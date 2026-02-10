
import Category from "../models/categoryModel.js";
import { uploadImageToCloudinary } from "../services/fileUploadServices.js";


export const createCategory = async (req, res) => {

  try {
    const { name, order, parent} = req.body;

    if (!name.trim()) {
      return res.status(400).json({ message: "Category name required" });
    }

    const imageData = await uploadImageToCloudinary(req.file);

    const category =  new Category({
        name,
        image: imageData,
        ...(parent && { parent }),
        ...(order && { order }),
    });

    await category.save();

    res.status(201).json({
      success: true,
      category
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({success: false, message: "Server error" });
  }
};
