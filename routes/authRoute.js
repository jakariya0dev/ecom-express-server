import express from "express";
import { userRegisterController, userLoginController, verifyEmailController, resendOtpController, userLogoutController, forgotPasswordController, resetPasswordController, userRefreshTokenController } from "../controllers/authController.js";

const authRoute = express.Router();

// @route   POST /api/users/register
// @desc    Register a new user
// @access  Public
authRoute.post("/register", userRegisterController);

// @route   POST /api/users/verify
// @desc    Verify a user
// @access  Public
authRoute.post("/verify", verifyEmailController);

// @route   POST /api/users/login
// @desc    Login a user
// @access  Public
authRoute.post("/login", userLoginController);

// @route   POST /api/users/resend-otp
// @desc    Resend OTP
// @access  Public
authRoute.post("/resend-otp", resendOtpController);

// @route   POST /api/users/logout
// @desc    Logout a user
// @access  Public
authRoute.post("/logout", userLogoutController);

// @route   POST /api/users/forgot-password
// @desc    Forgot password
// @access  Public
authRoute.post("/forgot-password", forgotPasswordController);

// @route   POST /api/users/reset-password
// @desc    Reset password
// @access  Public
authRoute.post("/reset-password", resetPasswordController);

// @Route   GET /api/auth/refresh
// @Desc    Refresh token
// @Access  Public
authRoute.get("/refresh", userRefreshTokenController); 


export default authRoute;