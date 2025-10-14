const { ObjectId } = require("mongodb");
const { reportCollection } = require("../config/collections");

const userReport = async (req, res) => {
  try {
    const { userId, issue, type } = req.body;

    // Validate inputs
    if (!userId || !issue || !type) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate userId format
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId format" });
    }

    // Validate report type
    const allowedTypes = [
      "transaction",
      "login",
      "security",
      "bug",
      "other",
    ];
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ message: "Invalid report type" });
    }

    // Create report object
    const report = {
      userId: new ObjectId(userId),
      issue: issue.trim(),
      type,
      status: "pending", // Added status field
      createdAt: new Date(),
    };

    // Insert into database
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

module.exports = {
  userReport,
};



// const { reportCollection } = require('../config/collections'); // Destructure kore import
// const { ObjectId } = require("mongodb");


// const userReport = async (req, res) => {
//   try {
//     const { userId, issue, type } = req.body;

//     // Validate input
//     if (!userId || !issue || !type) {
//       return res.status(400).json({ message: 'Please provide userId, issue and type' });
//     }

//     // Validate userId format
//     if (!ObjectId.isValid(userId)) {
//       return res.status(400).json({ message: 'Invalid userId format' });
//     }

//     // Optionally validate type against allowed values
//     const allowedTypes = ["bug", "feature", "other"];
//     if (!allowedTypes.includes(type)) {
//       return res.status(400).json({ message: 'Invalid report type' });
//     }

//     const report = {
//       userId: new ObjectId(userId),
//       issue: issue.trim(),
//       type, // নতুন ফিল্ড
//       createdAt: new Date()
//     };

//     const collection = await reportCollection();
//     const result = await collection.insertOne(report);

//     if (result.insertedId) {
//       return res.status(201).json({
//         message: 'Report submitted successfully',
//         reportId: result.insertedId
//       });
//     } else {
//       return res.status(500).json({ message: 'Failed to submit report' });
//     }
//   } catch (error) {
//     console.error('Error submitting report:', error);
//     return res.status(500).json({
//       message: 'Server error',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// module.exports = {
//   userReport
// };



// const { reportCollection } = require('../config/collections'); // Destructure kore import
// const { ObjectId } = require("mongodb");
// const { getClient } = require("../config/db");

// const userReport = async (req, res) => {
//   try {
//     const { userId, issue } = req.body;

//     // Validate input
//     if (!userId || !issue) {
//       return res.status(400).json({ message: 'Please provide userId and issue' });
//     }

//     // Validate userId format
//     if (!ObjectId.isValid(userId)) {
//       return res.status(400).json({ message: 'Invalid userId format' });
//     }

//     // Create report object
//     const report = {
//       userId: new ObjectId(userId),
//       issue: issue.trim(),
//       createdAt: new Date()
//     };

//     // Get collection using await (IMPORTANT!)
//     const collection = await reportCollection(); // await diye function call koro
//     const result = await collection.insertOne(report);
    
//     if (result.insertedId) {
//       return res.status(201).json({ 
//         message: 'Report submitted successfully',
//         reportId: result.insertedId 
//       });
//     } else {
//       return res.status(500).json({ message: 'Failed to submit report' });
//     }
//   } catch (error) {
//     console.error('Error submitting report:', error);
//     return res.status(500).json({ 
//       message: 'Server error',
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };

// module.exports = {
//   userReport
// };