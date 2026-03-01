const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { OpenAI } = require('openai');
const multer = require('multer');

// Configure Multer for PDF/Text uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain') {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and Text files are allowed'), false);
        }
    }
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

router.post('/analyze', auth, upload.single('resume'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a resume file' });
        }

        const resumeText = req.file.buffer.toString('utf-8'); // Note: Simple buffer to string for text files. For PDFs, we'd need a PDF parser.

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are an expert career coach and ATS optimization specialist. Analyze the provided resume text and provide feedback in JSON format with keys: 'score' (out of 100), 'strengths' (array), 'weaknesses' (array), 'suggestions' (array), and 'keywords' (array of missing keywords)."
                },
                {
                    role: "user",
                    content: `Analyze this resume: \n\n${resumeText}`
                }
            ],
            response_format: { type: "json_object" }
        });

        const analysis = JSON.parse(response.choices[0].message.content);
        res.json(analysis);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'AI Analysis failed', error: err.message });
    }
});

module.exports = router;
