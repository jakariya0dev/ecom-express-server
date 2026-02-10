import express from "express";
import { userRegisterController, userLoginController, verifyEmailController, resendOtpController, userLogoutController, forgotPasswordController, resetPasswordController } from "../controllers/authController.js";

const userRouter = express.Router();

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
userRouter.post("/register", userRegisterController);

// @route   POST /api/users/verify
// @desc    Verify a user
// @access  Public
userRouter.post("/verify", verifyEmailController);

// @route   POST /api/users/login
// @desc    Login a user
// @access  Public
userRouter.post("/login", userLoginController);

// @route   POST /api/users/resend-otp
// @desc    Resend OTP
// @access  Public
userRouter.post("/resend-otp", resendOtpController)

// @route   POST /api/users/logout
// @desc    Logout a user
// @access  Public
userRouter.post("/logout", userLogoutController);

// @route   POST /api/users/forgot-password
// @desc    Forgot password
// @access  Public
userRouter.post("/forgot-password", forgotPasswordController);

// @route   POST /api/users/reset-password
// @desc    Reset password
// @access  Public
userRouter.post("/reset-password", resetPasswordController);



export default userRouter;