const { ObjectId } = require("mongodb");
const {
  upgradeRequestsCollection,
  usersCollection,
} = require("../config/collections");

// User sends upgrade request
const applyUpgradeRequest = async (req, res) => {
  try {
    const { name, phone, photo } = req.body;
    if (!name || !phone || !photo)
      return res.status(400).json({ message: "All fields are required." });

    const collection = await upgradeRequestsCollection();

    // Check if user already has a pending request
    const existing = await collection.findOne({ phone, status: "pending" });
    if (existing) {
      return res
        .status(400)
        .json({ message: "You already have a pending request." });
    }

    const newRequest = {
      name,
      phone,
      photo,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await collection.insertOne(newRequest);
    res
      .status(201)
      .json({ message: "Upgrade request submitted successfully." });
  } catch (error) {
    console.error("Upgrade Request Error:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// Admin fetches all upgrade requests
const getUpgradeRequests = async (req, res) => {
  try {
    const collection = await upgradeRequestsCollection();
    const usersCol = await usersCollection();

    // Join requests with user role
    const requests = await collection
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "phone",
            foreignField: "phone",
            as: "user",
          },
        },
        { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            name: 1,
            phone: 1,
            status: 1,
            role: { $ifNull: ["$user.role", "user"] }, // default role is "user"
            createdAt: 1,
            updatedAt: 1,
          },
        },
      ])
      .sort({ createdAt: -1 })
      .toArray();

    res.json(requests);
  } catch (error) {
    console.error("Get Upgrade Requests Error:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// Admin approves a request → user role becomes merchant
const approveMerchantRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await upgradeRequestsCollection();
    const usersCol = await usersCollection();

    const request = await collection.findOne({ _id: new ObjectId(id) });
    if (!request)
      return res.status(404).json({ message: "Request not found." });

    // Update request status
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "approved", updatedAt: new Date() } }
    );

    // Update user role
    const updateResult = await usersCol.updateOne(
      { phone: request.phone },
      { $set: { role: "merchant", updatedAt: new Date() } }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ message: "User not found to upgrade" });
    }

    res.json({ message: "Merchant request approved and user role updated." });
  } catch (error) {
    console.error("Approve Error:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

// Admin rejects a request → delete request
const rejectMerchantRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const collection = await upgradeRequestsCollection();

    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0)
      return res.status(404).json({ message: "Request not found." });

    res.json({ message: "Merchant request rejected successfully." });
  } catch (error) {
    console.error("Reject Error:", error);
    res.status(500).json({ message: "Something went wrong." });
  }
};

module.exports = {
  applyUpgradeRequest,
  getUpgradeRequests,
  approveMerchantRequest,
  rejectMerchantRequest,
};
