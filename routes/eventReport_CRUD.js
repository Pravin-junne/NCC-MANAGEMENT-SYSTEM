const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage, cloudinary } = require("../cloudConfig.js"); // Cloudinary config
const { isAdmin } = require("../middleware"); // Middleware for admin access
const eventReport = require("../models/eventsReport.js"); // Model for event doc
const eventsReportD = require("../models/eventsReport.js");



//  Route to render the upload form (Only Admins can access)
router.get("/upload", (req, res) => {
    res.render("pages/uploadEventDoc"); // Make sure this file exists inside "views/pages/"
});

const upload = multer({ storage });

//  Route to upload a event reports (Admin Only)
router.post("/upload",  upload.single("file"), async (req, res) => {
    try {
        const { title } = req.body;
        if (!req.file || !title) {
            return res.status(400).send("Missing file or title");
        }

        const newReport = new eventReport({
            title,
            fileUrl: req.file.path || req.file.secure_url, // Ensure correct URL Cloudinary URL
            uploadedAt: new Date(),
        });

        await newReport.save();
        res.redirect('/event/eventReport');  // Redirect back to documents page
    } catch (error) {
        console.error("Error uploading document:", error);
        res.status(500).send("Server Error");
    }
});

//  Route to get all study documents (Accessible to all)
router.get("/eventReport", async (req, res) => {
    try {
        const eventReport = await eventsReportD.find();
        res.render("pages/eventsReport", { eventReport });
    } catch (error) {
        console.error("Error fetching documents:", error);
        res.status(500).send("Server Error");
    }
});

//  Route to delete a document (Admin Only)
router.delete("/eventReport/:id", isAdmin, async (req, res) => {
    try {
        const doc = await eventsReportD.findById(req.params.id);
        if (!doc) {
            return res.status(404).send("Document not found");
        }

        // Extract publicId correctly
        const urlParts = doc.fileUrl.split("/");
        const publicIdWithExt = urlParts[urlParts.length - 1]; // Get last part
        const publicId = publicIdWithExt.split(".")[0]; // Remove file extension

        


        // Delete from Cloudinary
        await cloudinary.uploader.destroy(`NCC_Documents/${publicId}`, { resource_type: "raw" });

       // await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });

        // Delete from MongoDB
        await eventsReportD.findByIdAndDelete(req.params.id);

        res.redirect('/event/eventReport');  // Redirect back to documents page
    } catch (error) {
        console.error("Error deleting document:", error);
        res.status(500).send("Server Error");
    }
});

module.exports = router;
