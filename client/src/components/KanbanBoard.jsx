import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../api';
import { Plus, Briefcase, MapPin, ExternalLink, Trash2, RotateCcw } from 'lucide-react';

const COLUMNS = ['Applied', 'Interview', 'Rejected', 'Offer'];

export default function KanbanBoard() {
    const [jobs, setJobs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [newJob, setNewJob] = useState({ company: '', position: '', location: '', link: '', status: 'Applied' });

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const { data } = await api.get('/jobs');
            setJobs(data);
        } catch (err) {
            console.error('Fetch Jobs Failed:', err);
            // If it's a 401, the interceptor handles it. For others, show an alert.
            if (err.response?.status !== 401) {
                alert('Could not fetch jobs. Please check your connection.');
            }
        }
    };

    const onDragEnd = async (result) => {
        if (!result.destination) return;
        const { draggableId, destination } = result;
        const newStatus = destination.droppableId;

        // Optimistic update
        const updatedJobs = jobs.map(j => j._id === draggableId ? { ...j, status: newStatus } : j);
        setJobs(updatedJobs);

        try {
            await api.patch(`/jobs/${draggableId}`, { status: newStatus });
        } catch (err) {
            console.error('Update Status Failed:', err);
            fetchJobs(); // Revert on error
        }
    };

    const handleAddJob = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/jobs', newJob);
            setJobs([data, ...jobs]);
            setShowModal(false);
            setNewJob({ company: '', position: '', location: '', link: '', status: 'Applied' });
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

    return (
        <div className="container">
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                    Job Tracker
                    <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginLeft: '1rem', fontWeight: 'normal' }}>
                        ({jobs.length} Total)
                    </span>
                </h2>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className="btn"
                        onClick={fetchJobs}
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'white', padding: '0.5rem 1rem' }}
                        title="Refresh Job List"
                    >
                        <RotateCcw size={18} />
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                        <Plus size={20} /> Add Job
                    </button>
                </div>
            </header>

            <div style={{ marginBottom: '2rem' }}>
                <input
                    type="text"
                    placeholder="Search jobs by company or position..."
                    className="glass"
                    style={{
                        width: '100%',
                        padding: '1rem',
                        fontSize: '1rem',
                        color: 'white',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px'
                    }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
                    {COLUMNS.map(column => {
                        const filteredJobs = jobs.filter(j =>
                            j.status === column &&
                            (j.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                j.position.toLowerCase().includes(searchTerm.toLowerCase()))
                        );

                        return (
                            <div key={column} className="glass" style={{ padding: '1rem', minHeight: '500px' }}>
                                <h3 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                                    {column}
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>
                                        ({filteredJobs.length})
                                    </span>
                                </h3>
                                <Droppable droppableId={column}>
                                    {(provided) => (
                                        <div {...provided.droppableProps} ref={provided.innerRef} style={{ minHeight: '400px' }}>
                                            {filteredJobs.map((job, index) => (
                                                <Draggable key={job._id} draggableId={job._id} index={index}>
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className="glass"
                                                            style={{
                                                                padding: '1rem',
                                                                marginBottom: '1rem',
                                                                border: 'none',
                                                                background: 'rgba(255,255,255,0.03)',
                                                                ...provided.draggableProps.style
                                                            }}
                                                        >
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                                                <h4 style={{ color: 'var(--primary)', marginBottom: '0.25rem' }}>{job.position}</h4>
                                                                <button onClick={() => handleDelete(job._id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}>
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                            <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                                                                <Briefcase size={14} /> {job.company}
                                                            </p>
                                                            {job.location && (
                                                                <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                                                                    <MapPin size={14} /> {job.location}
                                                                </p>
                                                            )}
                                                            {job.link && (
                                                                <a href={job.link} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--accent)', marginTop: '0.5rem', textDecoration: 'none' }}>
                                                                    <ExternalLink size={14} /> View Job
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {filteredJobs.length === 0 && !searchTerm && (
                                                <div style={{
                                                    textAlign: 'center',
                                                    padding: '2rem 1rem',
                                                    color: 'var(--text-muted)',
                                                    fontSize: '0.8rem',
                                                    border: '1px dashed var(--border)',
                                                    borderRadius: '12px',
                                                    opacity: 0.5,
                                                    marginBottom: '1rem'
                                                }}>
                                                    No applications yet
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

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="glass" style={{ padding: '2rem', width: '100%', maxWidth: '500px' }}>
                        <h3>Add New Job</h3>
                        <form onSubmit={handleAddJob}>
                            <div className="input-group">
                                <label>Company</label>
                                <input required value={newJob.company} onChange={e => setNewJob({ ...newJob, company: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Position</label>
                                <input required value={newJob.position} onChange={e => setNewJob({ ...newJob, position: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Location</label>
                                <input value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Job Link</label>
                                <input value={newJob.link} onChange={e => setNewJob({ ...newJob, link: e.target.value })} />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary">Add Job</button>
                                <button type="button" className="btn" onClick={() => setShowModal(false)} style={{ background: 'rgba(255,255,255,0.1)' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
