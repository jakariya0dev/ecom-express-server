import express from "express";
import {
  createVariant,
  getVariantsByProduct,
  getVariantById,
  updateVariant,
  deleteVariant,
  removeImageFromVariant,
  toggleVariantActiveStatus,
} from "../controllers/variantController.js";
import { multerMultipleUpload } from "../services/fileUploadServices.js";

const variantRoute = express.Router();

// @route   POST /api/variants/create
// @desc    Create a new variant for a product
// @access  Private (admin)
variantRoute.post("/create", multerMultipleUpload, createVariant);

// @route   GET /api/variants/product/:productId
// @desc    Get all variants for a specific product
// @access  Public
variantRoute.get("/product/:productId", getVariantsByProduct);

// @route   GET /api/variants/:id
// @desc    Get a single variant by ID
// @access  Public
variantRoute.get("/:id", getVariantById);

// @route   PUT /api/variants/:id
// @desc    Update a variant by ID
// @access  Private (admin)
variantRoute.put("/:id", updateVariant);

// @route   DELETE /api/variants/:id
// @desc    Delete a variant by ID
// @access  Private (admin)
variantRoute.delete("/:id", deleteVariant);

// @route   DELETE /api/variants/:variantId/image/:publicId
// @desc    Remove an image from a variant
// @access  Private (admin)
variantRoute.delete("/image/:variantId", removeImageFromVariant);

// @route   PATCH /api/variants/:id/toggle-active
// @desc    Toggle active status of a variant
// @access  Private (admin)
variantRoute.patch("/:id/toggle-active", toggleVariantActiveStatus);

export default variantRoute;
