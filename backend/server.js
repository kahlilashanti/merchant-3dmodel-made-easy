require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = 5001;

app.use(express.json());
app.use(cors());

const MESHY_API_KEY = process.env.MESHY_API_KEY;
const MESHY_API_URL = "https://api.meshy.ai/openapi/v1/image-to-3d";

if (!MESHY_API_KEY) {
    console.error("❌ ERROR: Meshy API Key is missing! Check your .env file.");
} else {
    console.log("✅ Meshy API Key Loaded.");
}

app.post("/meshy/upload", async (req, res) => {
    const { imageUrl } = req.body;
    if (!imageUrl) {
        return res.status(400).json({ error: "Missing image URL" });
    }

    try {
        console.log(`📤 Uploading image to Meshy AI: ${imageUrl}`);

        const response = await axios.post(
            MESHY_API_URL,
            { image_url: imageUrl },
            { headers: { Authorization: `Bearer ${MESHY_API_KEY}`, "Content-Type": "application/json" } }
        );

        console.log("✅ Meshy API Response:", response.data);
        res.json(response.data);
    } catch (error) {
        console.error("❌ Meshy API Error:", error.response ? error.response.data : error.message);
        res.status(error.response?.status || 500).json({
            error: "Meshy API failed",
            details: error.response?.data || error.message
        });
    }
});

const MASTERPIECE_API_KEY = process.env.MASTERPIECE_API_KEY;
const MASTERPIECE_API_URL = "https://api.genai.masterpiecex.com/v2/functions/imageto3d";

if (!MASTERPIECE_API_KEY) {
    console.error("❌ ERROR: Masterpiece API Key is missing! Check your .env file.");
} else {
    console.log("✅ Masterpiece API Key Loaded.");
}

app.post("/masterpiece/upload", async (req, res) => {
    const { imageUrl } = req.body;
    if (!imageUrl) {
        return res.status(400).json({ error: "Missing image URL" });
    }

    try {
        console.log(`📤 Uploading image to Masterpiece API: ${imageUrl}`);

        const response = await axios.post(
            MASTERPIECE_API_URL,
            { imageUrl: imageUrl },
            { headers: { Authorization: `Bearer ${MASTERPIECE_API_KEY}`, "Content-Type": "application/json" } }
        );

        console.log("✅ Masterpiece API Response:", response.data);
        res.json(response.data);
    } catch (error) {
        console.error("❌ Masterpiece API Error:", error.response ? error.response.data : error.message);
        res.status(error.response?.status || 500).json({
            error: "Masterpiece API failed",
            details: error.response?.data || error.message
        });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
