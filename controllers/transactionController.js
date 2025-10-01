const bcrypt = require("bcryptjs");
const {
  usersCollection,
  transactionsCollection,
} = require("../config/collections");
const { ObjectId } = require("mongodb");
const { getClient } = require("../config/db"); // MongoDB client for session

// Helper: round to 2 decimal places
const roundTo2 = (num) => Math.round(num * 100) / 100;

// ========================== SEND MONEY ==========================
const sendMoney = async (req, res) => {
  const client = getClient();
  const session = client.startSession();

  try {
    const { receiverPhone, amount, note, password } = req.body;
    const sendAmount = parseFloat(amount);

    if (isNaN(sendAmount) || sendAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    await session.withTransaction(async () => {
      const users = await usersCollection();

      // Sender
      const sender = await users.findOne(
        { _id: new ObjectId(req.user._id) },
        { session }
      );
      if (!sender) throw new Error("Sender not found");

      // ✅ Password check
      const isMatch = await bcrypt.compare(password, sender.pin);
      if (!isMatch) throw new Error("Invalid password");

      // Receiver
      const receiver = await users.findOne(
        { phone: receiverPhone },
        { session }
      );
      if (!receiver) throw new Error("Receiver not found");

      if (sender.balance < sendAmount) throw new Error("Insufficient balance");

      // Update balances
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

      // Save transaction
      const transactionId =
        "TXN-" + Date.now() + "-" + Math.floor(1000 + Math.random() * 9000);

      const transactions = await transactionsCollection();
      const transactionDoc = {
        transactionId,
        type: "sendMoney",
        senderId: sender._id,
        receiverId: receiver._id,
        senderPhone: sender.phone,
        senderName: sender.name,
        receiverName: receiver.name,
        senderImage: sender.photo || null,
        receiverPhone: receiver.phone,
        receiverImage: receiver.photo || null,
        amount: roundTo2(sendAmount),
        note: note || "",
        status: "success",
        createdAt: new Date(),
      };
      await transactions.insertOne(transactionDoc, { session });

      res.status(200).json({
        message: "Money sent successfully",
        transaction: transactionDoc,
      });
    });
  } catch (error) {
    console.error("Send Money Confirm Error:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  } finally {
    await session.endSession();
  }
};

// ========================== CASHOUT ==========================
const cashout = async (req, res) => {
  const client = getClient();
  const session = client.startSession();

  try {
    const { merchantPhone, amount, note, password } = req.body;
    const cashoutAmount = parseFloat(amount);

    if (isNaN(cashoutAmount) || cashoutAmount <= 0)
      return res.status(400).json({ message: "Invalid amount" });

    await session.withTransaction(async () => {
      const users = await usersCollection();

      // Sender
      const sender = await users.findOne(
        { _id: new ObjectId(req.user._id) },
        { session }
      );
      if (!sender) throw new Error("Sender not found");

      // Password check
      const isPasswordValid = await bcrypt.compare(password, sender.pin);
      console.log(sender.pin);
      if (!isPasswordValid) throw new Error("Incorrect password");

      if (sender.balance < cashoutAmount)
        throw new Error("Insufficient balance");

      // Merchant
      const merchant = await users.findOne(
        { phone: merchantPhone, role: "merchant" },
        { session }
      );
      if (!merchant) throw new Error("Merchant account not found");

      // Update balances
      await users.updateOne(
        { _id: sender._id },
        { $inc: { balance: -roundTo2(cashoutAmount) } },
        { session }
      );
      await users.updateOne(
        { _id: merchant._id },
        { $inc: { balance: roundTo2(cashoutAmount) } },
        { session }
      );

      // Save transaction
      const transactionId =
        "TXN-" + Date.now() + "-" + Math.floor(1000 + Math.random() * 9000);
      const transactions = await transactionsCollection();
      const transactionDoc = {
        transactionId,
        type: "cashout",
        senderId: sender._id,
        receiverId: merchant._id,
        senderPhone: sender.phone,
        senderImage: sender.photo || null,
        senderName: sender.name,
        merchantName: merchant.name,
        merchantPhone: merchant.phone,
        merchantImage: merchant.photo || null,
        amount: roundTo2(cashoutAmount),
        note: note || "",
        status: "success",
        createdAt: new Date(),
      };
      await transactions.insertOne(transactionDoc, { session });

      res.status(200).json({
        message: "Cashout successful",
        transaction: transactionDoc,
      });
    });
  } catch (error) {
    console.error("Cashout Error:", error);
    res.status(400).json({ message: error.message || "Cashout failed" });
  } finally {
    await session.endSession();
  }
};

// ========================== GET TRANSACTIONS ==========================
const getTransactions = async (req, res) => {
  try {
    const userPhone = req.user.phone;

    const transactions = await (
      await transactionsCollection()
    )
      .find({
        $or: [{ senderPhone: userPhone }, { receiverPhone: userPhone }],
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(transactions);
  } catch (error) {
    console.error("Get Transactions Error:", error);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
};

module.exports = { sendMoney, cashout, getTransactions };
