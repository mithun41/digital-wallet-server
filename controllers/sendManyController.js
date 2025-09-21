const { getDB } = require("../config/db");

const sendManyCollaction = () => getDB().collection('sendMany')

const createSendMany = async (req, res) => {
    try {
        const data = req.body;
        if (!data || (Array.isArray(data) && data.length == 0))
            return res.status(400).json({ message: 'No Data Provider' })
        const result = await sendManyCollaction().insertMany(
            Array.isArray(data) ? data : [data]
        )
        res.status(201).json({
            message: "Data saved successfully",
            insertedCount: result.insertedCount,
        })
    } catch (error) {
        res.status(500).json({ message: error.message });
    }

}

const getSendMany = async (req, res) => {
    try {
        const data = await sendManyCollaction().find({}).toArray();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = { createSendMany, getSendMany }