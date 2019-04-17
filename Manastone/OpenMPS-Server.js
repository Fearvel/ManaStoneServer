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
var Version = "0.9.1.0";
/**
 * Socket.io Server Handler
 * Reacts on incoming Connections
 */
io.on('connection', function (socket) {
    //   socket.emit('info', Version);
    mysqlConnectionManager.insertServerLog(socket.id.toString(), " Connection Opened");
    /**
     * Handles incoming OidRequest
     * Sends the latest Oid Table, if the token is in the Database
     */
    socket.on('OidRequest', function (token) {
        try {
            mysqlConnectionManager.insertServerLog(socket.id.toString(), "New OidRequest from "
                + socket.ipAddress.toString());
            mysqlConnectionManager.getOidTable().then(function (row) {
                socket.emit("OidOffer", JSON.stringify(row));
            });
        }
        catch (e) {
            console.log(e);
        }
    });
    /**
     * Handles incoming SendData
     * Inserts a OidDataSet into the Database
     */
    socket.on('SendData', function (data) {
        try {
            mysqlConnectionManager.insertServerLog(socket.id.toString(), "New Data from "
                + socket.ipAddress.toString());
            var a = JSON.parse(data);
            mysqlConnectionManager.insertOidSet(a);
            sendSimpleResult(socket, true);
        }
        catch (e) {
            sendSimpleResult(socket, false);
        }
    });
    /**
     * Handles incoming OidVersionRequest
     * Sends the latest Oid Version
     */
    socket.on('OidVersionRequest', function () {
        mysqlConnectionManager.getOidVersion().then(function (row) {
            mysqlConnectionManager.insertServerLog(socket.id.toString(), "New OidVersionRequest from "
                + socket.ipAddress.toString());
            socket.emit("OidVersion", JSON.stringify(row[0]));
        });
    });
    /**
     * Handles incoming MPSVersionRequest
     * Sends the latest MPS Version
     */
    socket.on('MPSVersionRequest', function () {
        mysqlConnectionManager.getMPSVersion().then(function (row) {
            mysqlConnectionManager.insertServerLog(socket.id.toString(), "New MPSVersionRequest from "
                + socket.ipAddress.toString());
            socket.emit("MPSVersion", JSON.stringify(row[0]));
        });
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
/**
 * Entry Point of the Socket.io server
 * Starts the server and outputs Version and Port
 */
server.listen(config.ServerPort, function () {
    mysqlConnectionManager.insertServerLog("", "openMPS Server: "
        + Version + " Listening on: " + config.ServerPort);
    console.log('openMPS Server V %s, Listening on %s', Version, config.ServerPort);
});
//# sourceMappingURL=OpenMPS-Server.js.map