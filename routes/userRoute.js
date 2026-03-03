import express from "express";
import { changeUserStatus, getUsers } from "../controllers/userController.js";
import { isAuthenticated } from "../middlewares/auth.js";

const userRoute = express.Router();

// @route   Get /api/users
// @desc    Get all users
// @access  Private (admin)
userRoute.get("/", getUsers);

//TODO: make it private
// @route   POST /api/users/change-status
// @desc    Change user status
// @access  Private (admin)
userRoute.post("/change-status", changeUserStatus);

export default userRoute;

