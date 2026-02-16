import mongoose from "mongoose";
import slugify from "slugify";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    shortDescription: { type: String, required: true },
    longDescription: String,

    // Categorization
    brand: { type: String, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    tags: [String], // e.g., ["smart-home", "apple", "sale"]

    // High-level Tech/Spec Info (for filters)
    attributes: [
      {
        key: String, // e.g., "Material" or "Processor"
        value: String, // e.g., "Cotton" or "M3"
      },
    ],

    // Media & Social
    thumbnail: { url: String, publicId: String },
    videoUrl: String,

    // Status
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }, // For visibility control
    isDeleted: { type: Boolean, default: false }, // Soft delete flag
    isDigital: { type: Boolean, default: false }, // True for software/ebooks
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // Include virtuals when converting to JSON
    toObject: { virtuals: true }, // Include virtuals when converting to plain objects
  },
);

// Create SEO Slug
productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Connect to Variants automatically
productSchema.virtual("variants", {
  ref: "Variant",
  localField: "_id",
  foreignField: "product",
});

export default mongoose.model("Product", productSchema);
