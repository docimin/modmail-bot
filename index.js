const mysql  = require("mysql2"),
      fs     = require("fs"),
      config = require("./config.json");

validateDatabase().then(() => {
 let foundBot       = fs.existsSync(`${__dirname}/bot/index.js`),
     foundDashboard = fs.existsSync(`${__dirname}/dashboard/build/index.js`);
 if (foundBot || foundDashboard) {
  if (foundBot && ["both", "bot"].includes(config.run))
   require("./bot/index.js");
  if (foundDashboard && ["both", "dashboard"].includes(config.run))
   import("./dashboard/build/index.js");
 } else {
  console.log("Bot and dashboard not found");
 }
});

function validateDatabase() {

 return new Promise(async (resolve) => {

  let connection = mysql.createConnection({
    host     : config.database.host,
    user     : config.database.user,
    password : config.database.password,
    database : config.database.database
  });
   
  connection.connect(async (err) => {

   if (err) {
    console.log("[MySQL] Connection failed");
    console.log(err);
    return;
   }

   console.log("[MySQL] Connected");

   await new Promise((resolve) => connection.query(`CREATE TABLE IF NOT EXISTS tickets (
    id VARCHAR(12) NOT NULL,
    userId VARCHAR(32) NOT NULL,
    authorId VARCHAR(32) NOT NULL,
    dmChannelId VARCHAR(32) NOT NULL,
    reason TEXT,
    comment TEXT,
    attachedUsers TEXT,
    createdTimestamp VARCHAR(32) NOT NULL,
    closedTimestamp VARCHAR(32),
    closedAuthorId VARCHAR(32),
    messages TEXT,
    notifyUserIds TEXT,
    PRIMARY KEY (id)
   )`, (err) => err ? console.log(err) : resolve()));

   await new Promise((resolve) => connection.query(`CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(40) NOT NULL,
    access_token VARCHAR(32) NOT NULL,
    refresh_token VARCHAR(32) NOT NULL,
    PRIMARY KEY (id)
   )`, (err) => err ? console.log(err) : resolve()));

   await new Promise((resolve) => connection.query(`CREATE TABLE IF NOT EXISTS blocked (
    id VARCHAR(32) NOT NULL,
    authorId VARCHAR(32) NOT NULL,
    reason TEXT,
    blockedTimestamp VARCHAR(32) NOT NULL,
    PRIMARY KEY (id)
   )`, (err) => err ? console.log(err) : resolve()));

   await new Promise((resolve) => connection.query(`CREATE TABLE IF NOT EXISTS snippets (
    name VARCHAR(128) NOT NULL,
    content TEXT NOT NULL,
    PRIMARY KEY (name)
   )`, (err) => err ? console.log(err) : resolve()));

   await new Promise((resolve) => connection.query(`CREATE TABLE IF NOT EXISTS authorized (
    id VARCHAR(32) NOT NULL,
    type VARCHAR(4) NOT NULL,
    PRIMARY KEY (id)
   )`, (err) => err ? console.log(err) : resolve()));

   connection.end(() => {

    console.log("[MySQL] Validated");
    resolve();

   });

  });

 });

}