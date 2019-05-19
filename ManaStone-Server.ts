#!/usr/bin/env node
/**
 * Manastone DRM Server
 * @author Andreas Schreiner
 * @copyright Andreas Schreiner 2019
 */
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

const Version = "1.0.0.0";


/**
 * Socket.io Server Handler
 * Reacts on incoming Connections
 */
io.on('connection', (socket) => {
    //   socket.emit('info', Version);
    mysqlConnectionManager.insertServerLog(socket.id.toString(), " Connection Opened");

    /**
     * Reacts on incoming connections on ServerTimeRequest
     * emits ServerTime on ServerTime
     */
    socket.on('ServerTimeRequest', () => {
        try {
            mysqlConnectionManager.retrieveServerTime().then(row => {
                    mysqlConnectionManager.insertServerLog(socket.id.toString(), "New ServerTimeRequest");
                    socket.emit("ServerTime", JSON.stringify((row[0])[0]));
                }
            );
        } catch (e) {
        }
    });

    /**
     * Reacts on incoming connections on ManastoneVersionRequest
     * emits ManastoneServerVersion on ManastoneVersion
     */
    socket.on('ManastoneVersionRequest', () => {
        try {
            mysqlConnectionManager.retrieveManastoneVersion().then(row => {
                    mysqlConnectionManager.insertServerLog(socket.id.toString(), "New ManastoneVersionRequest");
                    socket.emit("ManastoneVersion", JSON.stringify((row[0])[0]));
                }
            );
        } catch (e) {
            mysqlConnectionManager.insertServerLog(socket.id.toString(), "ERROR: ManastoneVersionRequest");
        }
    });

    /**
     * Reacts on incoming connections on ActivationRequest
     * Activates a SerialNumber if activatable and matching the productId
     * emits the ActivationKey on ActivationOffer
     */
    socket.on('ActivationRequest', (data) => {
        try {
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
        } catch (e) {
            mysqlConnectionManager.insertServerLog(socket.id.toString(), "ERROR: ActivationRequest" + data);
        }
    });

    /**
     * Reacts on incoming connections on ActivationOnlineCheckRequest
     * emits a variable which determines if the ActivationKey is valid on ActivationOnlineCheckOffer
     */
    socket.on('ActivationOnlineCheckRequest', (data) => {
        try {
            let dataObj = JSON.parse(data);
            mysqlConnectionManager.checkActivation(dataObj.ActivationKey, dataObj.HardwareId).then(row => {
                    mysqlConnectionManager.insertServerLog(socket.id.toString(),
                        "New ActivationOnlineCheckRequest");
                    socket.emit("ActivationOnlineCheckOffer", JSON.stringify((row[0])[0]));
                }
            );
        } catch (e) {
            mysqlConnectionManager.insertServerLog(socket.id.toString(), "ERROR: ActivationOnlineCheckRequest"
                + data);
        }
    });

    /**
     * Reacts on incoming connections on CustomerReferenceRequest
     * emits CustomerReference on CustomerReferenceOffer
     */
    socket.on('CustomerReferenceRequest', (data) => {
        try {
            let dataObj = JSON.parse(data);
            mysqlConnectionManager.retrieveCustomerReference(dataObj.ActivationKey).then(row => {
                    mysqlConnectionManager.insertServerLog(socket.id.toString(), "New CustomerReferenceRequest");
                    socket.emit("CustomerReferenceOffer", JSON.stringify((row[0])[0]));
                }
            );
        } catch (e) {
            mysqlConnectionManager.insertServerLog(socket.id.toString(), "ERROR: CustomerReferenceRequest"
                + data);
        }
    });

    /**
     * Reacts on incoming connections on CheckTokenRequest
     * Uses DateOfExpiry -1H do make sure the Token wont run out in the expected time
     * emits a variable which determines if the Token is valid on CheckTokenOffer
     */
    socket.on('CheckTokenRequest', (data) => {
        try {
            let dataObj = JSON.parse(data);
            mysqlConnectionManager.checkToken(dataObj.Token).then(row => {
                    mysqlConnectionManager.insertServerLog(socket.id.toString(), "New CheckTokenRequest");
                    socket.emit("CheckTokenOffer", JSON.stringify((row[0])[0]));
                }
            );
        } catch (e) {
            mysqlConnectionManager.insertServerLog(socket.id.toString(), "ERROR: CheckTokenRequest"
                + data);
        }
    });

    /**
     * Reacts on incoming connections on CheckTokenServerSideRequest
     * emits a variable which determines if the Token is valid on CheckTokenOffer
     */
    socket.on('CheckTokenServerSideRequest', (data) => {
        try {
            let dataObj = JSON.parse(data);
            mysqlConnectionManager.checkTokenServerSide(dataObj.Token).then(row => {
                    mysqlConnectionManager.insertServerLog(socket.id.toString(), "New CheckTokenServerSideRequest");
                    socket.emit("CheckTokenOffer", JSON.stringify((row[0])[0]));
                }
            );
        } catch (e) {
            mysqlConnectionManager.insertServerLog(socket.id.toString(), "ERROR: CheckTokenServerSideRequest"
                + data);
        }
    });

    /**
     * Reacts on incoming connections on TokenRequest
     * Generates a token if the ActivationKey is valid
     * emits a Generated Token on TokenOffer
     */
    socket.on('TokenRequest', (data) => {

        try {
            let dataObj = JSON.parse(data);
            mysqlConnectionManager.retrieveToken(dataObj.ActivationKey).then(row => {
                    if ((row[0])[0].Token.length > 0) {
                        mysqlConnectionManager.insertServerLog(socket.id.toString(), "New TokenRequest");
                        socket.emit("TokenOffer", JSON.stringify((row[0])[0]));
                    } else {
                        socket.emit('TokenOffer', JSON.stringify({Token: ""}));
                    }
                }
            );
        } catch (e) {
            mysqlConnectionManager.insertServerLog(socket.id.toString(), "ERROR: TokenRequest"
                + data);
        }
    });

    /**
     * Reacts on incoming connections on DeactivationRequest
     * Planed for later versions
     * emits on DeactivationOffer
     */
    socket.on('DeactivationRequest', (data) => {
        try {
            let dataObj = JSON.parse(data);
            mysqlConnectionManager.deactivateSerialNumber(dataObj.SerialNumber).then(row => {
                socket.emit('DeactivationOffer', JSON.stringify(((row[0])[0])));
            });
            mysqlConnectionManager.insertServerLog(socket.id.toString(), "New DeactivationRequest");
            sendSimpleResult(true);
        }catch (e) {
            mysqlConnectionManager.insertServerLog(socket.id.toString(), "ERROR: DeactivationRequest"
                + data);
        }
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