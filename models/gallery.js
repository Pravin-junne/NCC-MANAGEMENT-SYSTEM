const mongoose = require("mongoose");

const GallerySchema = new mongoose.Schema({
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Gallery", GallerySchema);
