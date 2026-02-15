import express from "express";
import {createProduct} from "productController"

const productRoute = express.Router();

// @route   POST /api/product/create
// @desc    store a new product
// @access  Private
productRoute.post('/create', createProduct);

// @route
export default productRoute;