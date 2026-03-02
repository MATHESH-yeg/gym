import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { Flame, Calendar, CreditCard, ChevronRight, PlayCircle, Megaphone, CheckCircle, X, Moon, User, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const MemberDashboard = () => {
    const { user } = useAuth();
    const { streaks = {}, attendance = {}, logAttendance, members = [], announcements = [], dietPlans = {}, trainers = [] } = useData();
    const navigate = useNavigate();
    const [showAttendanceModal, setShowAttendanceModal] = React.useState(false);
    const [modalType, setModalType] = React.useState('all');
    const [timeRange, setTimeRange] = React.useState('month');
    const [trainerCode, setTrainerCode] = React.useState('');
    const { connectToTrainer } = useData();

    const getTodayStr = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const userStreak = streaks[user?.id] || { current: 0, best: 0 };
    const memberData = members.find(m => m.id === user?.id) || user;
    const activeDietPlans = dietPlans[user?.id] || [];
    const assignedDiet = activeDietPlans.filter(p => p.createdBy === 'MASTER' || p.createdBy === 'TRAINER').slice(-1)[0];
    const today = getTodayStr();
    const userAttendanceData = attendance[user?.id] || [];
    const todayRecord = userAttendanceData.find(a => a.date === today);
    const hasCheckedIn = !!todayRecord;
    const assignedTrainer = trainers?.find(t => t.id === memberData?.trainerId);

    const { attendanceCounts, currentRangeList } = React.useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const end = new Date(today);
        end.setHours(23, 59, 59, 999);

        let start = new Date(today);
        if (timeRange === 'year') {
            const joinDateStr = memberData?.joinDate || memberData?.createdAt;
            // Use joining date for YEAR, falling back to Jan 1st if no date found
            start = joinDateStr ? new Date(joinDateStr) : new Date(today.getFullYear(), 0, 1);
        } else {
            // MONTH range starts on the 1st of current month
            start = new Date(today.getFullYear(), today.getMonth(), 1);
        }
        start.setHours(0, 0, 0, 0);

        // Safety: If start is somehow after end
        if (start > end) start = new Date(end);

        // Optimize lookup
        const attMap = {};
        userAttendanceData.forEach(a => { attMap[a.date] = a.status; });

        const counts = { present: 0, rest: 0, absent: 0 };
        const list = [];

        let d = new Date(start);
        while (d <= end) {
            const dateStr = getTodayStr(d);
            const status = attMap[dateStr] || 'absent';

            if (status === 'present') counts.present++;
            else if (status === 'rest') counts.rest++;
            else counts.absent++;

            list.push({
                date: dateStr,
                displayDate: d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
                displayMonth: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
                status
            });

            d.setDate(d.getDate() + 1);
        }

        return { attendanceCounts: counts, currentRangeList: list.reverse() };
    }, [timeRange, userAttendanceData, memberData?.joinDate, memberData?.createdAt]);

    const { present: presentDaysCount, rest: restDaysCount, absent: absentDaysCount } = attendanceCounts;

    const handleCheckIn = () => {
        logAttendance(user.id, today, 'present');
        alert('Check-in successful!');
    };

    const handleRestDay = () => {
        logAttendance(user.id, today, 'rest');
        alert('Rest day logged!');
    };

    const handleAbsent = () => {
        logAttendance(user.id, today, 'absent');
        alert('Marked as absent for today.');
    };

    const handleTrainerConnect = (e) => {
        e.preventDefault();
        if (!trainerCode.trim()) return;
        const success = connectToTrainer(user.id, trainerCode);
        if (success) {
            alert('Connected to trainer!');
            setTrainerCode('');
        } else {
            alert('Invalid trainer code.');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <header style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.25rem)', fontWeight: '800' }}>
                        Welcome, {user?.name ? user.name.split(' ')[0] : 'Member'}!
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.95rem' }}>Ready to crush your workout?</p>
                        <div style={{ display: 'flex', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '20px', padding: '0.2rem' }}>
                            <button
                                onClick={() => setTimeRange('month')}
                                style={{
                                    padding: '0.25rem 0.75rem',
                                    fontSize: '0.7rem',
                                    borderRadius: '15px',
                                    border: 'none',
                                    background: timeRange === 'month' ? 'var(--primary)' : 'transparent',
                                    color: timeRange === 'month' ? 'black' : 'var(--muted-foreground)',
                                    cursor: 'pointer',
                                    fontWeight: '700',
                                    transition: 'all 0.2s'
                                }}
                            >MONTH</button>
                            <button
                                onClick={() => setTimeRange('year')}
                                style={{
                                    padding: '0.25rem 0.75rem',
                                    fontSize: '0.7rem',
                                    borderRadius: '15px',
                                    border: 'none',
                                    background: timeRange === 'year' ? 'var(--primary)' : 'transparent',
                                    color: timeRange === 'year' ? 'black' : 'var(--muted-foreground)',
                                    cursor: 'pointer',
                                    fontWeight: '700',
                                    transition: 'all 0.2s'
                                }}
                            >YEAR</button>
                        </div>
                    </div>
                </div>
                {!todayRecord && (
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <button className="btn-primary" onClick={handleCheckIn} style={{ padding: '0.75rem 1.25rem', fontSize: '0.9rem' }}>
                            <CheckCircle size={18} /> Check In
                        </button>
                        <button className="btn-outline" onClick={handleRestDay} style={{ padding: '0.75rem 1.25rem', fontSize: '0.9rem', borderColor: '#3b82f6', color: '#3b82f6' }}>
                            <Moon size={18} /> Rest Day
                        </button>
                        <button className="btn-outline" onClick={handleAbsent} style={{ padding: '0.75rem 1.25rem', fontSize: '0.9rem', borderColor: '#ef4444', color: '#ef4444' }}>
                            <X size={18} /> Absent
                        </button>
                    </div>
                )}
            </header>

            <div className="responsive-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--primary)' }}>
                    <Flame size={24} color="var(--primary)" />
                    <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Active Streak</p>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{userStreak.current} Days</h3>
                    </div>
                </div>
                <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #10b981', cursor: 'pointer' }} onClick={() => { setModalType('present'); setShowAttendanceModal(true); }}>
                    <CheckCircle size={24} color="#10b981" />
                    <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Present Days</p>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{presentDaysCount}</h3>
                    </div>
                </div>
                <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #3b82f6', cursor: 'pointer' }} onClick={() => { setModalType('rest'); setShowAttendanceModal(true); }}>
                    <Moon size={24} color="#3b82f6" />
                    <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Rest Days</p>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{restDaysCount}</h3>
                    </div>
                </div>
                <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #ef4444', cursor: 'pointer' }} onClick={() => { setModalType('absent'); setShowAttendanceModal(true); }}>
                    <X size={24} color="#ef4444" />
                    <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Absent Days</p>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{absentDaysCount}</h3>
                    </div>
                </div>
            </div>

            {/* Gym Announcements */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '700' }}>
                    <Megaphone size={18} /> Gym Announcements
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {(() => {
                        const activeAnnouncements = (announcements || []).filter(ann => {
                            if (!ann.expiryDate) return true;
                            return new Date(ann.expiryDate) > new Date();
                        });
                        if (activeAnnouncements.length === 0) {
                            return <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', textAlign: 'center' }}>No active announcements.</p>;
                        }
                        return activeAnnouncements.map((ann, idx) => (
                            <div key={ann.id || idx} className="premium-card" style={{ background: 'linear-gradient(135deg, rgba(132, 204, 22, 0.05), transparent)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>{ann.title}</h4>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>{ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : ''}</span>
                                </div>
                                <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>{ann.message}</p>
                            </div>
                        ));
                    })()}
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {!memberData?.trainerId ? (
                    <div className="premium-card" style={{ padding: '2rem', border: '1px solid var(--primary)', background: 'rgba(132, 204, 22, 0.01)' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Connect to Trainer</h2>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Enter trainer code to start private coaching.</p>
                        <form onSubmit={handleTrainerConnect} style={{ display: 'flex', gap: '0.5rem' }}>
                            <input className="input-field" placeholder="TRAINER CODE" value={trainerCode} onChange={e => setTrainerCode(e.target.value)} />
                            <button className="btn-primary">Connect</button>
                        </form>
                    </div>
                ) : (
                    <div className="premium-card" style={{ padding: '2rem' }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '1.25rem' }}>My Trainer</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: 'var(--surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <User size={24} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>{assignedTrainer?.name || 'Assigned Coach'}</h3>
                                <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>Personal Trainer</p>
                            </div>
                        </div>
                        <button className="btn-outline" style={{ marginTop: '1.5rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={() => navigate('/member/chat')}>
                            Open Chat <MessageSquare size={16} />
                        </button>
                    </div>
                )}

                <div className="premium-card" style={{ padding: '2rem', background: 'rgba(255,255,255,0.02)' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Today's Program</h2>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                        {memberData?.assignedProgram?.name ? `${memberData.assignedProgram.name}` : 'No program assigned yet.'}
                    </p>
                    <button className="btn-primary" style={{ width: '100%' }} onClick={() => navigate(memberData?.assignedProgram?.code ? `/member/workout/execute/${memberData.assignedProgram.code}` : '/member/workout-plans')}>
                        <PlayCircle size={20} /> Let's Start
                    </button>
                </div>
            </div>

            <div className="premium-card">
                <h3 style={{ marginBottom: '1.5rem' }}>Quick Actions</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <button className="btn-outline" style={{ width: '100%' }} onClick={handleRestDay}>Rest Day</button>
                    <button className="btn-outline" style={{ width: '100%' }} onClick={() => navigate('/member/records')}>Performance</button>
                    <button className="btn-outline" style={{ width: '100%' }} onClick={() => navigate('/member/diet-plan')}>Diet Plan</button>
                    <button className="btn-outline" style={{ width: '100%' }} onClick={() => navigate('/member/settings')}>Settings</button>
                </div>
            </div>

            <AnimatePresence>
                {showAttendanceModal && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(4px)' }}>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="premium-card" style={{ width: '100%', maxWidth: '500px', maxHeight: '80vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: '900' }}>Attendance History</h2>
                                <button onClick={() => setShowAttendanceModal(false)}><X size={24} /></button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {currentRangeList.filter(day => modalType === 'all' || day.status === modalType).map(day => (
                                    <div key={day.date} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                        <p style={{ margin: 0, fontWeight: '700' }}>{day.displayDate}</p>
                                        <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: day.status === 'present' ? 'var(--primary)' : day.status === 'rest' ? '#3b82f6' : '#ef4444' }}>{day.status}</span>
                                    </div>
                                ))}
                            </div>
                            <button className="btn-primary" style={{ width: '100%', marginTop: '2rem' }} onClick={() => setShowAttendanceModal(false)}>Close</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div >
    );
};

export default MemberDashboard;
