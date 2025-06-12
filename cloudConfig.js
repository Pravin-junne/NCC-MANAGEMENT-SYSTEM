const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = "NCC_Photos";
    let resourceType = "image"; // Default to image

    if (file.mimetype === "application/pdf") {
      folder = "NCC_Documents"; // Store PDFs separately
      resourceType = "raw"; // Treat PDF as raw file
    }

    return {
      folder: folder,
      resource_type: resourceType, // Ensure PDFs are stored as raw files
      format: file.mimetype.split("/")[1] // Auto-detect format
    };
  }
});

module.exports = {
  cloudinary,
  storage
};
