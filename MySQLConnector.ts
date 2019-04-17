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
        retrieveServerTime() {
            return new Promise((resolve, reject) => {
                this.connection.query("call RetrieveServerTime()",
                    (err, rows) => {
                        if (err)
                            return reject(err);
                        resolve(rows);
                    });
            });
        }


        retrieveCustomerReference(activationToken: string) {
            return new Promise((resolve, reject) => {
                this.connection.query("call RetrieveCustomerReferenceViaActivationKey(?)",[activationToken],
                    (err, rows) => {
                        if (err)
                            return reject(err);
                        resolve(rows);
                    });
            });
        }


        retrieveManastoneVersion() {
            return new Promise((resolve, reject) => {
                this.connection.query("CALL RetrieveManastoneVersion()", [],
                    (err, rows) => {
                        if (err)
                            return reject(err);
                        resolve(rows);
                    });
            });
        }

        activateSerialNumber(serialNumber: string, hardwareId: string) {
            return new Promise((resolve, reject) => {
                this.connection.query("CALL Activate(?, ?)", [serialNumber, hardwareId],
                    (err, rows) => {
                        if (err)
                            return reject(err);
                        resolve(rows);
                    });
            });
        }

        deactivateSerialNumber(serialNumber: string) {
            return new Promise((resolve, reject) => {
                this.connection.query("CALL Deactivate(?)", [serialNumber],
                    (err, rows) => {
                        if (err)
                            return reject(err);
                        resolve(rows);
                    });
            });
        }

        checkSerialNumberActivatable(serialNumber: string) {
            return new Promise((resolve, reject) => {
                this.connection.query("CALL CheckActivatable(?)", [serialNumber],
                    (err, rows) => {
                        if (err)
                            return reject(err);
                        resolve(rows);
                    });
            });
        }

        retrieveToken(activationKey : string){
            return new Promise((resolve, reject) => {
                this.connection.query("CALL GenerateTokenByActivationKey(?)", [activationKey],
                    (err, rows) => {
                        if (err)
                            return reject(err);
                        resolve(rows);
                    });
            });
        }
        checkToken(Token : string){
            return new Promise((resolve, reject) => {
                this.connection.query("CALL CheckToken(?)", [Token],
                    (err, rows) => {
                        if (err)
                            return reject(err);
                        resolve(rows);
                    });
            });
        }

        checkProductMatchingSerialNumber(productUUID : string, serialNumber :string){
            return new Promise((resolve, reject) => {
                this.connection.query("CALL CheckIfSerialNumberMatchesTheProductUUID(?,?)", [productUUID, serialNumber],
                    (err, rows) => {
                        if (err)
                            return reject(err);
                        resolve(rows);
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