const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();

let db; // singleton

const connectDB = async () => {
  if (db) return db; // already connected
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db("digitalWalletDB");
  console.log("✅ MongoDB connected");
  return db;
};

const getDB = () => {
  if (!db) throw new Error("Database not initialized. Call connectDB first.");
  return db;
};

module.exports = { connectDB, getDB };
