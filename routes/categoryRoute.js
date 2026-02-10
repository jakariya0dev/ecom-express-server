import express from "express";
import multer from "multer";
import { createCategory } from "../controllers/categoryController.js";
import e from "express";

const categoryRouter = express.Router();

// Require for file upload with multer
const storage = multer.memoryStorage();
const multerUpload = multer({ storage }).single("image");

// @route   POST /api/categories
// @desc    Create a new category
// @access  Private
categoryRouter.post("/create", multerUpload, createCategory);

export default categoryRouter;