import React, { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { Plus, Search, Utensils, Edit, Trash2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MasterDiet = () => {
    const { members, dietPlans, saveDietPlan, deleteDietPlan } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [planData, setPlanData] = useState({
        name: '',
        goal: 'Weight Loss',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        meals: { breakfast: '', lunch: '', snack: '', dinner: '' }
    });

    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSave = () => {
        if (!selectedMember || !planData.name) return;
        saveDietPlan(selectedMember.id, planData);
        setIsModalOpen(false);
        setPlanData({
            name: '',
            goal: 'Weight Loss',
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            meals: { breakfast: '', lunch: '', snack: '', dinner: '' }
        });
        alert(`Diet plan assigned to ${selectedMember.name}`);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            </div>

            <div className="premium-card" style={{ padding: '0', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>Member</th>
                            <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>Active Diet Plan</th>
                            <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>Goal</th>
                            <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.map(member => {
                            const latestPlan = (dietPlans[member.id] || []).slice(-1)[0];
                            return (
                                <tr key={member.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <p style={{ fontWeight: '600' }}>{member.name}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{member.id}</p>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        {latestPlan ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Utensils size={14} color="var(--primary)" />
                                                {latestPlan.name}
                                            </div>
                                        ) : (
                                            <span style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>No plan assigned</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>
                                        {latestPlan?.goal || '-'}
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            {latestPlan ? (
                                                <>
                                                    <button
                                                        title="Edit Active Plan"
                                                        onClick={() => {
                                                            setSelectedMember(member);
                                                            setPlanData(latestPlan);
                                                            setIsModalOpen(true);
                                                        }}
                                                        style={{ color: 'var(--primary)' }}
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        title="Delete Plan"
                                                        onClick={() => {
                                                            if (window.confirm('Delete this diet plan?')) {
                                                                deleteDietPlan(member.id, latestPlan.id);
                                                            }
                                                        }}
                                                        style={{ color: '#ef4444' }}
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    className="btn-primary"
                                                    style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                                                    onClick={() => {
                                                        setSelectedMember(member);
                                                        setPlanData({
                                                            name: '',
                                                            goal: 'Weight Loss',
                                                            startDate: new Date().toISOString().split('T')[0],
                                                            endDate: '',
                                                            meals: { breakfast: '', lunch: '', snack: '', dinner: '' }
                                                        });
                                                        setIsModalOpen(true);
                                                    }}
                                                >
                                                    <Plus size={14} /> Assign Plan
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="premium-card" style={{ width: '100%', maxWidth: '500px' }}>
                            <h3 style={{ marginBottom: '1.5rem' }}>Assign Diet Plan to {selectedMember?.name}</h3>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Plan Name</label>
                                    <input className="input-field" value={planData.name} onChange={e => setPlanData({ ...planData, name: e.target.value })} placeholder="e.g. Muscle Gain Plan V1" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Goal</label>
                                        <select className="input-field" value={planData.goal} onChange={e => setPlanData({ ...planData, goal: e.target.value })}>
                                            <option>Weight Loss</option>
                                            <option>Muscle Gain</option>
                                            <option>Maintenance</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Start Date</label>
                                        <input type="date" className="input-field" value={planData.startDate} onChange={e => setPlanData({ ...planData, startDate: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>End Date</label>
                                        <input type="date" className="input-field" value={planData.endDate} onChange={e => setPlanData({ ...planData, endDate: e.target.value })} />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem' }}>Breakfast</label>
                                        <textarea className="input-field" style={{ minHeight: '60px', fontSize: '0.875rem' }} value={planData.meals.breakfast} onChange={e => setPlanData({ ...planData, meals: { ...planData.meals, breakfast: e.target.value } })} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem' }}>Lunch</label>
                                        <textarea className="input-field" style={{ minHeight: '60px', fontSize: '0.875rem' }} value={planData.meals.lunch} onChange={e => setPlanData({ ...planData, meals: { ...planData.meals, lunch: e.target.value } })} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem' }}>Snack</label>
                                        <textarea className="input-field" style={{ minHeight: '60px', fontSize: '0.875rem' }} value={planData.meals.snack} onChange={e => setPlanData({ ...planData, meals: { ...planData.meals, snack: e.target.value } })} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.75rem' }}>Dinner</label>
                                        <textarea className="input-field" style={{ minHeight: '60px', fontSize: '0.875rem' }} value={planData.meals.dinner} onChange={e => setPlanData({ ...planData, meals: { ...planData.meals, dinner: e.target.value } })} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button className="btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button className="btn-primary" style={{ flex: 1 }} onClick={handleSave}>Assign Plan</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MasterDiet;
