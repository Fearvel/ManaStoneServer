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
var Version = "0.0.0.1";
/**
 * Socket.io Server Handler
 * Reacts on incoming Connections
 */
io.on('connection', function (socket) {
    //   socket.emit('info', Version);
    mysqlConnectionManager.insertServerLog(socket.id.toString(), " Connection Opened");
    socket.on('ServerTimeRequest', function () {
        mysqlConnectionManager.retrieveServerTime().then(function (row) {
            mysqlConnectionManager.insertServerLog(socket.id.toString(), "New ServerTimeRequest");
            var a = JSON.stringify((row[0])[0]);
            socket.emit("ServerTime", JSON.stringify((row[0])[0]));
        });
    });
    socket.on('ManastoneVersionRequest', function () {
        mysqlConnectionManager.retrieveManastoneVersion().then(function (row) {
            mysqlConnectionManager.insertServerLog(socket.id.toString(), "New ManastoneVersionRequest");
            socket.emit("ManastoneVersion", JSON.stringify((row[0])[0]));
        });
    });
    socket.on('ActivationRequest', function (data) {
        var dataObj = JSON.parse(data);
        mysqlConnectionManager.checkSerialNumberActivatable(dataObj.SerialNumber).then(function (row) {
            if ((row[0])[0].Activatable == 1) {
                mysqlConnectionManager.checkProductMatchingSerialNumber(dataObj.ProductUUID, dataObj.SerialNumber).then(function (rowI) {
                    if ((rowI[0])[0].ProductMatch == 1) {
                        mysqlConnectionManager.activateSerialNumber(dataObj.SerialNumber, dataObj.HardwareId).then(function (rowJ) {
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
    });
    socket.on('TokenRequest', function (data) {
        var dataObj = JSON.parse(data);
        mysqlConnectionManager.retrieveToken(dataObj.ActivationKey).then(function (row) {
            if ((row[0])[0].Token.length > 0) {
                mysqlConnectionManager.insertServerLog(socket.id.toString(), "New ManastoneVersionRequest");
                socket.emit("TokenOffer", JSON.stringify((row[0])[0]));
            }
            else {
                socket.emit('TokenOffer', JSON.stringify({ Token: "" }));
            }
        });
    });
    socket.on('CheckToken', function (data) {
        var dataObj = JSON.parse(data);
        mysqlConnectionManager.checkToken(dataObj.Token).then(function (row) {
            mysqlConnectionManager.insertServerLog(socket.id.toString(), "New ManastoneVersionRequest");
            socket.emit("ManastoneVersion", JSON.stringify((row[0])[0]));
        });
    });
    socket.on('ProductUUIDRequest', function (data) {
        var dataObj = JSON.parse(data);
        mysqlConnectionManager.checkToken(dataObj.Token).then(function (row) {
            mysqlConnectionManager.insertServerLog(socket.id.toString(), "New ManastoneVersionRequest");
            socket.emit("ManastoneVersion", JSON.stringify((row[0])[0]));
        });
    });
    socket.on('DeactivationRequest', function (data) {
        var dataObj = JSON.parse(data);
        mysqlConnectionManager.deactivateSerialNumber(dataObj.SerialNumber).then(function (row) {
            socket.emit('ActivationOffer', JSON.stringify(((row[0])[0])));
        });
        sendSimpleResult(true);
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