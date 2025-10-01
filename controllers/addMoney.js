const { getDB } = require("../config/db");

const addMoney = async (req, res) => {
  try {
    const db = getDB();

    const addMoneyCollections = db.collection("addMoney");
    const data = req.body;
    // console.log(data);
    if (!data) return res.status(400).json({ message: "no data available" });

    const result = await addMoneyCollections.insertOne(data);
    res.send(result);
    // console.log(result);
  } catch (error) {
    console.log("there are some issue in send money", error);
  }
};

module.exports = { addMoney };
