const mongoose = require("mongoose");
require("dotenv").config();

const {DB_NAME} = process.env

const connect = async () => {
  try {
    await mongoose.connect(`mongodb://127.0.0.1:27017/${DB_NAME}`);
    console.log("Connected to MongoDB");
  } catch (e) {
    console.error(`Error connecting to MongoDB: ${e.message}`);
  }
};

module.exports = connect;
