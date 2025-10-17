const { educationCollection } = require("../config/collections");

const education = async (req, res) => {
  try {
    console.log("✅ Received Education Request:", req.body);

    const collection = await educationCollection();
    console.log("✅ Connected to Education Collection");

    const {
      studentName,
      studentId,
      institution,
      feeAmount,
      discountPercent,
      discountAmount,
      totalAmount,
      paymentMethod,
    } = req.body;

    const educationData = {
      studentName,
      studentId,
      institution,
      feeAmount: parseFloat(feeAmount),
      discountPercent: parseFloat(discountPercent), 
      discountAmount: parseFloat(discountAmount),
      totalAmount: parseFloat(totalAmount),
      paymentMethod,
      transactionId: `EDU${Date.now()}`,
      status: "paid",
      createdAt: new Date(),
    };

    const result = await collection.insertOne(educationData);
    console.log("✅ Data Inserted:", result);

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { education };
