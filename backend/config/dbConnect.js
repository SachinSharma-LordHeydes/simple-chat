const mongoose = require('mongoose');

const MONGO_DB_URL = process.env.MONGO_DB_URL
const dbConnect = async () => {
    try {
        const dbConnectResponse = await mongoose.connect(MONGO_DB_URL);
        if (!dbConnectResponse) console.log("Internal server error occurred while connecting to database");
        console.log("Connection with database established successfully");
    } catch (error) {
        console.log("DB connection error:", error);
    }
};

module.exports = dbConnect;