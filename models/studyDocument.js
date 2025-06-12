const mongoose = require("mongoose");

const studyDocumentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    fileUrl: { type: String, required: true }, // Cloudinary file URL
    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("studyDocument", studyDocumentSchema);
