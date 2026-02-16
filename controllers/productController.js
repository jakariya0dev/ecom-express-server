import Product from "../models/productModel.js";

import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from "../services/fileUploadServices.js";

export const createProduct = async (req, res) => {
  try {
    let productData = { ...req.body };

    // ---> For debugging: log the incoming data
    // return res.status(200).json({
    //   success: true,
    //   message: "Received product data",
    //   data: productData,
    // });

    // Handle multer stringified arrays for tags and attributes
    if (req.body?.tags && typeof req.body.tags === "string") {
      try{
        productData.tags = JSON.parse(req.body.tags);
      }
      catch(error){
        console.error("Failed to parse tags JSON:", error.message);
        return res.status(400).json({
          success: false,
          message: "Invalid format for tags. Must be a JSON string.",
        });
      }
    }
    if (req.body?.attributes && typeof req.body.attributes === "string"){
      try{
        productData.attributes = JSON.parse(req.body.attributes);
      }
      catch(error){
        console.error("Failed to parse attributes JSON:", error.message);
        return res.status(400).json({
          success: false,
          message: "Invalid format for attributes. Must be a JSON string.",
          error: error.message,
        });
      }
    }

    // Handle image upload if file is provided
    if (req.file) {
      const imageData = await uploadImageToCloudinary(req.file, "products");
      productData.thumbnail = imageData;
    }

    const product = new Product(productData);
    await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: product,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating product", error: error.message });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const product = await Product.find({
      isDeleted: false,
      isActive: true,
    }).populate("category", "name");
    res.status(200).json({
      success: true,
      message: "All products fetched successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

export const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }
    res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // List of keys to update directly from req.body
    const fields = [
      "name", "shortDescription", "longDescription", "brand", 
      "category", "videoUrl", "isFeatured", "isActive", "isDigital"
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    });

    // Safe Parsing Helper
    const safeParse = (data) => (typeof data === "string" ? JSON.parse(data) : data);

    if (req.body.tags) product.tags = safeParse(req.body.tags);
    if (req.body.attributes) product.attributes = safeParse(req.body.attributes);
    if (req.body.thumbnail) product.thumbnail = safeParse(req.body.thumbnail);

    // Handle Image Update
    if (req.file) {
      // Store old ID
      const oldPublicId = product.thumbnail?.publicId;

      //  Upload new image 
      const imageData = await uploadImageToCloudinary(req.file, "products");
      product.thumbnail = imageData;

      //  Delete old image only if upload succeeded and old ID exists
      if (oldPublicId) {
        // Don't 'await' this so the user doesn't wait for Cloudinary's slow delete
        deleteImageFromCloudinary(oldPublicId).catch(err => 
          console.error("Cloudinary Cleanup Failed:", err.message)
        );
      }
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export const deleteProduct = async (req, res) => {

  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Soft delete: mark as deleted instead of removing from DB
    // ---> Optional: implementation hard delete by actually removing the document and its associated media
    // if (product.thumbnail?.public_id) {
    //   try{
    //     await deleteImageFromCloudinary(product.thumbnail.public_id);
    //   }
    //   catch(error){
    //     console.error(`Failed to delete image from Cloudinary: ${error.message}`);
    //   }
    // }

    product.isDeleted = true; // Soft delete
    await product.save();
    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};
