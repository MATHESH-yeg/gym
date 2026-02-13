import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Shield, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const RegisterMaster = () => {
    const navigate = useNavigate();
    const { registerGymOwner } = useAuth();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        gender: 'Male',
        age: '',
        gymName: '',
        gymLocation: '',
        phone: '',
        email: '',
        accountType: '', // 'MASTER', 'ONLINE_COACH', 'BOTH'
        yearsOfExperience: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phone') {
            if (!/^\d*$/.test(value)) {
                setError('Mobile number must contain only numbers.');
                return;
            } else {
                setError('');
            }
        }
        setFormData({ ...formData, [name]: value });
    };

    const handleAccountTypeChange = (type) => {
        setFormData({ ...formData, accountType: type });
        setError('');
    };

    const handleNext = (e) => {
        e.preventDefault();
        if (!formData.accountType) {
            setError('Please select an account type first.');
            return;
        }
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const [createdUser, setCreatedUser] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();

        // Final validation before submit
        if (!formData.accountType) {
            setError('Account type is required.');
            return;
        }

        if ((formData.accountType === 'MASTER' || formData.accountType === 'BOTH') && (!formData.gymName || !formData.gymLocation)) {
            setError('Gym name and location are required.');
            return;
        }

        if ((formData.accountType === 'ONLINE_COACH' || formData.accountType === 'BOTH') && !formData.yearsOfExperience) {
            setError('Years of experience is required.');
            return;
        }

        const res = registerGymOwner(formData);
        if (res.success) {
            setCreatedUser(res.user);
            setStep(3);
        } else {
            setError(res.message);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'radial-gradient(circle at top right, rgba(132, 204, 22, 0.1), transparent 40%)'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="premium-card"
                style={{ width: '100%', maxWidth: '500px', position: 'relative', overflow: 'hidden' }}
            >
                {/* Header */}
                {step < 3 && (
                    <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                        <button onClick={() => navigate('/login')} style={{ color: 'var(--muted-foreground)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}>
                            Already have an account? <span style={{ color: 'var(--primary)', fontWeight: '600' }}>Login</span>
                        </button>
                    </div>
                )}

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(132, 204, 22, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
                    }}>
                        {step === 3 ? <Check size={32} color="var(--primary)" /> : <Shield size={32} color="var(--primary)" />}
                    </div>
                    <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
                        {step === 3 ? 'Registration Successful!' : 'Register '}
                    </h2>
                    <p style={{ color: 'var(--muted-foreground)' }}>
                        {step === 3 ? 'Your account is ready. Here are your login details.' : 'Start your 7-day free trial today.'}
                    </p>
                </div>

                {/* Progress Bar */}
                {step < 3 && (
                    <div style={{ display: 'flex', marginBottom: '2rem', gap: '0.5rem' }}>
                        <div style={{ height: '4px', flex: 1, borderRadius: '2px', background: step >= 1 ? 'var(--primary)' : 'var(--muted)' }}></div>
                        <div style={{ height: '4px', flex: 1, borderRadius: '2px', background: step >= 2 ? 'var(--primary)' : 'var(--muted)' }}></div>
                    </div>
                )}

                <form onSubmit={step === 2 ? handleSubmit : handleNext}>
                    {step === 1 && (
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: -20, opacity: 0 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                        >
                            {/* Account Type Selection */}
                            <div>
                                <label className="input-label" style={{ marginBottom: '0.75rem', display: 'block' }}>Account Type</label>
                                <div style={{
                                    display: 'flex',
                                    gap: '0.5rem',
                                    padding: '0.25rem',
                                    background: 'var(--muted)',
                                    borderRadius: '0.75rem',
                                    border: '1px solid var(--border)'
                                }}>
                                    {[
                                        { id: 'MASTER', label: 'Master' },
                                        { id: 'ONLINE_COACH', label: 'Coach' },
                                        { id: 'BOTH', label: 'Both' }
                                    ].map(type => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => handleAccountTypeChange(type.id)}
                                            style={{
                                                flex: 1,
                                                padding: '0.5rem 0.25rem',
                                                borderRadius: '0.5rem',
                                                border: 'none',
                                                fontSize: '0.875rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                background: formData.accountType === type.id ? 'var(--primary)' : 'transparent',
                                                color: formData.accountType === type.id ? 'var(--primary-foreground)' : 'var(--muted-foreground)'
                                            }}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="input-label">Full Name</label>
                                <input className="input-field" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label className="input-label">Gender</label>
                                    <select className="input-field" name="gender" value={formData.gender} onChange={handleChange}>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="input-label">Age</label>
                                    <input className="input-field" type="number" name="age" value={formData.age} onChange={handleChange} required placeholder="30" />
                                </div>
                            </div>
                            <div>
                                <label className="input-label">Phone Number</label>
                                <input className="input-field" type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="1234567890" maxLength={15} />
                            </div>
                            <div>
                                <label className="input-label">Email ID</label>
                                <input className="input-field" type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" />
                            </div>

                            {error && <div style={{ color: 'var(--destructive)', fontSize: '0.875rem' }}>{error}</div>}

                            <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                Next Step <ArrowRight size={18} />
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                        >
                            {(formData.accountType === 'MASTER' || formData.accountType === 'BOTH') && (
                                <>
                                    <div>
                                        <label className="input-label">Gym Name</label>
                                        <input className="input-field" name="gymName" value={formData.gymName} onChange={handleChange} required placeholder="Oliva Pro Gym" />
                                        <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                                            Your Master Code will be generated from this name.
                                        </p>
                                    </div>
                                    <div>
                                        <label className="input-label">Gym Location</label>
                                        <input className="input-field" name="gymLocation" value={formData.gymLocation} onChange={handleChange} required placeholder="New York, NY" />
                                    </div>
                                </>
                            )}

                            {(formData.accountType === 'ONLINE_COACH' || formData.accountType === 'BOTH') && (
                                <div>
                                    <label className="input-label">Years of Experience</label>
                                    <input
                                        className="input-field"
                                        type="number"
                                        name="yearsOfExperience"
                                        value={formData.yearsOfExperience}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        max="60"
                                        placeholder="5"
                                    />
                                </div>
                            )}

                            {error && <div style={{ color: 'var(--destructive)', background: 'rgba(239, 68, 68, 0.1)', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>{error}</div>}

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={handleBack} className="btn-outline" style={{ flex: 1 }}>Back</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Start Free Trial</button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && createdUser && (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{ textAlign: 'center' }}
                        >
                            <div style={{ background: 'rgba(132, 204, 22, 0.1)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '1.5rem', border: '1px solid var(--primary)' }}>
                                <h3 style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                                    Your Master Login Code
                                </h3>
                                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '0.05em', userSelect: 'all', cursor: 'text' }}>
                                    {createdUser.id}
                                </div>
                                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
                                    Please save this code. You will need it to log in as Master.
                                </p>
                            </div>

                            <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--foreground)' }}>
                                <Check size={18} color="var(--primary)" />
                                <span>7-Day Free Trial Activated</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <button type="button" onClick={() => navigate('/login')} className="btn-primary" style={{ width: '100%', padding: '1.5rem', fontSize: '1rem' }}>
                                    Continue to Login
                                </button>
                                <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                                    Use your Master Code to login or add members to your gym
                                </p>
                            </div>
                        </motion.div>
                    )}
                </form>
            </motion.div>
        </div>
    );
};

export default RegisterMaster;
