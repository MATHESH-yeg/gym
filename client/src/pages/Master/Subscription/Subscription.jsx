import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { CreditCard, Check, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const Subscription = () => {
    const { user, logout } = useAuth();

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="dashboard-card"
                style={{ textAlign: 'center', padding: '3rem 2rem' }}
            >
                <div style={{
                    width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'
                }}>
                    <Shield size={40} color="var(--destructive)" />
                </div>

                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Free Trial Expired</h2>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
                    Your 7-day free trial has ended. To continue managing your gym with Oliva Pro, please upgrade to a premium plan.
                </p>

                <div className="premium-card" style={{ maxWidth: '400px', margin: '0 auto', border: '1px solid var(--primary)' }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Oliva Pro Master</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '1rem' }}>
                        $29<span style={{ fontSize: '1rem', color: 'var(--muted-foreground)', fontWeight: 'normal' }}>/month</span>
                    </div>

                    <ul style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem' }}>
                        {['Unlimited Members', 'Advanced Analytics', 'Diet Plans & Workouts', 'Priority Support'].map(item => (
                            <li key={item} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <div style={{ background: 'var(--primary)', borderRadius: '50%', padding: '2px' }}>
                                    <Check size={12} color="black" />
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>

                    <button className="btn-primary" style={{ width: '100%', marginBottom: '1rem' }}>
                        Subscribe Now
                    </button>
                    <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                        Secure payment powered by Stripe
                    </p>
                </div>

                <button onClick={logout} className="btn-outline" style={{ marginTop: '2rem' }}>
                    Logout
                </button>
            </motion.div>
        </div>
    );
};

export default Subscription;
