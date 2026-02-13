import React, { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { Users, Plus, Copy, Edit2, RefreshCw, X } from 'lucide-react';

const TrainerManagement = () => {
    const { trainers = [], saveTrainer, deleteTrainer } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTrainer, setEditingTrainer] = useState(null);
    const [form, setForm] = useState({ name: '', code: '', email: '' });

    const generateCode = () => {
        return 'TRAINER' + Math.random().toString(36).substring(2, 8).toUpperCase();
    };

    const handleSave = (e) => {
        e.preventDefault();
        saveTrainer({
            ...form,
            id: editingTrainer?.id || 'TR_' + Date.now(),
            createdAt: editingTrainer?.createdAt || Date.now()
        });
        setIsModalOpen(false);
        setEditingTrainer(null);
        setForm({ name: '', code: '', email: '' });
    };

    const handleEdit = (trainer) => {
        setEditingTrainer(trainer);
        setForm(trainer);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (window.confirm('Delete this trainer? This will unlink all members.')) {
            deleteTrainer(id);
        }
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        alert('Trainer code copied to clipboard!');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '900' }}>TRAINER MANAGEMENT</h2>
                    <p style={{ color: 'var(--muted-foreground)' }}>Manage trainers and generate codes for member connections</p>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => {
                        setEditingTrainer(null);
                        setForm({ name: '', code: generateCode(), email: '' });
                        setIsModalOpen(true);
                    }}
                    style={{ backgroundColor: '#BEFF00', color: 'black', fontWeight: '900' }}
                >
                    <Plus size={20} /> CREATE TRAINER
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {trainers.length === 0 ? (
                    <div className="premium-card" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center' }}>
                        <Users size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                        <p style={{ color: 'var(--muted-foreground)' }}>No trainers created yet. Create one to get started.</p>
                    </div>
                ) : (
                    trainers.map(trainer => (
                        <div key={trainer.id} className="premium-card" style={{ border: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>{trainer.name}</h3>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button onClick={() => handleEdit(trainer)} className="btn-outline" style={{ padding: '0.4rem' }}>
                                        <Edit2 size={16} />
                                    </button>
                                    <button onClick={() => handleDelete(trainer.id)} className="btn-outline" style={{ padding: '0.4rem', color: '#ef4444' }}>
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>TRAINER CODE</p>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <div style={{ flex: 1, padding: '0.75rem', backgroundColor: 'rgba(190, 255, 0, 0.1)', border: '1px solid #BEFF00', borderRadius: '8px', fontWeight: '900', textAlign: 'center', color: '#BEFF00', letterSpacing: '0.1em' }}>
                                        {trainer.code}
                                    </div>
                                    <button onClick={() => handleCopyCode(trainer.code)} className="btn-outline" style={{ padding: '0.75rem' }}>
                                        <Copy size={16} />
                                    </button>
                                    <button
                                        onClick={() => {
                                            const newCode = generateCode();
                                            saveTrainer({ ...trainer, code: newCode });
                                        }}
                                        className="btn-outline"
                                        style={{ padding: '0.75rem' }}
                                    >
                                        <RefreshCw size={16} />
                                    </button>
                                </div>
                            </div>

                            {trainer.email && (
                                <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
                                    Email: {trainer.email}
                                </p>
                            )}

                            <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Assigned Members</p>
                                <p style={{ fontSize: '1.25rem', fontWeight: '800' }}>0</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                    <div className="premium-card" style={{ width: '100%', maxWidth: '500px' }}>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '2rem' }}>
                            {editingTrainer ? 'EDIT TRAINER' : 'CREATE TRAINER'}
                        </h3>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '700' }}>Trainer Name</label>
                                <input
                                    className="input-field"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. John Doe"
                                    required
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '700' }}>Trainer Code</label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        className="input-field"
                                        value={form.code}
                                        onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                        placeholder="TRAINERXXX"
                                        style={{ flex: 1, fontWeight: '900', letterSpacing: '0.1em' }}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, code: generateCode() })}
                                        className="btn-outline"
                                    >
                                        <RefreshCw size={18} />
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', fontWeight: '700' }}>Email (Optional)</label>
                                <input
                                    className="input-field"
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                    placeholder="trainer@example.com"
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => { setIsModalOpen(false); setEditingTrainer(null); }} className="btn-outline" style={{ flex: 1 }}>
                                    CANCEL
                                </button>
                                <button type="submit" className="btn-primary" style={{ flex: 1, backgroundColor: '#BEFF00', color: 'black', fontWeight: '900' }}>
                                    SAVE
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrainerManagement;
