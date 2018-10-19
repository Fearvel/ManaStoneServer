var http = require('http')
var https = require('https');
var fs = require('fs');
var mysql = require('mysql');
var express = require('express');
var bodyParser = require('body-parser');
var serverTools = require('./fnServerTools');
var typeTools = require('./fnTypeTools');

const Version = "0.0.0.1";
const HttpPort = 9040;
const HttpsPort = 9041;

const options = {
    key: fs.readFileSync("testKey.pem"),
    cert: fs.readFileSync("testCert.pem")
};

const app = express();
const http_server = require('http').createServer(app);
const https_server = require('https').createServer(options,app);

const MySqlConnection = ConnectToMysql();

http_server.listen(HttpPort, () => console.log(GetStartInfo("[HTTP]", HttpPort)));
https_server.listen(HttpsPort,() => console.log(GetStartInfo("[HTTPS]", HttpsPort)));

app.post('/Activate', function (req, res) {

});
app.post('/CheckActivation', function (req, res) {

});
app.post('/Deactivate', function (req, res) {

});

function GetStartInfo(s, port) {
    return "[" + typeTools.GetDateTimeNow() + "] [fnLog Version: " + Version + "] Server Started. on Port: " + port + "\t" + s;
}

function ConnectToMysql() {
    var con = mysql.createConnection({
        host: "localhost",
        user: "testuser",
        password: "password"
    });
    return con;
}


