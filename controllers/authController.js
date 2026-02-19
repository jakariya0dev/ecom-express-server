import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { sendEmail, optEmailTemplate } from "../services/emailService.js";
import {
  generateAccessToken,
  generateHashedPassword,
  generateRefreshToken,
  generateOtpAndHashToken,
} from "../utils/auth.js";
import dotenv from "dotenv";
dotenv.config();

// register new user
export const userRegisterController = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

    // hashed password and otp with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const hashedOtp = await bcrypt.hash(otp, salt);

    // save user to database
    const user = new User({
      name,
      email,
      password: hashedPassword,
      otp: hashedOtp,
      otpExpires,
    });
    await user.save();

    // send email with OTP
    const emailContent = optEmailTemplate(otp);
    await sendEmail(email, "OTP for Email Verification", emailContent);

    res.status(201).json({
      success: true,
      message: "User registered successfully, please verify your email",
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// verify email with OTP
export const verifyEmailController = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+otp +otpExpires",
    );

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }

    const isMatch = await bcrypt.compare(otp, user.otp);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    user.verified = true;
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Error verifying email:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// login user
export const userLoginController = async (req, res) => {
  try {
    // get user input
    const { email, password } = req.body;

    // check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // get user data
    const user = await User.findOne({ email }).select("+password");

    // check if user exists
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // check if user is verified
    if (!user.verified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email",
      });
    }

    // check if user is blocked
    if (
      user.status === "inactive" ||
      user.status === "suspended" ||
      user.status === "blocked"
    ) {
      return res.status(400).json({
        success: false,
        message: `Your account has been ${user.status}. Please contact support for more information.`,
      });
    }

    // match password
    const isMatch = await bcrypt.compare(password, user.password);

    // check if password is correct
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // create and store token
    const refreshToken = generateRefreshToken(user);
    const accessToken = generateAccessToken(user);
    user.refreshTokens.push(refreshToken);
    await user.save();

    const cookieOptions = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    };

    // send response
    res.status(200).cookie("refreshToken", refreshToken, cookieOptions).json({
      success: true,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// resend OTP
export const resendOtpController = async (req, res) => {
  try {
    // get user input
    const { email } = req.body;

    // check if email is provided
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // get user data
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+otp +otpExpires",
    );

    // check if user exists
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email",
      });
    }

    // check if user is already verified
    if (user.verified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    // check if OTP has expired
    if (user.otpExpires > Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP has not expired yet",
      });
    }

    // generate a new OTP
    const otp = Math.floor(100000 + Math.random() * 900000);
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otp.toString(), salt);
    user.otp = hashedOtp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save();

    await sendEmail(user.email, "Email Verification", optEmailTemplate(otp));

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Error resending OTP:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// logout user
export const userLogoutController = async (req, res) => {
  try {
    // get user input
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    // check if userId is provided
    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    const user = await User.findById(req.user._id);
    user.refreshTokens = user.refreshTokens.filter((t) => t !== token);
    await user.save();

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });

    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    console.error("Error logging out user:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// refresh token
export const userRefreshTokenController = async (req, res) => {
  try {
    // get user input
    const refreshToken  = req.cookies.refreshToken || req.body.refreshToken;

    // check if token is provided
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    // check if token is valid
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Find user AND token
    const user = await User.findById(decoded.userId);

    if (!user || !user.refreshTokens.includes(refreshToken)) {
      // token reuse detected
      if (user) {
        user.refreshTokens = []; // force logout everywhere
        await user.save();
      }

      return res
        .status(403)
        .json({ success: false, message: "Token reuse detected" });
    }

    //Rotate token (invalidate old)
    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== refreshToken,
    );

    // Issue new tokens
    const newAccessToken = generateAccessToken({ userId: user._id });
    const newRefreshToken = generateRefreshToken({ userId: user._id });

    user.refreshTokens.push(newRefreshToken);
    await user.save();

    const cookiesOptions = {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    };
    res.cookie("refreshToken", newRefreshToken, cookiesOptions);

    // send response
    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// forgot password
export const forgotPasswordController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    const user = await User.findOne(
      { email },
      "+resetPasswordToken +resetPasswordExpires",
    );

    // prevent email spoofing
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If the email exists, an OTP has been sent",
      });
    }

    // prevent OTP spamming
    if (user.resetPasswordToken && user.resetPasswordExpires > Date.now()) {
      return res.status(200).json({
        success: true,
        // message: "If the email exists, an OTP has been sent",
        message: "If the email exists, an OTP has been sent",
      });
    }

    const { otp, hashedToken } = await generateOtpAndHashToken();

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendEmail(user.email, "Password Reset OTP", optEmailTemplate(otp));

    return res.status(200).json({
      success: true,
      message: "If the email exists, an OTP has been sent",
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// reset password
export const resetPasswordController = async (req, res) => {
  try {
    // get user input
    const { email, otp, newPassword } = req.body;

    // check if email is provided
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Invalid request",
      });
    }

    const user = await User.findOne(
      { email },
      "+resetPasswordToken +resetPasswordExpires",
    );
    // return res.status(200).json(user);

    // check if user exists and OTP is valid and not expired
    if (
      !user ||
      !user.resetPasswordToken ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // verify OTP
    const isValidOtp = await bcrypt.compare(otp, user.resetPasswordToken);

    if (!isValidOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // hash new password
    const hashedPassword = await generateHashedPassword(newPassword);

    // update password
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.refreshTokens = [];
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
