const express = require("express");
const { cloudinary, galleryUpload } = require("../galleryCloudinary");
const Gallery = require("../models/gallery");
const {isAdmin} = require("../middleware");
const router = express.Router();

///
router.get("/upload", (req, res) => {
    res.render("pages/gallery_upload"); // Create 'gallery_upload.ejs'
});

//  Fetch and display gallery images
router.get("/", async (req, res) => {
    try {
        const images = await Gallery.find(); // Fetch images from MongoDB
        res.render("pages/gallery", { images }); // Pass images to EJS
    } catch (error) {
        console.error("Error fetching images:", error);
        res.status(500).json({ message: "Server Error", error });
    }
});

//  Upload Image (Gallery)
router.post("/upload", galleryUpload.single("image"), async (req, res) => {
    try {
        const { category } = req.body;
        const file = req.file;

        if (!file) return res.status(400).json({ message: "No file uploaded!" });

        // Upload to Cloudinary (Gallery-Specific Folder)
        cloudinary.uploader.upload_stream({ folder: "NCC_Gallery" }, async (error, result) => {
            if (error) return res.status(500).json({ message: "Upload failed!" });

            // Save to MongoDB
            const newImage = new Gallery({ category, imageUrl: result.secure_url });
            await newImage.save();

            res.redirect("/gallery") // Redirect to the updated gallery page
        }).end(file.buffer);

    } catch (error) {
        res.status(500).json({ message: "Server Error", error });
    }
});


// DELETE Image Route (Only for Admins)
router.delete("/:id", async (req, res) => {
    try {
        const image = await Gallery.findById(req.params.id);
        if (!image) return res.status(404).json({ success: false, message: "Image not found" });

        // Extract Cloudinary image public ID from URL
        //const publicId = image.imageUrl.split("/").pop().split(".")[0];
        const publicId = image.imageUrl.match(/\/v\d+\/(.+?)\./)[1]; // Extract publicId


        // Delete image from Cloudinary
        await cloudinary.uploader.destroy(publicId);

        // Delete image from MongoDB
        await Gallery.findByIdAndDelete(req.params.id);

        res.redirect("/gallery") // Redirect to the updated gallery page
        //res.json({ success: true, message: "Image deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
