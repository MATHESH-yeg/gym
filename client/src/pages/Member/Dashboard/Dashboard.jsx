import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { Flame, Calendar, CreditCard, ChevronRight, PlayCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MemberDashboard = () => {
    const { user } = useAuth();
    const { streaks, attendance, logAttendance, members, progress, announcements } = useData();
    const navigate = useNavigate();

    const userStreak = streaks[user.id] || { current: 0, best: 0 };
    const memberData = members.find(m => m.id === user.id) || user;

    const today = new Date().toISOString().split('T')[0];
    const hasCheckedIn = attendance[user.id]?.some(a => a.date === today);

    const handleRestDay = () => {
        logAttendance(user.id, today, 'rest');
        alert('Rest day logged! Enjoy your recovery.');
    };



    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <header style={{
                marginBottom: '1rem',
                display: 'flex',
                flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: window.innerWidth < 768 ? 'flex-start' : 'center',
                gap: '0.5rem'
            }}>
                <div>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: '800' }}>
                        Welcome, {user.name.split(' ')[0]}!
                    </h1>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.95rem' }}>Let's crush today's workout.</p>
                </div>
                <div style={{ textAlign: window.innerWidth < 768 ? 'left' : 'right' }}>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)', fontWeight: '500' }}>
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </header>

            <div className="responsive-grid">
                <motion.div whileHover={{ scale: 1.01 }} className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '4px solid var(--primary)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(132, 204, 22, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Flame size={24} color="var(--primary)" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Current Streak</p>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{userStreak.current} Days</h3>
                    </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.01 }} className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '4px solid #a855f7' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Calendar size={24} color="#a855f7" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Monthly Workouts</p>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{attendance[user.id]?.filter(a => a.status === 'present').length || 0}</h3>
                    </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.01 }} className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '4px solid #3b82f6' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CreditCard size={24} color="#3b82f6" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Plan: {memberData.plan || 'Free Plan'}</p>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: '600' }}>Exp: {memberData.expiryDate ? new Date(memberData.expiryDate).toLocaleDateString() : 'Lifetime'}</h3>
                    </div>
                </motion.div>
            </div>

            {/* Gym Announcements */}
            {announcements.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}>
                        <Megaphone size={18} /> Announcements
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {announcements.map((ann, idx) => (
                            <motion.div
                                key={ann.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="premium-card"
                                style={{ background: 'linear-gradient(135deg, rgba(132, 204, 22, 0.08), transparent)' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '1rem' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>{ann.title}</h4>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', whiteSpace: 'nowrap' }}>{new Date(ann.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', lineHeight: '1.6' }}>{ann.message}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            <div className="premium-card" style={{ padding: '2rem', minHeight: 'auto', backgroundColor: '#09090b', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <span className="badge" style={{ backgroundColor: 'rgba(132, 204, 22, 0.1)', color: 'var(--primary)', border: '1px solid rgba(132, 204, 22, 0.2)', marginBottom: '1.25rem', display: 'inline-block', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                        FEATURED WORKOUT
                    </span>
                    <h2 style={{ fontSize: 'clamp(1.75rem, 6vw, 2.5rem)', margin: '0.5rem 0', fontWeight: '800', lineHeight: '1.1' }}>
                        {memberData.assignedProgram?.name ? `${memberData.assignedProgram.name} - Day ${Math.min((attendance[user.id]?.length || 0) % (memberData.assignedProgram.schedule?.length || 4) + 1, memberData.assignedProgram.schedule?.length || 4)}` : 'Ready to Start?'}
                    </h2>
                    <div style={{ marginBottom: '2rem' }}>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: '1rem', marginBottom: '1.5rem', maxWidth: '600px' }}>
                            {memberData.assignedProgram
                                ? `Your trainer has prepared a new session: ${memberData.assignedProgram.schedule?.[(attendance[user.id]?.length || 0) % (memberData.assignedProgram.schedule?.length || 4)]?.focus || 'General Fitness'}`
                                : 'Choose a workout plan to start your fitness journey today.'}
                        </p>

                        {memberData.assignedProgram?.code && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1.25rem',
                                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '12px',
                                    fontFamily: 'monospace',
                                    fontSize: '1.1rem',
                                    color: 'var(--primary)'
                                }}>
                                    <span style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem', fontWeight: '500' }}>CODE:</span>
                                    {memberData.assignedProgram.code}
                                </div>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(memberData.assignedProgram.code);
                                        alert('Code copied to clipboard!');
                                    }}
                                    className="btn-outline"
                                    style={{ height: '48px', minWidth: '80px' }}
                                >
                                    Copy
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        className="btn-primary"
                        style={{ width: window.innerWidth < 640 ? '100%' : 'auto', padding: '1rem 2.5rem', fontSize: '1.1rem' }}
                        onClick={() => {
                            if (memberData.assignedProgram?.code) {
                                navigate(`/member/workout/execute/${memberData.assignedProgram.code}`);
                            } else {
                                navigate('/member/workout-plans');
                            }
                        }}
                    >
                        <PlayCircle size={22} />
                        Start Session
                    </button>
                </div>
            </div>

            <div className="premium-card">
                <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', fontWeight: '700' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    <button className="btn-outline" style={{ justifyContent: 'space-between', width: '100%' }} onClick={handleRestDay}>
                        Today is Rest Day <ChevronRight size={18} />
                    </button>
                    <button className="btn-outline" style={{ justifyContent: 'space-between', width: '100%' }} onClick={() => navigate('/member/records')}>
                        View Performance <ChevronRight size={18} />
                    </button>
                    <button className="btn-outline" style={{ justifyContent: 'space-between', width: '100%' }} onClick={() => navigate('/member/attendance')}>
                        Check Attendance <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MemberDashboard;
