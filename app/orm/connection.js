//Pull in dependencies
//===================================================
let mysql = require("mysql");
require("dotenv").config();
//===================================================
//build the database connection and connect
//===============================================================
let connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: process.env.SQL_NAME,
  password: process.env.SQL_PASS,
  database: "friends_db"
});

connection.connect(err => {
  if (err) throw err;
});
//===============================================================
module.exports = connection;
