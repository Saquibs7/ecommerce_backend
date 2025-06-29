import express from "express";
import { signup,createAdmin,verifyOTP } from "../controllers/authController.js";
const router = express.Router();

router.post("/signup", signup);
router.post("/verifyOTP",verifyOTP)
router.post("/create-admin", createAdmin);
// router.post("/login", login);

export default router;
