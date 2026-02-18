import express from "express";
import {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
    getProductById,
} from "../controllers/productController.js";
import { validateMongoId } from "../middlewares/validateId.js";
import { multerSingleUpload } from "../services/fileUploadServices.js";

const productRoute = express.Router();

// @route   GET /api/products/all
// @desc    fetch all products
// @access  Public
productRoute.get("/all", getAllProducts);

// @route   GET /api/products/:id
// @desc    fetch a single product by ID
// @access  Public
productRoute.get("/:id", validateMongoId, getProductById);

// @route   POST /api/products/create
// @desc    store a new product
// @access  Private
productRoute.post("/create", multerSingleUpload, createProduct);

// @route   PUT api/products/:id
// @desc    update product category
// @access  Private
productRoute.put("/:id", validateMongoId, multerSingleUpload, updateProduct);

// @route DELETE api/products/:id
// @desc delete a product
// @access Private
productRoute.delete("/:id", validateMongoId, deleteProduct);
export default productRoute;
