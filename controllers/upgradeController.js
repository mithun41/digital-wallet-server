const { ObjectId } = require("mongodb");
const { upgradeRequestsCollection, usersCollection } = require("../config/collections");

// 🟢 Fetch All Requests (Admin)
const getUpgradeRequests = async (req, res) => {
  try {
    const collection = await upgradeRequestsCollection();
    const requests = await collection.find().sort({ createdAt: -1 }).toArray();
    res.json(requests);
  } catch (error) {
    console.error("Get Upgrade Requests Error:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// 🟢 User Sends Request
const applyUpgradeRequest = async (req, res) => {
  try {
    const { name, phone, photo } = req.body;
    if (!name || !phone || !photo)
      return res.status(400).json({ message: "All fields are required." });

    const collection = await upgradeRequestsCollection();

    const newRequest = {
      name,
      phone,
      photo,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await collection.insertOne(newRequest);
    res.status(201).json({ message: "Upgrade request submitted successfully." });
  } catch (error) {
    console.error("Upgrade Request Error:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// 🟢 Admin Approves Request
const approveMerchantRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await upgradeRequestsCollection();
    const usersCol = await usersCollection();

    const request = await collection.findOne({ _id: new ObjectId(id) });
    if (!request) return res.status(404).json({ message: "Request not found." });

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "approved", updatedAt: new Date() } }
    );

    await usersCol.updateOne(
      { phone: request.phone },
      { $set: { role: "merchant", updatedAt: new Date() } }
    );

    res.json({ message: "Merchant request approved successfully." });
  } catch (error) {
    console.error("Approve Error:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// 🔴 Admin Rejects Request (Deletes It)
const rejectMerchantRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await upgradeRequestsCollection();

    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0)
      return res.status(404).json({ message: "Request not found or already deleted." });

    res.json({ message: "Merchant request rejected and deleted successfully." });
  } catch (error) {
    console.error("Reject Error:", error);
    res.status(500).json({ message: "Failed to delete request." });
  }
};

module.exports = {
  applyUpgradeRequest,
  getUpgradeRequests,
  approveMerchantRequest,
  rejectMerchantRequest,
};
