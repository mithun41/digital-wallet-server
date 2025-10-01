const {
  usersCollection,
  transactionsCollection,
} = require("../config/collections");
const { ObjectId } = require("mongodb");
const { getClient } = require("../config/db"); // MongoDB client for session

const sendMoney = async (req, res) => {
  const client = getClient();
  const session = client.startSession();

  try {
    const { receiverPhone, amount, note } = req.body;
    const sendAmount = parseFloat(amount);
    if (isNaN(sendAmount) || sendAmount <= 0)
      return res.status(400).json({ message: "Invalid amount" });

    const roundTo2 = (num) => Math.round(num * 100) / 100;

    await session.withTransaction(async () => {
      const users = await usersCollection();

      // ✅ Sender
      const sender = await users.findOne(
        { _id: new ObjectId(req.user._id) },
        { session }
      );
      if (!sender) throw new Error("Sender not found");

      // ✅ Receiver
      const receiver = await users.findOne(
        { phone: receiverPhone },
        { session }
      );
      if (!receiver) throw new Error("Receiver not found");

      if (sender.balance < sendAmount) throw new Error("Insufficient balance");

      // ✅ Update balances
      await users.updateOne(
        { _id: sender._id },
        { $inc: { balance: -roundTo2(sendAmount) } },
        { session }
      );

      await users.updateOne(
        { _id: receiver._id },
        { $inc: { balance: roundTo2(sendAmount) } },
        { session }
      );

      // ✅ Save transaction
      const transactions = await transactionsCollection();
      const transactionDoc = {
        type: "sendMoney",
        senderId: sender._id,
        receiverId: receiver._id,
        senderPhone: sender.phone, // ✅ add this
        receiverPhone: receiver.phone,
        amount: roundTo2(sendAmount),
        note,
        status: "success",
        createdAt: new Date(),
      };

      await transactions.insertOne(transactionDoc, { session });

      // ✅ Response
      res.status(200).json({
        message: "Money sent successfully",
        transaction: transactionDoc,
      });
    });
  } catch (error) {
    console.error("Send Money Error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  } finally {
    await session.endSession();
  }
};

// ✅ Get User Transactions
const getTransactions = async (req, res) => {
  try {
    const userPhone = req.user.phone; // user er phone

    const transactions = await (
      await transactionsCollection()
    )
      .find({
        $or: [
          { senderPhone: userPhone }, // sender hishebe phone use
          { receiverPhone: userPhone }, // receiver hishebe phone use
        ],
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
};

module.exports = { sendMoney, getTransactions };
