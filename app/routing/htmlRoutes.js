//Pull in dependencies
//===============================================================
let path = require("path");
//===============================================================

//Build the api routes within the exports declaration for brevity
//===============================================================
module.exports = function(app) {
  app.get("/", (req, res) => {
    //Serve up the home page and allow front end logic to re-direct when necessary
    res.sendFile(path.join(__dirname, "../public/home.html"));
  });

  app.get("/profile", (req, res) => {
    //Serve up the profile page and allow front end logic to hit the api for data
    res.sendFile(path.join(__direname, "../public/profile.html"));
  });

  app.get("/assets/:dir/:file", (req, res) => {
    //Serve up the assets files for externally linked css and scripts as well as embedded images
    res.sendFile(path.join(__dirname, "../public/" + req.params.dir + "/" + req.params.file));
  });
};
//===============================================================
