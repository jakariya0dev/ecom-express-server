import express from "express";
import {createProduct} from "productController"

const productRoute = express.Router();

// @route   GET /api/product/all
// @desc    fetch all products
// @access  Public
productRoute.get('/all', getAllProducts);

// @route   POST /api/product/create
// @desc    store a new product
// @access  Private
productRoute.post('/create', createProduct);

// @route
export default productRoute;