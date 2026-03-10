import React, { useState } from 'react';
import api from '../api';
import { Upload, CheckCircle, AlertCircle, Sparkles, Wand2, FileType, Target, Zap, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResumeAnalyzer() {
    const [file, setFile] = useState(null);
    const [jobDescription, setJobDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);
    const [copiedIndex, setCopiedIndex] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleAnalyze = async () => {
        if (!file) {
            alert('Please select a resume file (PDF or TXT) first.');
            return;
        }
        setAnalysis(null);
        setLoading(true);
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobDescription', jobDescription);

        try {
            const { data } = await api.post('/resume/analyze', formData);
            setAnalysis(data);
        } catch (err) {
            console.error('Analysis Failed:', err);
            const msg = err.response?.data?.message || 'Analysis failed. Please try again.';
            const detail = err.response?.data?.error || '';

            if (detail.includes('API key')) {
                alert('OpenAI API Key is missing or invalid. Please check your server .env file.');
            } else {
                alert(`${msg}\n${detail}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <header style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2.5rem', fontWeight: '800', background: 'linear-gradient(to right, #6366f1, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Advanced AI Resume Analyzer</h2>
                <p style={{ color: 'var(--text-muted)' }}>Upload your resume (PDF or TXT) and paste the Job Description for a detailed compatibility analysis.</p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div className="glass" style={{ padding: '2rem' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.1rem' }}>
                        <FileType size={20} color="var(--primary)" /> 1. Upload Resume
                    </h3>
                    <div style={{ textAlign: 'center', border: '2px dashed var(--border)', padding: '2rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)' }}>
                        <Upload size={32} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
                        <input type="file" accept=".pdf,.txt" onChange={handleFileChange} style={{ display: 'none' }} id="resume-upload" />
                        <label htmlFor="resume-upload" className="btn" style={{ background: 'var(--primary)', color: 'white', width: '100%', cursor: 'pointer', justifyContent: 'center' }}>
                            {file ? file.name : 'Choose PDF or Text'}
                        </label>
                    </div>
                </div>

                <div className="glass" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', margin: 0 }}>
                            <Target size={20} color="var(--accent)" /> 2. Paste Job Description (Optional)
                        </h3>
                        {jobDescription && (
                            <button
                                onClick={() => setJobDescription('')}
                                style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.8rem', cursor: 'pointer', opacity: 0.7 }}
                            >
                                Clear
                            </button>
                        )}
                    </div>
                    <textarea
                        className="input-group"
                        placeholder="Paste the job requirements here for matching..."
                        style={{ width: '100%', height: '120px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: '12px', color: 'white', padding: '1rem', resize: 'none' }}
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                    />
                    <div style={{ textAlign: 'right', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                        {jobDescription.length} characters
                    </div>
                </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <button
                    className="btn btn-primary"
                    onClick={handleAnalyze}
                    disabled={loading || !file}
                    style={{ padding: '1rem 3rem', fontSize: '1.1rem' }}
                >
                    {loading ? 'Processing AI Magic...' : <><Sparkles size={20} /> Analyze & Match Now</>}
                </button>
            </div>

            <AnimatePresence>
                {analysis && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}
                    >
                        {analysis.matchScore !== undefined && (
                            <div className="glass" style={{ padding: '2rem', borderTop: `4px solid var(--accent)` }}>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--accent)' }}>JD Match Score</h3>
                                <div style={{ fontSize: '4rem', fontWeight: '900' }}>
                                    {analysis.matchScore}<span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>%</span>
                                </div>
                                <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginTop: '1rem' }}>
                                    <div style={{ height: '100%', width: `${analysis.matchScore}%`, background: 'var(--accent)', borderRadius: '4px' }} />
                                </div>
                            </div>
                        )}

                        <div className="glass" style={{ padding: '2rem', borderTop: `4px solid ${analysis.score > 70 ? 'var(--success)' : 'var(--warning)'}` }}>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Overall ATS Score</h3>
                            <div style={{ fontSize: '4rem', fontWeight: '900', color: analysis.score > 70 ? 'var(--success)' : 'var(--warning)' }}>
                                {analysis.score}<span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>/100</span>
                            </div>
                        </div>

                        <div className="glass" style={{ padding: '2rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <CheckCircle size={20} color="var(--success)" /> Top Strengths
                            </h3>
                            <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                {analysis.strengths.map((s, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{s}</li>)}
                            </ul>
                        </div>

                        <div className="glass" style={{ padding: '2rem' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <AlertCircle size={20} color="var(--warning)" /> Critical Gaps
                            </h3>
                            <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                {analysis.weaknesses.map((w, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{w}</li>)}
                            </ul>
                        </div>

                        {analysis.smartRewrites && (
                            <div className="glass" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                    <Zap size={20} color="yellow" /> AI Smart Rewrites (Context Aware)
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                                    {analysis.smartRewrites.map((item, i) => (
                                        <div key={i} style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)', position: 'relative' }}>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontStyle: 'italic' }}>Original: {item.original}</p>
                                            <p style={{ color: 'var(--success)', fontWeight: '500', paddingRight: '2rem' }}>→ {item.improved}</p>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(item.improved);
                                                    setCopiedIndex(i);
                                                    setTimeout(() => setCopiedIndex(null), 2000);
                                                }}
                                                style={{
                                                    position: 'absolute',
                                                    top: '0.5rem',
                                                    right: '0.5rem',
                                                    background: 'none',
                                                    border: 'none',
                                                    color: copiedIndex === i ? 'var(--success)' : 'var(--text-muted)',
                                                    cursor: 'pointer',
                                                    padding: '0.25rem'
                                                }}
                                                title="Copy to clipboard"
                                            >
                                                {copiedIndex === i ? <CheckCircle size={14} /> : <Copy size={14} />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="glass" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                                <Wand2 size={20} color="var(--accent)" /> Missing Keywords for Optimization
                            </h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                                {analysis.keywords.map((k, i) => (
                                    <span key={i} style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.4rem 1rem', borderRadius: '20px', fontSize: '0.9rem', border: '1px solid rgba(99, 102, 241, 0.2)', fontWeight: '600' }}>
                                        {k}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
