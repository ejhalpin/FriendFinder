//Pull in dependencies
//===============================================================
let path = require("path");
//===============================================================

//Build the api routes within the exports declaration for brevity
//===============================================================
module.exports = function(app) {
  // an endpoint to serve up the home page and allow front end logic to re-direct when necessary
  app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/home.html"));
  });

  // an endpoint to serve up the profile page and allow front end logic to hit the api for data
  app.get("/profile", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/profile.html"));
  });

  app.get("/create", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/survey-gen.html"));
  });
  // an endpoint to serve up the assets files for externally linked css and scripts
  // app.get("/assets/:dir/:file", (req, res) => {
  //   res.sendFile(path.join(__dirname, "../public/assets/" + req.params.dir + "/" + req.params.file));
  // });
};
//===============================================================
