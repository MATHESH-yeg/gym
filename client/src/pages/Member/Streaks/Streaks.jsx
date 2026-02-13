import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { Flame, Trophy, Award, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const Streaks = () => {
    const { user } = useAuth();
    const { streaks } = useData();

    const streak = streaks[user.id] || { current: 0, best: 0 };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="premium-card" style={{ textAlign: 'center', padding: '3rem 2rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.05 }}><Flame size={160} color="var(--primary)" /></div>
                    <Flame size={80} color="var(--primary)" style={{ margin: '0 auto 1.5rem' }} />
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '1.125rem' }}>Current Streak</p>
                    <h2 style={{ fontSize: '4rem', fontWeight: '900', color: 'var(--primary)' }}>{streak.current}</h2>
                    <p style={{ fontWeight: '600' }}>Days and counting!</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }} className="premium-card" style={{ textAlign: 'center', padding: '3rem 2rem', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: -20, right: -20, opacity: 0.05 }}><Trophy size={160} color="#f59e0b" /></div>
                    <Trophy size={80} color="#f59e0b" style={{ margin: '0 auto 1.5rem' }} />
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '1.125rem' }}>Personal Best</p>
                    <h2 style={{ fontSize: '4rem', fontWeight: '900', color: '#f59e0b' }}>{streak.best}</h2>
                    <p style={{ fontWeight: '600' }}>Can you beat it?</p>
                </motion.div>
            </div>

            <div className="premium-card">
                <h3 style={{ marginBottom: '1.5rem' }}>Achievements</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: streak.current >= 7 ? 1 : 0.3 }}>
                        <div style={{ padding: '1rem', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}><Award color="#3b82f6" /></div>
                        <div>
                            <h4 style={{ fontSize: '1rem' }}>7 Day Warrior</h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Completed 7 days streak</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: streak.current >= 30 ? 1 : 0.3 }}>
                        <div style={{ padding: '1rem', borderRadius: '50%', backgroundColor: 'rgba(168, 85, 247, 0.1)' }}><Zap color="#a855f7" /></div>
                        <div>
                            <h4 style={{ fontSize: '1rem' }}>30 Day Elite</h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Completed 30 days streak</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: streak.current >= 100 ? 1 : 0.3 }}>
                        <div style={{ padding: '1rem', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}><Trophy color="#ef4444" /></div>
                        <div>
                            <h4 style={{ fontSize: '1rem' }}>Centurion</h4>
                            <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Completed 100 days streak</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Streaks;
