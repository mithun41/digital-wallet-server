// config/collections.js
const { connectDB } = require("./db");

const usersCollection = async () => {
  const db = await connectDB();
  return db.collection("users");
};

const transactionsCollection = async () => {
  const db = await connectDB();
  return db.collection("transactions");
};
const cardsCollection = async () => {
  const db = await connectDB();
  return db.collection("cards");
};


// =================================================================================
 const reportCollection = async () => {
  const db = await connectDB();
  return db.collection("report")
 }


module.exports = {
  usersCollection,
  transactionsCollection,
  cardsCollection,
  reportCollection
};
