const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { connectDB } = require("../config/db");
const { ObjectId } = require("mongodb");

const usersCollection = async () => {
  const db = await connectDB();
  return db.collection("users");
};

const registerUser = async (req, res) => {
  try {
    const { name, phone, photo, pin } = req.body;

    // Hash the pin before storing it
    const hashedPin = await bcrypt.hash(pin, 10);

    // Get the users collection from the database
    const users = await usersCollection();

    const newUser = {
      name,
      phone,
      pin: hashedPin, // Store the hashed pin
      photo,
      balance: 0.0,
      currency: "BDT",
      transactions: [],
      isVerified: true,
      role: "user",
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await users.insertOne(newUser);

    const token = jwt.sign(
      { id: result.insertedId, phone },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      user: {
        name,
        phone,
        photo,
        balance: newUser.balance,
        isVerified: newUser.isVerified,
        role: newUser.role,
        status: newUser.status,
      },
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

// ✅ Get current user
const getMe = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = await usersCollection();
    const user = await users.findOne({ _id: new ObjectId(decoded.id) });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      user: { name: user.name, phone: user.phone, photo: user.photo },
    });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(401).json({ message: "Invalid token" });
  }
};

// ✅ Reset PIN
const resetPin = async (req, res) => {
  try {
    const { phone, oldPin, newPin } = req.body;
    if (!phone || !oldPin || !newPin) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const users = await usersCollection();
    const user = await users.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Check old PIN
    const isMatch = await bcrypt.compare(oldPin, user.pin);
    if (!isMatch) {
      return res.status(400).json({ message: "Old PIN is incorrect" });
    }

    // Hash new PIN and update
    const hashedNewPin = await bcrypt.hash(newPin, 10);
    await users.updateOne({ phone }, { $set: { pin: hashedNewPin } });

    res.json({ message: "PIN updated successfully" });
  } catch (error) {
    console.error("Reset PIN error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  resetPin,
};
