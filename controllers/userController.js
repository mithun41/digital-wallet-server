const { usersCollection } = require("../config/collections");

const checkUserByPhone = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "Phone is required" });
    }

    // ✅ collection নাও
    const collection = await usersCollection();
    const user = await collection.findOne({ phone });

    if (!user) {
      return res.status(200).json({
        success: true,
        exists: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      exists: true,
      user: {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        photo: user.photo || null, // 👈 profile image পাঠানো হলো
      },
    });
  } catch (err) {
    console.error("Error checking user:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { checkUserByPhone };
