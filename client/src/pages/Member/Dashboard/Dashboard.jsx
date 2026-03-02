import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { Flame, Calendar, CreditCard, ChevronRight, PlayCircle, Megaphone, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MemberDashboard = () => {
    const { user } = useAuth();
    const { streaks, attendance, logAttendance, members, progress, announcements, dietPlans } = useData();
    const navigate = useNavigate();

    const userStreak = (streaks && user?.id) ? (streaks[user.id] || { current: 0, best: 0 }) : { current: 0, best: 0 };
    const memberData = (members && user?.id) ? (members.find(m => m.id === user.id) || user) : user;
    const activeDietPlans = (dietPlans && user?.id) ? (dietPlans[user.id] || []) : [];
    const assignedDiet = activeDietPlans.filter(p => p.createdBy === 'MASTER' || p.createdBy === 'TRAINER').slice(-1)[0];

    const today = new Date().toISOString().split('T')[0];
    const userAttendanceData = (attendance && user?.id) ? (attendance[user.id] || []) : [];
    const hasCheckedIn = userAttendanceData.some(a => a.date === today);

    const handleCheckIn = () => {
        logAttendance(user.id, today, 'present');
        alert('Check-in successful! Have a great workout.');
    };

    const handleRestDay = () => {
        logAttendance(user.id, today, 'rest');
        alert('Rest day logged! Enjoy your recovery.');
    };

    // Calculate attendance stats for current month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthAttendance = userAttendanceData.filter(a => {
        const d = new Date(a.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const presentDays = monthAttendance.filter(a => a.status === 'present').length;
    const restDays = monthAttendance.filter(a => a.status === 'rest').length;
    // For "absent", we check days passed in month minus tracked days
    const todayNum = new Date().getDate();
    const absentDays = Math.max(0, todayNum - monthAttendance.length);

    // Get last 7 days for the activity bar
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];
        const record = userAttendanceData.find(a => a.date === dateStr);
        return {
            dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
            status: record ? record.status : 'none',
            isToday: dateStr === today
        };
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <header style={{
                marginBottom: '1rem',
                display: 'flex',
                flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: window.innerWidth < 768 ? 'flex-start' : 'center',
                gap: '1rem'
            }}>
                <div>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: '800' }}>
                        Welcome, {user?.name ? user.name.split(' ')[0] : 'Member'}!
                    </h1>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.95rem' }}>Let's crush today's workout.</p>
                </div>
                {!hasCheckedIn ? (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-primary"
                        onClick={handleCheckIn}
                        style={{ padding: '0.75rem 2rem', fontSize: '1rem', boxShadow: '0 4px 15px rgba(132, 204, 22, 0.3)' }}
                    >
                        <CheckCircle size={20} /> Check In Today
                    </motion.button>
                ) : (
                    <div style={{ backgroundColor: 'rgba(132, 204, 22, 0.1)', color: 'var(--primary)', padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(132, 204, 22, 0.2)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}>
                        <CheckCircle size={20} /> Checked In for Today
                    </div>
                )}
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
                        <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>Monthly Presence</p>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{presentDays} / {daysInMonth}</h3>
                    </div>
                </motion.div>

                <motion.div whileHover={{ scale: 1.01 }} className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '4px solid #3b82f6' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <CreditCard size={24} color="#3b82f6" />
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Absent This Month</p>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: absentDays > 5 ? '#ef4444' : 'inherit' }}>{absentDays} Days</h3>
                    </div>
                </motion.div>
            </div>

            {/* Attendance Activity */}
            <div className="premium-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: '700' }}>Recent Activity</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>Last 7 Days</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                    {last7Days.map((day, idx) => (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                                width: '100%',
                                height: '40px',
                                borderRadius: '8px',
                                backgroundColor: day.status === 'present' ? 'var(--primary)' :
                                    day.status === 'rest' ? '#3b82f6' : 'rgba(255,255,255,0.05)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: day.isToday ? '2px solid white' : 'none',
                                opacity: day.status === 'none' ? 0.3 : 1
                            }}>
                                {day.status === 'present' && <CheckCircle size={16} color="black" />}
                            </div>
                            <span style={{ fontSize: '0.7rem', color: day.isToday ? 'var(--primary)' : 'var(--muted-foreground)', fontWeight: day.isToday ? '700' : '500' }}>{day.isToday ? 'T' : day.dayName}</span>
                        </div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--primary)' }}></div> Present
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#3b82f6' }}></div> Rest
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'rgba(255,255,255,0.1)' }}></div> Not Marked
                    </div>
                </div>
            </div>

            {/* Gym Announcements */}
            {(announcements?.length || 0) > 0 && (
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

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                <div className="premium-card" style={{ padding: '2rem', minHeight: 'auto', backgroundColor: '#09090b', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <span className="badge" style={{ backgroundColor: 'rgba(132, 204, 22, 0.1)', color: 'var(--primary)', border: '1px solid rgba(132, 204, 22, 0.2)', marginBottom: '1.25rem', display: 'inline-block', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                            FEATURED WORKOUT
                        </span>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', margin: '0.5rem 0', fontWeight: '800', lineHeight: '1.2' }}>
                            {memberData?.assignedProgram?.name ? `${memberData.assignedProgram.name} - Day ${Math.min((userAttendanceData.length || 0) % (memberData.assignedProgram.schedule?.length || 4) + 1, memberData.assignedProgram.schedule?.length || 4)}` : 'Ready to Start?'}
                        </h2>
                        <div style={{ marginBottom: '2rem' }}>
                            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.95rem', marginBottom: '1.5rem', maxWidth: '600px' }}>
                                {memberData?.assignedProgram
                                    ? `Your ${memberData.assignedProgram.createdBy === 'MASTER' ? 'master' : 'trainer'} has prepared a new session: ${memberData.assignedProgram.schedule?.[(userAttendanceData.length || 0) % (memberData.assignedProgram.schedule?.length || 4)]?.focus || 'General Fitness'}`
                                    : 'Choose a workout plan to start your fitness journey today.'}
                            </p>

                            {memberData?.assignedProgram?.code && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.5rem 1rem',
                                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '12px',
                                        fontFamily: 'monospace',
                                        fontSize: '1rem',
                                        color: 'var(--primary)'
                                    }}>
                                        <span style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem', fontWeight: '500' }}>CODE:</span>
                                        {memberData.assignedProgram.code}
                                    </div>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(memberData.assignedProgram.code);
                                            alert('Code copied to clipboard!');
                                        }}
                                        className="btn-outline"
                                        style={{ height: '42px', minWidth: '70px', fontSize: '0.85rem' }}
                                    >
                                        Copy
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            className="btn-primary"
                            style={{ width: window.innerWidth < 640 ? '100%' : 'auto', padding: '0.8rem 2rem', fontSize: '1rem' }}
                            onClick={() => {
                                if (memberData?.assignedProgram?.code) {
                                    navigate(`/member/workout/execute/${memberData.assignedProgram.code}`);
                                } else {
                                    navigate('/member/workout-plans');
                                }
                            }}
                        >
                            <PlayCircle size={20} />
                            Start Session
                        </button>
                    </div>
                </div>

                <div className="premium-card" style={{ padding: '2rem', minHeight: 'auto', backgroundColor: '#09090b', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                        <span className="badge" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '1.25rem', display: 'inline-flex', width: 'fit-content', fontSize: '0.7rem', letterSpacing: '0.05em' }}>
                            {assignedDiet ? (assignedDiet.createdBy === 'MASTER' ? 'MASTER ASSIGNED DIET' : 'TRAINER ASSIGNED DIET') : 'ACTIVE DIET PLAN'}
                        </span>
                        <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', margin: '0.5rem 0', fontWeight: '800', lineHeight: '1.2' }}>
                            {assignedDiet?.name ? assignedDiet.name : 'No Diet Assigned'}
                        </h2>
                        <div style={{ flexGrow: 1, marginBottom: '2rem' }}>
                            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                                {assignedDiet
                                    ? `Goal: ${assignedDiet.goal || 'General Health'} | Tap view details to see your meals.`
                                    : 'Speak to your trainer to get a personalized nutrition plan.'}
                            </p>
                            {assignedDiet && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                    <div className="glass-card" style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)' }}>
                                        <p style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Breakfast</p>
                                        <p style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{assignedDiet.meals?.breakfast || '-'}</p>
                                    </div>
                                    <div className="glass-card" style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)' }}>
                                        <p style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Lunch</p>
                                        <p style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{assignedDiet.meals?.lunch || '-'}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button
                            className="btn-outline"
                            style={{ width: window.innerWidth < 640 ? '100%' : 'auto', padding: '0.8rem 2rem', fontSize: '1rem', borderColor: '#3b82f6', color: '#3b82f6' }}
                            onClick={() => navigate('/member/diet-plan')}
                        >
                            View Details
                        </button>
                    </div>
                </div>
            </div>

            <div className="premium-card">
                <h3 style={{ fontSize: '1.125rem', marginBottom: '1.25rem', fontWeight: '700' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                    {!hasCheckedIn && (
                        <button className="btn-outline" style={{ justifyContent: 'space-between', width: '100%', borderColor: 'var(--primary)', color: 'var(--primary)' }} onClick={handleCheckIn}>
                            Check In Today <ChevronRight size={18} />
                        </button>
                    )}
                    <button className="btn-outline" style={{ justifyContent: 'space-between', width: '100%' }} onClick={handleRestDay}>
                        Today is Rest Day <ChevronRight size={18} />
                    </button>
                    <button className="btn-outline" style={{ justifyContent: 'space-between', width: '100%' }} onClick={() => navigate('/member/records')}>
                        View Performance <ChevronRight size={18} />
                    </button>
                    <button className="btn-outline" style={{ justifyContent: 'space-between', width: '100%' }} onClick={() => navigate('/member/reminders')}>
                        Reminders & Notes <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MemberDashboard;
