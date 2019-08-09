//Pull in dependencies
//===============================================================
let express = require("express");
let exphbs = require("express-handlebars");
//===============================================================
//Do a little config on Handlebars to allow for grabbing the index
//within an each loop and incrementing the value (avoid 0)
//===============================================================
var hbs = exphbs.create({
  // Specify helpers which are only registered on this instance.
  helpers: {
    increment: function(value, options) {
      return parseInt(value) + 1;
    }
  }
});
//===============================================================
//Set up the express server
//===============================================================
var PORT = process.env.PORT || 8080;
var app = express();
app.use(express.static("app/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.engine("handlebars", hbs.engine, exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");
//===============================================================

//Bring in the html and api routes, passing in the express instance
//===============================================================
require("./app/routing/apiRoutes")(app);
require("./app/routing/htmlroutes")(app);
//===============================================================

//Give our server ears
//===============================================================
app.listen(PORT, () => {
  console.log("listening on port 8080");
});
//===============================================================
