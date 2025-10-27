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

 const reportCollection = async () => {
  const db = await connectDB();
  return db.collection("report")
 }

const educationCollection = async () => {
  const db = await connectDB();
  return db.collection("education");
};
const upgradeRequestsCollection = async () => {
  const db = await connectDB();
  return db.collection("upgradeRequests");
};
// ===== Add Loan Collection =====
const loansCollection = async () => {
  const db = await connectDB();
  return db.collection("loans");
};

module.exports = {
  usersCollection,
  transactionsCollection,
  cardsCollection,
  reportCollection,
  loansCollection,
  educationCollection,
  upgradeRequestsCollection
};
