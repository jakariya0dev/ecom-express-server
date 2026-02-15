import express from "express";
import multer from "multer";
import { createCategory, getCategories, getRootCategories, getSubCategories, getCategory } from "../controllers/categoryController.js";
import e from "express";

const categoryRouter = express.Router();

// Require for file upload with multer
const storage = multer.memoryStorage();
const multerUpload = multer({ storage }).single("image");

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

// @route   GET /api/categories/update/:id
// @desc    Update category by ID
// @access  Private
categoryRouter.put("/update/:id", multerUpload, updateCategory);

// @route   GET /api/categories/parents
// @desc    Get all parent categories
// @access  Public
categoryRouter.get("/parents", getRootCategories);

// @route   GET /api/categories/:parentId
// @desc    Get all sub categories
// @access  Public
categoryRouter.get("/sub/:parentId", getSubCategories);

export default categoryRouter;