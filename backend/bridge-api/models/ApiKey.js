const mongoose = require("mongoose");

const ApiKeySchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true }, // e.g., 'React Native App', 'Buildora Website', 'Client X'
    usageCount: { type: Number, default: 0 },
    lastUsed: { type: Date },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ApiKey", ApiKeySchema);
