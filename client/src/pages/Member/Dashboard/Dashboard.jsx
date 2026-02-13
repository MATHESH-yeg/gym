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
            <header style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Welcome, {user.name.split(' ')[0]}!</h1>
                    <p style={{ color: 'var(--muted-foreground)' }}>Let's crush today's workout.</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                </div>
            </header>



            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <motion.div whileHover={{ scale: 1.02 }} className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '4px solid var(--primary)' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(132, 204, 22, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Flame size={24} color="var(--primary)" />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>Current Streak</p>
                        <h3 style={{ fontSize: '1.5rem' }}>{userStreak.current} Days</h3>
                    </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '4px solid #a855f7' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(168, 85, 247, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Calendar size={24} color="#a855f7" />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>Monthly Workouts</p>
                        <h3 style={{ fontSize: '1.5rem' }}>{attendance[user.id]?.filter(a => a.status === 'present').length || 0}</h3>
                    </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '4px solid #3b82f6' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CreditCard size={24} color="#3b82f6" />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>Plan: {memberData.plan || 'No Active Plan'}</p>
                        <h3 style={{ fontSize: '1rem' }}>Exp: {memberData.expiryDate ? new Date(memberData.expiryDate).toLocaleDateString() : 'N/A'}</h3>
                    </div>
                </motion.div>
            </div>

            {/* Gym Announcements */}
            {announcements.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <PlayCircle size={18} /> 📢 Gym Announcements
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {announcements.map((ann, idx) => (
                            <motion.div
                                key={ann.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="premium-card"
                                style={{ background: 'linear-gradient(to right, rgba(132, 204, 22, 0.05), transparent)' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>{ann.title}</h4>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{new Date(ann.createdAt).toLocaleDateString()}</span>
                                </div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', lineHeight: '1.5' }}>{ann.message}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            <div className="premium-card" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', backgroundColor: '#09090b', border: '1px solid var(--border)' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                    <span className="badge" style={{ backgroundColor: 'rgba(132, 204, 22, 0.1)', color: '#BEFF00', border: '1px solid rgba(132, 204, 22, 0.2)', marginBottom: '1rem', display: 'inline-block' }}>
                        TRAINER ASSIGNED WORKOUT
                    </span>
                    <h2 style={{ fontSize: '2rem', margin: '0.5rem 0', fontWeight: '800' }}>
                        {memberData.assignedProgram?.name ? `${memberData.assignedProgram.name} - Day ${Math.min((attendance[user.id]?.length || 0) % (memberData.assignedProgram.schedule?.length || 4) + 1, memberData.assignedProgram.schedule?.length || 4)}` : 'No Active Plan'}
                    </h2>
                    <div style={{ marginBottom: '2rem' }}>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
                            {memberData.assignedProgram
                                ? `Ready for your session? Focus: ${memberData.assignedProgram.schedule?.[(attendance[user.id]?.length || 0) % (memberData.assignedProgram.schedule?.length || 4)]?.focus || 'General Fitness'}`
                                : 'Ask your trainer to assign a routine.'}
                        </p>
                        {memberData.assignedProgram?.code && (
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1rem',
                                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '8px',
                                    fontFamily: 'monospace',
                                    fontSize: '1.2rem',
                                    color: '#BEFF00'
                                }}>
                                    <span style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>CODE:</span>
                                    {memberData.assignedProgram.code}
                                </div>
                                <button
                                    onClick={() => {
                                        navigator.clipboard.writeText(memberData.assignedProgram.code);
                                        alert('Code copied to clipboard!');
                                    }}
                                    className="btn-outline"
                                    style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', height: 'auto' }}
                                >
                                    Copy
                                </button>
                            </div>
                        )}
                    </div>

                    <button
                        className="btn-primary"
                        style={{ padding: '1rem 2rem', fontSize: '1.1rem', backgroundColor: '#BEFF00', color: 'black', fontWeight: 'bold' }}
                        onClick={() => {
                            if (memberData.assignedProgram?.code) {
                                navigate(`/member/workout/execute/${memberData.assignedProgram.code}`);
                            } else {
                                navigate('/member/workout-plans');
                            }
                        }}
                    >
                        <PlayCircle size={24} />
                        Start Assigned Workout
                    </button>
                </div>
            </div>

            <div className="premium-card">
                <h3 style={{ marginBottom: '1rem' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
                    <button className="btn-outline" style={{ justifyContent: 'space-between' }} onClick={handleRestDay}>
                        Today is Rest Day <ChevronRight size={16} />
                    </button>
                    <button className="btn-outline" style={{ justifyContent: 'space-between' }} onClick={() => navigate('/member/records')}>
                        View Performance <ChevronRight size={16} />
                    </button>
                    <button className="btn-outline" style={{ justifyContent: 'space-between' }} onClick={() => navigate('/member/records')}>
                        Evolution <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MemberDashboard;
