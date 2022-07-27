import mysql from "mysql2";
let connectionObj = {
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_DATABASE
};
let connection = mysql.createConnection(connectionObj);
connection.connect((err) => {
  if (err)
    return console.log("[MySQL] Connection failed", err);
  keepAlive();
  function keepAlive() {
    if (connection) {
      connection.query("SELECT 1");
      setTimeout(() => keepAlive(), 3e4);
    }
  }
});
function query(...args) {
  connection.ping((err) => {
    if (err)
      connection = mysql.createConnection(connectionObj);
    connection.query(...args);
  });
}
const db = {
  query
};
export {
  db as d
};
