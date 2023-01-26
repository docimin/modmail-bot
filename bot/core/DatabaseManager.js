const mysql = require("mysql2");

// changing one connection to a pool for better performance and to prevent the connection from being closed by the database
module.exports = mysql.createPool({
 host     : process.env.DATABASE_HOST,
 user     : process.env.DATABASE_USER,
 password : process.env.DATABASE_PASSWORD,
 database : process.env.DATABASE_DATABASE,
 multipleStatements: true,
 // keepAlive to try to prevent the connection from being closed by the database
 keepAliveInitialDelay: 28799 // 1s less than 8 hours | default timeout when no activity is detected is 8 hours
});