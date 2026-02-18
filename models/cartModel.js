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
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        variant: { type: mongoose.Schema.Types.ObjectId, ref: "Variant", required: true },
        quantity: { type: Number, default: 1, min: 1 },
        priceAtAdd: { type: Number, required: true }, // for tracking price changes
      },
    ],
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

cartSchema.pre("save", function () {
  this.totalPrice = this.items.reduce(
    (total, item) => total + (item.priceAtAdd || 0) * (item.quantity || 0),
    0,
  );
});

cartSchema.virtual("totalItems").get(function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

cartSchema.index({ user: 1 }, { unique: true });

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
