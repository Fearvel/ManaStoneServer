/**
 * Connection Class for MySql Connections
 * @author Andreas Schreiner
 * @copyright Andreas Schreiner 2019
 */
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

        /**
         * Constructor
         * Creates the connection
         */
        constructor() {
            this.connection = mysql.createConnection(this.MySQLConfig);
        }

        /**
         * Unused query function
         * Stays here as an example
         * @param sql sql string
         * @param args argument array for prepared statements
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
         * retrieves the ServerTime(DB Time) via a Query
         * uses the RetrieveServerTime Stored Procedure
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

        /**
         * retrieves the CustomerReference via a Query
         * uses the RetrieveCustomerReferenceViaActivationKey Stored Procedure
         * @param activationKey used to determine which information is needed
         */
        retrieveCustomerReference(activationKey: string) {
            return new Promise((resolve, reject) => {
                this.connection.query("call RetrieveCustomerReferenceViaActivationKey(?)",[activationKey],
                    (err, rows) => {
                        if (err)
                            return reject(err);
                        resolve(rows);
                    });
            });
        }

        /**
         * retrieves the ManastoneServerVersion via a Query
         * uses the RetrieveManastoneVersion Stored Procedure
         */
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

        /**
         * Activates a SerialNumber via a Query
         * uses the Activate Stored Procedure
         * @param serialNumber
         * @param hardwareId Will be saved in the Activation Table
         */
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

        /**
         * Deactivates a SerialNumber via a Query
         * uses the Deactivate Stored Procedure
         * @param serialNumber
         */
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

        /**
         * retrieves a log which determines if the SerialNumber is activatable via a Query
         * uses the CheckActivatable Stored Procedure
         * @param serialNumber
         */
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

        /**
         * Generates and returns an Token
         * uses the GenerateTokenByActivationKey Stored Procedure
         * @param activationKey
         */
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

        /**
         * Checks if an token is valid
         * this function will check the DateOfExpiry -1H min
         * @param Token
         */
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

        /**
         * Checks if an token is valid
         * this function will check the DateOfExpiry
         * @param Token
         */
        checkTokenServerSide(Token : string){
            return new Promise((resolve, reject) => {
                this.connection.query("CALL CheckTokenServerSide(?)", [Token],
                    (err, rows) => {
                        if (err)
                            return reject(err);
                        resolve(rows);
                    });
            });
        }

        /**
         * Checks if an Activation is valid
         * @param activationKey
         * @param hardwareId
         */
        checkActivation(activationKey: string, hardwareId: string){
            return new Promise((resolve, reject) => {
                this.connection.query("CALL CheckActivation(?, ?)", [activationKey, hardwareId],
                    (err, rows) => {
                        if (err)
                            return reject(err);
                        resolve(rows);
                    });
            });
        }

        /**
         * Checks if the Product to be Activated matches the entered Serial Number
         * @param productUUID
         * @param serialNumber
         */
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