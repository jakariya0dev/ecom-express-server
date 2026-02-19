import User from "../models/userModel.js";import User from "../models/userModel.js";
import { uploadImageToCloudinary } from "../services/fileUploadServices.js";
import bcrypt from "bcryptjs";


// update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { name, password, mobile } = req.body;

    // check if name or mobile is provided
    if (!name && !mobile) {
      return res.status(400).json({
        success: false,
        message: "Name or mobile is required to save changes",
        data: null,
      });
    }

    // check if password is provided
    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Current password is required to save changes",
        data: null,
      });
    }

    const user = await User.findById(req.user._id, "+password");

    // check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    // check if user is verified
    if (!user.verified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email",
        data: null,
      });
    }

    // check password match
    const isPasswordMatched = await bcrypt.compare(password, user.password);
    if (!isPasswordMatched) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
        data: null,
      });
    }

    // upload images to Cloudinary and get URLs 

    if (req.file) {
      const result = await uploadImageToCloudinary(req.file, "users");
      user.avatar = result;
    }

    // update user data
    if (name) user.name = name;
    if (mobile) user.mobile = mobile;
    await user.save();

    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
