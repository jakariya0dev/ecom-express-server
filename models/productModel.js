const productSchema = new mongoose.Schema(
  {
    name: String,
    slug: String,
    description: String,
    basePrice: Number, // optional
    images: [String],
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    attributes: {
      colors: [String],   // ["Red", "Blue"]
      sizes: [String],    // ["M", "L", "XL"]
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);
