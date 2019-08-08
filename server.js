//Pull in dependencies
//===============================================================
let express = require("express");
let exphbs = require("express-handlebars");
//===============================================================

//Set up the express server
//===============================================================
var PORT = process.env.PORT || 8080;
var app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
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
