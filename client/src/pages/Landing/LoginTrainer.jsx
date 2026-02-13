import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Award, ArrowLeft } from 'lucide-react';

const LoginTrainer = () => {
    const [id, setId] = useState('');
    const [error, setError] = useState('');
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

    const handleLogin = (e) => {
        e.preventDefault();
        // Trainers use their TR-XXXX codes or whatever is saved in DB
        const res = login(id, 'TRAINER');
        if (res.success) {
            navigate('/trainer');
        } else {
            setError(res.message || 'Invalid Trainer ID.');
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="premium-card" style={{ width: '100%', maxWidth: '400px' }}>
                <button
                    onClick={() => navigate('/select-role')}
                    style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <ArrowLeft size={18} /> Back
                </button>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        color: '#3b82f6'
                    }}>
                        <Award size={32} />
                    </div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>Trainer Login</h2>
                    <p style={{ color: 'var(--muted-foreground)' }}>Enter your Professional Trainer ID</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Trainer ID</label>
                        <input
                            className="input-field"
                            type="text"
                            placeholder="e.g. TR-1234"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p style={{ color: 'var(--destructive)', fontSize: '0.875rem' }}>{error}</p>}
                    <button type="submit" className="btn-primary" style={{ width: '100%', backgroundColor: '#3b82f6', borderColor: '#3b82f6', color: 'white' }}>Login to Pro Dashboard</button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
                    <p>Issues logging in? Contact your Studio Master.</p>
                </div>
            </div>
        </div>
    );
};

export default LoginTrainer;
