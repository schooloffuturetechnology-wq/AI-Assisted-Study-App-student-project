const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { MongoMemoryServer } = require("mongodb-memory-server");

dotenv.config();

let memoryServer;

async function connectDB() {
  const useMemoryDB = process.env.USE_MEMORY_DB === "false";

  if (useMemoryDB) {
    memoryServer = await MongoMemoryServer.create();
    await mongoose.connect(memoryServer.getUri());
    console.log("Connected to in-memory MongoDB");
    return;
  }

  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) {
    throw new Error("MONGODB_URI is missing in environment variables.");
  }

  await mongoose.connect(mongoURI);
  console.log("Connected to MongoDB");
}

module.exports = connectDB;
