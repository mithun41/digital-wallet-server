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
module.exports = {
  usersCollection,
  transactionsCollection,cardsCollection
};
