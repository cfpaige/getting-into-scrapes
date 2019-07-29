// Dependencies:
const express = require("express");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const mongoose = require("mongoose");
const logger = require("morgan");
const router = require("./controllers/controller")

// Set mongoose to leverage built-in JavaScript ES6 Promises:
mongoose.Promise = Promise;

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

mongoose.connection.once("open", function () {
  console.log("Connected to the database.")
});

// App setup:
const app = express();
const PORT = process.env.PORT || 3000;

app.use(logger("dev"));
app.use(express.static("public"));
app.use(router);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.listen(PORT, function () {
  console.log(`App running on port: ${PORT}`);
});