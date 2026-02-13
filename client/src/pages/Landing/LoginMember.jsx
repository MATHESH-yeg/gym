import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, ArrowLeft } from 'lucide-react';

const LoginMember = () => {
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const { login, user, loading } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    React.useEffect(() => {
        if (!loading && user) {
            if (user.role === 'MEMBER') navigate('/member');
            else if (user.role === 'MASTER') navigate('/master');
        }
    }, [user, loading, navigate]);

    const handleLogin = (e) => {
        e.preventDefault();
        const res = login(id, 'MEMBER', { name });
        if (res.success) {
            navigate('/member');
        } else {
            setError(res.message);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
            <div className="premium-card" style={{ width: '100%', maxWidth: '400px' }}>
                <button onClick={() => navigate('/select-role')} style={{ color: 'var(--muted-foreground)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <ArrowLeft size={18} /> Back
                </button>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <Users size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>Member Login</h2>
                    <p style={{ color: 'var(--muted-foreground)' }}>Enter your Member ID to access the portal</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Your Name</label>
                        <input
                            className="input-field"
                            type="text"
                            placeholder="e.g. John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Member ID</label>
                        <input
                            className="input-field"
                            type="text"
                            placeholder="e.g. JOH001"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p style={{ color: 'var(--destructive)', fontSize: '0.875rem' }}>{error}</p>}
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>Login</button>
                </form>


            </div>
        </div>
    );
};

export default LoginMember;
