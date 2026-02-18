import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        product: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "Product", 
          required: true 
        },
        variant: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "Variant", 
          required: true 
        },
        productName: { 
          type: String, // product name snapshot
          required: true 
        },
        variantName: { 
          type: String, // variant name snapshot
          required: true 
        },
        quantity: { 
          type: Number, 
          default: 1, 
          min: 1,
          required: true
        },
        priceAtAdd: { 
          type: Number, // for tracking price changes
          required: true 
        }, 
      },
    ],
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

cartSchema.virtual("totalAmount").get(function () {
  return this.items.reduce((total, item) => total + item.priceAtAdd * item.quantity, 0);
});

cartSchema.virtual("totalItems").get(function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

cartSchema.index({ user: 1 }, { unique: true });

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
