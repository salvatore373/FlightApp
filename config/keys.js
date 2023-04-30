//add this file to .gitignore
const connectionString = require('../configuration.js').connectionString;

module.exports = {
    google: {
        clientID: "503090863856-vvognqe0rnuj3sc87qus7om90f9l6a15.apps.googleusercontent.com",
        clientSecret: "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"
    },
    postgreSQL: {
        // connectionString : 'postgresql://postgres:alessio2001@localhost:5432/progetto1'
        connectionString: connectionString
    }
}