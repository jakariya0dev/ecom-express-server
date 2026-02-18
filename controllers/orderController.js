import mongoose from "mongoose";
import Cart from "../models/cartModel.js";
import Order from "../models/orderModel.js";

// place order
export const placeOrder = async (req, res) => {
  const user = req.query.user; // TODO: later get user from auth middleware

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { paymentMethod, shippingAddress } = req.body;

    const cart = await Cart.findOne({ user }).session(session);
    if (!cart || cart.items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Your cart is empty",
        data: null,
      });
    }

    const order = new Order({
      user,
      paymentMethod,
      items: cart.items,
      totalAmount: cart.totalAmount,
      shippingAddress,
    });

    await order.save({ session });

    await Cart.deleteOne({ user }, { session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error.message);
    res.status(500).json({
      success: false,
      message: "Failed to place order",
    });
  }
};

// get user orders
export const getUserOrders = async (req, res) => {
  const user = req.query.user; // TODO: later get user from auth middleware

  try {
    const orders = await Order.find({ user }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// get order by id
export const getOrderById = async (req, res) => {
  const orderId = req.params.id;

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
        data: null,
      });
    }
    res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// get all orders
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};