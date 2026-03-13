import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../api';
import { Plus, Briefcase, MapPin, ExternalLink, Trash2, RotateCcw, FileText, Calendar, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const COLUMNS = ['Applied', 'Interview', 'Rejected', 'Offer'];

export default function KanbanBoard() {
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newJob, setNewJob] = useState({ company: '', position: '', location: '', link: '', status: 'Applied', notes: '' });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const { data } = await api.get('/jobs');
            setJobs(data);
        } catch (err) {
            console.error('Fetch Jobs Failed:', err);
            if (err.response?.status !== 401) {
                alert('Could not fetch jobs. Please check your connection.');
            }
        }
    };

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        const { draggableId, destination } = result;
        const newStatus = destination.droppableId;

        const updatedJobs = jobs.map(j => j._id === draggableId ? { ...j, status: newStatus } : j);
        setJobs(updatedJobs);

        try {
            await api.patch(`/jobs/${draggableId}`, { status: newStatus });
        } catch (err) {
            console.error('Update Status Failed:', err);
            fetchJobs();
        }
    };

    const handleAddJob = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/jobs', newJob);
            setJobs([data, ...jobs]);
            setShowModal(false);
            setNewJob({ company: '', position: '', location: '', link: '', status: 'Applied', notes: '' });
        } catch (err) {
            console.error('Add Job Failed:', err);
            alert(err.response?.data?.message || 'Failed to add job. Please try again.');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this job?')) return;
        try {
            await api.delete(`/jobs/${id}`);
            setJobs(jobs.filter(j => j._id !== id));
        } catch (err) {
            console.error('Delete Job Failed:', err);
            alert('Failed to delete job.');
        }
    };

    const getDaysSince = (dateString) => {
        const diff = new Date() - new Date(dateString);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        return `${days} days ago`;
    };

    return (
        <div className="container" style={{ paddingBottom: '4rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                <div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800', background: 'linear-gradient(to right, #6366f1, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
                        Job Tracker
                    </h2>
                    <p style={{ color: 'var(--text-muted)' }}>Manage and track your job applications career progress.</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="btn"
                        onClick={fetchJobs}
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '0.75rem', borderRadius: '12px', border: '1px solid var(--border)' }}
                        title="Refresh Job List"
                    >
                        <RotateCcw size={20} />
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ padding: '0.75rem 1.5rem', borderRadius: '12px' }}>
                        <Plus size={20} /> Add Job
                    </button>
                </div>
            </header>

            <div style={{ marginBottom: '2.5rem' }}>
                <div style={{ position: 'relative' }}>
                    <input
                        type="text"
                        placeholder="Search jobs by company or position..."
                        className="glass"
                        style={{
                            width: '100%',
                            padding: '1.25rem 1.25rem 1.25rem 3rem',
                            fontSize: '1rem',
                            color: 'white',
                            background: 'rgba(255,255,255,0.03)',
                            border: '1px solid var(--border)',
                            borderRadius: '16px',
                            transition: 'all 0.2s'
                        }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                        <Plus size={18} style={{ transform: 'rotate(45deg)' }} />
                    </div>
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
                    {COLUMNS.map(column => {
                        const filteredJobs = jobs.filter(j =>
                            j.status === column &&
                            (j.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                j.position.toLowerCase().includes(searchTerm.toLowerCase()))
                        );

                        return (
                            <div key={column} className="glass" style={{ padding: '1.25rem', minHeight: '600px', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: column === 'Offer' ? 'var(--success)' : column === 'Rejected' ? 'var(--danger)' : 'var(--primary)' }} />
                                        {column}
                                    </h3>
                                    <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '12px', color: 'var(--text-muted)' }}>
                                        {filteredJobs.length}
                                    </span>
                                </div>
                                <Droppable droppableId={column}>
                                    {(provided) => (
                                        <div {...provided.droppableProps} ref={provided.innerRef} style={{ flex: 1 }}>
                                            {filteredJobs.map((job, index) => (
                                                <Draggable key={job._id} draggableId={job._id} index={index}>
                                                    {(provided) => (
                                                        <motion.div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            className="glass"
                                                            style={{
                                                                padding: '1.25rem',
                                                                marginBottom: '1rem',
                                                                border: '1px solid var(--border)',
                                                                background: 'rgba(255,255,255,0.04)',
                                                                cursor: 'grab',
                                                                ...provided.draggableProps.style
                                                            }}
                                                        >
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                                                                <h4 style={{ color: 'white', fontWeight: '700', fontSize: '1rem', margin: 0 }}>{job.position}</h4>
                                                                <button onClick={() => handleDelete(job._id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.2rem', opacity: 0.6 }} className="hover-opacity">
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                                                <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--primary)', margin: 0 }}>
                                                                    <Briefcase size={14} /> {job.company}
                                                                </p>
                                                                {job.location && (
                                                                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                                                                        <MapPin size={14} /> {job.location}
                                                                    </p>
                                                                )}
                                                                <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, marginTop: '0.4rem' }}>
                                                                    <Calendar size={12} /> {getDaysSince(job.createdAt)}
                                                                </p>
                                                            </div>
                                                            
                                                            {job.notes && (
                                                                <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', borderLeft: '2px solid var(--border)' }}>
                                                                    <FileText size={12} style={{ marginBottom: '0.2rem' }} /> {job.notes}
                                                                </div>
                                                            )}

                                                            {job.link && (
                                                                <a href={job.link} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--accent)', marginTop: '0.75rem', textDecoration: 'none', fontWeight: '500' }}>
                                                                    <ExternalLink size={14} /> View Listing
                                                                </a>
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {filteredJobs.length === 0 && (
                                                <div style={{
                                                    textAlign: 'center',
                                                    padding: '3rem 1rem',
                                                    color: 'var(--text-muted)',
                                                    fontSize: '0.85rem',
                                                    border: '1px dashed var(--border)',
                                                    borderRadius: '16px',
                                                    opacity: 0.4,
                                                    background: 'rgba(255,255,255,0.01)'
                                                }}>
                                                    <Briefcase size={24} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
                                                    <p style={{ margin: 0 }}>Drop jobs here</p>
                                                </div>
                                            )}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        );
                    })}
                </div>
            </DragDropContext>

            <AnimatePresence>
                {showModal && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem' }}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="glass" 
                            style={{ padding: '2.5rem', width: '100%', maxWidth: '550px', position: 'relative', border: '1px solid var(--border)' }}
                        >
                            <button 
                                onClick={() => setShowModal(false)}
                                style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                            >
                                <X size={24} />
                            </button>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1.5rem' }}>Add New Job Trace</h3>
                            <form onSubmit={handleAddJob} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="input-group">
                                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Company Name</label>
                                        <input required placeholder="e.g. Google" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} value={newJob.company} onChange={e => setNewJob({ ...newJob, company: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Job Position</label>
                                        <input required placeholder="e.g. Frontend Engineer" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} value={newJob.position} onChange={e => setNewJob({ ...newJob, position: e.target.value })} />
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div className="input-group">
                                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Location</label>
                                        <input placeholder="e.g. Remote / New York" style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} />
                                    </div>
                                    <div className="input-group">
                                        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Job Link</label>
                                        <input placeholder="https://..." style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white' }} value={newJob.link} onChange={e => setNewJob({ ...newJob, link: e.target.value })} />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', display: 'block' }}>Notes (Optional)</label>
                                    <textarea placeholder="Key requirements, contact person, etc..." style={{ width: '100%', height: '100px', padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'white', resize: 'none' }} value={newJob.notes} onChange={e => setNewJob({ ...newJob, notes: e.target.value })} />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '1rem', borderRadius: '12px' }}>Track Job</button>
                                    <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: 'white' }}>Cancel</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
