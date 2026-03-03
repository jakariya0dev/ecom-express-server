import User from "../models/userModel.js";
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

export const getUsers = async (req, res) => {
  try {
    // get query params if any
    const { search, role, status, verified, limit = 10, page = 1 } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (verified) filter.verified = verified === "true";

    // skip and limit for pagination
    const pageSize = parseInt(limit);
    const currentPage = parseInt(page);
    const skip = (currentPage - 1) * pageSize;

    // get all users with total orders
    const users = await User.find(filter)
      .populate("orders")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const changeUserStatus = async (req, res) => {
  try {
    const { userId, status } = req.body;

    console.log(userId, status);

    // check if userId is provided
    if (!userId || !status) {
      return res.status(400).json({
        success: false,
        message: "User ID and status are required",
        data: null,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
        data: null,
      });
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: user,
    });
  } catch (error) {
    console.error("Error changing user status:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
