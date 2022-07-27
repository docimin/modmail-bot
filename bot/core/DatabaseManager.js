const mysql = require("mysql2");

module.exports = mysql.createConnection({
 host     : process.env.DATABASE_HOST,
 user     : process.env.DATABASE_USER,
 password : process.env.DATABASE_PASSWORD,
 database : process.env.DATABASE_DATABASE
});