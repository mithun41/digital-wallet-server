const { ObjectId } = require("mongodb");
const { getClient } = require("../config/db");
const {
  usersCollection,
  loansCollection,
  transactionsCollection,
} = require("../config/collections");

// Helper: round to 2 decimal places
const roundTo2 = (num) => Math.round(num * 100) / 100;

// ========================== APPLY LOAN ==========================
const applyLoan = async (req, res) => {
  try {
    const loans = await loansCollection();
    const { amount, duration, purpose } = req.body;

    if (!amount || !duration) {
      return res
        .status(400)
        .json({ message: "Amount and duration are required." });
    }

    const newLoan = {
      userId: new ObjectId(req.user._id),
      amount: Number(amount),
      duration: Number(duration),
      purpose: purpose || "",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await loans.insertOne(newLoan);
    res.status(201).json({ message: "Loan request submitted successfully." });
  } catch (error) {
    console.error("Apply Loan Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========================== GET USER LOANS ==========================
const getUserLoans = async (req, res) => {
  try {
    const loans = await loansCollection();
    const userLoans = await loans
      .find({ userId: new ObjectId(req.user._id) })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(userLoans);
  } catch (error) {
    console.error("Get User Loans Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========================== GET ALL LOANS (ADMIN) ==========================
const getAllLoans = async (req, res) => {
  try {
    const loans = await loansCollection();
    const allLoans = await loans.find().sort({ createdAt: -1 }).toArray();
    res.json(allLoans);
  } catch (error) {
    console.error("Get All Loans Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========================== APPROVE LOAN (Interest-Free) ==========================
const approveLoan = async (req, res) => {
  const client = getClient();
  const session = client.startSession();

  try {
    const { id } = req.params;

    await session.withTransaction(async () => {
      const loans = await loansCollection();
      const users = await usersCollection();
      const transactions = await transactionsCollection();

      const loan = await loans.findOne({ _id: new ObjectId(id) }, { session });
      if (!loan) throw new Error("Loan not found");
      if (loan.status === "approved") throw new Error("Loan already approved");

      const totalPayable = roundTo2(loan.amount); // interest-free
      const monthlyInstallment = roundTo2(totalPayable / loan.duration);

      // Update loan
      await loans.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            status: "approved",
            totalPayable,
            monthlyInstallment,
            remainingBalance: totalPayable,
            nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(),
          },
        },
        { session }
      );

      // Update user balance
      const userId = new ObjectId(loan.userId);
      const updatedUser = await users.findOne({ _id: userId }, { session });
      if (!updatedUser) throw new Error("User not found for balance credit");

      await users.updateOne(
        { _id: userId },
        { $inc: { balance: totalPayable } },
        { session }
      );

      // Record transaction
      await transactions.insertOne(
        {
          transactionId: `TXN-${Date.now()}-${Math.floor(
            1000 + Math.random() * 9000
          )}`,
          userId: userId,
          type: "loanCredit",
          amount: totalPayable,
          purpose: "Loan credited",
          status: "success",
          createdAt: new Date(),
        },
        { session }
      );

      res.json({
        message: "Loan approved and credited to user balance.",
        loanId: loan._id,
      });
    });
  } catch (error) {
    console.error("Approve Loan Error:", error);
    res.status(500).json({ message: error.message });
  } finally {
    await session.endSession();
  }
};

// ========================== REJECT LOAN ==========================
const rejectLoan = async (req, res) => {
  try {
    const loans = await loansCollection();
    const { id } = req.params;

    await loans.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: "rejected", updatedAt: new Date() } }
    );

    res.json({ message: "Loan rejected." });
  } catch (error) {
    console.error("Reject Loan Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ========================== REPAY LOAN ==========================
const repayLoan = async (req, res) => {
  const client = getClient();
  const session = client.startSession();

  try {
    const { id } = req.params;

    await session.withTransaction(async () => {
      const loans = await loansCollection();
      const users = await usersCollection();
      const transactions = await transactionsCollection();

      const loan = await loans.findOne({ _id: new ObjectId(id) }, { session });
      if (!loan) throw new Error("Loan not found");
      if (loan.status !== "approved")
        throw new Error("Loan is not active for repayment");

      const user = await users.findOne(
        { _id: new ObjectId(loan.userId) },
        { session }
      );
      if (!user) throw new Error("User not found");
      if (user.balance < loan.monthlyInstallment)
        throw new Error("Insufficient balance to repay installment");

      // Deduct installment
      await users.updateOne(
        { _id: new ObjectId(loan.userId) },
        { $inc: { balance: -roundTo2(loan.monthlyInstallment) } },
        { session }
      );

      // Update loan remainingBalance & status
      const newRemaining = roundTo2(
        loan.remainingBalance - loan.monthlyInstallment
      );
      const newStatus = newRemaining <= 0 ? "completed" : "approved";

      await loans.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            remainingBalance: Math.max(newRemaining, 0),
            status: newStatus,
            nextDueDate:
              newStatus === "completed"
                ? null
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(),
          },
        },
        { session }
      );

      // Record transaction
      await transactions.insertOne(
        {
          transactionId: `TXN-${Date.now()}-${Math.floor(
            1000 + Math.random() * 9000
          )}`,
          userId: loan.userId,
          type: "loanRepayment",
          amount: roundTo2(loan.monthlyInstallment),
          purpose: "Loan installment repayment",
          status: "success",
          createdAt: new Date(),
        },
        { session }
      );

      res.json({
        message:
          newStatus === "completed"
            ? "Loan fully repaid!"
            : "Installment repaid successfully.",
        remainingBalance: Math.max(newRemaining, 0),
        loanStatus: newStatus,
      });
    });
  } catch (error) {
    console.error("Repay Loan Error:", error);
    res.status(500).json({ message: error.message });
  } finally {
    await session.endSession();
  }
};

module.exports = {
  applyLoan,
  getUserLoans,
  getAllLoans,
  approveLoan,
  rejectLoan,
  repayLoan,
};
