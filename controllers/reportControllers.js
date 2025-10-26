const { ObjectId } = require("mongodb");
const { reportCollection } = require("../config/collections");

// ================= USER CREATES REPORT =================
const userReport = async (req, res) => {
  try {
    const { userId, name, phone, reportText, type } = req.body;

    if (!name || !phone || !reportText || !type) {
      return res
        .status(400)
        .json({ message: "Name, phone, reportText and type are required" });
    }

    let userObjectId = null;
    if (userId) {
      if (!ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid userId format" });
      }
      userObjectId = new ObjectId(userId);
    }

    const allowedTypes = ["transaction", "login", "security", "bug", "other"];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid report type" });
    }

    const report = {
      name: name.trim(),
      phone: phone.trim(),
      reportText: reportText.trim(),
      type,
      status: "pending",
      adminNote: "", // admin feedback placeholder
      createdAt: new Date(),
    };

    if (userObjectId) report.userId = userObjectId;

    const collection = await reportCollection();
    const result = await collection.insertOne(report);

    if (result.insertedId) {
      return res.status(201).json({
        message: "Report submitted successfully",
        reportId: result.insertedId,
      });
    } else {
      return res.status(500).json({ message: "Failed to submit report" });
    }
  } catch (error) {
    console.error("Error submitting report:", error);
    return res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ================= ADMIN FETCHES ALL REPORTS =================
const getAllReports = async (req, res) => {
  try {
    const collection = await reportCollection();
    const reports = await collection.find({}).sort({ createdAt: -1 }).toArray();

    return res.status(200).json({
      message: "Reports fetched successfully",
      reports,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ================= ADMIN UPDATES REPORT =================
const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid report ID" });
    }

    const collection = await reportCollection();
    const updateFields = {};

    if (status) updateFields.status = status;
    if (adminNote !== undefined) updateFields.adminNote = adminNote;

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "No report found or no changes made" });
    }

    return res.status(200).json({
      message: "Report updated successfully",
    });
  } catch (error) {
    console.error("Error updating report:", error);
    return res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// ================= USER FETCHES OWN REPORTS =================
const getUserReports = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(400).json({ message: "User not found" });

    const collection = await reportCollection();
    const reports = await collection
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({
      message: "User reports fetched successfully",
      reports,
    });
  } catch (error) {
    console.error("Error fetching user reports:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  userReport,
  getAllReports,
  updateReport,
  getUserReports,
};
