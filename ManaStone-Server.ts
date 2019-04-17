import * as fs from 'fs';
// @ts-ignore
import * as config from './config.json';
import * as https from 'https';
import * as express from 'express';
import * as MysqlConnector from './MySQLConnector';

let mysqlConnectionManager = new MysqlConnector.sql.MySQLConnector;
let app = express();
let options = {
    key: fs.readFileSync(config.CertPath.key),
    cert: fs.readFileSync(config.CertPath.cert)
};
let server = https.createServer(options, app);
let io = require('socket.io')(server);

const Version = "0.6.0.0";


/**
 * Socket.io Server Handler
 * Reacts on incoming Connections
 */
io.on('connection', (socket) => {
    //   socket.emit('info', Version);
    mysqlConnectionManager.insertServerLog(socket.id.toString(), " Connection Opened");


    socket.on('ServerTimeRequest', () => {
        mysqlConnectionManager.retrieveServerTime().then(row => {
                mysqlConnectionManager.insertServerLog(socket.id.toString(), "New ServerTimeRequest");
                var a = JSON.stringify((row[0])[0]);
                socket.emit("ServerTime", JSON.stringify((row[0])[0]));
            }
        );
    });

    socket.on('ManastoneVersionRequest', () => {
        mysqlConnectionManager.retrieveManastoneVersion().then(row => {
                mysqlConnectionManager.insertServerLog(socket.id.toString(), "New ManastoneVersionRequest");
                socket.emit("ManastoneVersion", JSON.stringify((row[0])[0]));
            }
        );
    });

    socket.on('ActivationRequest', (data) => {//TESTME
        let dataObj = JSON.parse(data);

        mysqlConnectionManager.checkSerialNumberActivatable(dataObj.SerialNumber).then(row => {
                if ((row[0])[0].Activatable == 1) {
                    mysqlConnectionManager.checkProductMatchingSerialNumber(dataObj.ProductUUID,
                        dataObj.SerialNumber).then(rowI => {
                        if ((rowI[0])[0].ProductMatch == 1) {
                            mysqlConnectionManager.activateSerialNumber(dataObj.SerialNumber,
                                dataObj.HardwareId).then(rowJ => {
                                mysqlConnectionManager.insertServerLog(socket.id.toString(),
                                    "New ActivationRequest");
                                socket.emit('ActivationOffer', JSON.stringify(((rowJ[0])[0])));
                            });
                        } else {
                            socket.emit('ActivationOffer', JSON.stringify({ActivationKey: ""}));

                        }
                    });
                }
            }
        );
    });

    socket.on('TokenRequest', (data) => {
        let dataObj = JSON.parse(data);

        mysqlConnectionManager.retrieveToken(dataObj.ActivationKey).then(row => {
                if ((row[0])[0].Token.length > 0) {
                    mysqlConnectionManager.insertServerLog(socket.id.toString(), "New ManastoneVersionRequest");
                    socket.emit("TokenOffer", JSON.stringify((row[0])[0]));
                } else {
                    socket.emit('TokenOffer', JSON.stringify({Token: ""}));
                }
            }
        );
    });

    socket.on('CheckToken', (data) => {
        let dataObj = JSON.parse(data);
        mysqlConnectionManager.checkToken(dataObj.Token).then(row => {
                mysqlConnectionManager.insertServerLog(socket.id.toString(), "New ManastoneVersionRequest");
                socket.emit("ManastoneVersion", JSON.stringify((row[0])[0]));
            }
        );
    });
    socket.on('ProductUUIDRequest', (data) => {
        let dataObj = JSON.parse(data);
        mysqlConnectionManager.checkToken(dataObj.Token).then(row => {
                mysqlConnectionManager.insertServerLog(socket.id.toString(), "New ManastoneVersionRequest");
                socket.emit("ManastoneVersion", JSON.stringify((row[0])[0]));
            }
        );
    });


    socket.on('DeactivationRequest', (data) => {
        let dataObj = JSON.parse(data);
        mysqlConnectionManager.deactivateSerialNumber(dataObj.SerialNumber).then(row => {
            socket.emit('ActivationOffer', JSON.stringify(((row[0])[0])));
        });
        sendSimpleResult(true);
    });


    /**
     * Disconnect event
     * Inserts Connection closed message into the Serverlog Table
     */
    socket.on('disconnect', () => {
        mysqlConnectionManager.insertServerLog(socket.id.toString(), "Connection Closed");
    });
})
;

/**
 * Entry Point of the Socket.io server
 * Starts the server and outputs Version and Port
 */
server.listen(config.ServerPort, () => {
    mysqlConnectionManager.insertServerLog("", "openMPS Server: "
        + Version + " Listening on: " + config.ServerPort);
    console.log('ManaStone Server V %s, Listening on %s', Version, config.ServerPort);
});

/**
 * Sends a SimpleResult
 * @param socket
 * @param res
 * @constructor
 */
function sendSimpleResult(socket, res: boolean = false): void {
    socket.emit('closer', JSON.stringify({Result: res}));
    socket.disconnect();
}