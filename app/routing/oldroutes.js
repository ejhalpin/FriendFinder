
  
  

 

  
 

  

  

 

  app.post("/survey/submit", (req, res) => {
    //each survey has its own table of results. table names are of the form:
    //  scores_<survey id>
    //get all the results currently in the survey table
    connection.query("SELECT * FROM scores_" + req.body.survey_id, (err, data) => {
      if (err) {
        console.log("error at 180: " + err);
        return res.status(500).end();
      }
      //save the results in the scores_id table
      connection.query(
        "INSERT INTO scores_" + req.body.survey_id + " SET ?",
        [{ user_id: req.body.user_id, user_name: req.body.user_name, answers: req.body.results }],
        err => {
          if (err) {
            console.log("error at 217: " + err);
            return res.status(500).end();
          }
        }
      );
      //calculate the scores
      var scores = [];
      //loop through the data returned from the query and compile an object containing a score and match data
      data.forEach(entry => {
        if (entry.user_name === req.body.user_name) return;
        scores.push({
          score: reduce(req.body.results, entry.answers, parseInt(req.body.nq)),
          name: entry.user_name,
          id: entry.user_id
        });
      });
      //check to see if scores are empty
      if (scores.length === 0) {
        return res.json({
          status: 300
        });
      }
      //sort the scores array ascending.
      scores.sort((a, b) => {
        return a.score - b.score;
      });
      //check to see if the user has match data for this survey
      connection.query("SELECT survey_name FROM table_" + req.body.user_id, (err, data) => {
        if (err) {
          return res.status(500).end();
        }
        //if the survey name exists in the column
        if (data.length > 0) {
          //update the data
          connection.query(
            "UPDATE table_" + req.body.user_id + " SET ? WHERE ?",
            [{ match_name: scores[0].name, score: scores[0].score }, { survey_name: req.body.survey_name }],
            err => {
              if (err) {
                return res.status(500).end();
              }
            }
          );
        } else {
          //insert the data
          connection.query(
            "INSERT INTO table_" + req.body.user_id + " SET ?",
            [{ survey_name: req.body.survey_name, match_name: scores[0].name, score: scores[0].score }],
            err => {
              if (err) {
                console.log("ERROR at 207: " + err);
                return res.status(500).end();
              }
            }
          );
        }
      });
      //check to see if the match user has survey data in the table
      //check to see if the user has match data for this survey
      connection.query("SELECT survey_name FROM table_" + scores[0].id, (err, data) => {
        if (err) {
          return res.status(500).end();
        }
        //if the survey name exists in the column
        if (data.length > 0) {
          //update the data
          connection.query(
            "UPDATE table_" + scores[0].id + " SET ? WHERE ?",
            [{ match_name: req.body.user_name, score: scores[0].score }, { survey_name: req.body.survey_name }],
            err => {
              if (err) {
                return res.status(500).end();
              }
            }
          );
        } else {
          //insert the data
          connection.query(
            "INSERT INTO table_" + scores[0].id + " SET ?",
            [{ survey_name: req.body.survey_name, match_name: req.body.user_name, score: scores[0].score }],
            err => {
              if (err) {
                console.log("ERROR at 207: " + err);
                return res.status(500).end();
              }
            }
          );
        }
      });
      res.json(scores[0]);
    });
  });

  //an endpoint to create a survey
  app.post("/api/create", (req, res) => {
    //add the survey to the survey table
    console.log(req.body);
  });
};

// private methods for authentication
//===============================================================



// a function that will calculate the reduced score for two users
function reduce(scorestring1, scorestring2, n) {
  n = 40 * n;
  var score = 0;
  var ans1 = scorestring1.split(",");
  var ans2 = scorestring2.split(",");
  for (var i = 0; i < ans1.length; i++) {
    score += Math.abs(parseInt(ans1[i]) - parseInt(ans2[i]));
  }
  return (((n - score) / n) * 100).toFixed(2);
}
