import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { CreditCard, ShieldCheck, AlertCircle, CheckCircle2, ArrowRight, Download, Zap, Users, Calendar, Dumbbell } from 'lucide-react';
import { motion } from 'framer-motion';

const Membership = () => {
    const { user } = useAuth();
    const { members, payments, processMembershipPayment, membershipPlans } = useData();

    const memberData = members.find(m => m.id === user.id) || user;
    const isExpired = memberData.expiryDate ? new Date(memberData.expiryDate) < new Date() : true;
    const myPayments = payments.filter(p => p.memberId === user.id).sort((a, b) => new Date(b.date) - new Date(a.date));

    const plans = membershipPlans.map(p => ({
        ...p,
        description: `${p.durationMonths} Month${p.durationMonths > 1 ? 's' : ''} Access`,
        icon: p.name.toLowerCase().includes('year') ? Dumbbell : p.name.toLowerCase().includes('6 month') ? Users : p.name.toLowerCase().includes('3 month') ? Zap : Calendar,
        features: Array.isArray(p.features) ? p.features : [],
        popular: p.isPopular,
        badge: p.isBestValue ? 'Best Value' : undefined,
        color: p.color || '#BEFF00'
    }));

    const handlePayNow = (plan) => {
        if (window.confirm(`Proceed to pay ₹${plan.price} for the ${plan.name} plan?\n\nThis will extend your membership by ${plan.name}.`)) {
            processMembershipPayment(user.id, plan);
            alert('✅ Payment successful! Your membership has been updated.');
        }
    };

    const downloadInvoice = (payment) => {
        // Generate simple text invoice
        const invoiceText = `
OLIVA GYM - PAYMENT INVOICE
═══════════════════════════════════

Invoice ID: ${payment.id}
Date: ${new Date(payment.paymentDate).toLocaleDateString()}

MEMBER DETAILS:
Name: ${memberData.name}
Member ID: ${memberData.id}

PLAN DETAILS:
Plan: ${payment.planName}
Amount: ₹${payment.amount}
Valid From: ${new Date(payment.paymentDate).toLocaleDateString()}
Valid Till: ${new Date(payment.validTill).toLocaleDateString()}
Payment Mode: ${payment.mode}
Status: ${payment.status}

═══════════════════════════════════
Thank you for choosing OLIVA GYM!
        `.trim();

        // Create blob and download
        const blob = new Blob([invoiceText], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `OLIVA_Invoice_${payment.id}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    };

    const getDaysRemaining = () => {
        if (!memberData.expiryDate) return 0;
        const expiry = new Date(memberData.expiryDate);
        const now = new Date();
        const diff = expiry - now;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const daysRemaining = getDaysRemaining();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Status Header */}
            <div className="premium-card" style={{
                borderLeft: `6px solid ${isExpired ? '#ef4444' : 'var(--primary)'}`,
                background: isExpired ? 'rgba(239, 68, 68, 0.05)' : 'linear-gradient(145deg, rgba(132, 204, 22, 0.05), var(--surface))'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>Current Membership Status</p>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {isExpired ? 'EXPIRED' : 'ACTIVE'}
                            {isExpired ? <AlertCircle size={32} color="#ef4444" /> : <ShieldCheck size={32} color="var(--primary)" />}
                        </h2>
                        {!isExpired && daysRemaining <= 7 && (
                            <p style={{ color: '#f59e0b', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: '600' }}>
                                ⚠️ Expiring in {daysRemaining} days
                            </p>
                        )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: '700' }}>Expiry Date</p>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>
                            {memberData.expiryDate ? new Date(memberData.expiryDate).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'No Plan Active'}
                        </h3>
                        {memberData.plan && <p style={{ color: 'var(--primary)', fontSize: '0.9rem', marginTop: '0.5rem', fontWeight: '700' }}>Current: {memberData.plan}</p>}
                    </div>
                </div>
            </div>

            {/* Available Plans */}
            <section>
                <h3 style={{ fontSize: '1.75rem', marginBottom: '1.5rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CreditCard size={28} color="var(--primary)" /> {isExpired ? 'Choose a Plan' : 'Renew or Upgrade'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={plan.name}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="premium-card"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center',
                                border: plan.popular ? '2px solid #BEFF00' : memberData.plan === plan.name ? '2px solid var(--primary)' : '1px solid var(--border)',
                                position: 'relative',
                                background: plan.popular ? 'linear-gradient(145deg, rgba(190, 255, 0, 0.05), var(--surface))' : undefined
                            }}
                        >
                            {plan.badge && (
                                <div style={{ position: 'absolute', top: '-12px', background: plan.color, color: plan.color === '#BEFF00' ? 'black' : 'white', padding: '4px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '900', letterSpacing: '0.05em' }}>
                                    {plan.badge}
                                </div>
                            )}
                            {plan.popular && !plan.badge && (
                                <div style={{ position: 'absolute', top: '-12px', background: '#BEFF00', color: 'black', padding: '4px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '900' }}>
                                    POPULAR
                                </div>
                            )}
                            {memberData.plan === plan.name && !isExpired && !plan.popular && (
                                <div style={{ position: 'absolute', top: '-12px', background: 'var(--primary)', color: 'black', padding: '4px 12px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '900' }}>CURRENT</div>
                            )}

                            <div style={{ width: '60px', height: '60px', borderRadius: '12px', backgroundColor: `${plan.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                                <plan.icon size={32} color={plan.color} />
                            </div>

                            <h4 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: '900' }}>{plan.name}</h4>
                            <div style={{ fontSize: '2.25rem', fontWeight: '900', color: plan.color, marginBottom: '0.5rem' }}>₹{plan.price}</div>
                            <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>{plan.description}</p>

                            <div style={{ width: '100%', textAlign: 'left', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                {plan.features.map((feature, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: i < plan.features.length - 1 ? '0.5rem' : 0, fontSize: '0.85rem' }}>
                                        <CheckCircle2 size={14} color={plan.color} />
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                className="btn-primary"
                                style={{ width: '100%', marginTop: 'auto', backgroundColor: plan.color, color: plan.color === '#BEFF00' ? 'black' : 'white', fontWeight: '900' }}
                                onClick={() => handlePayNow(plan)}
                            >
                                {memberData.plan === plan.name && !isExpired ? 'Renew' : 'Choose Plan'} <ArrowRight size={16} />
                            </button>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Payment History */}
            <div className="premium-card">
                <h4 style={{ marginBottom: '1.5rem', fontSize: '1.5rem', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <CheckCircle2 size={24} color="var(--primary)" /> Payment History
                </h4>
                <div style={{ overflowX: 'auto' }}>
                    {myPayments.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted-foreground)' }}>
                            <CreditCard size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                            <p>No payment history found.</p>
                            <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Purchase a plan to see your payment records here.</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--muted-foreground)' }}>
                                    <th style={{ padding: '1rem 0', fontWeight: '700' }}>Plan</th>
                                    <th style={{ padding: '1rem 0', fontWeight: '700' }}>Amount</th>
                                    <th style={{ padding: '1rem 0', fontWeight: '700' }}>Payment Date</th>
                                    <th style={{ padding: '1rem 0', fontWeight: '700' }}>Valid Till</th>
                                    <th style={{ padding: '1rem 0', textAlign: 'center', fontWeight: '700' }}>Status</th>
                                    <th style={{ padding: '1rem 0', textAlign: 'right', fontWeight: '700' }}>Invoice</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myPayments.map(p => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1rem 0', fontWeight: '700' }}>{p.planName}</td>
                                        <td style={{ padding: '1rem 0', color: 'var(--primary)', fontWeight: '800' }}>₹{p.amount}</td>
                                        <td style={{ padding: '1rem 0' }}>{new Date(p.paymentDate).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem 0' }}>{new Date(p.validTill).toLocaleDateString()}</td>
                                        <td style={{ padding: '1rem 0', textAlign: 'center' }}>
                                            <span className="badge badge-primary" style={{ fontSize: '0.7rem', fontWeight: '900', backgroundColor: '#BEFF00', color: 'black' }}>{p.status}</span>
                                        </td>
                                        <td style={{ padding: '1rem 0', textAlign: 'right' }}>
                                            <button
                                                onClick={() => downloadInvoice(p)}
                                                className="btn-outline"
                                                style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                                            >
                                                <Download size={14} /> Download
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Membership;
