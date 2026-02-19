import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    transactionId: {
      type: String,
      unique: true,
      default: null,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        variant: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Variant",
          required: true,
        },
        productName: {
          type: String, // product name snapshot
          required: true,
        },
        variantName: {
          type: String, // variant name snapshot
          required: true,
        },
        quantity: {
          type: Number,
          min: 1,
          required: true,
          default: 1,
        },
        priceAtAdd: {
          type: Number, // price at time of order
          required: true,
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
    _paymentMethod: {
      type: String,
      enum: [
        "cod",
        "card",
        "online",
        "upi",
        "wallet",
        "emi",
        "cheque",
        "other",
      ],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded", "failed"],
      default: "unpaid",
    },
    status: {
      type: String,
      enum: ["pending", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true },
);

// user friendly order id
orderSchema.pre("validate", function () {
  if(this.isNew){
    this.orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`; // ex: ORD-1688000000000-123
  }
});

orderSchema.pre("save", async function () {
  if(this.transactionId && this.isModified("transactionId")) {
    this.paymentStatus = "paid";
  } 
})

const Order = mongoose.model("Order", orderSchema);

export default Order;
