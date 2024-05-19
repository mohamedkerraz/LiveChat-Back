const mongoose = require("mongoose");
require("dotenv").config();

const MONGO_URI = `mongodb://${process.env.ADMIN_USERNAME}:${process.env.ADMIN_PASSWORD}@mongo:27017`;


mongoose
    .connect(MONGO_URI)
    .catch((error) => console.error("MongoDB connection error:", error));

module.exports = mongoose;