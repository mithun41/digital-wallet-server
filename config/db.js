// config/db.js
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();

let client;
let db;

const connectDB = async () => {
  if (db) return db; // singleton

  if (!client) {
    client = new MongoClient(process.env.MONGO_URI); // direct
  }

  try {
    await client.connect(); // Vercel safe
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ DB connection failed:", err);
    throw err;
  }

  db = client.db("digitalWalletDB");
  return db;
};

const getDB = () => {
  if (!db) throw new Error("Database not initialized. Call connectDB first.");
  return db;
};
const usersCollection = async () => {
  const database = await connectDB();
  return database.collection("users");
};

module.exports = { connectDB, getDB, usersCollection };
