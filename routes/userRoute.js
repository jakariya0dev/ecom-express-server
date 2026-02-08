import express from "express";
import { registerUser, loginUser, verifyEmail, resendOtp } from "../controllers/userControllers.js";

const userRouter = express.Router();

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
userRouter.post("/register", registerUser);

// @route   POST /api/users/verify
// @desc    Verify a user
// @access  Public
userRouter.post("/verify", verifyEmail);

// @route   POST /api/users/login
// @desc    Login a user
// @access  Public
userRouter.post("/login", loginUser);

// @route   POST /api/users/resend-otp
// @desc    Resend OTP
// @access  Public
userRouter.post("/resend-otp", resendOtp)

export default userRouter;