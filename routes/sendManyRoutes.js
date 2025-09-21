const express = require('express');
const { createSendMany,getSendMany } = require('../controllers/sendManyController');

const router = express.Router();

// POST /api/send-many
router.post('/', createSendMany);
// get all send-many data 
router.get('/', getSendMany)

module.exports = router;
