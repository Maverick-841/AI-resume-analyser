const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: String, required: true },
    position: { type: String, required: true },
    status: {
        type: String,
        enum: ['Applied', 'Interview', 'Rejected', 'Offer'],
        default: 'Applied'
    },
    location: { type: String },
    link: { type: String },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Job', jobSchema);
