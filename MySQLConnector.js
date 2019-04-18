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
        /**
         * Constructor
         */
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
         * retrieves the ServerTime(DB Time) via a Query
         * uses the RetrieveServerTime Stored Procedure
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
        /**
         * retrieves the CustomerReference via a Query
         * uses the RetrieveCustomerReferenceViaActivationKey Stored Procedure
         * @param activationKey used to determine which information is needed
         */
        MySQLConnector.prototype.retrieveCustomerReference = function (activationKey) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.connection.query("call RetrieveCustomerReferenceViaActivationKey(?)", [activationKey], function (err, rows) {
                    if (err)
                        return reject(err);
                    resolve(rows);
                });
            });
        };
        /**
         * retrieves the ManastoneServerVersion via a Query
         * uses the RetrieveManastoneVersion Stored Procedure
         */
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
        /**
         * Activates a SerialNumber via a Query
         * uses the Activate Stored Procedure
         * @param serialNumber
         * @param hardwareId Will be saved in the Activation Table
         */
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
        /**
         * Deactivates a SerialNumber via a Query
         * uses the Deactivate Stored Procedure
         * @param serialNumber
         */
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
        /**
         * retrieves a log which determines if the SerialNumber is activatable via a Query
         * uses the CheckActivatable Stored Procedure
         * @param serialNumber
         */
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
        /**
         * Generates and returns an Token
         * uses the GenerateTokenByActivationKey Stored Procedure
         * @param activationKey
         */
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
        /**
         * Checks if an token is valid
         * this function will check the DateOfExpiry -1H min
         * @param Token
         */
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
        /**
         * Checks if an token is valid
         * this function will check the DateOfExpiry
         * @param Token
         */
        MySQLConnector.prototype.checkTokenServerSide = function (Token) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.connection.query("CALL CheckTokenServerSide(?)", [Token], function (err, rows) {
                    if (err)
                        return reject(err);
                    resolve(rows);
                });
            });
        };
        /**
         * Checks if an Activation is valid
         * @param activationKey
         * @param hardwareId
         */
        MySQLConnector.prototype.checkActivation = function (activationKey, hardwareId) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.connection.query("CALL CheckActivation(?, ?)", [activationKey, hardwareId], function (err, rows) {
                    if (err)
                        return reject(err);
                    resolve(rows);
                });
            });
        };
        /**
         * Checks if the Product to be Activated matches the entered Serial Number
         * @param productUUID
         * @param serialNumber
         */
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