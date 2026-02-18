import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sku: { type: String, required: true, unique: true }, // Stock Keeping Unit eg: "TSHIRT-BLUE-MEDIUM"},

    // Common options for variants (can be extended as needed)
    options: {
      color: String,
      size: String,
      weight: String,
      storage: String,
    },
    
    // additional attributes
    attributes: [
      {
        key: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],

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
    images: [{ url: String, publicId: String }],

    // status flags
    isDefault: { type: Boolean, default: false }, // Indicates if this is the default variant for the product
    isActive: { type: Boolean, default: true }, // Indicates if the variant is active and available for purchase
    isDeleted: { type: Boolean, default: false }, // Soft delete flag
  },
  { timestamps: true },
);

// Prevent duplicate variants (e.g., can't have two "Blue, 128GB" for same product)
variantSchema.index(
  { product: 1, "options.color": 1, "options.weight": 1, "options.size": 1, "options.storage": 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } },
);

export default mongoose.model("Variant", variantSchema);
