import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sku: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },

    // Flexible Options (The "Small/Blue" or "8GB/256GB")
    options: {
      color: String,
      size: String,
      storage: String,
      ram: String,
      material: String,
    },

    // Pricing & Finance
    costPrice: { type: Number, required: true }, // Buying price
    price: { type: Number, required: true }, // Selling price
    salePrice: {
      type: Number,
      validate: {
        validator: function (v) {
          return v <= this.price;
        },
        message: "Sale price must be less than regular price",
      },
    }, // Discounted price

    // Inventory
    stock: { type: Number, default: 0, min: [0, "Stock cannot be negative"] },
    weight: Number, // For shipping calculations

    // Images specific to this variant (e.g., the Blue phone photos)
    images: [{ url: String, publicId: String }],
  },
  { timestamps: true },
);

// Prevent duplicate variants (e.g., can't have two "Blue, 128GB" for same product)
variantSchema.index(
  { product: 1, "options.color": 1, "options.storage": 1, "options.size": 1 },
  { unique: true },
);

export default mongoose.model("Variant", variantSchema);
