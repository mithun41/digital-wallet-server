const jwt = require("jsonwebtoken");
const { ObjectId } = require("mongodb");
const { usersCollection } = require("../config/collections");

const protectByToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: No token" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }

    const users = await usersCollection();
<<<<<<< HEAD
    console.log(decoded.id);
    const user = await users.findOne({ _id: new ObjectId(decoded.id) });
    console.log(user);
=======
    // console.log(decoded.id);
    const user = await users.findOne({ _id: new ObjectId(decoded.id) });
    // console.log(user);
>>>>>>> 7e8f459a68ea2ef829b38e0402a26f15c03c0b7a
    if (!user)
      return res.status(401).json({ message: "Unauthorized: User not found" });

    req.user = user;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(401).json({ message: "Unauthorized: Token failed" });
  }
};

module.exports = { protectByToken };
