import cloudinary from "../config/cloudinary.js";

export const uploadImageToCloudinary = async (file) => {
        if (file) {
      const uploadResult = await cloudinary.v2.uploader.upload(
        `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
        {
          folder: "ecom-express-server/categories"
        }
      );

      return {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id
      };
    }
}