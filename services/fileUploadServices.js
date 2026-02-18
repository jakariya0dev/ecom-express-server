import cloudinary from "../config/cloudinary.js";
import multer from "multer";

// Require for file upload with multer
const storage = multer.memoryStorage(); // Use memory storage

// Expecting a single file with field name "image"
export const multerSingleUpload = multer({
  storage,
  limits: { fieldSize: 5 * 1024 * 1024 },
}).single("image");

// Expecting multiple files with  field name "images", max 10 files
export const multerMultipleUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
}).array("images", 10);

export const uploadImageToCloudinary = async (file, folderName = "test") => {
  
  if (!file || !file.buffer) return null;

  try {
    const b64 = file.buffer.toString("base64");
    const dataURI = `data:${file.mimetype};base64,${b64}`;

    const uploadResult = await cloudinary.v2.uploader.upload(dataURI, {
      folder: `ecom-express/${folderName}`, // Organize uploads in a folder
      resource_type: "auto", // Cloudinary detect the file type
    });

    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
    };
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return null;
  }
};

export const deleteImageFromCloudinary = async (publicId) => {
  if (publicId) {
    try {
      await cloudinary.v2.uploader.destroy(publicId);
    } catch (error) {
      // Not throwing error further to avoid breaking main flow, but logging it for debugging
      console.error(`Failed to delete image from Cloudinary: ${error.message}`);
    }
  }
};
