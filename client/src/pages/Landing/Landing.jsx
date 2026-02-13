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
            color: 'var(--foreground)',
            overflowX: 'hidden'
        }}>
            {/* Nav */}
            <nav style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1.5rem 5%',
                position: 'fixed',
                top: 0,
                width: '100%',
                zIndex: 100,
                backgroundColor: 'rgba(0,0,0,0.8)',
                backdropFilter: 'blur(10px)',
                borderBottom: '1px solid var(--border)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Dumbbell size={32} color="var(--primary)" />
                    <span style={{ fontSize: '1.5rem', fontWeight: '950', letterSpacing: '-0.05em' }}>OLIVA</span>
                </div>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <button onClick={() => navigate('/login')} className="btn-outline" style={{ border: 'none' }}>Login</button>
                    <button onClick={() => navigate('/select-role')} className="btn-primary" style={{ padding: '0.6rem 1.5rem' }}>Get Started</button>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                padding: '0 5%',
                position: 'relative',
                background: 'radial-gradient(circle at center, rgba(190, 255, 0, 0.1) 0%, transparent 70%)'
            }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    style={{ position: 'absolute', zIndex: -1, opacity: 0.2 }}
                >
                    <Dumbbell size={400} />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 style={{
                        fontSize: 'clamp(3rem, 10vw, 7rem)',
                        fontWeight: '950',
                        lineHeight: '0.9',
                        marginBottom: '1.5rem',
                        letterSpacing: '-0.04em'
                    }}>
                        UNLEASH YOUR <br />
                        <span style={{ color: 'var(--primary)', WebkitTextStroke: '2px var(--primary)', WebkitTextFillColor: 'transparent' }}>POTENTIAL.</span>
                    </h1>
                    <p style={{
                        fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                        color: 'var(--muted-foreground)',
                        maxWidth: '700px',
                        margin: '0 auto 3rem',
                        lineHeight: '1.6'
                    }}>
                        The ultimate gym management and workout tracking ecosystem.
                        Precision metrics, professional routines, and elite-level results.
                    </p>

                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button
                            onClick={() => navigate('/select-role')}
                            className="btn-primary"
                            style={{
                                padding: '1.25rem 3rem',
                                fontSize: '1.1rem',
                                fontWeight: '800',
                                borderRadius: '100px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}
                        >
                            Explore  <ChevronRight size={20} />
                        </button>
                        <button
                            className="btn-outline"
                            style={{
                                padding: '1.25rem 3rem',
                                fontSize: '1.1rem',
                                fontWeight: '800',
                                borderRadius: '100px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}
                        >
                            <Play size={20} fill="currentColor" /> Watch Demo
                        </button>
                    </div>
                </motion.div>

                {/* Status Bar */}
                <div style={{
                    position: 'absolute',
                    bottom: '3rem',
                    display: 'flex',
                    gap: '4rem',
                    color: 'var(--muted-foreground)',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Activity size={20} color="var(--primary)" /> <span>LIVE METRICS</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Shield size={20} color="var(--primary)" /> <span>MASTER CONTROL</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Flame size={20} color="var(--primary)" /> <span>ELITE STREAKS</span>
                    </div>
                </div>
            </section>

            {/* Features Preview */}
            <section style={{ padding: '8rem 5%', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
                        <h2 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '1rem' }}>Engineered for Performance</h2>
                        <p style={{ color: 'var(--muted-foreground)' }}>Whether you're a gym owner, a trainer, or a member, Oliva provides the tools you need.</p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <div className="premium-card" style={{ padding: '3rem' }}>
                            <div style={{ width: '50px', height: '50px', backgroundColor: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', color: 'black' }}>
                                <Shield size={28} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Studio Master</h3>
                            <p style={{ color: 'var(--muted-foreground)', lineHeight: '1.6' }}>Control every aspect of your fitness center. Manage staff, billing, and membership cycles with ease.</p>
                        </div>
                        <div className="premium-card" style={{ padding: '3rem' }}>
                            <div style={{ width: '50px', height: '50px', backgroundColor: '#3b82f6', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', color: 'white' }}>
                                <Award size={28} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Elite Pro Trainer</h3>
                            <p style={{ color: 'var(--muted-foreground)', lineHeight: '1.6' }}>Design world-class diet and workout programs. Track your assigned members' progress in real-time.</p>
                        </div>
                        <div className="premium-card" style={{ padding: '3rem' }}>
                            <div style={{ width: '50px', height: '50px', backgroundColor: '#BEFF00', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', color: 'black' }}>
                                <Users size={28} />
                            </div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Member Portal</h3>
                            <p style={{ color: 'var(--muted-foreground)', lineHeight: '1.6' }}>Access your personalized routines, view diet plans, and compete on the leaderboard streaks.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Landing;
