require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5001;

app.use(express.json());
app.use(cors()); // Allow frontend requests

const MESHY_API_KEY = process.env.MESHY_AI_API_KEY;
const MESHY_API_URL = "https://api.meshy.ai/openapi/v1/image-to-3d";
const MASTERPIECE_API_KEY = process.env.MASTERPIECE_API_KEY;
const MASTERPIECE_API_URL = "https://api.genai.masterpiecex.com/v2/functions/imageto3d";

const MODELS_DIR = path.join(__dirname, "public", "models");
if (!fs.existsSync(MODELS_DIR)) {
    fs.mkdirSync(MODELS_DIR, { recursive: true });
}

// 🔹 Convert Images to 3D via Meshy API
app.post("/meshy/upload", async (req, res) => {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ error: "Missing image URL" });

    try {
        const response = await axios.post(
            MESHY_API_URL,
            { image_url: imageUrl, enable_pbr: false, should_remesh: false, should_texture: false },
            { headers: { Authorization: `Bearer ${MESHY_API_KEY}` } }
        );
        res.json({ taskId: response.data.result });
    } catch (error) {
        res.status(500).json({ error: "Meshy API request failed" });
    }
});

// 🔹 Convert Images to 3D via Masterpiece API
app.post("/masterpiece/upload", async (req, res) => {
    const { imageUrl } = req.body;
    if (!imageUrl) return res.status(400).json({ error: "Missing image URL" });

    try {
        const response = await axios.post(
            MASTERPIECE_API_URL,
            { imageUrl },
            { headers: { Authorization: `Bearer ${MASTERPIECE_API_KEY}` } }
        );
        res.json({ requestId: response.data.requestId });
    } catch (error) {
        res.status(500).json({ error: "Masterpiece API request failed" });
    }
});

// 🔹 Check Task Status for Meshy
app.get("/meshy/status/:taskId", async (req, res) => {
    const { taskId } = req.params;

    try {
        const response = await axios.get(`${MESHY_API_URL}/${taskId}`, {
            headers: { Authorization: `Bearer ${MESHY_API_KEY}` }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Meshy API status request failed" });
    }
});

// 🔹 Check Task Status for Masterpiece
app.get("/masterpiece/status/:requestId", async (req, res) => {
    const { requestId } = req.params;

    try {
        const response = await axios.get(
            `https://api.genai.masterpiecex.com/v2/status/${requestId}`,
            { headers: { Authorization: `Bearer ${MASTERPIECE_API_KEY}` } }
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Masterpiece API status request failed" });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
