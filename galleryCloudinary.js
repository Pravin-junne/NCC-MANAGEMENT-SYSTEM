const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

// 🔹 Storage for Documents (PDFs) and Images
const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    let folder = "NCC_Documents";
    let resourceType = "image"; // Default to image

    if (file.mimetype === "application/pdf") {
      folder = "NCC_Documents"; // Store PDFs separately
      resourceType = "raw"; // Treat PDF as raw file
    }

    return {
      folder: folder,
      resource_type: resourceType,
      format: file.mimetype.split("/")[1] // Auto-detect format
    };
  }
});

// 🔹 Storage for Gallery Images (Separate from Documents)
const galleryStorage = multer.memoryStorage();
const galleryUpload = multer({ storage: galleryStorage });

module.exports = { cloudinary, documentStorage, galleryUpload };
