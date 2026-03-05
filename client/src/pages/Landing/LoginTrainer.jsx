import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Award, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginTrainer = () => {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const { login, user, loading } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    React.useEffect(() => {
        if (!loading && user) {
            if (user.role === 'TRAINER') navigate('/trainer');
            else if (user.role === 'MASTER') navigate('/master');
            else if (user.role === 'MEMBER') navigate('/member');
        }
    }, [user, loading, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setError('');

        // Brief delay for premium feel
        setTimeout(async () => {
            const res = await login(code, 'TRAINER', { name });
            if (res.success) {
                navigate('/trainer');
            } else {
                setError(res.message || 'Invalid Trainer credentials.');
                setIsLoggingIn(false);
            }
        }, 800);
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.1), transparent), #0a0a0b',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Decorations */}
            <div style={{ position: 'absolute', top: '10%', right: '10%', width: '300px', height: '300px', background: 'rgba(59, 130, 246, 0.05)', filter: 'blur(100px)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: '250px', height: '250px', background: 'rgba(59, 130, 246, 0.03)', filter: 'blur(80px)', borderRadius: '50%' }} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="premium-card"
                style={{
                    width: '100%',
                    maxWidth: '420px',
                    padding: '2.5rem',
                    backgroundColor: 'rgba(20, 20, 22, 0.8)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                }}
            >
                <button
                    onClick={() => navigate('/select-role')}
                    style={{
                        color: 'var(--muted-foreground)',
                        marginBottom: '2rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: 'color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'white'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--muted-foreground)'}
                >
                    <ArrowLeft size={16} /> Back to Roles
                </button>

                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <motion.div
                        initial={{ rotate: -10, scale: 0.8 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: 'spring', damping: 12 }}
                        style={{
                            width: '70px',
                            height: '70px',
                            borderRadius: '24px',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1.5rem',
                            color: 'white',
                            boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.5)'
                        }}
                    >
                        <Award size={36} />
                    </motion.div>
                    <h2 style={{ fontSize: '2rem', fontWeight: '900', color: 'white', marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>Trainer Access</h2>
                    <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '1rem' }}>Enter your professional credentials</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'rgba(255, 255, 255, 0.7)', marginLeft: '0.25rem' }}>Full Name</label>
                        <input
                            className="input-field"
                            type="text"
                            placeholder="Registered trainer name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                padding: '1rem',
                                color: 'white'
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'rgba(255, 255, 255, 0.7)', marginLeft: '0.25rem' }}>Unique Trainer Code</label>
                        <input
                            className="input-field"
                            type="text"
                            placeholder="e.g. TRAINER-XXXX"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            required
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                padding: '1rem',
                                color: '#3b82f6',
                                fontWeight: '800',
                                letterSpacing: '0.05em'
                            }}
                        />
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: '500', textAlign: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '8px' }}
                        >
                            {error}
                        </motion.p>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={isLoggingIn}
                        className="btn-primary"
                        style={{
                            width: '100%',
                            backgroundColor: '#3b82f6',
                            borderColor: '#3b82f6',
                            color: 'white',
                            padding: '1rem',
                            fontWeight: '700',
                            fontSize: '1rem',
                            marginTop: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            opacity: isLoggingIn ? 0.7 : 1,
                            cursor: isLoggingIn ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isLoggingIn ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Authenticating...
                            </>
                        ) : (
                            'Launch Pro Dashboard'
                        )}
                    </motion.button>
                </form>

                <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1.5rem' }}>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.4)' }}>
                        Need credentials? Contact your Studio Master.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginTrainer;
