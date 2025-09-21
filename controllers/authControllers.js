const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { connectDB } = require("../config/db");

// ✅ lazy users collection
const usersCollection = async () => {
  const db = await connectDB();
  return db.collection("users");
};

const registerUser = async (req, res) => {
  try {
    const { name, phone, pin } = req.body;
    if (!name || !phone || !pin) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const users = await usersCollection();
    const existingUser = await users.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPin = await bcrypt.hash(pin, 10);
    await users.insertOne({
      name,
      phone,
      pin: hashedPin,
      createdAt: new Date(),
    });

    res.status(201).json({
      message: "User registered successfully",
      user: { name, phone },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { phone, pin } = req.body;
    const users = await usersCollection();
    const user = await users.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "Invalid phone or PIN" });
    }

    const isMatch = await bcrypt.compare(pin, user.pin);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid phone or PIN" });
    }

    const token = jwt.sign(
      { id: user._id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { name: user.name, phone: user.phone },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser };
