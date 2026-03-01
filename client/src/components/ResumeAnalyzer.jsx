import React, { useState } from 'react';
import api from '../api';
import { Upload, CheckCircle, AlertCircle, Sparkles, Wand2 } from 'lucide-react';

export default function ResumeAnalyzer() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState(null);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleAnalyze = async () => {
        if (!file) return alert('Please select a file');
        setLoading(true);
        const formData = new FormData();
        formData.append('resume', file);

        try {
            const { data } = await api.post('/resume/analyze', formData);
            setAnalysis(data);
        } catch (err) {
            alert(err.response?.data?.message || 'Analysis failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <header style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>AI Resume Analyzer</h2>
                <p style={{ color: 'var(--text-muted)' }}>Upload your resume in .txt format to get AI-powered feedback and ATS optimization tips.</p>
            </header>

            <div className="glass" style={{ padding: '3rem', textAlign: 'center', marginBottom: '2rem' }}>
                <Upload size={48} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
                <div className="input-group" style={{ maxWidth: '300px', margin: '0 auto 1.5rem' }}>
                    <input type="file" accept=".txt" onChange={handleFileChange} style={{ display: 'none' }} id="resume-upload" />
                    <label htmlFor="resume-upload" className="btn" style={{ background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--border)', width: '100%', cursor: 'pointer' }}>
                        {file ? file.name : 'Choose Text File'}
                    </label>
                </div>
                <button className="btn btn-primary" onClick={handleAnalyze} disabled={loading || !file}>
                    {loading ? 'Analyzing...' : <><Sparkles size={20} /> Analyze Resume</>}
                </button>
            </div>

            {analysis && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    <div className="glass" style={{ padding: '2rem', borderTop: `4px solid ${analysis.score > 70 ? 'var(--success)' : 'var(--warning)'}` }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>ATS Score</h3>
                        <div style={{ fontSize: '4rem', fontWeight: 'bold', color: analysis.score > 70 ? 'var(--success)' : 'var(--warning)' }}>
                            {analysis.score}<span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/100</span>
                        </div>
                    </div>

                    <div className="glass" style={{ padding: '2rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <CheckCircle size={20} color="var(--success)" /> Strengths
                        </h3>
                        <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-muted)' }}>
                            {analysis.strengths.map((s, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{s}</li>)}
                        </ul>
                    </div>

                    <div className="glass" style={{ padding: '2rem' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <AlertCircle size={20} color="var(--warning)" /> Weaknesses
                        </h3>
                        <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-muted)' }}>
                            {analysis.weaknesses.map((w, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{w}</li>)}
                        </ul>
                    </div>

                    <div className="glass" style={{ padding: '2rem', gridColumn: '1 / -1' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <Wand2 size={20} color="var(--accent)" /> AI Suggestions & Keywords
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Key Recommendations</h4>
                                <ul style={{ paddingLeft: '1.2rem', color: 'var(--text-muted)' }}>
                                    {analysis.suggestions.map((s, i) => <li key={i} style={{ marginBottom: '0.5rem' }}>{s}</li>)}
                                </ul>
                            </div>
                            <div>
                                <h4 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Missing Keywords</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {analysis.keywords.map((k, i) => (
                                        <span key={i} style={{ background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.875rem', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                            {k}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
