import * as mysql from 'mysql';
// @ts-ignore
import * as config from './config.json';
//
export namespace sql {

    /**
     * Class for Managing The SQL Connection
     */
    export class MySQLConnector {

        /**
         * The DB Connection
         */
        private connection: any;

        /**
         * Config, read from config.json
         */
        private MySQLConfig = {
            host: config.MySQLConnectionInformation.host,
            user: config.MySQLConnectionInformation.user,
            password: config.MySQLConnectionInformation.password,
            database: config.MySQLConnectionInformation.database
        };

        constructor() {
            this.connection = mysql.createConnection(this.MySQLConfig);
        }

        /**
         * Unused query function
         * Stays here as an example
         * @param sql
         * @param args
         */
        private query(sql, args) {
            return new Promise((resolve, reject) => {
                this.connection.query(sql, args, (err, rows) => {
                    if (err)
                        return reject(err);
                    resolve(rows);
                });
            });
        }

        /**
         * Delivers multiple Oids
         * @param filter some string
         */
        getOidTable() {
            return new Promise((resolve, reject) => {
                this.connection.query("Select * from Oid",
                    (err, rows) => {
                        if (err)
                            return reject(err);
                        resolve(rows);
                    });
            });
        }

        /**
         *
         * @param filter
         */
        getOidVersion() {
            return new Promise((resolve, reject) => {
                this.connection.query("Select `DValue` as Version from Directory where `DKey` = 'OidVersion'", [],
                    (err, rows) => {
                        if (err)
                            return reject(err);
                        resolve(rows);
                    });
            });
        }

        /**
         *
         * @param filter
         */
        getMPSVersion() {
            return new Promise((resolve, reject) => {
                this.connection.query("Select `DValue` as Version from Directory where `DKey` = 'Version'", [],
                    (err, rows) => {
                        if (err)
                            return reject(err);
                        resolve(rows);
                    });
            });
        }

        /**
         * Checks an Token
         * returns an boolean
         * @param token a tokenString
         */
        checkAccessToken(token: string): Promise<boolean> {
            return new Promise((resolve, reject) => {
                this.connection.query("Select * from AccessToken where Token = ?",
                    [token],
                    (err, rows) => {
                        if (err)
                            return reject(err);
                        if (rows.length == 1) {
                            resolve(true);
                        } else {
                            resolve(false);
                        }
                    });
            });
        }

        /**
         * Inserts the Log of the Server
         * @param socketId
         * @param message
         */
        insertServerLog(socketId: string, message: string) {
            this.connection.query("INSERT INTO `ServerLog`" +
                "(" +
                "`SocketId`," +
                "`Message`)" +
                "VALUES" +
                "(?, ?)",
                [socketId, message]
                , (err) => {
                    if (err)
                        console.log(err);
                });
        }

        insertOidSet(oidSet: any) {

            for (let i = 0; i <  oidSet.length; i++) {
                this.insertOid(oidSet[i]);

            }

        }

        insertOid(oidData: any) {
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
                " ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
                [oidData["customerRef"],
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
                    oidData["YellowLevel"]]
                , (err) => {
                    if (err)
                        console.log(err);
                });
        }

        /**
         * Closes the DB Connection
         */
        close() {
            return new Promise((resolve, reject) => {
                this.connection.end(err => {
                    if (err)
                        return reject(err);
                    resolve();
                });
            });
        }
    }
}