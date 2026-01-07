const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
    userId: { type: String, required: false },
    originalImage: { type: String }, // Store URL or path
    processedImage: { type: String }, // Store URL or path or base64
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Image", ImageSchema);
