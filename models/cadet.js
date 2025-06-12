const mongoose = require("mongoose");

const cadetSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    education:{
        type: String,
        required: true
    },

    contact: {
        type: String,
        required: true
    },
 
    email: {
        type: String,
        required: true,
        unique:true
     },

    batch: {
        type: String,
        required: true
    },
    achievement: {
        type: String
    },

    img: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("Cadet", cadetSchema);