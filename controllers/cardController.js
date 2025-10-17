const { connectDB } = require("../config/db");
const { ObjectId } = require("mongodb");


// Get cards collection
const cardsCollection = async () => {
  const db = await connectDB();
  return db.collection("cards");
};

// Add new card
const addCard = async (req, res) => {
  try {
    const { number, type, holder, expiry, phone } = req.body;
    const user = req.user;

    if (!number || !type || !holder || !expiry || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const maskedNumber = number.replace(/\d(?=\d{4})/g, "*"); // mask except last 4

    const newCard = {
      userId: new ObjectId(user._id),
      phone,
      number: maskedNumber,
      type,
      holder,
      expiry,
      balance: 5000,
      createdAt: new Date(),
    };

    const cards = await cardsCollection();
    const result = await cards.insertOne(newCard);

    res.status(201).json({ 
      message: "Card added successfully", 
      card: { ...newCard, _id: result.insertedId } 
    });
  } catch (error) {
    console.error("Add Card Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get cards by phone
const getCardsByPhone = async (req, res) => {
  try {
    const { phone } = req.params;
    const cards = await cardsCollection();
    const userCards = await cards.find({ phone }).toArray();
    res.json(userCards);
  } catch (error) {
    console.error("Get Cards Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Check if card exists (for BankTransfer)
const checkCard = async (req, res) => {
  try {
    const { cardNumber } = req.body;
    if (!cardNumber || cardNumber.length !== 16) {
      return res.status(400).json({ message: "Invalid card number" });
    }

    const last4 = cardNumber.slice(-4);
    const cards = await cardsCollection();

    const card = await cards.findOne({
      number: { $regex: `\\*?\\s*${last4}$` } // works with masked numbers
    });

    if (!card) {
      return res.json({ exists: false });
    }

    res.json({
      exists: true,
      user: {
        name: card.holder,
        phone: card.phone,
        photo: card.photo || null,
        number: card.number,
      },
    });
  } catch (err) {
    console.error("Check Card Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { addCard, getCardsByPhone, checkCard, cardsCollection };
