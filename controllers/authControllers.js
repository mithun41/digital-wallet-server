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
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        photo: user.photo,
        balance: user.balance,
        currency: user.currency,
        transactions: user.transactions,
        isVerified: user.isVerified,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get current user
const getMe = async (req, res) => {
  try {
    const user = req.user; // protect middleware থেকে আসছে

    if (!user) return res.status(404).json({ message: "User not found" });

    // full user data without pin
    res.json({
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        photo: user.photo,
        balance: user.balance,
        currency: user.currency,
        transactions: user.transactions,
        isVerified: user.isVerified,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
//  update profile
const updateProfile = async (req, res) => {
  try {
    const { name, photo } = req.body;

    if (!name && !photo) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const users = await usersCollection();
    const user = req.user; // ✅ protect middleware থেকে আসছে

    const updateData = {};
    if (name) updateData.name = name;
    if (photo) updateData.photo = photo;
    updateData.updatedAt = new Date();

    await users.updateOne({ _id: user._id }, { $set: updateData });

    // Updated user
    const updatedUser = await users.findOne({ _id: user._id });

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        phone: updatedUser.phone,
        photo: updatedUser.photo,
        balance: updatedUser.balance,
        currency: updatedUser.currency,
        transactions: updatedUser.transactions,
        isVerified: updatedUser.isVerified,
        role: updatedUser.role,
        status: updatedUser.status,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update Profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Reset PIN
const resetPin = async (req, res) => {
  try {
    const { oldPin, newPin } = req.body;
    if (!oldPin || !newPin) {
      return res
        .status(400)
        .json({ message: "Both old and new PIN are required" });
    }

    const users = await usersCollection();
    const user = req.user; // protect middleware থেকে আসছে

    // Check old PIN
    const isMatch = await bcrypt.compare(oldPin, user.pin);
    if (!isMatch) {
      return res.status(400).json({ message: "Old PIN is incorrect" });
    }

    // Hash new PIN and update
    const hashedNewPin = await bcrypt.hash(newPin, 10);
    await users.updateOne(
      { _id: user._id },
      { $set: { pin: hashedNewPin, updatedAt: new Date() } }
    );

    res.json({ message: "PIN updated successfully" });
  } catch (error) {
    console.error("Reset PIN error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  resetPin,
  updateProfile,
};
