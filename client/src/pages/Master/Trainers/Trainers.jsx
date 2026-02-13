import React, { useState, useMemo } from 'react';
import { useData } from '../../../context/DataContext';
import {
    Plus, Search, Edit, Trash2, User, Phone, Mail,
    Calendar, Award, DollarSign, TrendingUp, Users,
    MoreVertical, CheckCircle, XCircle, Trash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Trainers = () => {
    const {
        trainers, members, payments, saveTrainer, deleteTrainer
    } = useData();

    // UI state
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTrainer, setEditingTrainer] = useState(null);
    const [showDeleted, setShowDeleted] = useState(false);

    // Trainer form state
    const [formData, setFormData] = useState({
        name: '',
        phoneNumber: '',
        email: '',
        specialization: '',
        joiningDate: new Date().toISOString().split('T')[0],
        commissionPercentage: 0,
        status: 'Active'
    });

    // --- Analytics Logic ---
    const getTrainerStats = (trainerId) => {
        const trainerMembers = members.filter(m => m.trainerId === trainerId);
        const activeMembers = trainerMembers.filter(m => m.status === 'active').length;
        const expiredMembers = trainerMembers.filter(m => m.status === 'expired').length;

        // Members assigned to this trainer
        const trainerMemberIds = trainerMembers.map(m => m.id);

        // Payments from these members
        const trainerPayments = payments.filter(p => trainerMemberIds.includes(p.memberId));
        const totalRevenue = trainerPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        const renewals = trainerPayments.length;

        return {
            totalMembers: trainerMembers.length,
            activeMembers,
            expiredMembers,
            totalRevenue,
            renewals
        };
    };

    const filteredTrainers = trainers.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.specialization?.toLowerCase().includes(searchTerm.toLowerCase());
        const isDeleted = t.status === 'Deleted';
        return matchesSearch && (showDeleted ? isDeleted : !isDeleted);
    });

    // --- Handlers ---
    const handleOpenModal = (trainer = null) => {
        if (trainer) {
            setEditingTrainer(trainer);
            setFormData({
                ...trainer,
                joiningDate: trainer.joiningDate || new Date().toISOString().split('T')[0],
                commissionPercentage: trainer.commissionPercentage || 0,
                status: trainer.status || 'Active'
            });
        } else {
            setEditingTrainer(null);
            setFormData({
                name: '',
                phoneNumber: '',
                email: '',
                specialization: '',
                joiningDate: new Date().toISOString().split('T')[0],
                commissionPercentage: 0,
                status: 'Active'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        saveTrainer({
            ...editingTrainer,
            ...formData,
            id: editingTrainer?.id || `TR-${Math.floor(1000 + Math.random() * 9000)}`,
            code: editingTrainer?.code || `OLV-TR-${Math.floor(100 + Math.random() * 900)}`
        });
        setIsModalOpen(false);
    };

    const handleToggleStatus = (trainer) => {
        const newStatus = trainer.status === 'Active' ? 'Inactive' : 'Active';
        saveTrainer({ ...trainer, status: newStatus });
    };

    const handleSoftDelete = (trainer) => {
        if (window.confirm('Mark this trainer as deleted? They will no longer be visible in the active list.')) {
            saveTrainer({ ...trainer, status: 'Deleted' });
        }
    };

    const handlePermanentDelete = (id) => {
        if (window.confirm('Permanently delete this trainer? This cannot be undone.')) {
            deleteTrainer(id);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Summary Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(132, 204, 22, 0.1)', borderRadius: '12px' }}>
                        <Users size={24} color="var(--primary)" />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>Total Trainers</p>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{trainers.filter(t => t.status !== 'Deleted').length}</h3>
                    </div>
                </div>
                <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px' }}>
                        <TrendingUp size={24} color="#22c55e" />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>Active Memberships</p>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{members.filter(m => m.status === 'active' && m.trainerId).length}</h3>
                    </div>
                </div>
                <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(234, 179, 8, 0.1)', borderRadius: '12px' }}>
                        <DollarSign size={24} color="#eab308" />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>Trainer Revenue</p>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>₹{payments.filter(p => members.find(m => m.id === p.memberId && m.trainerId)).reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0).toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            {/* Actions & Filters */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} size={18} />
                    <input
                        className="input-field"
                        style={{ paddingLeft: '2.5rem' }}
                        placeholder="Search trainers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        className={`btn-outline ${showDeleted ? 'active' : ''}`}
                        onClick={() => setShowDeleted(!showDeleted)}
                        style={{ borderColor: showDeleted ? 'var(--primary)' : 'var(--border)' }}
                    >
                        {showDeleted ? 'Show Active' : 'Show Deleted'}
                    </button>
                    <button className="btn-primary" onClick={() => handleOpenModal()}>
                        <Plus size={20} />
                        Add Trainer
                    </button>
                </div>
            </div>

            {/* Trainer Cards List */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {filteredTrainers.map(trainer => {
                    const stats = getTrainerStats(trainer.id);
                    return (
                        <motion.div
                            key={trainer.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="premium-card"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                borderTop: `4px solid ${trainer.status === 'Active' ? 'var(--primary)' : trainer.status === 'Deleted' ? '#ef4444' : '#64748b'}`
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <User size={28} color="var(--primary)" />
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{trainer.name}</h4>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>{trainer.specialization || 'General Trainer'}</p>
                                    </div>
                                </div>
                                <div className={`badge ${trainer.status === 'Active' ? 'badge-primary' : ''}`} style={{ backgroundColor: trainer.status === 'Deleted' ? '#ef4444' : trainer.status === 'Inactive' ? '#64748b' : '' }}>
                                    {trainer.status}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                                    <Phone size={14} /> {trainer.phoneNumber || 'N/A'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                                    <Mail size={14} /> {trainer.email || 'N/A'}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                                    <Award size={14} /> {trainer.id}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                                    <Calendar size={14} /> {trainer.joiningDate}
                                </div>
                            </div>

                            <hr style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '0.5rem 0' }} />

                            {/* Mini Monitoring Dashboard */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>Active Members</p>
                                    <p style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--primary)' }}>{stats.activeMembers} <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', fontWeight: '400' }}>/ {stats.totalMembers}</span></p>
                                </div>
                                <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', padding: '0.75rem', borderRadius: '8px', textAlign: 'center' }}>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>Total Revenue</p>
                                    <p style={{ fontSize: '1.25rem', fontWeight: '800' }}>₹{stats.totalRevenue.toLocaleString()}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                                <span>Expired: <span style={{ color: '#ef4444' }}>{stats.expiredMembers}</span></span>
                                <span>Renewals: {stats.renewals}</span>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                <button className="btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleOpenModal(trainer)}>
                                    <Edit size={16} /> Edit
                                </button>
                                {trainer.status !== 'Deleted' ? (
                                    <>
                                        <button
                                            className="btn-outline"
                                            style={{ padding: '0.75rem' }}
                                            title={trainer.status === 'Active' ? 'Deactivate' : 'Activate'}
                                            onClick={() => handleToggleStatus(trainer)}
                                        >
                                            {trainer.status === 'Active' ? <XCircle size={18} color="#f97316" /> : <CheckCircle size={18} color="var(--primary)" />}
                                        </button>
                                        <button className="btn-outline" style={{ padding: '0.75rem' }} title="Soft Delete" onClick={() => handleSoftDelete(trainer)}>
                                            <Trash size={18} color="#ef4444" />
                                        </button>
                                    </>
                                ) : (
                                    <button className="btn-outline" style={{ padding: '0.75rem' }} title="Permanent Delete" onClick={() => handlePermanentDelete(trainer.id)}>
                                        <Trash2 size={18} color="#ef4444" />
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="premium-card"
                            style={{ width: '100%', maxWidth: '500px', maxHeight: '95vh', overflowY: 'auto' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{editingTrainer ? 'Edit Trainer' : 'Add New Trainer'}</h3>
                                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer' }}><XCircle size={24} /></button>
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Name</label>
                                    <input
                                        className="input-field"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Enter full name"
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Phone Number</label>
                                        <input
                                            className="input-field"
                                            required
                                            value={formData.phoneNumber}
                                            onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                            placeholder="+91 00000 00000"
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Email ID</label>
                                        <input
                                            className="input-field"
                                            type="email"
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="trainer@oliva.com"
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Specialization</label>
                                    <input
                                        className="input-field"
                                        value={formData.specialization}
                                        onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                                        placeholder="e.g. Bodybuilding, Yoga, CrossFit"
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Joining Date</label>
                                        <input
                                            type="date"
                                            className="input-field"
                                            value={formData.joiningDate}
                                            onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Commission % (Optional)</label>
                                        <input
                                            type="number"
                                            className="input-field"
                                            value={formData.commissionPercentage}
                                            onChange={e => setFormData({ ...formData, commissionPercentage: e.target.value })}
                                            placeholder="0"
                                            min="0"
                                            max="100"
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Status</label>
                                    <select
                                        className="input-field"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                        {editingTrainer && <option value="Deleted">Deleted</option>}
                                    </select>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>{editingTrainer ? 'Update Trainer' : 'Save Trainer'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Trainers;
