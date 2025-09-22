// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { connectDB } = require("../config/db");

const usersCollection = async () => {
  const db = await connectDB();
  return db.collection("users");
};

// ✅ Register user
const registerUser = async (req, res) => {
  try {
    const { name, phone, photo, pin } = req.body;
    if (!name || !phone || !pin || !photo) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const users = await usersCollection();
    const existingUser = await users.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPin = await bcrypt.hash(pin, 10);
    const newUser = {
      name,
      phone,
      pin: hashedPin,
      photo,
      createdAt: new Date(),
    };

    const result = await users.insertOne(newUser);

    // JWT generate
    const token = jwt.sign(
      { id: result.insertedId, phone },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      user: { name, phone, photo },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Login user
const loginUser = async (req, res) => {
  try {
    const { phone, pin } = req.body;
    const users = await usersCollection();
    const user = await users.findOne({ phone });
    if (!user) return res.status(400).json({ message: "Invalid phone or PIN" });

    const isMatch = await bcrypt.compare(pin, user.pin);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid phone or PIN" });

    const token = jwt.sign(
      { id: user._id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: { name: user.name, phone: user.phone, photo: user.photo },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};


module.exports = { registerUser, loginUser };
