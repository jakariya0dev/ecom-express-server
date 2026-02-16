import { mongo } from "mongoose";
import Product from "../models/productModel.js";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "../services/fileUploadServices.js";

export const createProduct = async (req, res) => {
  const {
    name,
    shortDescription,
    longDescription,
    brand,
    category,
    tags,
    attributes,
    thumbnail,
    videoUrl,
    isFeatured,
    isActive,
    isDigital,
  } = req.body;

  try {
    let imageData = null;

    if (req.file) {
      imageData = await uploadImageToCloudinary(req.file);
    }

    const product = new Product({});
    product.name = name;
    product.shortDescription = shortDescription;
    product.longDescription = longDescription;
    product.brand = brand;
    product.category = category;
    product.tags = tags;
    product.attributes = attributes;
    product.attributes = attributes;
    product.videoUrl = videoUrl;
    product.isFeatured = isFeatured;
    product.isActive = isActive;
    product.isDigital = isDigital;
    product.thumbnail = imageData || thumbnail;
    await product.save();    await product.save();

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
    const product = await Product.find();
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
      return res.status(404).json({success: false, message: "Product not found"});
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
      const {
      name,
      shortDescription,
      longDescription,
      brand,
      category,
      tags,
      attributes,
      thumbnail,      videoUrl,
      isFeatured,
      isActive,
      isDigital,
    } = req.body;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({success: false, message: "Product not found"});
    }

    if (name) product.name = name;
    if (shortDescription) product.shortDescription = shortDescription;
    if (longDescription) product.longDescription = longDescription;
    if (brand) product.brand = brand;
    if (category) product.category = category;
    if (tags) product.tags = tags;
    if (attributes) product.attributes = attributes;
    if (videoUrl) product.videoUrl = videoUrl;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;
    if (isActive !== undefined) product.isActive = isActive;
    if (isDigital !== undefined) product.isDigital = isDigital;

    // Handle Image Update
    if (req.file) {
      const oldPublicId = product.thumbnail?.public_id;
      
      // Upload new image
      const imageData = await uploadImageToCloudinary(req.file);
      product.thumbnail = imageData;

      // delete the old thumbnail from cloudinary if it exists
      if (oldPublicId) {
        await deleteImageFromCloudinary(oldPublicId).catch(err => 
          console.error("Cloudinary image cleanup failed:", err.message)
        );
      }
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {    res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    
    if (product.thumbnail?.public_id) {
      try{
        await deleteImageFromCloudinary(product.thumbnail.public_id);
      }
      catch(error){
        console.error(`Failed to delete image from Cloudinary: ${error.message}`);
      }
    }
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




