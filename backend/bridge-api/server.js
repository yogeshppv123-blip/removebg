require('dotenv').config();
const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const FormData = require("form-data");
const cloudinary = require("cloudinary").v2;
const ImageModel = require("./models/Image");

const cors = require("cors");
const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/removebg_saas")
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// Create public directory if it doesn't exist
const publicDir = path.join(__dirname, "public");
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}

// Serve static files from 'public' directory
app.use(express.static(publicDir));
app.use(express.json());

app.post("/upload", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No image uploaded" });
        }

        const imagePath = req.file.path;

        // 1. Send to Python AI API
        const form = new FormData();
        form.append("file", fs.createReadStream(imagePath));

        const pythonApiUrl = process.env.PYTHON_API_URL || "http://localhost:8000/remove-bg";
        console.log("Sending to AI API...");

        const response = await axios.post(pythonApiUrl, form, {
            headers: { ...form.getHeaders() },
        });

        const processedHex = response.data.image;
        const processedBuffer = Buffer.from(processedHex, 'hex');

        // 2. Upload both to Cloudinary
        console.log("Uploading to Cloudinary...");

        // Upload original
        const originalUpload = await cloudinary.uploader.upload(imagePath, {
            folder: "removebg/originals"
        });

        // Upload processed (using buffer)
        const processedUpload = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "removebg/processed" },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(processedBuffer);
        });

        // 3. Save to MongoDB
        const newImageRecord = new ImageModel({
            originalImage: originalUpload.secure_url,
            processedImage: processedUpload.secure_url,
        });
        await newImageRecord.save();

        res.json({
            success: true,
            original: originalUpload.secure_url,
            processed: processedUpload.secure_url,
            recordId: newImageRecord._id
        });

    } catch (error) {
        console.error("Error processing image:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to process image" });
    } finally {
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error("Error deleting temp file:", err);
            });
        }
    }
});

// --- SIMPLE API FOR REACT NATIVE (No Cloudinary/MongoDB) ---
app.post("/api/remove-bg", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No image provided" });

        const form = new FormData();
        form.append("file", fs.createReadStream(req.file.path));

        const response = await axios.post(
            process.env.PYTHON_API_URL || "http://localhost:8000/remove-bg",
            form,
            { headers: { ...form.getHeaders() } }
        );

        // Python returns hex by default in my main.py
        // We convert it to base64 for easy use in React Native
        const processedBase64 = Buffer.from(response.data.image, 'hex').toString('base64');

        res.json({
            success: true,
            image: `data:image/png;base64,${processedBase64}`
        });

    } catch (error) {
        console.error("Simple API Error:", error.message);
        res.status(500).json({ error: "AI Processing Failed" });
    } finally {
        if (req.file) fs.unlinkSync(req.file.path);
    }
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Node Bridge API running on port ${PORT}`));
