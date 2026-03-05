import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, Users, Award, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const RoleSelection = () => {
    const navigate = useNavigate();
    const { user, loading } = useAuth();

    // Redirect if already logged in
    useEffect(() => {
        if (!loading && user) {
            if (user.role === 'MASTER') navigate('/master');
            else if (user.role === 'MEMBER') navigate('/member');
            else if (user.role === 'TRAINER') navigate('/trainer');
        }
    }, [user, loading, navigate]);

    const roles = [
        {
            id: 'member',
            name: 'Member',
            icon: Users,
            description: 'Track workouts, streaks, and view your records.',
            path: '/login/member',
            color: 'var(--primary)',
            bg: 'rgba(132, 204, 22, 0.1)'
        },
        {
            id: 'trainer',
            name: 'Trainer',
            icon: Award,
            description: 'Manage assigned members and track performance.',
            path: '/login/trainer',
            color: '#3b82f6',
            bg: 'rgba(59, 130, 246, 0.1)'
        },
        {
            id: 'master',
            name: 'Master',
            icon: Shield,
            description: 'Full gym management, billing, and staff control.',
            path: '/login/master',
            color: '#f59e0b',
            bg: 'rgba(245, 158, 11, 0.1)'
        }
    ];

    return (
        <div className="role-selection-container">
            <style>{`
                .role-selection-container {
                    min-height: 100vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding: 2rem 1rem;
                    background: radial-gradient(circle at top right, rgba(132, 204, 22, 0.05), transparent), radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.05), transparent);
                    position: relative;
                }

                .back-intro-btn {
                    position: absolute;
                    top: 2rem;
                    left: 2rem;
                    border: none;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    color: var(--muted-foreground);
                    z-index: 10;
                }

                .role-header {
                    text-align: center;
                    margin-bottom: 3rem;
                    margin-top: 4rem; /* Space for back button if absolute */
                }

                .role-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 1.5rem;
                    width: 100%;
                    maxWidth: 1000px;
                }

                @media (max-width: 768px) {
                    .role-selection-container {
                        padding-top: 5rem;
                    }
                    .back-intro-btn {
                        top: 1rem;
                        left: 1rem;
                    }
                    .role-header h2 {
                        font-size: 1.75rem !important;
                    }
                    .role-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            <button
                onClick={() => navigate('/')}
                className="btn-outline back-intro-btn"
            >
                <ArrowLeft size={18} /> Back to Intro
            </button>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="role-header"
            >
                <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '1rem' }}>Select your role to continue</h2>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '1.1rem' }}>Choose the interface you want to access</p>
            </motion.div>

            <div className="role-grid">
                {roles.map((role, idx) => (
                    <motion.div
                        key={role.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ scale: 1.03, translateY: -5 }}
                        whileTap={{ scale: 0.98 }}
                        className="premium-card"
                        style={{
                            cursor: 'pointer',
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem',
                            border: '1px solid var(--border)',
                            transition: 'all 0.3s ease'
                        }}
                        onClick={() => {
                            localStorage.setItem('oliva_last_role', role.id);
                            navigate(role.path);
                        }}
                    >
                        <div style={{
                            width: '70px',
                            height: '70px',
                            borderRadius: '20px',
                            backgroundColor: role.bg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 0.5rem',
                            color: role.color
                        }}>
                            <role.icon size={36} />
                        </div>
                        <h3 style={{ fontSize: '1.75rem', fontWeight: '800' }}>{role.name}</h3>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                            {role.description}
                        </p>
                        <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                            <button className="btn-primary" style={{ width: '100%', backgroundColor: role.color, borderColor: role.color, color: role.id === 'member' ? 'black' : 'white' }}>
                                Access {role.name} Portal
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div style={{ marginTop: '4rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>
                    Don't have an account? <span style={{ color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }} onClick={() => navigate('/register/master')}>Register here</span>
                </p>
            </div>
        </div>
    );
};

export default RoleSelection;