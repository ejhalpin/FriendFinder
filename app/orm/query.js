//pull in the connection
//==========================================
let connection = require("./connection");
//==========================================

//orm is an object of methods which will return a promise that resolves to a JSON formatted data in the data key:
/*
  {
    status: code ==> 200, 409, 500, etc
    reason: "success" | err.code
    data: undefined | raw data from the query
  }
*/
var orm = {
  //update will update an exisiting entry in the database
  update: (table, setData, selectData, selectData2) => {
    return new Promise(resolve => {
      if (selectData2) {
        console.log("conditional update");
        connection.query("UPDATE ?? SET ? WHERE ( ? AND ? )", [table, setData, selectData, selectData2], (err, data) => {
          if (err) {
            return resolve({
              status: 500,
              reason: err.code
            });
          }
          resolve({ status: 200, reason: "success", data: data });
        });
      } else {
        console.log("single value update");
        connection.query("UPDATE ?? SET ? WHERE ?", [table, setData, selectData], (err, data) => {
          if (err) {
            return resolve({
              status: 500,
              reason: err.code
            });
          }
          resolve({ status: 200, reason: "success", data: data });
        });
      }
    });
  },
  //includes will return a key-value pair test: true | false
  includes: (table, colValPair, colValPair2) => {
    return new Promise(resolve => {
      if (colValPair2) {
        console.log("two column-value pairs");
        connection.query("SELECT * FROM ?? WHERE ? AND ?", [table, colValPair, colValPair2], (err, data) => {
          if (err) {
            return resolve({ status: 500, reason: err.code });
          }
          var test = data.length > 0;
          resolve({ status: 200, reason: "success", test: test, data: data });
        });
      } else {
        console.log("one column-value-pair");
        connection.query("SELECT * FROM ?? WHERE ?", [table, colValPair], (err, data) => {
          if (err) {
            return resolve({ status: 500, reason: err.code });
          }
          var test = data.length > 0;
          resolve({ status: 200, reason: "success", test: test, data: data });
        });
      }
    });
  },

  //insert will insert object data into a table
  insert: (table, objDat) => {
    return new Promise(resolve => {
      connection.query("INSERT INTO ?? SET ?", [table, objDat], (err, data) => {
        if (err) {
          console.log("error insert");
          console.log(err);
          return resolve({ status: 500, reason: err.code });
        }
        console.log("insert");
        resolve({ status: 200, reason: "success", data: data });
      });
    });
  },

  select: (table, select, colValPair) => {
    return new Promise(resolve => {
      if (colValPair) {
        connection.query("SELECT ?? FROM ?? WHERE ?", [select, table, colValPair], (err, data) => {
          if (err) {
            console.log("error insert");
            console.log(err);
            return resolve({ status: 500, reason: err.code });
          }
          resolve({ status: 200, reason: "success", data: data });
        });
      } else {
        connection.query("SELECT ?? FROM ??", [select, table], (err, data) => {
          if (err) {
            console.log("error insert");
            console.log(err);
            return resolve({ status: 500, reason: err.code });
          }
          resolve({ status: 200, reason: "success", data: data });
        });
      }
    });
  },

  selectAll: table => {
    return new Promise(resolve => {
      connection.query("SELECT * FROM ??", [table], (err, data) => {
        if (err) {
          console.log("error insert");
          console.log(err);
          return resolve({ status: 500, reason: err.code });
        }
        resolve({ status: 200, reason: "success", data: data });
      });
    });
  },

  twoColumnCheck: function(table, colVal1, colVal2, colVal3, colVal4) {
    return new Promise(resolve => {
      connection.query("SELECT * FROM ?? WHERE (? AND ?) OR (? AND ?)", [table, colVal1, colVal2, colVal3, colVal4], (err, data) => {
        if (err) {
          console.log("error insert");
          console.log(err);
          return resolve({ status: 500, reason: err.code });
        }
        resolve({ status: 200, reason: "success", data: data });
      });
    });
  },

  convolutedThreeTableJoin: function(user_id) {
    return new Promise(resolve => {
      connection.query(
        "select matches.match_id, matches.score, surveys.id as survey_id, surveys.name as survey_name, user_profile.name as match_name from matches join surveys on matches.survey_id = surveys.id join user_profile on matches.match_id = user_profile.id where matches.user_id = ?",
        [user_id],
        (err, data) => {
          if (err) {
            console.log("error insert");
            console.log(err);
            return resolve({ status: 500, reason: err.code });
          }
          resolve({ status: 200, reason: "success", data: data });
        }
      );
    });
  }
};

module.exports = orm;
