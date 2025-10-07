const bcrypt = require("bcryptjs");
const {
  usersCollection,
  transactionsCollection,
} = require("../config/collections");
const { ObjectId } = require("mongodb");
const { getClient } = require("../config/db"); // MongoDB client for session

// Helper: round to 2 decimal places
const roundTo2 = (num) => Math.round(num * 100) / 100;

// ========================== Electricity Bill ==========================

const PayBill = async (req, res) => {
  const client = getClient();
  const session = client.startSession();

  try {
    const { amount, method, details, password } = req.body;
    const billAmount = parseFloat(amount);

    console.log(req.user);

    if (isNaN(billAmount) || billAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }
    if (!details) {
      return res.status(400).json({ message: "Payment details required" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password required" });
    }

    await session.withTransaction(async () => {
      const users = await usersCollection();

      // Find user from token
      
      const user = await users.findOne(
        { _id: new ObjectId(req.user._id) },
        { session }
      );
      if (!user) throw new Error("User not found");

      if (user.balance < billAmount) {
        return res.status(400).json({ message: "Insufficient Balance" });
      }

      // 🔑 Password check
      const isMatch = await bcrypt.compare(password, user.pin || user.password);
      if (!isMatch) throw new Error("Invalid password");

      // ✅ Deduct balance
      await users.updateOne(
        { _id: user._id },
        { $inc: { balance: -roundTo2(billAmount) } },
        { session }
      );

      // ✅ Save transaction
      const transactionId =
        "TXN-" + Date.now() + "-" + Math.floor(1000 + Math.random() * 9000);

      const transactions = await transactionsCollection();
      const transactionDoc = {
        transactionId,
        userId: user._id,
        type: "electricity bill",
        method,
        details,
        amount: roundTo2(billAmount),
        status: "success",
        createdAt: new Date(),
      };

      await transactions.insertOne(transactionDoc, { session });

      res.status(200).json({
        message: "Electricity bill paid successfully!",
        transaction: transactionDoc,
      });
    });
  } catch (err) {
    console.error("Electricity Bill Error:", err);
    res.status(400).json({ message: err.message || "Failed to pay bill" });
  } finally {
    await session.endSession();
  }
};

// ========================== ADD MONEY ==========================

const addMoney = async (req, res) => {
  const client = getClient();
  const session = client.startSession();

  try {
    const { amount, method, details, password } = req.body;
    const addAmount = parseFloat(amount);

    console.log(req.user);

    if (isNaN(addAmount) || addAmount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }
    if (!details) {
      return res.status(400).json({ message: "Payment details required" });
    }
    if (!password) {
      return res.status(400).json({ message: "Password required" });
    }

    await session.withTransaction(async () => {
      const users = await usersCollection();

      // Find user from token
      const user = await users.findOne(
        { _id: new ObjectId(req.user._id) },
        { session }
      );
      if (!user) throw new Error("User not found");

      // 🔑 Password check (pin/password যেটা সেভ করেছো সেটাই compare করতে হবে)
      const isMatch = await bcrypt.compare(password, user.pin || user.password);
      if (!isMatch) throw new Error("Invalid password");

      // ✅ Update balance
      await users.updateOne(
        { _id: user._id },
        { $inc: { balance: roundTo2(addAmount) } },
        { session }
      );

      // ✅ Save transaction
      const transactionId =
        "TXN-" + Date.now() + "-" + Math.floor(1000 + Math.random() * 9000);

      const transactions = await transactionsCollection();
      const transactionDoc = {
        transactionId,
        userId: user._id,
        type: "addMoney",
        method,
        details,
        amount: roundTo2(addAmount),
        status: "success",
        createdAt: new Date(),
      };

      await transactions.insertOne(transactionDoc, { session });

      res.status(200).json({
        message: "Money added successfully!",
        transaction: transactionDoc,
      });
    });
  } catch (err) {
    console.error("Add Money Error:", err);
    res.status(400).json({ message: err.message || "Failed to add money" });
  } finally {
    await session.endSession();
  }
};

// ========================== SEND MONEY ==========================
const sendMoney = async (req, res) => {
  const client = getClient();
  const session = client.startSession();

  try {
    const { receiverPhone, amount, fee, note, password } = req.body;
    const sendAmount = parseFloat(amount);
    const feeAmount = parseFloat(fee) || 0;

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

      // Admin (fee যাবে এখানে)
      const admin = await users.findOne({ role: "admin" }, { session });
      if (!admin) throw new Error("Admin account not found");

      // Balance check (sender balance >= amount + fee)
      if (sender.balance < sendAmount + feeAmount) {
        throw new Error("Insufficient balance");
      }

      // Sender থেকে total deduct (amount + fee)
      await users.updateOne(
        { _id: sender._id },
        { $inc: { balance: -roundTo2(sendAmount + feeAmount) } },
        { session }
      );

      // Receiver কে শুধু মূল টাকা দাও
      await users.updateOne(
        { _id: receiver._id },
        { $inc: { balance: roundTo2(sendAmount) } },
        { session }
      );

      // Fee → Admin এ যোগ করো
      if (feeAmount > 0) {
        await users.updateOne(
          { _id: admin._id },
          { $inc: { balance: roundTo2(feeAmount) } },
          { session }
        );
      }

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
        fee: roundTo2(feeAmount),
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
        receiverName: merchant.name,
        receiverPhone: merchant.phone,
        receiverImage: merchant.photo || null,
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
        $or: [
          { senderPhone: userPhone },
          { receiverPhone: userPhone },
          { type: "addMoney", userId: req.user._id }, // ✅ addMoney include
        ],
      })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(transactions);
  } catch (error) {
    console.error("Get Transactions Error:", error);
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await (await transactionsCollection())
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ transactions });
  } catch (err) {
    console.error("Get All Transactions Error:", err);
    res.status(500).json({ message: "Failed to fetch all transactions" });
  }
};
const refundTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const transactions = await transactionsCollection();
    const users = await usersCollection();

    const transaction = await transactions.findOne({ _id: new ObjectId(id) });
    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });
    if (transaction.status !== "success")
      return res
        .status(400)
        .json({ message: "Only completed transactions can be refunded" });

    // Refund amount to sender
    await users.updateOne(
      { phone: transaction.senderPhone },
      { $inc: { balance: transaction.amount } }
    );

    await transactions.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "Refunded", updatedAt: new Date() } }
    );

    res.json({ message: "Transaction refunded successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  sendMoney,
  cashout,
  getTransactions,
  addMoney,
  getAllTransactions,
  refundTransaction,
  PayBill,
};
