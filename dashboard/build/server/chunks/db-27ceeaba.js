import mysql from "mysql2";
import { c as config } from "./config-3e06af2b.js";
let connectionObj = {
  host: config.database.host,
  user: config.database.user,
  password: config.database.password,
  database: config.database.database
};
let connection = mysql.createConnection(connectionObj);
function query(...args) {
  connection.ping((err) => {
    if (err)
      connection = mysql.createConnection(connectionObj);
    connection.query(...args);
  });
}
var db = {
  query
};
export { db as d };
