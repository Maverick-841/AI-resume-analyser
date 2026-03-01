const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Job = require('../models/Job');

// Get all jobs for user
router.get('/', auth, async (req, res) => {
    try {
        const jobs = await Job.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a job
router.post('/', auth, async (req, res) => {
    try {
        const { company, position, status, location, link, notes } = req.body;
        const newJob = new Job({ userId: req.user.id, company, position, status, location, link, notes });
        await newJob.save();
        res.json(newJob);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update job status
router.patch('/:id', auth, async (req, res) => {
    try {
        const job = await Job.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            { $set: req.body },
            { new: true }
        );
        res.json(job);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete a job
router.delete('/:id', auth, async (req, res) => {
    try {
        await Job.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        res.json({ message: 'Job deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
