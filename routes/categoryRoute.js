import express from "express";
import { multerUpload } from "../services/fileUploadServices.js";
import { createCategory, getCategories, getRootCategories, getSubCategories, getCategory, updateCategory, deleteCategory } from "../controllers/categoryController.js";

const categoryRouter = express.Router();



// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
categoryRouter.get("/", getCategories);

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Public
categoryRouter.get("/:id", getCategory);

// @route   POST /api/categories/create
// @desc    Create a new category
// @access  Private
categoryRouter.post("/create", multerUpload, createCategory);

// @route   PUT /api/categories/update/:id
// @desc    Update category by ID
// @access  Private
categoryRouter.put("/update/:id", multerUpload, updateCategory);

// @route   DELETE /api/categories/delete/:id
// @desc    Delete category by ID
// @access  Private
categoryRouter.delete("/delete/:id", deleteCategory);

// @route   GET /api/categories/parents
// @desc    Get all parent categories
// @access  Public
categoryRouter.get("/parents", getRootCategories);

// @route   GET /api/categories/:parentId
// @desc    Get all sub categories
// @access  Public
categoryRouter.get("/sub/:parentId", getSubCategories);

export default categoryRouter;