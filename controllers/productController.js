import Product from "../models/productModel.js";
import { uploadImageToCloudinary } from "../services/fileUploadServices.js";

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
    product.thumbnail = thumbnail;
    product.videoUrl = videoUrl;
    product.isFeatured = isFeatured;
    product.isActive = isActive;
    product.isDigital = isDigital;
    product.thumbnail = imageData;
    await product.save();

    res
      .status(201)
      .json({
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
      message: "Server error: ${error.message}",
    });
  }
};
