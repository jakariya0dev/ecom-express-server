import express from "express";
import { addToCart, getCart, removeCartItem } from "../controllers/cartController.js";
import { validateMongoId } from "../middlewares/validateId.js";

const cartRoute = express.Router();

// @route   GET /api/cart?user=USER_ID
// @desc    Get cart for user
// @access  Public (TODO: later make it private)
cartRoute.get("/", getCart);

// @route   POST /api/cart
// @desc    Add to cart
// @access  Private
cartRoute.post("/", addToCart);

// @route   DELETE /api/cart
// @desc    Remove cart item
// @access  Private
cartRoute.delete("/:id", validateMongoId, removeCartItem);

export default cartRoute;