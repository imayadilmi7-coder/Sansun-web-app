const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { GoogleGenAI } = require('@google/genai');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and Password required' });
    }
    const isAdmin = email.includes('admin');
    return res.status(200).json({
        success: true,
        user: { name: email.split('@')[0], email, role: isAdmin ? 'admin' : 'user' }
    });
});

app.post('/api/chat', async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ reply: "API Key සකසා නැත." });
        }
        
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const { message, language } = req.body;

        const systemPrompt = language === 'si'
            ? "ඔබ 'සන්සුන්' මානසික සෞඛ්‍ය සහායක AI වේ. පරිශීලකයාට කරුණාවෙන්, සන්සුන්ව සහ උපකාරී වන ලෙස මානසික සුවතාවය පිළිබඳ පිළිතුරු දෙන්න."
            : "You are 'Sansun', an empathetic mental health support AI agent. Provide calm, supportive, and helpful advice.";

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `${systemPrompt}\n\nUser Message: ${message}`
        });

        res.json({ reply: response.text });
    } catch (error) {
        console.error("Error generating response:", error);
        res.status(500).json({ reply: "කනගාටුයි, සේවාවේ දෝෂයක් පවතී." });
    }
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Sansun Backend Live!' });
});

// Serve Frontend Files
const frontendPath = path.resolve(process.cwd(), 'Frontend');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
});

module.exports = app;