const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const { usersCollection } = require("../config/collections");

// ------------------- User Controllers -------------------

// Register new user
const registerUser = async (req, res) => {
  try {
    const { name, phone, photo, pin } = req.body;
    const hashedPin = await bcrypt.hash(pin, 10);
    const users = await usersCollection();

    const newUser = {
      name,
      phone,
      pin: hashedPin,
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

// Login user
const loginUser = async (req, res) => {
  try {
    const { phone, pin } = req.body;
    const users = await usersCollection();
    const user = await users.findOne({ phone });

    if (!user)
      return res
        .status(404)
        .json({ message: "User not registered. Please sign up first." });

    if (user.lockUntil && user.lockUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      return res
        .status(403)
        .json({
          message: `Too many attempts. Suspended for ${minutesLeft} min.`,
        });
    }

    const isMatch = await bcrypt.compare(pin, user.pin);
    if (!isMatch) {
      let failedAttempts = (user.failedAttempts || 0) + 1;
      let updateDoc = { $set: { failedAttempts } };
      if (failedAttempts >= 3) {
        updateDoc = {
          $set: { failedAttempts: 0, lockUntil: Date.now() + 5 * 60 * 1000 },
        };
      }
      await users.updateOne({ _id: user._id }, updateDoc);
      return res.status(400).json({ message: "Invalid phone or PIN" });
    }

    await users.updateOne(
      { _id: user._id },
      { $set: { failedAttempts: 0, lockUntil: null } }
    );

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
    const user = req.user;
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user: { ...user, pin: undefined } });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const { name, photo } = req.body;
    if (!name && !photo)
      return res.status(400).json({ message: "Nothing to update" });

    const users = await usersCollection();
    const user = req.user;

    const updateData = {};
    if (name) updateData.name = name;
    if (photo) updateData.photo = photo;
    updateData.updatedAt = new Date();

    await users.updateOne({ _id: user._id }, { $set: updateData });
    const updatedUser = await users.findOne({ _id: user._id });

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Update Profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Reset PIN
const resetPin = async (req, res) => {
  try {
    const { oldPin, newPin } = req.body;
    if (!oldPin || !newPin)
      return res.status(400).json({ message: "Both old and new PIN required" });

    const users = await usersCollection();
    const user = req.user;
    const isMatch = await bcrypt.compare(oldPin, user.pin);
    if (!isMatch)
      return res.status(400).json({ message: "Old PIN is incorrect" });

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

// ------------------- Admin Controllers -------------------

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await usersCollection();
    const allUsers = await users.find({}).project({ pin: 0 }).toArray();
    res.json(allUsers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user status (block/unblock)
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "active" or "blocked"
    const users = await usersCollection();
    const user = await users.findOne({ _id: new ObjectId(id) });
    if (!user) return res.status(404).json({ message: "User not found" });

    await users.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );
    res.json({ message: `User status updated to ${status}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin reset user PIN
const resetUserPin = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPin } = req.body;
    if (!newPin)
      return res.status(400).json({ message: "New PIN is required" });

    const users = await usersCollection();
    const user = await users.findOne({ _id: new ObjectId(id) });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPin = await bcrypt.hash(newPin, 10);
    await users.updateOne(
      { _id: new ObjectId(id) },
      { $set: { pin: hashedPin, updatedAt: new Date() } }
    );
    res.json({ message: "User PIN reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  resetPin,
  updateProfile,
  getAllUsers,
  updateUserStatus,
  resetUserPin,
};
