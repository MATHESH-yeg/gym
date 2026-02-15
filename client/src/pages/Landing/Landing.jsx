import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, Activity, Shield, Flame, ChevronRight, Play, Award, Users } from 'lucide-react';

const Landing = () => {
    const navigate = useNavigate();
    console.log('OLIVA: Landing Page Loaded', { Award, Users });

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: 'var(--background)',
            color: '#ffffff',
            overflowX: 'hidden'
        }}>
            {/* Nav */}
            <nav style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 5%',
                position: 'fixed',
                top: 0,
                width: '100%',
                zIndex: 100,
                backgroundColor: 'rgba(9, 9, 11, 0.8)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--border)',
                boxSizing: 'border-box'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Dumbbell size={window.innerWidth < 425 ? 24 : 32} color="var(--primary)" />
                    <span style={{ fontSize: window.innerWidth < 425 ? '1.25rem' : '1.5rem', fontWeight: '900', letterSpacing: '-0.05em' }}>OLIVA</span>
                </div>
                <div style={{ display: 'flex', gap: window.innerWidth < 425 ? '0.5rem' : '1rem', alignItems: 'center' }}>
                    <button onClick={() => navigate('/login')} className="btn-outline" style={{ border: 'none', minHeight: '40px', padding: '0 1rem' }}>Login</button>
                    <button onClick={() => navigate('/select-role')} className="btn-primary" style={{ minHeight: '40px', padding: '0 1.25rem', fontSize: '0.875rem' }}>Join Now</button>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: '80px 5% 40px',
                position: 'relative',
                background: 'radial-gradient(circle at center, rgba(132, 204, 22, 0.1) 0%, transparent 70%)',
                boxSizing: 'border-box'
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    style={{ position: 'absolute', zIndex: -1, opacity: 0.1 }}
                >
                    <Dumbbell size={window.innerWidth < 768 ? 200 : 400} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    style={{ maxWidth: '1000px' }}
                >
                    <h1 style={{
                        fontSize: 'clamp(2.5rem, 10vw, 6rem)',
                        fontWeight: '950',
                        lineHeight: '0.95',
                        marginBottom: '1.5rem',
                        letterSpacing: '-0.04em'
                    }}>
                        UNLEASH YOUR <br />
                        <span style={{ color: 'var(--primary)', WebkitTextStroke: '1px var(--primary)', WebkitTextFillColor: 'transparent' }}>POTENTIAL.</span>
                    </h1>
                    <p style={{
                        fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                        color: 'var(--muted-foreground)',
                        maxWidth: '700px',
                        margin: '0 auto 2.5rem',
                        lineHeight: '1.6'
                    }}>
                        The ultimate gym management and workout tracking ecosystem.
                        Precision metrics, professional routines, and elite-level results.
                    </p>

                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => navigate('/select-role')}
                            className="btn-primary"
                            style={{
                                padding: '1rem 2.5rem',
                                borderRadius: '100px',
                                gap: '0.5rem'
                            }}
                        >
                            Get Started <ChevronRight size={20} />
                        </button>
                        <button
                            className="btn-outline"
                            style={{
                                padding: '1rem 2.5rem',
                                borderRadius: '100px',
                                gap: '0.5rem'
                            }}
                        >
                            <Play size={18} fill="currentColor" /> Watch Video
                        </button>
                    </div>
                </motion.div>

                {/* Status Bar */}
                <div style={{
                    marginTop: '4rem',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    gap: '1.5rem 3rem',
                    color: 'var(--muted-foreground)',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    letterSpacing: '0.1em'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity size={18} color="var(--primary)" /> <span>LIVE METRICS</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Shield size={18} color="var(--primary)" /> <span>MASTER CONTROL</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Flame size={18} color="var(--primary)" /> <span>ELITE STREAKS</span>
                    </div>
                </div>
            </section>

            {/* Features Preview */}
            <section style={{ padding: '5rem 5%', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: '900', marginBottom: '1rem', lineHeight: '1.1' }}>Engineered for Performance</h2>
                        <p style={{ color: 'var(--muted-foreground)', maxWidth: '600px', margin: '0 auto' }}>Whether you're a gym owner, a trainer, or a member, Oliva provides the tools you need.</p>
                    </div>

                    <div className="responsive-grid">
                        <div className="premium-card" style={{ padding: '2.5rem 2rem' }}>
                            <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'black' }}>
                                <Shield size={24} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Studio Master</h3>
                            <p style={{ color: 'var(--muted-foreground)', lineHeight: '1.6', fontSize: '0.9375rem' }}>Control every aspect of your fitness center. Manage staff, billing, and membership cycles with ease.</p>
                        </div>
                        <div className="premium-card" style={{ padding: '2.5rem 2rem' }}>
                            <div style={{ width: '48px', height: '48px', backgroundColor: '#3b82f6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'white' }}>
                                <Award size={24} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Elite Pro Trainer</h3>
                            <p style={{ color: 'var(--muted-foreground)', lineHeight: '1.6', fontSize: '0.9375rem' }}>Design world-class diet and workout programs. Track your assigned members' progress in real-time.</p>
                        </div>
                        <div className="premium-card" style={{ padding: '2.5rem 2rem' }}>
                            <div style={{ width: '48px', height: '48px', backgroundColor: '#BEFF00', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', color: 'black' }}>
                                <Users size={24} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Member Portal</h3>
                            <p style={{ color: 'var(--muted-foreground)', lineHeight: '1.6', fontSize: '0.9375rem' }}>Access your personalized routines, view diet plans, and compete on the leaderboard streaks.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
