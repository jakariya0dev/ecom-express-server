import Variant from "../models/variantModel.js";
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} from "../services/fileUploadServices.js";
import { parseString } from "../utils/safeParse.js";

// Create a new variant
export const createVariant = async (req, res) => {

  // ---> DEBUGGING PURPOSES ONLY <---
  // return res.send("This is a placeholder response for createVariant endpoint.");

  try {
    const variantData = {...req.body};
    // return res.status(200).json(variantData);
    if (
      !variantData.product ||
      !variantData.sku ||
      !variantData.costPrice ||
      !variantData.price
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: productId, sku, costPrice, price",
        data: null,
      });
    }

    // parse option and attr if provided as JSON string
    if (variantData.attributes)
      variantData.attributes = parseString(variantData.attributes);
    if (variantData.options)
      variantData.options = parseString(variantData.options);

    // upload images to Cloudinary and get URLs
    let uploadedImagesData = [];
    if (req.files && req.files.length > 0) {
      const imageUploadPromises = req.files.map((file) =>
        uploadImageToCloudinary(file, "variants"),
      );
      uploadedImagesData = await Promise.all(imageUploadPromises);
    }
    variantData.images = uploadedImagesData;

    const newVariant = await Variant.create(variantData);
    res.status(201).json({
      success: true,
      message: "Variant created successfully",
      data: newVariant,
    });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Failed to create variant", error: error.message });
  }
};

// Get all variants for a product
export const getVariantsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const variants = await Variant.find({ product: productId, isDeleted: false, isActive: true });
    res.status(200).json({
      success: true,
      message: "Variants fetched successfully",
      data: variants,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error fetching variants",
      error: error.message,
    });
  }
};

// Get a single variant by ID
export const getVariantById = async (req, res) => {
  try {
    const { id } = req.params;
    const variant = await Variant.findOne({ _id: id, isDeleted: false, isActive: true });
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
        data: null,
      });
    }
    res.status(200).json({
      success: true,
      message: "Variant fetched successfully",
      data: variant,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Error fetching variant",
      error: error.message,
    });
  }
};

// Update a variant
export const updateVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const variantData = { ...req.body };

    // parse option and attr if provided as JSON string
    if (variantData.attributes)
      variantData.attributes = parseString(variantData.attributes);
    if (variantData.options)
      variantData.options = parseString(variantData.options);

    // Fetch existing variant to get current images
    const existingVariant = await Variant.findById(id);
    if(!existingVariant){
      return res.status(404).json({
        success: false,        
        message: "Variant not found",
        data: null,
      })
    }
    const existingImages = existingVariant.images || [];

    // Handle image uploads if new images are provided
    if (req.files && req.files.length > 0) {
      const imageUploadPromises = req.files.map((file) =>
        uploadImageToCloudinary(file, "variants"),
      );
      const uploadedImagesData = await Promise.all(imageUploadPromises);
      variantData.images = [...existingImages, ...uploadedImagesData];
    }

    const updatedVariant = await Variant.findByIdAndUpdate(id, variantData, {
      new: true,
      runValidators: true,
    });

    if (!updatedVariant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Variant updated successfully",
      data: updatedVariant,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to update variant",
      error: error.message,
    });
  }
};

// Delete a variant
export const deleteVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const variant = await Variant.findById(id);
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
        data: null,
      });
    }
    // Soft delete: set isDeleted to true
    variant.isDeleted = true;
    await variant.save();

    res.status(200).json({
      success: true,
      message: "Variant deleted successfully (soft delete)",
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to delete variant",
      error: error.message,
    });
  }
};

export const toggleVariantActiveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const variant = await Variant.findById(id);
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
        data: null,
      });
    }
    variant.isActive = !variant.isActive;
    await variant.save();
    res.status(200).json({
      success: true,
      message: `Variant is now ${variant.isActive ? "active" : "inactive"}`,
      data: variant,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to toggle variant status",
      error: error.message,
    });
  }
};

export const removeImageFromVariant = async (req, res) => {
  try {
    const { variantId } = req.params;
    const { publicId } = req.body;

    if (!variantId || !publicId) {
      return res.status(400).json({
        success: false,
        message: "set variantId as path param and publicId in request body to delete image",
        data: null,
      });
    }

    const variant = await Variant.findById(variantId);
    if (!variant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
        data: null,
      });
    }

    // Check if the image actually exists in this variant
    const imageExists = variant.images.some((img) => img.publicId === publicId);

    if (!imageExists) {
      return res.status(404).json({
        success: false,
        message: "Image not found in this variant",
      });
    }

    // Remove image from Cloudinary
    await deleteImageFromCloudinary(publicId);

    // Remove image reference from variant document
    variant.images = variant.images.filter(
      (image) => image.publicId !== publicId,
    );
    await variant.save();

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      data: variant,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to delete image",
      error: error.message,
    });
  }
};
