const mongoose = require("mongoose");
require("dotenv").config();
const ApiKey = require("./models/ApiKey");

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/removebg_saas";

mongoose.connect(uri).then(async () => {
    console.log("Connected to DB...");

    // 1. Create Key for Samajwadi Project
    await ApiKey.create({
        key: "samajwadi_secret_key_101",
        name: "Samajwadi Project"
    });
    console.log("✅ Created Key for: Samajwadi Project");

    // 2. Create Key for Another Client (Example)
    await ApiKey.create({
        key: "client_b_secret_key_202",
        name: "Client B Website"
    });
    console.log("✅ Created Key for: Client B");

    console.log("-----------------------------------");
    console.log("🔑 KEYS GENERATED SUCCESSFULLY!");
    console.log("Use 'x-api-key' header in your requests.");
    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
