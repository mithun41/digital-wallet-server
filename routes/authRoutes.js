// /routes/authRoutes.js
import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";
import { addMoney } from "../controllers/sendMoney.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post('/', addMoney)

export default router;
