import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    image: {
      url: String,
      publicId: String,
    },
  },
  { timestamps: true },
);

categorySchema.pre("validate", function () {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      trim: true,
    });
  }
});

// In your Category Model file
categorySchema.virtual("product", {
  ref: "Product",        // The model to use
  localField: "_id",     // Find products where "localField"
  foreignField: "category", // is equal to "foreignField"
});

// Ensure virtuals are included when converting to JSON
categorySchema.set("toJSON", { virtuals: true });
categorySchema.set("toObject", { virtuals: true });

const Category = mongoose.model("Category", categorySchema);

export default Category;
