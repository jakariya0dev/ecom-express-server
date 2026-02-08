import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        variant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Variant",
          required: true,
        },

        productName: {
          type: String, // product name snapshot
          required: true,
        },
        attributes: {
          color: String,
          size: String,
          weight: String,
        },
        price: {
          type: Number, // price at time of order
          required: true,
        },

        quantity: {
          type: Number,
          min: 1,
          required: true,
          default: 1,
        },
      },
    ],

    shippingAddress: {
      name: String, // receiver name
      phone: String, // receiver phone number
      line1: String,
      line2: String,
      city: String,
      zipCode: String,
      country: String,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "card", "sslcommerz"],
      default: "cod",
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);

export default Order;
