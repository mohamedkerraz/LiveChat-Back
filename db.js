const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI = `mongodb://${process.env.ADMIN_USERNAME}:${process.env.ADMIN_PASSWORD}@localhost:${process.env.MONGO_PORT}` || "mongodb://localhost:27017/livechat";
console.log(MONGO_URI);

mongoose
    .connect(MONGO_URI)
    .catch((error) => console.error("MongoDB connection error:", error));

module.exports = mongoose;