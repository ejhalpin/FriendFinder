//Pull in dependencies
//===============================================================
let query = require("../orm/query");
let crypto = require("crypto");
let axios = require("axios");
//===============================================================
//to leverage the power of promises within the query module, export an async function
module.exports = async function(app) {
  //an api endpoint to handle all authentication requests
  app.post("/auth/:method", (req, res) => {
    //all incoming requests need to have the methode:<type> key-value pair in the body
    switch (req.params.method) {
      case "signup":
        createNewUser(req.body.name, req.body.email, req.body.password).then(function(response) {
          res.json(response);
        });
        break;
      case "login":
        loginUser(req.body.email, req.body.password).then(response => {
          res.json(response);
        });
        break;
      case "logout":
        query.update("user_profile", { status: false }, { id: req.body.id }).then(response => {
          res.status(response.status).json(response);
        });
    }
  });

  //an endpoint to retreive match data
  app.post("/match/:id", (req, res) => {
    query.select("user_profile", "*", { id: req.params.id }).then(response => {
      res.status(response.status).json({ name: response.data[0].name, photo: response.data[0].photo, brand: response.data[0].brand });
    });
  });

  //an endpoint to deliver an item from the user_profile table
  app.get("/user/:id/:item", (req, res) => {
    query.select("user_profile", req.params.item, { id: req.params.id }).then(response => {
      console.log(response);
      if (response.status === 200) {
        return res.json({ status: 200, reason: "success", data: response.data[0] });
      }

      res.status(response.status).json(response);
    });
  });

  //an endpoint to deliver a user's match data from the matches table
  app.get("/api/match/:id", (req, res) => {
    getMatchData(req.params.id).then(response => {
      res.json(response);
    });
  });

  //an endpoint to update user data
  app.post("/api/user", (req, res) => {
    query.update("user_profile", req.body.data[0], req.body.data[1]).then(response => {
      res.status(response.status).json(response);
    });
  });

  //an endpoint to fetch the top 12 trending giphy stickers
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
  app.get("/survey", (req, res) => {
    //get the survey list from the database and send back the survey page
    query.selectAll("surveys").then(response => {
      if (response.status === 200) {
        var surveyData = {
          data: response.data
        };
        return res.render("index", surveyData);
      }
      res.status(response.status).json(response);
    });
  });

  //an api endpoint to get survey questions by id
  app.get("/survey/:id", (req, res) => {
    query.select("surveys", "*", { id: req.params.id }).then(response => {
      if (response.status !== 200) {
        res.status(response.status).json(response);
      }
      var data = response.data[0];
      var questions = [];
      for (var i = 0; i < 15; i++) {
        var key = "q" + i;
        if (data[key]) {
          questions.push(data[key]);
        }
      }
      var surveyData = {
        author: data.author,
        title: data.name,
        id: data.id,
        nq: data.nq,
        questions: questions
      };
      res.render("survey", surveyData);
    });
  });

  //an endpoint to submit survey results and get back match data
  app.post("/survey/submit", (req, res) => {
    console.log(req.body);
    query.select("scores", "*", { survey_id: req.body.survey_id }).then(scores => {
      saveAnswers(req.body);
      var array = [];
      var D = parseInt(req.body.nq) * 4;
      var results = req.body.results.split(",");
      var data = scores.data;
      data.forEach(entry => {
        if (entry.user_id === req.body.user_id) return; //don't score against yourself
        var values = entry.answers.split(",");
        var score = 0;
        values.forEach((value, index) => {
          score += Math.abs(parseInt(value) - parseInt(results[index]));
        });
        array.push({
          match_id: entry.user_id,
          survey_id: req.body.survey_id,
          score: ((D - score) / D) * 100
        });
      });

      //check to see if scores are empty
      if (array.length === 0) {
        return res.json({
          status: 300,
          reason: "no data"
        });
      }
      array.sort((a, b) => {
        return b.score - a.score;
      });
      var match = array[0];
      //wirte the match data to the database for both users
      recordMatchData(req.body.user_id, match).then(response => {
        if (response.status !== 200) {
          res.status(response.status).json(response);
        }
        res.status(200).json(match);
      });
    });
  });

  //an endpoint to store a new survey
  app.post("/survey/create", (req, res) => {
    //organize the data
    var dataObject = {
      name: req.body.name,
      author: req.body.author,
      nq: req.body.nq
    };
    req.body.questions.forEach((value, index) => {
      var key = "q" + index;
      dataObject[key] = value;
    });
    query.insert("surveys", dataObject).then(response => {
      res.status(response.status).json(response);
    });
  });

  //an endpoint to return table data
  app.get("/api/search/:table", (req, res) => {
    query.selectAll(req.params.table, "*", "").then(response => {
      res.status(response.status).json({ response });
    });
  });
};
//==============================================================

//private method for collecting match data
var getMatchData = async function(id) {
  //load the user match data
  var matchQueryData = await query.convolutedThreeTableJoin(id);
  if (matchQueryData.stats !== 200) {
    console.log(matchQueryData);
    return new Promise(resolve => {
      resolve(matchQueryData);
    });
  }
  //gather the data into an array
  var results = [];
  return new Promise(resolve => {
    resolve(matchQueryData);
  });
};

//private methods for handling survey submission
//==============================================================

//a function to save the user survey answers
var saveAnswers = async function(data) {
  //see if the user has taken the survey before
  var test = await query.includes("scores", { user_id: data.user_id }, { survey_id: data.survey_id });
  if (test.status === 500) {
    throw new Error(test.reason);
  }
  if (test.test) {
    //the user has taken the survey in the past
    console.log("data exists, updating...");
    query.update("scores", { answers: data.results }, { user_id: data.user_id }, { survey_id: data.survey_id });
  } else {
    console.log("no data present, inserting...");
    query.insert("scores", { user_id: data.user_id, survey_id: data.survey_id, answers: data.results });
  }
};

//a function to record the match data for the user and match
var recordMatchData = async function(user_id, matchObject) {
  //query data for the user/survey and the match/survey combinations
  console.log(user_id);
  console.log(matchObject);
  var quickCheck = await query.twoColumnCheck(
    "matches",
    { user_id: user_id },
    { survey_id: matchObject.survey_id },
    { user_id: matchObject.match_id },
    { survey_id: matchObject.survey_id }
  );
  if (quickCheck.status !== 200) {
    console.log("error in quickcheck");
    console.log(quickCheck);
    return new Promise(resolve => {
      resolve(quickCheck);
    });
  }
  //this data will contain user/match/survey/score data
  var userDataExists = false;
  var matchDataExists = false;
  var data = quickCheck.data;
  data.forEach(entry => {
    console.log("============================");
    console.log(entry);
    console.log("============================");
    if (entry.user_id == user_id) {
      console.log("user data exisits!");
      userDataExists = true;
    }
    if (entry.user_id == matchObject.match_id) {
      matchDataExists = true;
      console.log("match data exists");
    }
  });

  var response = {
    status: 200,
    reason: "success"
  };
  var updateUserData;
  if (userDataExists) {
    console.log("user data existis, updating...");
    updateUserData = await query.update(
      "matches",
      { match_id: matchObject.match_id, score: matchObject.score },
      { user_id: user_id },
      { survey_id: matchObject.survey_id }
    );
  } else {
    console.log("no user data, inserting...");
    updateUserData = await query.insert("matches", {
      user_id: user_id,
      match_id: matchObject.match_id,
      survey_id: matchObject.survey_id,
      score: matchObject.score
    });
  }
  var updateMatchData;
  if (matchDataExists) {
    updateMatchData = await query.update(
      "matches",
      { match_id: user_id, score: matchObject.score },
      { user_id: matchObject.match_id },
      { survey_id: matchObject.survey_id }
    );
  } else {
    updateMatchData = await query.insert("matches", {
      user_id: matchObject.match_id,
      match_id: user_id,
      survey_id: matchObject.survey_id,
      score: matchObject.score
    });
  }

  if (updateUserData.status !== 200) {
    response.status = 500;
    response.reason = "error updating user match data";
  }
  if (updateMatchData.status !== 200) {
    response.status = 500;
    response.reason = "error updating match data";
  }
  if (updateUserData.status !== 200 && updateMatchData.status !== 200) {
    response.status = 500;
    response.reason = "error updating all match data";
  }
  return new Promise(resolve => {
    resolve(response);
  });
};
//==============================================================

//private routing methods for authentication
//==============================================================
//a function to generate a new user and insert the user into the user_profile table
var createNewUser = async function(name, email, password) {
  console.log(password);
  //make sure the email address is unique
  var testEmail = await query.includes("user_profile", { email: email });
  if (testEmail.status !== 200) {
    return new Promise(resolve => {
      console.log("email failed in DB");
      resolve(testEMail);
    });
  }
  if (testEmail.test) {
    testEmail.status = 409;
    testEmail.reason = "That email is already associated with an account.";
    return new Promise(resolve => {
      console.log("email failed 409");
      resolve(testEmail);
    });
  }
  //make sure the name is unique
  var testName = await query.includes("user_profile", { name: name });
  if (testName.status !== 200)
    return new Promise(resolve => {
      console.log("name failed in db");
      resolve(testName);
    });
  if (testName.test) {
    testName.status = 409;
    testName.reason = "That user name already exists.";
    return new Promise(resolve => {
      console.log("name failed 409");
      resolve(testName);
    });
  }
  //generate a key for the user
  var key = crypto.pbkdf2Sync(password, email, 100000, 16, "sha512");
  var token = key.toString("hex");
  //build the user object
  var userObject = {
    token: token,
    photo: "",
    name: name,
    email: email,
    brand: "",
    status: true
  };
  //add the user data to the database
  var response = await query.insert("user_profile", userObject);
  if (response.status === 500 || response === undefined) {
    return new Promise(resolve => {
      console.log("server error");
      resolve(response);
    });
  }
  var maskObject = {
    status: 200,
    reason: "user created successfully",
    token: token,
    name: name,
    quantum: response.data.insertId,
    photo: ""
  };
  return new Promise(resolve => {
    console.log("resolving mask");
    resolve(maskObject);
  });
};

//a function to login an existing user with token authentication
var loginUser = async function(email, password) {
  //validate the email address
  var emailTest = await query.includes("user_profile", { email: email });
  if (!emailTest.test) {
    //if the email doesn't exist in the database
    return new Promise(resolve => {
      resolve({
        status: 409,
        reason: "invalid email address"
      });
    });
  }
  var userData = emailTest.data[0];
  var key = crypto.pbkdf2Sync(password, email, 100000, 16, "sha512");
  var token = key.toString("hex");
  //compare the tokens...
  if (token === userData.token) {
    //cool! login time!
    await query.update("user_profile", { status: true }, { id: userData.id });
    var maskObject = {
      status: 200,
      reason: "user created successfully",
      token: token,
      name: userData.name,
      quantum: userData.id,
      photo: userData.photo
    };
    return new Promise(resolve => {
      resolve(maskObject);
    });
  }
  //the token's don't match
  return new Promise(resolve => {
    resolve({
      status: 409,
      reason: "invalid password"
    });
  });
};

//
