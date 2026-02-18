import express from "express";
import { multerSingleUpload } from "../services/fileUploadServices.js";
import { createCategory, getCategories, getRootCategories, getSubCategories, getCategory, updateCategory, deleteCategory } from "../controllers/categoryController.js";

const categoryRoute = express.Router();



// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
categoryRoute.get("/", getCategories);

// @route   POST /api/categories/create
// @desc    Create a new category
// @access  Private
categoryRoute.post("/create", multerSingleUpload, createCategory);

// @route   PUT /api/categories/update/:id
// @desc    Update category by ID
// @access  Private
categoryRoute.put("/update/:id", multerSingleUpload, updateCategory);

// @route   DELETE /api/categories/delete/:id
// @desc    Delete category by ID
// @access  Private
categoryRoute.delete("/delete/:id", deleteCategory);

// @route   GET /api/categories/sub/:parentId
// @desc    Get all sub categories
// @access  Public
categoryRoute.get("/sub/:parentId", getSubCategories);

// @route   GET /api/categories/parents
// @desc    Get all parent categories
// @access  Public
categoryRoute.get("/parents", getRootCategories);

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Public
categoryRoute.get("/:id", getCategory);

export default categoryRoute;