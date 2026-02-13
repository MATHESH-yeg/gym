import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { Plus, Coffee, Sun, Soup, Moon, Info, Trash2, Edit2, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const DietPlan = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { dietPlans, saveDietPlan, deleteDietPlan } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [viewingPlan, setViewingPlan] = useState(null);

    const userPlans = dietPlans[user.id] || [];

    // Separate master-assigned and personal plans
    const masterAssignedPlans = userPlans.filter(p => p.createdBy === 'MASTER');
    const personalPlans = userPlans.filter(p => !p.createdBy || p.createdBy === user.id);

    const handleSavePlan = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const planData = {
            id: editingPlan?.id || 'DP' + Date.now(),
            name: formData.get('name'),
            goal: formData.get('goal'),
            date: formData.get('date'),
            createdBy: editingPlan?.createdBy || user.id,
            meals: {
                breakfast: formData.get('breakfast'),
                lunch: formData.get('lunch'),
                snack: formData.get('snack'),
                dinner: formData.get('dinner')
            }
        };

        saveDietPlan(user.id, planData);
        setIsModalOpen(false);
        setEditingPlan(null);
    };

    const handleEdit = (plan) => {
        // Only allow editing personal plans or if user is master
        if (plan.createdBy !== 'MASTER' || user.role === 'MASTER') {
            setEditingPlan(plan);
            setIsModalOpen(true);
        }
    };

    const handleDelete = (plan) => {
        // Only allow deleting personal plans
        if (plan.createdBy !== 'MASTER') {
            if (window.confirm('Delete this plan?')) {
                deleteDietPlan(user.id, plan.id);
            }
        }
    };

    const renderPlanCard = (plan, isMasterAssigned = false) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            key={plan.id}
            className="premium-card"
            style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                border: isMasterAssigned ? '2px solid #BEFF00' : '1px solid var(--border)',
                background: isMasterAssigned ? 'linear-gradient(145deg, rgba(190, 255, 0, 0.05), var(--surface))' : undefined
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                    {isMasterAssigned && (
                        <span style={{ fontSize: '0.65rem', color: '#BEFF00', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '0.25rem', marginBottom: '0.5rem' }}>
                            <Award size={12} /> TRAINER ASSIGNED
                        </span>
                    )}
                    <h3 style={{ fontSize: '1.25rem', color: isMasterAssigned ? '#BEFF00' : 'var(--primary)' }}>{plan.name}</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{plan.goal} • {plan.date}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className="btn-outline"
                        style={{ padding: '0.4rem', borderColor: 'rgba(255,255,255,0.1)' }}
                        onClick={() => setViewingPlan(plan)}
                        title="View Details"
                    >
                        <Info size={16} />
                    </button>
                    {!isMasterAssigned && (
                        <>
                            <button
                                className="btn-outline"
                                style={{ padding: '0.4rem', borderColor: 'rgba(255,255,255,0.1)' }}
                                onClick={() => handleEdit(plan)}
                                title="Edit Plan"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button
                                className="btn-outline"
                                style={{ padding: '0.4rem', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                                onClick={() => handleDelete(plan)}
                                title="Delete Plan"
                            >
                                <Trash2 size={16} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            <hr style={{ border: '0', borderTop: '1px solid var(--border)' }} />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="glass-card" style={{ padding: '0.75rem' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Breakfast</p>
                    <p style={{ fontSize: '0.875rem' }}>{plan.meals.breakfast}</p>
                </div>
                <div className="glass-card" style={{ padding: '0.75rem' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Lunch</p>
                    <p style={{ fontSize: '0.875rem' }}>{plan.meals.lunch}</p>
                </div>
                <div className="glass-card" style={{ padding: '0.75rem' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Snack</p>
                    <p style={{ fontSize: '0.875rem' }}>{plan.meals.snack}</p>
                </div>
                <div className="glass-card" style={{ padding: '0.75rem' }}>
                    <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>Dinner</p>
                    <p style={{ fontSize: '0.875rem' }}>{plan.meals.dinner}</p>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '900' }}>DIET PLANS</h2>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>View trainer-assigned and manage your personal nutrition plans</p>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => { setEditingPlan(null); setIsModalOpen(true); }}
                    style={{ backgroundColor: '#BEFF00', color: 'black', fontWeight: '900' }}
                >
                    <Plus size={20} /> Create Personal Plan
                </button>
            </div>

            {/* Master-Assigned Section */}
            {masterAssignedPlans.length > 0 && (
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1rem', color: '#BEFF00' }}>TRAINER ASSIGNED PLANS</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {masterAssignedPlans.map(plan => renderPlanCard(plan, true))}
                    </div>
                </div>
            )}

            {/* Personal Plans Section */}
            <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '1rem' }}>MY PERSONAL PLANS</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {personalPlans.length === 0 ? (
                        <div className="premium-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem 2rem' }}>
                            <Soup size={48} color="var(--muted-foreground)" style={{ marginBottom: '1rem', margin: '0 auto' }} />
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Personal Plans Found</h3>
                            <p style={{ color: 'var(--muted-foreground)' }}>Create your own custom diet plan to get started.</p>
                        </div>
                    ) : (
                        personalPlans.map(plan => renderPlanCard(plan, false))
                    )}
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                    <div className="premium-card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '900' }}>
                            {editingPlan ? 'EDIT DIET PLAN' : 'CREATE DIET PLAN'}
                        </h3>
                        <form onSubmit={handleSavePlan} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: '700' }}>Plan Name</label>
                                    <input
                                        name="name"
                                        className="input-field"
                                        placeholder="e.g. My Summer Cut"
                                        defaultValue={editingPlan?.name}
                                        required
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: '700' }}>Goal</label>
                                    <select name="goal" className="input-field" defaultValue={editingPlan?.goal || 'Weight Loss'}>
                                        <option>Weight Loss</option>
                                        <option>Muscle Gain</option>
                                        <option>Maintenance</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem', fontWeight: '700' }}>Start Date</label>
                                <input
                                    name="date"
                                    type="date"
                                    className="input-field"
                                    defaultValue={editingPlan?.date || new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>

                            <hr style={{ border: '0', borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Coffee size={18} color="var(--primary)" />
                                    <input
                                        name="breakfast"
                                        className="input-field"
                                        placeholder="Breakfast details"
                                        defaultValue={editingPlan?.meals.breakfast}
                                        required
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Sun size={18} color="var(--primary)" />
                                    <input
                                        name="lunch"
                                        className="input-field"
                                        placeholder="Lunch details"
                                        defaultValue={editingPlan?.meals.lunch}
                                        required
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Soup size={18} color="var(--primary)" />
                                    <input
                                        name="snack"
                                        className="input-field"
                                        placeholder="Snack details"
                                        defaultValue={editingPlan?.meals.snack}
                                        required
                                    />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Moon size={18} color="var(--primary)" />
                                    <input
                                        name="dinner"
                                        className="input-field"
                                        placeholder="Dinner details"
                                        defaultValue={editingPlan?.meals.dinner}
                                        required
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button
                                    type="button"
                                    className="btn-outline"
                                    style={{ flex: 1 }}
                                    onClick={() => { setIsModalOpen(false); setEditingPlan(null); }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    style={{ flex: 1, backgroundColor: '#BEFF00', color: 'black', fontWeight: '900' }}
                                >
                                    {editingPlan ? 'Save Changes' : 'Create Plan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {viewingPlan && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                    <div className="premium-card" style={{ width: '100%', maxWidth: '400px' }}>
                        <h3 style={{ marginBottom: '0.5rem' }}>{viewingPlan.name}</h3>
                        <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>{viewingPlan.goal} • {viewingPlan.date}</p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div className="glass-card" style={{ padding: '1rem' }}>
                                <h4 style={{ fontSize: '0.8125rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>Breakfast</h4>
                                <p style={{ fontSize: '0.875rem' }}>{viewingPlan.meals.breakfast}</p>
                            </div>
                            <div className="glass-card" style={{ padding: '1rem' }}>
                                <h4 style={{ fontSize: '0.8125rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>Lunch</h4>
                                <p style={{ fontSize: '0.875rem' }}>{viewingPlan.meals.lunch}</p>
                            </div>
                            <div className="glass-card" style={{ padding: '1rem' }}>
                                <h4 style={{ fontSize: '0.8125rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>Snack</h4>
                                <p style={{ fontSize: '0.875rem' }}>{viewingPlan.meals.snack}</p>
                            </div>
                            <div className="glass-card" style={{ padding: '1rem' }}>
                                <h4 style={{ fontSize: '0.8125rem', color: 'var(--primary)', marginBottom: '0.25rem' }}>Dinner</h4>
                                <p style={{ fontSize: '0.875rem' }}>{viewingPlan.meals.dinner}</p>
                            </div>
                        </div>

                        <button className="btn-primary" style={{ width: '100%', marginTop: '1.5rem', backgroundColor: '#BEFF00', color: 'black', fontWeight: '900' }} onClick={() => setViewingPlan(null)}>Done</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DietPlan;
