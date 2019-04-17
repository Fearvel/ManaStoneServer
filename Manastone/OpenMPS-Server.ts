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

const Version = "0.9.1.0";


/**
 * Socket.io Server Handler
 * Reacts on incoming Connections
 */
io.on('connection', (socket) => {
    //   socket.emit('info', Version);
    mysqlConnectionManager.insertServerLog(socket.id.toString(), " Connection Opened");


    /**
     * Handles incoming OidRequest
     * Sends the latest Oid Table, if the token is in the Database
     */
    socket.on('OidRequest', (token) => {
        try {
            mysqlConnectionManager.insertServerLog(socket.id.toString(), "New OidRequest from "
                + socket.ipAddress.toString());
            mysqlConnectionManager.getOidTable().then(row => {
                socket.emit("OidOffer", JSON.stringify(row));
            });
        } catch (e) {
            console.log(e);
        }
    });

    /**
     * Handles incoming SendData
     * Inserts a OidDataSet into the Database
     */
    socket.on('SendData', (data) => {
        try {
            mysqlConnectionManager.insertServerLog(socket.id.toString(), "New Data from "
                + socket.ipAddress.toString());
            var a = JSON.parse(data)
            mysqlConnectionManager.insertOidSet(a);
            sendSimpleResult(socket, true);
        } catch (e) {
            sendSimpleResult(socket, false);
        }

    });

    /**
     * Handles incoming OidVersionRequest
     * Sends the latest Oid Version
     */
    socket.on('OidVersionRequest', () => {
        mysqlConnectionManager.getOidVersion().then(row => {
                mysqlConnectionManager.insertServerLog(socket.id.toString(), "New OidVersionRequest from "
                    + socket.ipAddress.toString());
                socket.emit("OidVersion", JSON.stringify(row[0]));
            }
        );
    });

    /**
     * Handles incoming MPSVersionRequest
     * Sends the latest MPS Version
     */
    socket.on('MPSVersionRequest', () => {
        mysqlConnectionManager.getMPSVersion().then(row => {
                mysqlConnectionManager.insertServerLog(socket.id.toString(), "New MPSVersionRequest from "
                    + socket.ipAddress.toString());
                socket.emit("MPSVersion", JSON.stringify(row[0]));
            }
        );
    });

    /**
     * Disconnect event
     * Inserts Connection closed message into the Serverlog Table
     */
    socket.on('disconnect', () => {
        mysqlConnectionManager.insertServerLog(socket.id.toString(), "Connection Closed");
    });
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

/**
 * Entry Point of the Socket.io server
 * Starts the server and outputs Version and Port
 */
server.listen(config.ServerPort, () => {
    mysqlConnectionManager.insertServerLog("", "openMPS Server: "
        + Version + " Listening on: " + config.ServerPort);
    console.log('openMPS Server V %s, Listening on %s', Version, config.ServerPort);
});