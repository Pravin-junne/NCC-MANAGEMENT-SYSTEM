const mongoose = require("mongoose");

const eventReportSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true 
    },

    fileUrl: { 
        type: String, 
        required: true 
    }, // Cloudinary file URL

    uploadedAt: { 
        type: Date, 
        default: Date.now 
    }

});

module.exports = mongoose.model("eventReport", eventReportSchema);
