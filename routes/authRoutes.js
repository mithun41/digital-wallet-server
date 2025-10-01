// /routes/authRoutes.js
import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { addMoney } from "../controllers/addMoney.js";

const express = require("express");
const {
  registerUser,
  loginUser,
  getMe,
  resetPin,
  updateProfile,
  singleUser,
} = require("../controllers/authControllers");
const { protectByToken } = require("../middleware/authMiddleware");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post('/', addMoney)
router.post('/singleUser', singleUser)

export default router;
router.get("/me", protectByToken, getMe);
router.post("/reset-pin", protectByToken, resetPin);
router.put("/update-profile", protectByToken, updateProfile);
module.exports = router;
