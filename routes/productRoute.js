import express from "express";
import {createProduct, getAllProducts, deleteProduct} from "productController"

const productRoute = express.Router();

// @route   GET /api/product/all
// @desc    fetch all products
// @access  Public
productRoute.get('/all', getAllProducts);

// @route   POST /api/product/create
// @desc    store a new product
// @access  Private
productRoute.post('/create', createProduct);

// @route   PUT api/product/:id
// @desc    update product category
// @access  Private
productRoute.put()

// @route DELETE api/product/:id
// @desc delete a product
// @access Private
productRoute.delete('/:id', deleteProduct);
export default productRoute;