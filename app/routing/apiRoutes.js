//Pull in dependencies
//===============================================================
let mysql = require("mysql");
require("dotenv").config();
let crypto = require("crypto");
let axios = require("axios");
//===============================================================

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
module.exports = function(app) {
  //an auth endpoint to handle exisiting user logins
  app.post("/auth", (req, res) => {
    loginUser(req.body.email, req.body.pass).then(response => {
      res.status(response.status).json(response);
    });
  });

  //an auth endpoint to handle new user generation
  app.post("/auth/newuser", (req, res) => {
    createUserProfile(req.body.email, req.body.pass, req.body.user).then(response => {
      res.status(response.status).json(response);
    });
  });

  //an auth endpoint to handle logouts
  app.post("/auth/logout/:id", (req, res) => {
    connection.query("UPDATE user_profile SET ? WHERE ?", [{ status: false }, { id: req.params.id }], err => {
      if (err) {
        return res.status(500).json({
          status: 500,
          reason: "error updating user status"
        });
      }
      //status updated successfully
      res.status(200).json({
        status: 200,
        reason: "user successfully logged out"
      });
    });
  });

  //an api endpoint to load a user profile element (singular)
  app.get("/api/user/:id/:item", (req, res) => {
    var querystring = "SELECT " + req.params.item + " FROM user_profile WHERE id = " + req.params.id;
    connection.query(querystring, (err, data) => {
      if (err) {
        return res.status(500).json({
          status: 500,
          reason: "error fetching " + req.params.item + " from user profile with id (" + req.params.id + ")"
        });
      }
      res.json({
        status: 200,
        reason: "data retrieved successfully",
        data: data[0]
      });
    });
  });

  //an api endpoint to return the user match data
  app.get("/api/table/:id/table", (req, res) => {
    var querystring = "SELECT * FROM table_" + req.params.id;
    connection.query(querystring, (err, data) => {
      if (err) {
        return res.status(500).json({
          status: 500,
          reason: "error fetching data from user table"
        });
      }
      res.json({
        status: 200,
        reason: "user table data successfully retrieved",
        rows: data
      });
    });
  });

  //an endpoint to update user data (1 col per request) --TODO make it a put
  app.post("/api/user", (req, res) => {
    connection.query("UPDATE user_profile SET ? WHERE ?", req.body.data, err => {
      if (err) {
        res.status(500).json({
          status: 500,
          reason: "error updating user profile"
        });
      }
    });
    res.status(200).json({
      status: 200,
      reason: "user profile updated successfully"
    });
  });

  //an endpoint to fetch the top 12 trending giphy images
  app.get("/api/giphy", (req, res) => {
    var apiKey = process.env.API_KEY;
    console.log(apiKey);
    axios.get("https://api.giphy.com/v1/stickers/trending?api_key=" + process.env.API_KEY + "&limit=12").then(response => {
      var object = {
        urls: []
      };
      response.data.data.forEach(entry => {
        object.urls.push(entry.images.fixed_width.url);
      });
      res.json(object);
    });
  });

  //an andpoint to serve up the survey page
  app.get("/surveys", (req, res) => {
    //get the survey list from the database and send back the survey page
    connection.query("SELECT * FROM surveys", (err, data) => {
      if (err) {
        return res.status(500).end();
      }
      //format the data for handlebars
      var surveyData = {
        data: data
      };
      res.render("index", surveyData);
    });
  });
};

// private methods for authentication
//===============================================================

// a function which validates the presence or absence of data and returns a boolean based on the test case
function validate(keyVal, test) {
  return new Promise((resolve, reject) => {
    //validation of the user_profile table will query for a key-value pair from the table.
    //test <true|false> determines the validation type
    //true -> the entry exists in the database
    //false -> the entry is new / unique
    connection.query("SELECT * FROM user_profile WHERE ?", keyVal, (err, data) => {
      if (err) {
        //this is a tough one to handle
        reject(err);
      }
      if (test) return resolve(data.length === 1);
      // exists and is unique
      else return resolve(data.length === 0); // does not exist
    });
  });
}

// a function which validates the user email and password before creating and inserting the user data into the user_profile table and making a table_id table for the user
function createUserProfile(salt, pass, user) {
  return new Promise(resolve => {
    //validate the email address
    validate({ email: salt }, false).then(response => {
      if (!response) {
        return resolve({
          status: 409,
          reason: "an account exists for that email address"
        });
      }
      // validate the user name
      validate({ name: user }, false).then(response => {
        if (!response) {
          return resolve({
            status: 409,
            reason: "user name taken"
          });
        }
        // both the name and email are new / unique
        // genrate the user token
        crypto.pbkdf2(pass, salt, 100000, 16, "sha512", (err, derivedKey) => {
          if (err) {
            return resolve({
              status: 500,
              reason: "error generating token"
            });
          }
          //build the initial data object for the user
          var userObject = {
            name: user,
            token: derivedKey.toString("hex"),
            email: salt,
            status: true
          };
          //insert the data into the user_profile database
          connection.query("INSERT INTO user_profile SET ? ", userObject, (err, data) => {
            if (err) {
              return resolve({
                status: 500,
                reason: "error writing user profile"
              });
            }
            //the data was written successfully
            connection.query("SELECT * FROM user_profile WHERE ?", { token: derivedKey.toString("hex") }, (err, data) => {
              if (err || data.length === 0) {
                resolve({
                  status: 500,
                  reason: "error fetching user data"
                });
              }

              //data holds the user data key-value pairs
              var response = {
                status: 200,
                reason: "user created successfully",
                token: derivedKey.toString("hex"),
                name: user,
                quantum: data[0].id,
                photo: data[0].photo
              };

              //create a user table that will store survey names and corresponding match data
              var sql = "CREATE TABLE table_" + response.quantum + " (survey_name VARCHAR(32), match_name VARCHAR(80), score INTEGER(11))";

              connection.query(sql, (err, data) => {
                if (err) {
                  resolve({
                    status: 500,
                    reason: "error creating user table"
                  });
                }
                resolve(response);
              });
            });
          });
        });
      });
    });
  });
}

// a function which validates the user email before creating a token. The token is used to query the user_profile table to return the user data
function loginUser(salt, pass) {
  return new Promise(resolve => {
    //validate the user email
    validate({ email: salt }, true).then(response => {
      if (!response) {
        //the email does not exist in the database
        resolve({
          status: 409,
          reason: "invalid email address"
        });
      }
      // the email address exists. Create the token using the provided password
      crypto.pbkdf2(pass, salt, 100000, 16, "sha512", (err, derivedKey) => {
        if (err) {
          return resolve({
            status: 500,
            reason: "error generating token"
          });
        }
        //use the derived key to query the user_profile table and fetch the user data
        connection.query("SELECT * FROM user_profile WHERE ?", { token: derivedKey.toString("hex") }, (err, data) => {
          if (err) {
            return resolve({
              status: 500,
              reason: "error fetching user profile"
            });
          }
          if (data.length === 0) {
            return resolve({
              status: 409,
              reason: "invalid password"
            });
          }
          //the user data was fetched successfully. Build the user object
          var response = {
            status: 200,
            reason: "user successfully logged in",
            token: derivedKey.toString("hex"),
            name: data[0].name,
            quantum: data[0].id,
            photo: data[0].photo
          };
          //update the user status to true ==> logged in
          connection.query("UPDATE user_profile SET ? WHERE ?", [{ status: true }, { id: response.quantum }], err => {
            if (err) {
              return resolve({
                status: 500,
                reason: "error updating user status"
              });
            }
            //the user status was updated successfully
            resolve(response);
          });
        });
      });
    });
  });
}
