import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../../context/DataContext';
import { useAuth } from '../../../context/AuthContext';
import { ChevronLeft, Save, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const ManageSubscription = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { members, updateMember, addPayment } = useData();

    const member = members.find(m => m.id === id);

    const [formData, setFormData] = useState({
        plan: member?.plan || 'Standard Membership',
        expiryDate: member?.expiryDate ? new Date(member.expiryDate).toISOString().split('T')[0] : '',
        recordPayment: true,
        amount: 0,
        notes: 'Manual Subscription Update'
    });

    if (!member) return <div style={{ padding: '2rem' }}>Member not found</div>;

    const plans = [
        { name: '1 Month Membership', days: 30, price: 1000 },
        { name: '3 Months Membership', days: 90, price: 2500 },
        { name: '6 Months Membership', days: 180, price: 5000 },
        { name: '1 Year Membership', days: 365, price: 9000 },
        { name: 'Custom', days: 0, price: 0 }
    ];

    const handlePlanChange = (e) => {
        const selected = plans.find(p => p.name === e.target.value);
        if (selected && selected.name !== 'Custom') {
            const date = new Date();
            date.setDate(date.getDate() + selected.days);
            setFormData({
                ...formData,
                plan: selected.name,
                expiryDate: date.toISOString().split('T')[0],
                amount: selected.price
            });
        } else {
            setFormData({ ...formData, plan: e.target.value });
        }
    };

    const handleSave = (e) => {
        e.preventDefault();

        // 1. Update Member Profile
        updateMember(id, {
            plan: formData.plan,
            expiryDate: new Date(formData.expiryDate).toISOString(),
            status: new Date(formData.expiryDate) > new Date() ? 'active' : 'expired'
        });

        // 2. Record Payment (Optional)
        if (formData.recordPayment) {
            addPayment({
                memberId: id,
                memberName: member.name,
                planName: formData.plan,
                amount: formData.amount,
                paymentDate: new Date().toISOString(),
                validTill: new Date(formData.expiryDate).toISOString(),
                status: 'Completed',
                mode: 'Manual/Cash',
                notes: formData.notes
            });
        }

        alert('Subscription Updated Successfully');
        navigate(`/master/members/${id}`);
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
            <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer' }}>
                <ChevronLeft size={20} /> Back to Member
            </button>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="premium-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontWeight: 'bold' }}>
                        {member.name[0]}
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Manage Subscription</h2>
                        <p style={{ color: 'var(--muted-foreground)' }}>For {member.name} ({member.id})</p>
                    </div>
                </div>

                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Current Status Box */}
                    <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ color: 'var(--muted-foreground)' }}>Current Plan:</span>
                            <span style={{ fontWeight: 'bold' }}>{member.plan || 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--muted-foreground)' }}>Expires On:</span>
                            <span style={{ color: member.expiryDate && new Date(member.expiryDate) < new Date() ? '#ef4444' : 'var(--primary)' }}>
                                {member.expiryDate ? new Date(member.expiryDate).toLocaleDateString() : 'N/A'}
                            </span>
                        </div>
                    </div>

                    <div>
                        <label className="input-label">Select New Plan / Action</label>
                        <select className="input-field" value={plans.some(p => p.name === formData.plan) ? formData.plan : 'Custom'} onChange={handlePlanChange}>
                            {plans.map(p => <option key={p.name} value={p.name}>{p.name} {p.price > 0 && `(₹${p.price})`}</option>)}
                        </select>
                    </div>

                    {formData.plan === 'Custom' && (
                        <div>
                            <label className="input-label">Custom Plan Name</label>
                            <input className="input-field" value={formData.plan} onChange={e => setFormData({ ...formData, plan: e.target.value })} placeholder="e.g. Special Promo" />
                        </div>
                    )}

                    <div>
                        <label className="input-label">New Expiry Date</label>
                        <div className="input-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={18} color="var(--muted-foreground)" />
                            <input
                                type="date"
                                className="input-field"
                                value={formData.expiryDate}
                                onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ padding: '1.5rem', backgroundColor: 'rgba(132, 204, 22, 0.05)', borderRadius: '8px', border: '1px solid rgba(132, 204, 22, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <input
                                type="checkbox"
                                id="recordPayment"
                                checked={formData.recordPayment}
                                onChange={e => setFormData({ ...formData, recordPayment: e.target.checked })}
                                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                            />
                            <label htmlFor="recordPayment" style={{ fontSize: '1rem', cursor: 'pointer' }}>Record as new Payment Transaction</label>
                        </div>

                        {formData.recordPayment && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label className="input-label">Amount Paid (₹)</label>
                                    <input
                                        type="number"
                                        className="input-field"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="input-label">Notes (Optional)</label>
                                    <input
                                        className="input-field"
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        placeholder="e.g. Cash payment received"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </div>

                    <button type="submit" className="btn-primary" style={{ padding: '1rem' }}>
                        <Save size={20} />
                        Update Subscription
                    </button>

                </form>
            </motion.div>
        </div>
    );
};

export default ManageSubscription;
