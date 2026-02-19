import express from "express";
import {
  createAddress,
  getAddress,
  updateAddress,
  deleteAddress,
  getAllAddresses,
} from "../controllers/addressController.js";
import { validateMongoId } from "../middlewares/validateId.js";
import { isAuthenticated } from "../middlewares/auth.js";

const addressRoute = express.Router();

// @route   POST /api/addresses/create
// @desc    Create a new address
// @access  Private
addressRoute.post("/create", isAuthenticated, createAddress);

// @route   GET /api/addresses/:id
// @desc    Get a single address by ID
// @access  Public
addressRoute.get("/:id", validateMongoId, isAuthenticated, getAddress);

// @route   PUT /api/addresses/:id
// @desc    Update address by ID
// @access  Private
addressRoute.put("/:id", validateMongoId, isAuthenticated, updateAddress);

// @route   DELETE /api/addresses/:id
// @desc    Delete address by ID
// @access  Private
addressRoute.delete("/:id", validateMongoId, isAuthenticated, deleteAddress);

// @route   GET /api/addresses
// @desc    Get all addresses
// @access  Public
addressRoute.get("/", isAuthenticated, getAllAddresses);

export default addressRoute;
