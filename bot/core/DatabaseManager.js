const mysql  = require("mysql2"),
      config = require("../../config.json");

module.exports = mysql.createConnection({
 host     : config.database.host,
 user     : config.database.user,
 password : config.database.password,
 database : config.database.database
});