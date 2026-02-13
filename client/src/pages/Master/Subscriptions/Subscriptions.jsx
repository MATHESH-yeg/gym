import React, { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle, Edit, Plus, Trash2, Save, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Subscriptions = () => {
    const { membershipPlans, saveMembershipPlan, deleteMembershipPlan } = useData();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    // Initial state for new plan form
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        durationMonths: 1,
        features: '',
        color: 'blue'
    });

    const handleEdit = (plan) => {
        setFormData({
            ...plan,
            features: Array.isArray(plan.features) ? plan.features.join('\n') : plan.features
        });
        setSelectedPlan(plan);
        setIsEditing(true);
    };

    const handleCreate = () => {
        setFormData({
            name: '',
            price: '',
            durationMonths: 1,
            features: '',
            color: 'blue'
        });
        setSelectedPlan(null);
        setIsEditing(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        const featuresArray = formData.features.split('\n').filter(f => f.trim() !== '');

        const planToSave = {
            ...formData,
            id: selectedPlan ? selectedPlan.id : undefined,
            price: Number(formData.price),
            durationMonths: Number(formData.durationMonths),
            features: featuresArray
        };

        saveMembershipPlan(planToSave);
        setIsEditing(false);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this plan?')) {
            deleteMembershipPlan(id);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Membership Plans</h1>
                    <p style={{ color: 'var(--muted-foreground)' }}>Configure the subscription packages offered to your members.</p>
                </div>
                <button className="btn-primary" onClick={handleCreate}>
                    <Plus size={20} /> Create New Plan
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {membershipPlans.map(plan => (
                    <div key={plan.id} className="premium-card" style={{
                        position: 'relative',
                        borderTop: `4px solid ${plan.color || 'var(--primary)'}`,
                        display: 'flex', flexDirection: 'column', gap: '1rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{plan.name}</h3>
                                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>{plan.durationMonths} Month{plan.durationMonths > 1 ? 's' : ''} Access</p>
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>₹{plan.price}</h2>
                        </div>

                        <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0', flex: 1 }}>
                            {plan.features.map((feature, idx) => (
                                <li key={idx} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                    <CheckCircle size={16} color="var(--primary)" style={{ flexShrink: 0 }} />
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button
                                className="btn-outline"
                                style={{ flex: 1, justifyContent: 'center' }}
                                onClick={() => handleEdit(plan)}
                            >
                                <Edit size={16} /> Edit Details
                            </button>
                            <button
                                className="btn-outline"
                                style={{ padding: '0.75rem', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                                onClick={() => handleDelete(plan.id)}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>

                        {/* Tag */}
                        {plan.isPopular && (
                            <div style={{
                                position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                                backgroundColor: 'var(--primary)', color: 'black', fontWeight: 'bold',
                                fontSize: '0.7rem', padding: '0.25rem 0.75rem', borderRadius: '100px',
                                textTransform: 'uppercase', letterSpacing: '0.05em'
                            }}>
                                Popular
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditing && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="premium-card"
                            style={{ width: '500px', maxHeight: '90vh', overflowY: 'auto' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                <h2>{selectedPlan ? 'Edit Plan' : 'Create Plan'}</h2>
                                <button onClick={() => setIsEditing(false)} style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer' }}><X size={24} /></button>
                            </div>

                            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                <div>
                                    <label className="input-label">Plan Name</label>
                                    <input className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g. 1 Month Gold" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label className="input-label">Price (₹)</label>
                                        <input type="number" className="input-field" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                                    </div>
                                    <div>
                                        <label className="input-label">Duration (Months)</label>
                                        <input type="number" className="input-field" value={formData.durationMonths} onChange={e => setFormData({ ...formData, durationMonths: e.target.value })} required />
                                    </div>
                                </div>
                                <div>
                                    <label className="input-label">Features (One per line)</label>
                                    <textarea
                                        className="input-field"
                                        style={{ height: '150px', resize: 'vertical' }}
                                        value={formData.features}
                                        onChange={e => setFormData({ ...formData, features: e.target.value })}
                                        placeholder="Gym Access&#10;Locker Facility&#10;Free WiFi"
                                        required
                                    />
                                </div>

                                {selectedPlan && (
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.isPopular}
                                                onChange={e => setFormData({ ...formData, isPopular: e.target.checked })}
                                            />
                                            Mark as Popular
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                            <input
                                                type="checkbox"
                                                checked={formData.isBestValue}
                                                onChange={e => setFormData({ ...formData, isBestValue: e.target.checked })}
                                            />
                                            Mark as Best Value
                                        </label>
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => setIsEditing(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save Plan</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Subscriptions;
