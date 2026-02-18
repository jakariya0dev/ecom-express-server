import express from "express";
import { placeOrder, getUserOrders, getAllOrders, getOrderById } from "../controllers/orderController.js";

const orderRoute = express.Router();

// @route   POST /api/orders
// @desc    Place an order
// @access  Private
orderRoute.post("/", placeOrder);

// @route   GET /api/orders
// @desc    Get user orders
// @access  Private
orderRoute.get("/", getUserOrders);

// @route   GET /api/orders
// @desc    Get all orders
// @access  Private (admin)
orderRoute.get("/all", getAllOrders);

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private (admin)
orderRoute.get("/:id", getOrderById);



export default orderRoute;