// config/db.js (Updated)
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();

let client;
let db;

const connectDB = async () => {
  if (db) return db; // singleton

  if (!client) {
    // ক্লায়েন্ট অবজেক্ট তৈরি এবং গ্লোবালি রাখা
    client = new MongoClient(process.env.MONGO_URI);
  }

  try {
    await client.connect();
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

// ✅ নতুন ফাংশন: ট্রানজেকশনের জন্য MongoClient ক্লায়েন্ট এক্সপোর্ট করা হলো
const getClient = () => {
  if (!client)
    throw new Error("MongoClient not initialized. Call connectDB first.");
  return client;
};

module.exports = { connectDB, getDB, getClient };
