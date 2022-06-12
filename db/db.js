const mongoose = require("mongoose");
const dbName = require("../config/keys.js");

// console.log("dbName", dbName);

module.exports = async function connection() {
  try {
    const connectionParams = {
      useNewUrlParser: true,

      useUnifiedTopology: true,
    };
    await mongoose.connect(dbName.MongoURI, connectionParams);
    console.log("connected to database");
  } catch (error) {
    console.log(error);
    console.log("could not connect to database");
  }
};
