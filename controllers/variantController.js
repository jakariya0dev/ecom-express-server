import Variant from "../models/variantModel.js";
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} from "../services/fileUploadServices.js";
import { parseString } from "../utils/safeParse.js";

// Create a new variant
export const createVariant = async (req, res) => {
  let uploadedImagesData = [];

  try {
    const variantData = { ...req.body };

    // Required Field Validation
    const required = ["product", "sku", "costPrice", "price"];
    const missing = required.filter((field) => !variantData[field]);

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(", ")}`,
      });
    }

    // 2. Parse JSON strings (FormData sends strings)
    if (typeof variantData.attributes === "string")
      variantData.attributes = JSON.parse(variantData.attributes);
    if (typeof variantData.options === "string")
      variantData.options = JSON.parse(variantData.options);

    // 3. Handle Images
    if (req.files && req.files.length > 0) {
      const imageUploadPromises = req.files.map((file) =>
        uploadImageToCloudinary(file, "variants"),
      );
      // Stores [{url, publicId}, ...]
      uploadedImagesData = await Promise.all(imageUploadPromises);
    }

    variantData.images = uploadedImagesData;

    // 4. Create Variant
    const newVariant = await Variant.create(variantData);

    res.status(201).json({
      success: true,
      message: "Variant created successfully",
      data: newVariant,
    });
  } catch (error) {
    // 5. ROLLBACK: Delete images from Cloudinary if DB save fails
    if (uploadedImagesData.length > 0) {
      const deletePromises = uploadedImagesData.map((img) =>
        deleteImageFromCloudinary(img.publicId),
      );
      await Promise.all(deletePromises);
    }

    // Check for Mongoose Duplicate Key Error (SKU)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "A variant with this SKU or combination already exists.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create variant",
      error: error.message,
    });
  }
};

// Get all variants for a product
export const getVariantsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const variants = await Variant.find({
      product: productId,
      isDeleted: false,
      isActive: true,
    });
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
    const variant = await Variant.findOne({
      _id: id,
      isDeleted: false,
      isActive: true,
    });
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

    // return res.status(200).json(variantData);

    // Fetch existing variant to get current images
    const existingVariant = await Variant.findById(id);
    if (!existingVariant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
        data: null,
      });
    }

    // parse option and attr if provided as JSON string
    if (variantData.attributes)
      variantData.attributes = parseString(variantData.attributes);
    if (variantData.options)
      variantData.options = parseString(variantData.options);

    const images = existingVariant.images || [];

    // Handle image uploads if new images are provided
    if (req.files && req.files.length > 0) {
      const imageUploadPromises = req.files.map((file) =>
        uploadImageToCloudinary(file, "variants"),
      );
      const uploadedImagesData = await Promise.all(imageUploadPromises);
      variantData.images = [...images, ...uploadedImagesData];
    }

    const updatedVariant = await Variant.findByIdAndUpdate(
       id,
      {
        $set: variantData,
      },
      { new: true },
    );

    if (!updatedVariant) {
      return res.status(404).json({
        success: false,
        message: "Variant not found",
        data: null,
      });
    }

    res.status(200).json({
      success: true,
      message: "Variant updated successfully!",
      data: variantData,
    });
  } catch (error) {
    console.log(error.message);
    
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

    // delete images from Cloudinary
    const deletePromises = variant.images.map((img) =>
      deleteImageFromCloudinary(img.publicId),
    );
    await Promise.all(deletePromises);

    // Soft delete: set isDeleted to true
    variant.isDeleted = true;
    variant.isActive = false;
    variant.images = [];
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
    const { publicId } = req.query;

    // return res.json({ variantId, publicId });

    if (!variantId || !publicId) {
      return res.status(400).json({
        success: false,
        message: "Missing variantId or publicId",
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
    console.log(error);
    res.status(400).json({
      success: false,
      message: "Failed to delete image",
      error: error.message,
    });
  }
};
