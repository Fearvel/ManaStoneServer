var crypto = require('crypto');
var randomstring = require("randomstring");

function GenerateLicenseKey(progreamUUID) {
    var rawKey = randomstring.generate(18);
    return progreamUUID.substr(0, 2) + "-"
        + rawKey.substr(0, 6) + "-"
        + progreamUUID.substr(2, 6) + "-"
        + rawKey.substr(6, 6) + "-"
        + rawKey.substr(12, 6)
}

function GenerateAndAddLicenseKeyToDatabase(progreamUUID, dateOfExpiry, mysqlConnection, callback) {
    var licenseKey = GenerateLicenseKey(progreamUUID);

    mysqlConnection.query('SELECT ProgramId FROM ProgramListing where UUID = ?',
        [progreamUUID],
        (err, results) => {
            if (err) {
                console.log(err);
            } else {
                var expires = false;
                if (dateOfExpiry != null){
                    expires  = true;
                }
                mysqlConnection.query('Insert into LicenseKey (LicenseKey, Expires, DateOfExpiry, ProgramId) values (?,?,?,?)',
                    [licenseKey, expires, dateOfExpiry, results[0].ProgramId],
                    (err, results) => {
                        if (err) {
                            console.log(err);
                        }
                    });
            }
        });
    return licenseKey;
}

function GenerateActivationKey(uuid, hardwareId, licenseKey, dateOfExpiry) {

}

function GenerateToken(uuid, activationKey, dateOfExpiry) {

}

module.exports = {
    GenerateLicenseKey: GenerateLicenseKey,
    GenerateAndAddLicenseKeyToDatabase: GenerateAndAddLicenseKeyToDatabase,
    GenerateActivationKey: GenerateActivationKey,
    GenerateToken: GenerateToken,
};