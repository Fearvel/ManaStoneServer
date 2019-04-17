"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mysql = require("mysql");
// @ts-ignore
var config = require("./config.json");
//
var sql;
(function (sql_1) {
    /**
     * Class for Managing The SQL Connection
     */
    var MySQLConnector = /** @class */ (function () {
        function MySQLConnector() {
            /**
             * Config, read from config.json
             */
            this.MySQLConfig = {
                host: config.MySQLConnectionInformation.host,
                user: config.MySQLConnectionInformation.user,
                password: config.MySQLConnectionInformation.password,
                database: config.MySQLConnectionInformation.database
            };
            this.connection = mysql.createConnection(this.MySQLConfig);
        }
        /**
         * Unused query function
         * Stays here as an example
         * @param sql
         * @param args
         */
        MySQLConnector.prototype.query = function (sql, args) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.connection.query(sql, args, function (err, rows) {
                    if (err)
                        return reject(err);
                    resolve(rows);
                });
            });
        };
        /**
         * Delivers multiple Oids
         * @param filter some string
         */
        MySQLConnector.prototype.retrieveServerTime = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.connection.query("call RetrieveServerTime()", function (err, rows) {
                    if (err)
                        return reject(err);
                    resolve(rows);
                });
            });
        };
        MySQLConnector.prototype.retrieveCustomerReference = function (activationToken) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.connection.query("call RetrieveCustomerReferenceViaActivationKey(?)", [activationToken], function (err, rows) {
                    if (err)
                        return reject(err);
                    resolve(rows);
                });
            });
        };
        MySQLConnector.prototype.retrieveManastoneVersion = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.connection.query("CALL RetrieveManastoneVersion()", [], function (err, rows) {
                    if (err)
                        return reject(err);
                    resolve(rows);
                });
            });
        };
        MySQLConnector.prototype.activateSerialNumber = function (serialNumber, hardwareId) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.connection.query("CALL Activate(?, ?)", [serialNumber, hardwareId], function (err, rows) {
                    if (err)
                        return reject(err);
                    resolve(rows);
                });
            });
        };
        MySQLConnector.prototype.deactivateSerialNumber = function (serialNumber) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.connection.query("CALL Deactivate(?)", [serialNumber], function (err, rows) {
                    if (err)
                        return reject(err);
                    resolve(rows);
                });
            });
        };
        MySQLConnector.prototype.checkSerialNumberActivatable = function (serialNumber) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.connection.query("CALL CheckActivatable(?)", [serialNumber], function (err, rows) {
                    if (err)
                        return reject(err);
                    resolve(rows);
                });
            });
        };
        MySQLConnector.prototype.retrieveToken = function (activationKey) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.connection.query("CALL GenerateTokenByActivationKey(?)", [activationKey], function (err, rows) {
                    if (err)
                        return reject(err);
                    resolve(rows);
                });
            });
        };
        MySQLConnector.prototype.checkToken = function (Token) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.connection.query("CALL CheckToken(?)", [Token], function (err, rows) {
                    if (err)
                        return reject(err);
                    resolve(rows);
                });
            });
        };
        MySQLConnector.prototype.checkProductMatchingSerialNumber = function (productUUID, serialNumber) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.connection.query("CALL CheckIfSerialNumberMatchesTheProductUUID(?,?)", [productUUID, serialNumber], function (err, rows) {
                    if (err)
                        return reject(err);
                    resolve(rows);
                });
            });
        };
        /**
         * Inserts the Log of the Server
         * @param socketId
         * @param message
         */
        MySQLConnector.prototype.insertServerLog = function (socketId, message) {
            this.connection.query("INSERT INTO `ServerLog`" +
                "(" +
                "`SocketId`," +
                "`Message`)" +
                "VALUES" +
                "(?, ?)", [socketId, message], function (err) {
                if (err)
                    console.log(err);
            });
        };
        /**
         * Closes the DB Connection
         */
        MySQLConnector.prototype.close = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.connection.end(function (err) {
                    if (err)
                        return reject(err);
                    resolve();
                });
            });
        };
        return MySQLConnector;
    }());
    sql_1.MySQLConnector = MySQLConnector;
})(sql = exports.sql || (exports.sql = {}));
//# sourceMappingURL=MySQLConnector.js.map