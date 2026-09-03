const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');

const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/chat', async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ reply: "GEMINI_API_KEY එක Vercel Settings වල සකසා නැත!" });
        }

        const ai = new GoogleGenAI({ apiKey });
        const { message, language } = req.body;

        const systemPrompt = language === 'si'
            ? "ඔබ 'සන්සුන්' මානසික සෞඛ්‍ය සහායක AI වේ."
            : "You are 'Sansun', a mental health assistant AI.";

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: `${systemPrompt}\n\nUser Message: ${message}`
        });

        res.json({ reply: response.text });
    } catch (error) {
        res.status(500).json({ reply: "Server Error: " + error.message });
    }
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

module.exports = app;