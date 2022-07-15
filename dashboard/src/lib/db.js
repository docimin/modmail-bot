import mysql from "mysql2/promise";
import config from "$lib/config.js";

let connectionObj = {
 host     : config.database.host,
 user     : config.database.user,
 password : config.database.password,
 database : config.database.database
}

let connection = mysql.createConnection(connectionObj).catch((err) => console.log("[MySQL] Connection failed", err));

function query(...args) {

 connection.ping((err) => {

  if (err)
   connection = mysql.createConnection(connectionObj).catch((err) => console.log("[MySQL] Connection failed", err));

  connection.query(...args);

 });

}

export default {
 query
}