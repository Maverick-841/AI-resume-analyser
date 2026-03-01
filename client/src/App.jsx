import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import Auth from './components/Auth';
import KanbanBoard from './components/KanbanBoard';
import ResumeAnalyzer from './components/ResumeAnalyzer';
import { LayoutDashboard, FileText, LogOut, Briefcase } from 'lucide-react';

function App() {
    const { user, logout, loading } = useAuth();
    const [view, setView] = useState('kanban');

    if (loading) return null;
    if (!user) return <Auth />;

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            {/* Sidebar */}
            <nav className="glass" style={{ width: '280px', margin: '1rem', display: 'flex', flexDirection: 'column', padding: '2rem', borderRadius: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Briefcase size={24} color="white" />
                    </div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.5px' }}>HireUp AI</h1>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                        className="btn"
                        onClick={() => setView('kanban')}
                        style={{
                            background: view === 'kanban' ? 'rgba(99, 102, 241, 0.1)' : 'none',
                            color: view === 'kanban' ? 'var(--primary)' : 'var(--text-muted)',
                            justifyContent: 'flex-start'
                        }}
                    >
                        <LayoutDashboard size={20} /> Dashboard
                    </button>
                    <button
                        className="btn"
                        onClick={() => setView('analyzer')}
                        style={{
                            background: view === 'analyzer' ? 'rgba(99, 102, 241, 0.1)' : 'none',
                            color: view === 'analyzer' ? 'var(--primary)' : 'var(--text-muted)',
                            justifyContent: 'flex-start'
                        }}
                    >
                        <FileText size={20} /> AI Resume Analyzer
                    </button>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>{user.name}</p>
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Free Plan</p>
                        </div>
                    </div>
                    <button className="btn" onClick={logout} style={{ background: 'none', color: 'var(--danger)', justifyContent: 'flex-start', padding: '0.5rem' }}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                {view === 'kanban' ? <KanbanBoard /> : <ResumeAnalyzer />}
            </main>
        </div>
    );
}

export default App;
