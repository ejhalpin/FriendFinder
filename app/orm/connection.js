//Pull in dependencies
//===================================================
let mysql = require("mysql");
require("dotenv").config();
//===================================================
//build the database connection and connect
//===============================================================
let connection = mysql.createConnection({
  host: "k2pdcy98kpcsweia.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
  port: 3306,
  user: process.env.SQL_NAME,
  password: process.env.SQL_PASS,
  database: process.env.DBASE
});

connection.connect(err => {
  if (err) throw err;
});
//===============================================================
module.exports = connection;
