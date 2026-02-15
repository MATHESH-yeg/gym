import React, { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { Plus, Search, Edit, Trash2, Eye, Dumbbell, Flame, User, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

const Members = () => {
    // Context Data
    const {
        members, programs, addMember, updateMember, changeMemberId, deleteMember, assignWorkout,
        trainers, saveTrainer, deleteTrainer
    } = useData();

    const navigate = useNavigate();
    const location = useLocation();

    // UI State
    const [activeTab, setActiveTab] = useState('members');
    const [searchTerm, setSearchTerm] = useState(location.state?.search || '');
    // Member Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState(null);
    const [initialId, setInitialId] = useState('');
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [newMember, setNewMember] = useState({ name: '', id: '', experience: '', status: 'active' });

    React.useEffect(() => {
        if (location.state?.search) {
            setSearchTerm(location.state.search);
        }
    }, [location.state]);

    // --- MEMBER HANDLERS ---
    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddMember = (e) => {
        e.preventDefault();

        const memberData = { ...newMember };

        if (!memberData.id) {
            let count = members.length + 1;
            let potentialId = `OLIVA-${count.toString().padStart(3, '0')}`;
            while (members.some(m => m.id === potentialId)) {
                count++;
                potentialId = `OLIVA-${count.toString().padStart(3, '0')}`;
            }
            memberData.id = potentialId;
        }

        if (memberData.name && memberData.id) {
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

            {/* Header */}
            <div style={{
                display: 'flex',
                flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: window.innerWidth < 768 ? 'stretch' : 'center',
                gap: '1.5rem'
            }}>
                <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 1.75rem)', fontWeight: '800' }}>Member Management</h1>
                <div style={{
                    display: 'flex',
                    flexDirection: window.innerWidth < 425 ? 'column' : 'row',
                    gap: '1rem',
                    flex: window.innerWidth < 1024 ? 1 : 'none'
                }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: window.innerWidth < 425 ? '100%' : '240px' }}>
                        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} size={18} />
                        <input
                            className="input-field"
                            style={{ paddingLeft: '2.5rem' }}
                            placeholder="Search members..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="btn-primary" onClick={() => setIsAddModalOpen(true)} style={{ width: window.innerWidth < 425 ? '100%' : 'auto' }}>
                        <Plus size={20} />
                        Add Member
                    </button>
                </div>
            </div>

            {/* MEMBERS TAB CONTENT */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Member Name</th>
                            <th>Status</th>
                            <th>Program</th>
                            <th>Streak</th>
                            <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.map((member) => (
                            <tr key={member.id}>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', backgroundColor: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', flexShrink: 0, color: 'var(--primary)' }}>
                                            {member.name[0]}
                                        </div>
                                        <div style={{ minWidth: 0 }}>
                                            <p style={{ fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.name}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>ID: {member.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <div className={`badge ${member.status?.toLowerCase() === 'active' ? 'badge-primary' : ''}`}
                                        style={{
                                            backgroundColor: member.status?.toLowerCase() === 'expired' ? 'rgba(239, 68, 68, 0.1)' : '',
                                            color: member.status?.toLowerCase() === 'expired' ? '#ef4444' : '',
                                            border: member.status?.toLowerCase() === 'expired' ? '1px solid rgba(239, 68, 68, 0.2)' : ''
                                        }}>
                                        {member.status || 'Active'}
                                    </div>
                                </td>
                                <td style={{ fontSize: '0.875rem' }}>
                                    {member.assignedProgram?.name || <span className="text-muted">No Plan</span>}
                                </td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', fontWeight: '700' }}>
                                        <Flame size={14} /> {member.streak || 0}
                                    </div>
                                </td>
                                <td>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                        <button onClick={() => navigate(`/master/members/${member.id}`)} style={{ color: 'var(--primary)' }} title="Monitor Progress"><Eye size={18} /></button>
                                        <button onClick={() => { setSelectedMember(member); setInitialId(member.id); setIsEditModalOpen(true); }} style={{ color: 'var(--muted-foreground)' }} title="Edit Profile"><Edit size={18} /></button>
                                        <button onClick={() => { setSelectedMember(member); setIsAssignModalOpen(true); }} style={{ color: 'var(--muted-foreground)' }} title="Assign Workout"><Dumbbell size={18} /></button>
                                        <button onClick={() => handleDeleteMember(member.id)} style={{ color: 'var(--destructive)' }} title="Delete Member"><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredMembers.length === 0 && (
                    <div className="empty-state">
                        <User size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                        <p>No members found matching your search.</p>
                    </div>
                )}
            </div>

            {/* MEMBER ADD/EDIT MODAL */}
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
                                    <>
                                        <div style={{ margin: '0.5rem 0', height: '1px', backgroundColor: 'var(--border)' }} />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                            <CreditCard size={16} color="var(--primary)" />
                                            <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subscription</span>
                                        </div>
                                        <div className="responsive-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Current Plan</label>
                                                <input
                                                    className="input-field"
                                                    value={selectedMember?.plan || ''}
                                                    onChange={(e) => setSelectedMember({ ...selectedMember, plan: e.target.value })}
                                                    placeholder="Gold"
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Expiry Date</label>
                                                <input
                                                    type="date"
                                                    className="input-field"
                                                    value={selectedMember?.expiryDate ? new Date(selectedMember.expiryDate).toISOString().split('T')[0] : ''}
                                                    onChange={(e) => setSelectedMember({ ...selectedMember, expiryDate: new Date(e.target.value).toISOString() })}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
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

            {/* ASSIGN WORKOUT MODAL */}
            <AnimatePresence>
                {selectedMember && isAssignModalOpen && (
                    <div className="sidebar-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="premium-card"
                            style={{
                                width: '100%',
                                maxWidth: '500px',
                                maxHeight: '80vh',
                                overflowY: 'auto'
                            }}
                        >
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.25rem' }}>Assign Workout</h3>
                                <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Target: <span style={{ color: 'var(--primary)', fontWeight: '600' }}>{selectedMember.name}</span></p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {programs.length === 0 ? (
                                    <div className="empty-state" style={{ padding: '2rem' }}>
                                        <Dumbbell size={32} style={{ marginBottom: '1rem', opacity: 0.2 }} />
                                        <p>No programs available.</p>
                                    </div>
                                ) : (
                                    programs.map(p => (
                                        <button
                                            key={p.id}
                                            className="btn-outline"
                                            style={{ justifyContent: 'space-between', padding: '1rem', textAlign: 'left', minHeight: 'auto' }}
                                            onClick={() => {
                                                assignWorkout(selectedMember.id, p);
                                                setIsAssignModalOpen(false);
                                                setSelectedMember(null);
                                            }}
                                        >
                                            <div>
                                                <p style={{ fontWeight: '700', fontSize: '1rem' }}>{p.name}</p>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{p.exercises?.length || 0} exercises • {p.duration || '4 weeks'}</p>
                                            </div>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(132, 204, 22, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                                <Plus size={18} />
                                            </div>
                                        </button>
                                    ))
                                )}
                                <button className="btn-outline" style={{ marginTop: '1rem' }} onClick={() => setIsAssignModalOpen(false)}>Maybe Later</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Members;
