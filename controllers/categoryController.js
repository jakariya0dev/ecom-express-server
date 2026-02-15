import { get, mongo } from "mongoose";
import Category from "../models/categoryModel.js";
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} from "../services/fileUploadServices.js";

export const createCategory = async (req, res) => {
  try {
    const { name, order, parent } = req.body;

    if (!name.trim()) {
      return res.status(400).json({ message: "Category name required" });
    }

    const imageData = req.file ? await uploadImageToCloudinary(req.file) : null;

    const category = new Category({
      name,
      image: imageData,
      ...(parent && { parent }), // if parent is provided, include it in the category
      ...(order && { order }), // if order is provided, include it in the category
    });

    await category.save();

    res.status(201).json({
      success: true,
      category,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateCategory = async (req, res) => {

  const { id } = req.params;
  if (!id || !mongo.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Category ID is required and must be a valid MongoDB ObjectId",
    });
  }
  try {

    const { name, order, isActive, parent } = req.body;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Update name
    if (name !== undefined) {
      category.name = name;
    }

    // Update order
    if (order !== undefined) {
      category.order = order;
    }

    // Update isActive (fix boolean bug)
    if (isActive !== undefined) {
      category.isActive = isActive;
    }

    // Update parent
    if (parent !== undefined) {
      category.parent = parent || null;
    }

    // prevent circular reference when setting parent
    if (category.parent && category.parent.toString() === category._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "Category cannot be its own parent",
      });
    }

    // Update image safely
    if (req.file) {
      if (category.image?.publicId) {
        await deleteImageFromCloudinary(category.image.publicId);
      }

      const imageData = await uploadImageToCloudinary(req.file);
      category.image = imageData;
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const deleteCategory = async (req, res) => {

  const { id } = req.params;
  
  if (!id || !mongo.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Category ID is required and must be a valid MongoDB ObjectId",
    });
  }

  try {

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Prevent Delete If Children Exist
    const hasChildren = await Category.exists({ parent: id });
    if (hasChildren) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category with child categories",
      });
    }

    if (category.image?.publicId) {
      await deleteImageFromCloudinary(category.image.publicId);
    }

    // Soft delete instead of hard delete
    category.isActive = false;
    await category.save();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate("parent", "name")
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      count: categories.length,
      categories: [...categories],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getRootCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      parent: null,
      isActive: true,
    }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      message: "Parent categories fetched successfully",
      count: categories.length,
      categories,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getSubCategories = async (req, res) => {

  const { parentId } = req.params;

  if (!parentId || !mongo.Types.ObjectId.isValid(parentId)) {
    return res.status(400).json({
      success: false,
      message: "Parent category ID is required and must be a valid MongoDB ObjectId",
    });
  }
  try {
    
    const categories = await Category.find({
      parent: parentId,
      isActive: true,
    }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      message: "Sub categories fetched successfully",
      count: categories.length,
      categories,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getCategory = async (req, res) => {

  const { id } = req.params;

  if (!id || !mongo.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Category ID is required and must be a valid MongoDB ObjectId",
    });
  }

  try {
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category fetched successfully",
      category,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
