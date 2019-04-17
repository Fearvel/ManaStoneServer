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
        MySQLConnector.prototype.getOidTable = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.connection.query("Select * from Oid", function (err, rows) {
                    if (err)
                        return reject(err);
                    resolve(rows);
                });
            });
        };
        /**
         *
         * @param filter
         */
        MySQLConnector.prototype.getOidVersion = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.connection.query("Select `DValue` as Version from Directory where `DKey` = 'OidVersion'", [], function (err, rows) {
                    if (err)
                        return reject(err);
                    resolve(rows);
                });
            });
        };
        /**
         *
         * @param filter
         */
        MySQLConnector.prototype.getMPSVersion = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.connection.query("Select `DValue` as Version from Directory where `DKey` = 'Version'", [], function (err, rows) {
                    if (err)
                        return reject(err);
                    resolve(rows);
                });
            });
        };
        /**
         * Checks an Token
         * returns an boolean
         * @param token a tokenString
         */
        MySQLConnector.prototype.checkAccessToken = function (token) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                _this.connection.query("Select * from AccessToken where Token = ?", [token], function (err, rows) {
                    if (err)
                        return reject(err);
                    if (rows.length == 1) {
                        resolve(true);
                    }
                    else {
                        resolve(false);
                    }
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
        MySQLConnector.prototype.insertOidSet = function (oidSet) {
            for (var i = 0; i < oidSet.length; i++) {
                this.insertOid(oidSet[i]);
            }
        };
        MySQLConnector.prototype.insertOid = function (oidData) {
            this.connection.query("Insert into `OidData` (" +
                " `customerRef`," +
                " `VendorName`," +
                " `Model`," +
                " `SerialNumber`," +
                " `MacAddress`," +
                " `IpAddress`," +
                " `HostName`," +
                " `DescriptionLocation`," +
                " `AssetNumber`," +
                " `FirmwareVersion`," +
                " `PowerSleep1`," +
                " `PowerSleep2`," +
                " `ProfileName`," +
                " `DeviceName`," +
                " `DeviceType`," +
                " `Manufacturer`," +
                " `TotalPages`," +
                " `TotalPagesMono`," +
                " `TotalPagesColor`," +
                " `TotalPagesDuplex`," +
                " `PrinterPages`," +
                " `PrinterPagesMono`," +
                " `PrinterPagesColor`," +
                " `PrinterPagesFullColor`," +
                " `PrinterPagesTwoColor`," +
                " `CopyPagesMono`," +
                " `CopyPagesColor`," +
                " `CopyPagesFullColor`," +
                " `CopyPagesTwoColor`," +
                " `CopyPagesSingleColor`," +
                " `FaxesSentFaxesReceived`," +
                " `ScansTotalScansTotalMono`," +
                " `ScansTotalColor`," +
                " `ScansCopyMono`," +
                " `ScansCopyColor`," +
                " `ScansEmail`," +
                " `ScansEmailMono`," +
                " `ScansNet`," +
                " `ScansNetMono`," +
                " `ScansNetColor`," +
                " `LargePagesMono`," +
                " `LargePagesFullColor`," +
                " `CoverageAverageBlack`," +
                " `CoverageAverageCyan`," +
                " `CoverageAverageMagenta`," +
                " `CoverageAverageYellow`," +
                " `BlackLevelMax`," +
                " `CyanLevelMax`," +
                " `MagentaLevelMax`," +
                " `YellowLevelMax`," +
                " `BlackLevel`," +
                " `CyanLevel`," +
                " `MagentaLevel`," +
                " `YellowLevel`" +
                ") VALUES (" +
                "?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?," +
                " ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?," +
                " ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", [oidData["customerRef"],
                oidData["VendorName"],
                oidData["Model"],
                oidData["SerialNumber"],
                oidData["MacAddress"],
                oidData["IpAddress"],
                oidData["HostName"],
                oidData["DescriptionLocation"],
                oidData["AssetNumber"],
                oidData["FirmwareVersion"],
                oidData["PowerSleep1"],
                oidData["PowerSleep2"],
                oidData["ProfileName"],
                oidData["DeviceName"],
                oidData["DeviceType"],
                oidData["Manufacturer"],
                oidData["TotalPages"],
                oidData["TotalPagesMono"],
                oidData["TotalPagesColor"],
                oidData["TotalPagesDuplex"],
                oidData["PrinterPages"],
                oidData["PrinterPagesMono"],
                oidData["PrinterPagesColor"],
                oidData["PrinterPagesFullColor"],
                oidData["PrinterPagesTwoColor"],
                oidData["CopyPagesMono"],
                oidData["CopyPagesColor"],
                oidData["CopyPagesFullColor"],
                oidData["CopyPagesTwoColor"],
                oidData["CopyPagesSingleColor"],
                oidData["FaxesSentFaxesReceived"],
                oidData["ScansTotalScansTotalMono"],
                oidData["ScansTotalColor"],
                oidData["ScansCopyMono"],
                oidData["ScansCopyColor"],
                oidData["ScansEmail"],
                oidData["ScansEmailMono"],
                oidData["ScansNet"],
                oidData["ScansNetMono"],
                oidData["ScansNetColor"],
                oidData["LargePagesMono"],
                oidData["LargePagesFullColor"],
                oidData["CoverageAverageBlack"],
                oidData["CoverageAverageCyan"],
                oidData["CoverageAverageMagenta"],
                oidData["CoverageAverageYellow"],
                oidData["BlackLevelMax"],
                oidData["CyanLevelMax"],
                oidData["MagentaLevelMax"],
                oidData["YellowLevelMax"],
                oidData["BlackLevel"],
                oidData["CyanLevel"],
                oidData["MagentaLevel"],
                oidData["YellowLevel"]], function (err) {
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