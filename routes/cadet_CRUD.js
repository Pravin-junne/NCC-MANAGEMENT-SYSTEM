const express = require('express');
const router = express.Router();
const Cadet = require('../models/cadet'); // Import your Cadet model


const { cloudinary } = require("../cloudConfig.js"); // Cloudinary instance
const { isAdmin } = require("../middleware"); // Admin authentication middleware
// File upload setup
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });

// Admin routes

router.get('/add-cadet', (req, res) => {
    console.log("hello");
    res.render('pages/addCadet.ejs');
});

//  POST route to add a new cadet with image upload
router.post('/add-cadet', upload.single("img"), async (req, res) => {
    console.log("Incoming form data:", req.body);  // Debugging form data
    console.log("Uploaded file:", req.file);      // Debugging file upload

    try {
        const { name, education, contact, email, batch, achievement } = req.body;

        if (!name || !email || !req.file) {
            console.log("Missing required fields");
            return res.status(400).send("Missing required fields");
        }

        const newCadet = new Cadet({
            name,
            education,
            contact,
            email,
            batch,
            achievement,
            img: req.file.path //  Save Cloudinary secure URL
        });

        await newCadet.save();
        res.redirect("/cadetListing"); // Redirect correctly
    } catch (error) {
        console.error("Error adding cadet:", error);
        res.status(500).send("Server Error");
    }
});

router.get('/dashboard', (req, res) => {
    console.log("hello");
    res.render('pages/dashboard.ejs');
});

///
router.delete('/delete-cadet/:id', isAdmin, async (req, res) => {
    try {
        const cadet = await Cadet.findById(req.params.id);
        if (!cadet) {
            return res.status(404).json({ success: false, message: "Cadet not found" });
        }

        //  Delete Image from Cloudinary (if applicable)
        const publicId = cadet.img.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`NCC_Photos/${publicId}`);

        //  Delete Cadet from Database
        await Cadet.findByIdAndDelete(req.params.id);

        console.log("✅ Cadet deleted successfully");
        res.json({ success: true, message: "Cadet deleted successfully" });
    } catch (error) {
        console.error("Error deleting cadet:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
});


module.exports = router;
