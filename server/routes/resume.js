const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { OpenAI } = require('openai');
const multer = require('multer');

const pdf = require('pdf-parse');

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

        const jobDescription = req.body.jobDescription || "";
        let resumeText = "";

        if (req.file.mimetype === 'application/pdf') {
            const pdfData = await pdf(req.file.buffer);
            resumeText = pdfData.text;
        } else {
            resumeText = req.file.buffer.toString('utf-8');
        }

        const systemPrompt = jobDescription
            ? "You are an expert career coach and ATS optimization specialist. Analyze the provided resume against the Job Description (JD). Provide feedback in JSON format with keys: 'matchScore' (0-100), 'score' (general ATS score 0-100), 'strengths' (array), 'weaknesses' (array), 'suggestions' (array), 'keywords' (array of missing keywords from JD), and 'smartRewrites' (array of objects with { original: string, improved: string })."
            : "You are an expert career coach and ATS optimization specialist. Analyze the provided resume text and provide feedback in JSON format with keys: 'score' (out of 100), 'strengths' (array), 'weaknesses' (array), 'suggestions' (array), and 'keywords' (array of missing keywords).";

        const userPrompt = jobDescription
            ? `Job Description: \n${jobDescription}\n\nResume: \n${resumeText}`
            : `Analyze this resume: \n\n${resumeText}`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Better availability and performance
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
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
