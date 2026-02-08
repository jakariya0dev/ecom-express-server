import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { sendEmail, optEmailTemplate } from "../services/emailService.js";
import dotenv from "dotenv";
dotenv.config();

// register new user
export const registerUser = async (req, res) => {
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
      messegae: "Server error",
    });
  }
};

// verify email with OTP
export const verifyEmail = async (req, res) => {
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

export const loginUser = async (req, res) => {
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

    // match password
    const isMatch = await bcrypt.compare(password, user.password);

    // check if password is correct
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // create and assign token
    const token = jwt.sign(
      { userId: user._id, email },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );
    user.refreshTokens.push(token);
    await user.save();

    // send response
    res.status(200).json({
      success: true,
      token,
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
export const resendOtp = async (req, res) => {
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
