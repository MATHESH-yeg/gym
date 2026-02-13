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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Member Management</h1>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative', width: '300px' }}>
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
                        <Plus size={20} />
                        Add Member
                    </button>
                </div>
            </div>

            {/* MEMBERS TAB CONTENT */}


            <div className="premium-card" style={{ padding: '0', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                    <thead style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--muted-foreground)' }}>Member Name</th>
                            <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--muted-foreground)' }}>Status</th>
                            <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--muted-foreground)' }}>Program</th>
                            <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--muted-foreground)' }}>Streak</th>
                            <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', fontWeight: '600', color: 'var(--muted-foreground)', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.map((member) => (
                            <tr key={member.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600' }}>
                                            {member.name[0]}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: '600' }}>{member.name}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>ID: {member.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div className={`badge ${member.status?.toLowerCase() === 'active' ? 'badge-primary' : ''}`} style={{ backgroundColor: member.status?.toLowerCase() === 'expired' ? '#ef4444' : '' }}>
                                        {member.status || 'Active'}
                                    </div>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>
                                    {member.assignedProgram?.name || 'None'}
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--primary)', fontWeight: '600' }}>
                                        <Flame size={14} /> {member.streak || 0}
                                    </div>
                                </td>
                                <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                        <button onClick={() => navigate(`/master/members/${member.id}`)} style={{ color: 'var(--primary)' }} title="Monitor Progress"><Eye size={18} /></button>
                                        <button onClick={() => { setSelectedMember(member); setInitialId(member.id); setIsEditModalOpen(true); }} style={{ color: 'var(--muted-foreground)' }} title="Edit Profile"><Edit size={18} /></button>
                                        <button onClick={() => { setSelectedMember(member); setIsAssignModalOpen(true); }} style={{ color: 'var(--muted-foreground)' }} title="Assign Workout"><Dumbbell size={18} /></button>
                                        <button onClick={() => handleDeleteMember(member.id)} style={{ color: '#ef4444' }} title="Delete Member"><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredMembers.length === 0 && (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                        No members found.
                    </div>
                )}
            </div>




            {/* MEMBER ADD/EDIT MODAL */}
            <AnimatePresence>
                {(isAddModalOpen || isEditModalOpen) && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="premium-card" style={{ width: '400px', backgroundColor: 'var(--surface)' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>{isEditModalOpen ? 'Edit Member' : 'Add New Member'}</h3>
                            <form onSubmit={isEditModalOpen ? handleUpdateMember : handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Full Name</label>
                                    <input
                                        className="input-field"
                                        value={isEditModalOpen ? selectedMember?.name : newMember.name}
                                        onChange={(e) => isEditModalOpen ? setSelectedMember({ ...selectedMember, name: e.target.value }) : setNewMember({ ...newMember, name: e.target.value })}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Member ID</label>
                                    <input
                                        className="input-field"
                                        value={isEditModalOpen ? selectedMember?.id : newMember.id}
                                        onChange={(e) => isEditModalOpen ? setSelectedMember({ ...selectedMember, id: e.target.value }) : setNewMember({ ...newMember, id: e.target.value })}
                                        placeholder="Leave empty to auto-generate"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Experience / Level</label>
                                    <input
                                        className="input-field"
                                        value={isEditModalOpen ? (selectedMember?.experience || '') : newMember.experience}
                                        onChange={(e) => isEditModalOpen ? setSelectedMember({ ...selectedMember, experience: e.target.value }) : setNewMember({ ...newMember, experience: e.target.value })}
                                        placeholder="e.g. Intermediate, 2 Years"
                                    />
                                </div>
                                {isEditModalOpen && (
                                    <>
                                        <hr style={{ borderColor: 'var(--border)', margin: '0.5rem 0' }} />
                                        <h4 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>Subscription Details</h4>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Current Plan</label>
                                            <input
                                                className="input-field"
                                                value={selectedMember?.plan || ''}
                                                onChange={(e) => setSelectedMember({ ...selectedMember, plan: e.target.value })}
                                                placeholder="e.g. 1 Month Gold"
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
                                    </>
                                )}
                                {isEditModalOpen && (
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Status</label>
                                        <select
                                            className="input-field"
                                            value={selectedMember?.status}
                                            onChange={(e) => setSelectedMember({ ...selectedMember, status: e.target.value })}
                                        >
                                            <option value="active">Active</option>
                                            <option value="expired">Expired</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}>Cancel</button>
                                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>{isEditModalOpen ? 'Update' : 'Add'}</button>
                                </div>
                            </form >
                        </motion.div >
                    </div >
                )}
            </AnimatePresence>



            {/* ASSIGN WORKOUT MODAL (For Members) */}
            {selectedMember && isAssignModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="premium-card" style={{ width: '450px', maxHeight: '80vh', overflowY: 'auto' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Assign Workout to {selectedMember.name}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Select a global program to assign to this member.</p>
                            {programs.length === 0 ? (
                                <p style={{ textAlign: 'center', padding: '1rem', border: '1px dashed var(--border)', borderRadius: '8px' }}>No programs created yet.</p>
                            ) : (
                                programs.map(p => (
                                    <button
                                        key={p.id}
                                        className="btn-outline"
                                        style={{ justifyContent: 'space-between', padding: '1rem' }}
                                        onClick={() => {
                                            assignWorkout(selectedMember.id, p);
                                            setIsAssignModalOpen(false);
                                            setSelectedMember(null);
                                            alert('Workout assigned!');
                                        }}
                                    >
                                        <div style={{ textAlign: 'left' }}>
                                            <p style={{ fontWeight: '600' }}>{p.name}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{p.exercises?.length || 0} Exercises</p>
                                        </div>
                                        <Plus size={16} />
                                    </button>
                                ))
                            )}
                            <button className="btn-outline" style={{ marginTop: '1rem' }} onClick={() => setIsAssignModalOpen(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default Members;
