import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { Users, Search, MoreHorizontal, MessageSquare, Clipboard, Plus, User, CheckCircle, Edit, Trash2, Eye, Flame, Dumbbell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const TrainerMembers = () => {
    const { user } = useAuth();
    const { members, addMember, updateMember, deleteMember, changeMemberId } = useData();
    const navigate = useNavigate();

    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [initialId, setInitialId] = useState('');
    const [newMember, setNewMember] = useState({ name: '', id: '', experience: '', status: 'active' });

    const assignedMembers = members.filter(m => m.trainerId === user.id);
    const filteredMembers = assignedMembers.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddMember = (e) => {
        e.preventDefault();
        const memberData = { ...newMember, trainerId: user.id };

        if (memberData.name) {
            addMember(memberData);
            setNewMember({ name: '', id: '', experience: '', status: 'active' });
            setIsAddModalOpen(false);
        }
    };

    const handleUpdateMember = (e) => {
        e.preventDefault();
        if (selectedMember && selectedMember.name) {
            if (selectedMember.id !== initialId) {
                if (changeMemberId(initialId, selectedMember.id, selectedMember)) {
                    setIsEditModalOpen(false);
                    setSelectedMember(null);
                }
            } else {
                updateMember(selectedMember.id, selectedMember);
                setIsEditModalOpen(false);
                setSelectedMember(null);
            }
        }
    };

    const handleDeleteMember = (id) => {
        if (window.confirm('Are you sure you want to delete this member? All data will be lost.')) {
            deleteMember(id);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '900' }}>Manage Members</h1>
                    <p style={{ color: 'var(--muted-foreground)' }}>Monitor and guide your assigned gym members</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem', flexGrow: 1, justifyContent: 'flex-end', minWidth: '300px' }}>
                    <div style={{ position: 'relative', flexGrow: 1, maxWidth: '400px' }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} size={18} />
                        <input
                            className="input-field"
                            style={{ paddingLeft: '2.5rem' }}
                            placeholder="Search members..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn-primary" onClick={() => setIsAddModalOpen(true)}>
                        <Plus size={20} /> Add Member
                    </button>
                </div>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Member</th>
                            <th>Status</th>
                            <th>Progression</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>No members found.</td>
                            </tr>
                        ) : (
                            filteredMembers.map(m => (
                                <tr key={m.id}>
                                    <td style={{ padding: '1.25rem 1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'var(--primary)' }}>
                                                {m.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p style={{ fontWeight: '600', margin: 0 }}>{m.name}</p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', margin: 0 }}>ID: {m.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${m.status === 'active' ? 'badge-primary' : ''}`} style={{ textTransform: 'capitalize' }}>
                                            {m.status || 'Active'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', color: 'var(--primary)' }}>
                                            <Flame size={16} /> {m.progress || '0'}%
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                            <button onClick={() => navigate(`/trainer/members/${m.id}`)} style={{ color: 'var(--primary)' }} title="View Profile"><Eye size={18} /></button>
                                            <button onClick={() => { setSelectedMember(m); setInitialId(m.id); setIsEditModalOpen(true); }} style={{ color: 'var(--muted-foreground)' }} title="Edit Profile"><Edit size={18} /></button>
                                            <button onClick={() => navigate(`/trainer/members/${m.id}`, { state: { activeTab: 'workout' } })} style={{ color: 'var(--muted-foreground)' }} title="Assign Workout"><Dumbbell size={18} /></button>
                                            <button onClick={() => handleDeleteMember(m.id)} style={{ color: '#ef4444' }} title="Delete Member"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ADD/EDIT MODAL */}
            <AnimatePresence>
                {(isAddModalOpen || isEditModalOpen) && (
                    <div className="sidebar-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="premium-card"
                            style={{
                                width: '100%',
                                maxWidth: '450px',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                backgroundColor: 'var(--surface)'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.25rem' }}>{isEditModalOpen ? 'Edit Member' : 'Add New Member'}</h3>
                                <CheckCircle size={20} color="var(--primary)" />
                            </div>

                            <form onSubmit={isEditModalOpen ? handleUpdateMember : handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Full Name</label>
                                    <input
                                        className="input-field"
                                        value={isEditModalOpen ? selectedMember?.name : newMember.name}
                                        onChange={(e) => isEditModalOpen ? setSelectedMember({ ...selectedMember, name: e.target.value }) : setNewMember({ ...newMember, name: e.target.value })}
                                        placeholder="e.g. John Doe"
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Member ID</label>
                                    <input
                                        className="input-field"
                                        value={isEditModalOpen ? selectedMember?.id : newMember.id}
                                        onChange={(e) => isEditModalOpen ? setSelectedMember({ ...selectedMember, id: e.target.value }) : setNewMember({ ...newMember, id: e.target.value })}
                                        placeholder="Auto-generated if empty"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: '500' }}>Experience / Level</label>
                                    <input
                                        className="input-field"
                                        value={isEditModalOpen ? (selectedMember?.experience || '') : newMember.experience}
                                        onChange={(e) => isEditModalOpen ? setSelectedMember({ ...selectedMember, experience: e.target.value }) : setNewMember({ ...newMember, experience: e.target.value })}
                                        placeholder="e.g. Intermediate"
                                    />
                                </div>
                                {isEditModalOpen && (
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Status</label>
                                        <select
                                            className="input-field"
                                            value={selectedMember?.status}
                                            onChange={(e) => setSelectedMember({ ...selectedMember, status: e.target.value })}
                                            style={{ appearance: 'none' }}
                                        >
                                            <option value="active">Active</option>
                                            <option value="expired">Expired</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                                    <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}>Cancel</button>
                                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>{isEditModalOpen ? 'Save Changes' : 'Add Member'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TrainerMembers;

