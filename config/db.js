const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();

let db;

const connectDB = async () => {
  if (db) return db;

  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI not found in .env");

  const client = new MongoClient(uri);
  await client.connect();

  db = client.db("digitalWalletDB");
  console.log("MongoDB connected (Development)");
  return db;
};

const getDB = () => {
  if (!db) throw new Error("Database not initialized. Call connectDB first.");
  return db;
};

module.exports = { connectDB, getDB };
