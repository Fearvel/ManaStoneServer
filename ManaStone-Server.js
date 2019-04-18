"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
// @ts-ignore
var config = require("./config.json");
var https = require("https");
var express = require("express");
var MysqlConnector = require("./MySQLConnector");
var mysqlConnectionManager = new MysqlConnector.sql.MySQLConnector;
var app = express();
var options = {
    key: fs.readFileSync(config.CertPath.key),
    cert: fs.readFileSync(config.CertPath.cert)
};
var server = https.createServer(options, app);
var io = require('socket.io')(server);
var Version = "1.0.0.0";
/**
 * Socket.io Server Handler
 * Reacts on incoming Connections
 */
io.on('connection', function (socket) {
    //   socket.emit('info', Version);
    mysqlConnectionManager.insertServerLog(socket.id.toString(), " Connection Opened");
    /**
     * Reacts on incoming connections on ServerTimeRequest
     * emits ServerTime on ServerTime
     */
    socket.on('ServerTimeRequest', function () {
        try {
            mysqlConnectionManager.retrieveServerTime().then(function (row) {
                mysqlConnectionManager.insertServerLog(socket.id.toString(), "New ServerTimeRequest");
                socket.emit("ServerTime", JSON.stringify((row[0])[0]));
            });
        }
        catch (e) {
        }
    });
    /**
     * Reacts on incoming connections on ManastoneVersionRequest
     * emits ManastoneServerVersion on ManastoneVersion
     */
    socket.on('ManastoneVersionRequest', function () {
        try {
            mysqlConnectionManager.retrieveManastoneVersion().then(function (row) {
                mysqlConnectionManager.insertServerLog(socket.id.toString(), "New ManastoneVersionRequest");
                socket.emit("ManastoneVersion", JSON.stringify((row[0])[0]));
            });
        }
        catch (e) {
            mysqlConnectionManager.insertServerLog(socket.id.toString(), "ERROR: ManastoneVersionRequest");
        }
    });
    /**
     * Reacts on incoming connections on ActivationRequest
     * Activates a SerialNumber if activatable and matching the productId
     * emits the ActivationKey on ActivationOffer
     */
    socket.on('ActivationRequest', function (data) {
        try {
            var dataObj_1 = JSON.parse(data);
            mysqlConnectionManager.checkSerialNumberActivatable(dataObj_1.SerialNumber).then(function (row) {
                if ((row[0])[0].Activatable == 1) {
                    mysqlConnectionManager.checkProductMatchingSerialNumber(dataObj_1.ProductUUID, dataObj_1.SerialNumber).then(function (rowI) {
                        if ((rowI[0])[0].ProductMatch == 1) {
                            mysqlConnectionManager.activateSerialNumber(dataObj_1.SerialNumber, dataObj_1.HardwareId).then(function (rowJ) {
                                mysqlConnectionManager.insertServerLog(socket.id.toString(), "New ActivationRequest");
                                socket.emit('ActivationOffer', JSON.stringify(((rowJ[0])[0])));
                            });
                        }
                        else {
                            socket.emit('ActivationOffer', JSON.stringify({ ActivationKey: "" }));
                        }
                    });
                }
            });
        }
        catch (e) {
            mysqlConnectionManager.insertServerLog(socket.id.toString(), "ERROR: ActivationRequest" + data);
        }
    });
    /**
     * Reacts on incoming connections on ActivationOnlineCheckRequest
     * emits a variable which determines if the ActivationKey is valid on ActivationOnlineCheckOffer
     */
    socket.on('ActivationOnlineCheckRequest', function (data) {
        try {
            var dataObj = JSON.parse(data);
            mysqlConnectionManager.checkActivation(dataObj.ActivationKey, dataObj.HardwareId).then(function (row) {
                mysqlConnectionManager.insertServerLog(socket.id.toString(), "New ActivationOnlineCheckRequest");
                socket.emit("ActivationOnlineCheckOffer", JSON.stringify((row[0])[0]));
            });
        }
        catch (e) {
            mysqlConnectionManager.insertServerLog(socket.id.toString(), "ERROR: ActivationOnlineCheckRequest"
                + data);
        }
    });
    /**
     * Reacts on incoming connections on CustomerReferenceRequest
     * emits CustomerReference on CustomerReferenceOffer
     */
    socket.on('CustomerReferenceRequest', function (data) {
        try {
            var dataObj = JSON.parse(data);
            mysqlConnectionManager.retrieveCustomerReference(dataObj.ActivationKey).then(function (row) {
                mysqlConnectionManager.insertServerLog(socket.id.toString(), "New CustomerReferenceRequest");
                socket.emit("CustomerReferenceOffer", JSON.stringify((row[0])[0]));
            });
        }
        catch (e) {
            mysqlConnectionManager.insertServerLog(socket.id.toString(), "ERROR: CustomerReferenceRequest"
                + data);
        }
    });
    /**
     * Reacts on incoming connections on CheckTokenRequest
     * Uses DateOfExpiry -1H do make sure the Token wont run out in the expected time
     * emits a variable which determines if the Token is valid on CheckTokenOffer
     */
    socket.on('CheckTokenRequest', function (data) {
        try {
            var dataObj = JSON.parse(data);
            mysqlConnectionManager.checkToken(dataObj.Token).then(function (row) {
                mysqlConnectionManager.insertServerLog(socket.id.toString(), "New CheckTokenRequest");
                socket.emit("CheckTokenOffer", JSON.stringify((row[0])[0]));
            });
        }
        catch (e) {
            mysqlConnectionManager.insertServerLog(socket.id.toString(), "ERROR: CheckTokenRequest"
                + data);
        }
    });
    /**
     * Reacts on incoming connections on CheckTokenServerSideRequest
     * emits a variable which determines if the Token is valid on CheckTokenOffer
     */
    socket.on('CheckTokenServerSideRequest', function (data) {
        try {
            var dataObj = JSON.parse(data);
            mysqlConnectionManager.checkTokenServerSide(dataObj.Token).then(function (row) {
                mysqlConnectionManager.insertServerLog(socket.id.toString(), "New CheckTokenServerSideRequest");
                socket.emit("CheckTokenOffer", JSON.stringify((row[0])[0]));
            });
        }
        catch (e) {
            mysqlConnectionManager.insertServerLog(socket.id.toString(), "ERROR: CheckTokenServerSideRequest"
                + data);
        }
    });
    /**
     * Reacts on incoming connections on TokenRequest
     * Generates a token if the ActivationKey is valid
     * emits a Generated Token on TokenOffer
     */
    socket.on('TokenRequest', function (data) {
        try {
            var dataObj = JSON.parse(data);
            mysqlConnectionManager.retrieveToken(dataObj.ActivationKey).then(function (row) {
                if ((row[0])[0].Token.length > 0) {
                    mysqlConnectionManager.insertServerLog(socket.id.toString(), "New TokenRequest");
                    socket.emit("TokenOffer", JSON.stringify((row[0])[0]));
                }
                else {
                    socket.emit('TokenOffer', JSON.stringify({ Token: "" }));
                }
            });
        }
        catch (e) {
            mysqlConnectionManager.insertServerLog(socket.id.toString(), "ERROR: TokenRequest"
                + data);
        }
    });
    /**
     * Reacts on incoming connections on DeactivationRequest
     * Planed for later versions
     * emits on DeactivationOffer
     */
    socket.on('DeactivationRequest', function (data) {
        try {
            var dataObj = JSON.parse(data);
            mysqlConnectionManager.deactivateSerialNumber(dataObj.SerialNumber).then(function (row) {
                socket.emit('DeactivationOffer', JSON.stringify(((row[0])[0])));
            });
            mysqlConnectionManager.insertServerLog(socket.id.toString(), "New DeactivationRequest");
            sendSimpleResult(true);
        }
        catch (e) {
            mysqlConnectionManager.insertServerLog(socket.id.toString(), "ERROR: DeactivationRequest"
                + data);
        }
    });
    /**
     * Disconnect event
     * Inserts Connection closed message into the Serverlog Table
     */
    socket.on('disconnect', function () {
        mysqlConnectionManager.insertServerLog(socket.id.toString(), "Connection Closed");
    });
});
/**
 * Entry Point of the Socket.io server
 * Starts the server and outputs Version and Port
 */
server.listen(config.ServerPort, function () {
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
function sendSimpleResult(socket, res) {
    if (res === void 0) { res = false; }
    socket.emit('closer', JSON.stringify({ Result: res }));
    socket.disconnect();
}
//# sourceMappingURL=ManaStone-Server.js.map