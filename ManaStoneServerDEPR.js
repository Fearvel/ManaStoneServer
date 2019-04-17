var fs = require('fs');
var config = require('./config.json');
var https = require('https');
var express = require('express');
var app = express();
var options = {
    key: fs.readFileSync(config.CertPath.key),
    cert: fs.readFileSync(config.CertPath.cert)
};
var server = https.createServer(options, app);
var io = require('socket.io')(server);
var nct = require('./Tools/NetCompatibleTime');
var commonTypes = require('./Types/CommonTypes');
var manastoneTypes = require('./Types/ManastoneTypes');
var licenseManager = require('./Manastone/LicenseManager');

const MySqlConnection = require('./Tools/MySQLConnection').ConnectToMysql(
    config.MysqlConnectionInformation.host,
    config.MysqlConnectionInformation.user,
    config.MysqlConnectionInformation.password,
    config.MysqlConnectionInformation.database);

const Version = "0.9.0.0";


io.on('connection', (socket) => {
    //   socket.emit('info', Version);
    //console.log(socket.id.toString() + " Connection Opened");

    socket.on('ActivationRequest', (activationRequest) => {
        console.log(socket.id.toString() + " ActivationRequest Received: " + activationRequest);
        socket.emit('ActivationOffer',
            new commonTypes.OfferWrapper(new manastoneTypes.ManastoneActivationOffer(
                "bbbbb", nct.NetCompatibleDateTimeString(new Date())), new commonTypes.SimpleResult(true)

            )

        );

    });
    socket.on('TokenRequest', (SerialNumberPackage) => {
        console.log(socket.id.toString() + " [DATA] ActivationKey Received: ");

    });
    socket.on('ReactivationRequest', (reactivationRequest) => {
        console.log(socket.id.toString() + " [DATA] ActivationKey Received: ");

    });
    socket.on('Deactivate', (DeactivationPackage) => {
        console.log(socket.id.toString() + " [DATA] ActivationKey Received: ");

    });
    socket.on('RequestLicenseInformation', (DeactivationPackage) => {
        console.log(socket.id.toString() + " [DATA] ActivationKey Received: ");

    });


    socket.on('disconnect', () => {
        // console.log(socket.id.toString() + " Connection Closed");
    });
});

server.listen(config.ServerPort, () => {
    console.log('ManaStone Server V %s, Listening on %s Started at %s',
        Version,
        config.ServerPort, nct.NetCompatibleDateTimeString(new Date()));
    console.log(licenseManager.GenerateAndAddLicenseKeyToDatabase("f5606f8d-ffd6-11e8-8248-000c29b26495", null, MySqlConnection));
});






