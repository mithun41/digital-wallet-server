// config/db.js
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");
dotenv.config();

let client;
let db;

const connectDB = async () => {
  if (db) return db; // singleton
  if (!client) client = new MongoClient(process.env.MONGO_URI);
  if (!client.isConnected?.()) await client.connect(); // ensure connected
  db = client.db("digitalWalletDB");
  console.log("MongoDB connected (Development)");
  return db;
};

const getDB = () => {
  if (!db) throw new Error("Database not initialized. Call connectDB first.");
  return db;
};

module.exports = { connectDB, getDB };
