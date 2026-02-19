import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

// generate access token
export const generateAccessToken = (user) => {
    return jwt.sign({ userId: user._id }, process.env.JWT_ACCESS_SECRET, {
        expiresIn: "15m",
    });
};

// generate refresh token
export const generateRefreshToken = (user) => {
    return jwt.sign({ userId: user._id }, process.env.JWT_REFRESH_SECRET, {
        expiresIn: "7d",
    });
};

export const generateHashedPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

export const generateOtpAndHashToken = async () => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const salt = await bcrypt.genSalt(10);
    const hashedToken = await bcrypt.hash(otp.toString(), salt);
    return { otp, hashedToken };
}