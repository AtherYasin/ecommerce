require("dotenv").config();
//core modules
const path = require("path");

//Express
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const app = express();

//mongoose
const mongoose = require("mongoose");
const mongo = require("mongodb");
const dbName = require("./config/keys.js");

//multer


//mongoose Connection
const connection = require("./db/db.js");
connection();

//others
const flash = require("connect-flash");
const session = require("express-session");
//passport
const passport = require("passport");
require("./config/passport")(passport);


// const db = require("./config/keys").MongoURI;



//paths

const publicDirectoryPath = path.join(__dirname, "./public");

app.use(expressLayouts);
app.set("view engine", "ejs");

// const upload = require("./routes/upload");

app.use(express.static(publicDirectoryPath));
// app.use("/file", upload);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "scaredycat",
    resave: true,
    saveUninitialized: true,
  })
);

// app.use(passport.initialize());
// app.use(passport.session());

app.use(passport.authenticate("session"));

app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});






app.use("/", require("./routes/index"));
app.use("/users", require("./routes/users"));

const PORT = process.env.PORT || 4000;

app.listen(PORT, console.log(`server start on http://localhost:${PORT}`));
