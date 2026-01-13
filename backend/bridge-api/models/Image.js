const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
    userId: { type: String, required: false },
    originalImage: { type: String },
    processedImage: { type: String },
    source: { type: String, default: 'web' }, // 'web', 'mobile', or 'external'
    apiKey: { type: String, required: false },
    origin: { type: String }, // Domain name for external sites
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Image", ImageSchema);
