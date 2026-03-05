import Product from "../models/productModel.js";
import Variant from "../models/variantModel.js";
import { parseString } from "../utils/safeParse.js";

import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from "../services/fileUploadServices.js";
import mongoose from "mongoose";

export const createProduct = async (req, res) => {
  let productData;
  try {
    productData = { ...req.body };

    // ---> For debugging: log the incoming data
    // return res.status(200).json(productData);
    // console.log(productData);
    // return res.status(200).json(productData);

    // Safe Parsing for tags and attributes (if they come as JSON strings)
    if (productData?.tags) productData.tags = productData.tags.split(",");
    if (productData?.attributes)
      productData.attributes = parseString(productData.attributes);

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
    console.log(error.message);

    // rollback if model.save() fails
    if (productData?.thumbnail?.public_id) {
      await deleteImageFromCloudinary(productData.thumbnail.public_id);
    }

    res
      .status(500)
      .json({ message: "Error creating product", error: error.message });
  }
};

export const getProducts = async (req, res) => {
  const { filter, search, limit = 10, page = 1 } = req.query;

  const pageSize = parseInt(limit);
  const currentPage = parseInt(page);
  const skip = (currentPage - 1) * pageSize;

  const query = {
    isDeleted: false,
  };

  // Filters
  if (filter) {
    if (filter === "featured") query.isFeatured = true;
    if (filter === "not_featured") query.isFeatured = false;

    if (filter === "active") query.isActive = true;
    if (filter === "not_active") query.isActive = false;

    if (filter === "deleted") query.isDeleted = true;
    if (filter === "not_deleted") query.isDeleted = false;
  }

  // Search
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
      { brand: { $regex: search, $options: "i" } },
      { shortDescription: { $regex: search, $options: "i" } },
      { longDescription: { $regex: search, $options: "i" } },
      { "attributes.value": { $regex: search, $options: "i" } },
    ];
  }

  try {
    const products = await Product.find(query)
      .populate("category")
      .populate("variants")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    const totalCount = await Product.countDocuments(query);

    console.log(query);
    

    return res.status(200).json({
      success: true,
      message: "All products fetched successfully",
      count: totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      limit: pageSize,
      currentPage,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};


export const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id)
      .populate("category")
      .populate({
        path: "variants",
        match: { isDeleted: false, isActive: true },
      });
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
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // List of keys to update directly from req.body
    const fields = [
      "name",
      "shortDescription",
      "longDescription",
      "brand",
      "category",
      "videoUrl",
      "isFeatured",
      "isActive",
      "isDigital",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    });

    // Safe Parsing with Helper
    if (req.body.tags) product.tags = parseString(req.body.tags);
    if (req.body.attributes)
      product.attributes = parseString(req.body.attributes);
    if (req.body.thumbnail) product.thumbnail = parseString(req.body.thumbnail);

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
        deleteImageFromCloudinary(oldPublicId).catch((err) =>
          console.error("Cloudinary Cleanup Failed:", err.message),
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
  const db_session = await mongoose.startSession();
  db_session.startTransaction();
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

    // Soft delete
    product.isDeleted = true;
    product.deletedAt = Date.now();
    await product.save();
    await Variant.updateMany(
      { product: id },
      { isDeleted: true, deletedAt: Date.now() },
    );

    await db_session.commitTransaction();
    db_session.endSession();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    await db_session.abortTransaction();
    db_session.endSession();

    res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

export const toggleProductFeaturedStatus = async (req, res) => {
  // throw new Error("Test Error");
  
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    product.isFeatured = !product.isFeatured;
    await product.save();
    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};
