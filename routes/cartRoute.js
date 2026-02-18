import express from "express";
import { addToCart, getCart, removeCartItem, clearCart, incrementCartItem, decrementCartItem } from "../controllers/cartController.js";
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

// @route   DELETE /api/cart/clear
// @desc    Clear cart
// @access  Private
cartRoute.delete("/clear", clearCart);

// @route   DELETE /api/cart
// @desc    Remove cart item
// @access  Private
cartRoute.delete("/:id", validateMongoId, removeCartItem);

// @route   PATCH /api/cart/increment/:id
// @desc    Increment cart item quantity
// @access  Private
cartRoute.patch("/increment/:id", validateMongoId, incrementCartItem);

// @route   PATCH /api/cart/decrement/:id
// @desc    Decrement cart item quantity
// @access  Private
cartRoute.patch("/decrement/:id", validateMongoId, decrementCartItem);



export default cartRoute;