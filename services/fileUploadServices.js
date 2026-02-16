import cloudinary from "../config/cloudinary.js";
import multer from "multer";

// Require for file upload with multer
const storage = multer.memoryStorage(); // Use memory storage
export const multerUpload = multer({ storage }).single("image"); // Expecting a single file with the field name "image"

export const uploadImageToCloudinary = async (file, folderName = "test") => {
  if (file) {
    const uploadResult = await cloudinary.v2.uploader.upload(
      `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
      {
        folder: `ecom-express/${folderName}`, // Organize uploads in a folder
      },
    );

    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };
  }
};

export const deleteImageFromCloudinary = async (publicId) => {
  if (publicId) {
    try{
      await cloudinary.v2.uploader.destroy(publicId);
    }
    catch(error){
      // Not throwing error further to avoid breaking main flow, but logging it for debugging
      console.error(`Failed to delete image from Cloudinary: ${error.message}`);
    }
  }
};

