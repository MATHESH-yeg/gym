import React from 'react';
import { useData } from '../../../context/DataContext';
import { Users, CreditCard, Calendar, Flame, AlertCircle, ArrowUpRight, Megaphone, CheckCircle2, Copy, RefreshCw, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const MasterDashboard = () => {
    const { members, payments, attendance, streaks, saveAnnouncement, announcements, todaysWorkout, trainers, saveTrainer } = useData();

    const safeMembers = members || [];
    const safeAnnouncements = announcements || [];
    const [announcementState, setAnnouncementState] = React.useState({ title: '', message: '', expiryDate: '' });

    const format12h = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const getTimePreview = (timeStr) => {
        if (!timeStr) return '';
        const [h, m] = timeStr.split(':');
        const date = new Date();
        date.setHours(parseInt(h), parseInt(m));
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    const activeMembers = safeMembers.filter(m => m.status === 'active').length;
    const expiringSoon = safeMembers.filter(m => {
        if (!m.expiryDate) return false;
        const expiry = new Date(m.expiryDate);
        const diff = expiry - new Date();
        return diff > 0 && diff < (7 * 24 * 60 * 60 * 1000); // 7 days
    }).length;

    const stats = [
        { title: 'Total Members', value: safeMembers.length, icon: Users, color: 'var(--primary)' },
        { title: 'Active Plans', value: activeMembers, icon: CreditCard, color: '#3b82f6' },
        { title: 'Gym Attendance', value: (attendance ? Object.values(attendance).flat().filter(a => a.date === new Date().toISOString().split('T')[0]).length : 0), icon: Calendar, color: '#a855f7' },
        { title: 'Expiring Soon', value: expiringSoon, icon: AlertCircle, color: '#f59e0b' }
    ];

    const handleSubmitAnnouncement = (e) => {
        e.preventDefault();
        const { title, message, expiryDate, expiryTime } = announcementState;

        let expiryISO = null;
        if (expiryDate) {
            expiryISO = new Date(`${expiryDate}T23:59:59`).toISOString();
        }

        if (title && message) {
            saveAnnouncement(title, message, expiryISO);
            setAnnouncementState({ title: '', message: '', expiryDate: '' });
            alert('Announcement posted successfully!');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Stats Overview Grid */}
            <div className="responsive-grid">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="premium-card"
                        style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
                    >
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            backgroundColor: `rgba(255, 255, 255, 0.05)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <stat.icon size={24} color={stat.color} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.85rem' }}>{stat.title}</p>
                            <h3 style={{ fontSize: '1.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="responsive-grid" style={{ gridTemplateColumns: 'minmax(0, 1fr)' }}>
                {/* Announcement Creation */}
                <div className="premium-card" style={{ borderLeft: '6px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Megaphone size={20} color="var(--primary)" />
                        <h3 style={{ fontSize: '1.25rem' }}>Gym Announcements</h3>
                    </div>

                    <form onSubmit={handleSubmitAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--muted-foreground)' }}>Title</label>
                            <input
                                value={announcementState.title}
                                onChange={(e) => setAnnouncementState({ ...announcementState, title: e.target.value })}
                                className="input-field"
                                placeholder="Topic (e.g. Special Holiday Hours)"
                                required
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--muted-foreground)' }}>Message Content</label>
                            <textarea
                                value={announcementState.message}
                                onChange={(e) => setAnnouncementState({ ...announcementState, message: e.target.value })}
                                className="input-field"
                                placeholder="Type your announcement detail here..."
                                style={{ minHeight: '100px', resize: 'vertical' }}
                                required
                            ></textarea>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--muted-foreground)' }}>Message Lifespan</label>
                                <select
                                    className="input-field"
                                    value=""
                                    onChange={(e) => {
                                        if (!e.target.value) return;
                                        const now = new Date();
                                        const duration = parseInt(e.target.value);
                                        const expiry = new Date(now.getTime() + duration * 60 * 60 * 1000);

                                        setAnnouncementState({
                                            ...announcementState,
                                            expiryDate: expiry.toISOString().split('T')[0]
                                        });
                                    }}
                                >
                                    <option value="">Custom...</option>
                                    <option value="1">1 Hour</option>
                                    <option value="2">2 Hours</option>
                                    <option value="6">6 Hours</option>
                                    <option value="12">12 Hours</option>
                                    <option value="24">24 Hours (1 Day)</option>
                                    <option value="48">48 Hours (2 Days)</option>
                                    <option value="168">1 Week</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--muted-foreground)' }}>Visible Until Date</label>
                                <input
                                    name="expiryDate"
                                    type="date"
                                    className="input-field"
                                    value={announcementState.expiryDate}
                                    onChange={(e) => setAnnouncementState({ ...announcementState, expiryDate: e.target.value })}
                                />
                                <p style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>Leave blank for permanent</p>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" style={{ width: '100%', padding: '1rem' }}>Create & Broadcast</button>
                    </form>

                    <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                        <h4 style={{ fontSize: '0.9rem', marginBottom: '1.25rem', fontWeight: '800', letterSpacing: '0.05em' }}>PREVIOUS BROADCASTS</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {safeAnnouncements.slice(0, 5).map((ann, i) => {
                                const isExpired = ann.expiryDate && new Date(ann.expiryDate) < new Date();
                                return (
                                    <div key={ann.id || i} style={{
                                        padding: '1rem',
                                        backgroundColor: 'rgba(255,255,255,0.02)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border)',
                                        opacity: isExpired ? 0.6 : 1
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <p style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{ann.title}</p>
                                            {ann.expiryDate && (
                                                <span style={{
                                                    fontSize: '0.65rem',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    backgroundColor: isExpired ? 'rgba(239, 68, 68, 0.1)' : 'rgba(132, 204, 22, 0.1)',
                                                    color: isExpired ? '#ef4444' : 'var(--primary)',
                                                    fontWeight: '700'
                                                }}>
                                                    {isExpired ? 'EXPIRED' : `ACTIVE UNTIL ${format12h(ann.expiryDate)}`}
                                                </span>
                                            )}
                                        </div>
                                        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem', marginTop: '0.25rem' }}>Posted {new Date(ann.createdAt).toLocaleDateString()}</p>
                                    </div>
                                )
                            })}
                            {safeAnnouncements.length === 0 && (
                                <div className="empty-state" style={{ padding: '1rem' }}>
                                    <p style={{ fontSize: '0.8rem' }}>No announcements yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Recent Items Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="premium-card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <AlertCircle size={20} color="#f59e0b" />
                            <h3 style={{ fontSize: '1.125rem' }}>Upcoming Expiries</h3>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {safeMembers.filter(m => {
                                if (!m.expiryDate) return false;
                                const exp = new Date(m.expiryDate);
                                const now = new Date();
                                const nextWeek = new Date();
                                nextWeek.setDate(now.getDate() + 7);
                                return exp > now && exp < nextWeek;
                            }).length === 0 ? (
                                <div className="empty-state" style={{ padding: '1rem' }}>
                                    <p style={{ fontSize: '0.875rem' }}>No plans expiring soon.</p>
                                </div>
                            ) : (
                                safeMembers.filter(m => {
                                    if (!m.expiryDate) return false;
                                    const exp = new Date(m.expiryDate);
                                    const now = new Date();
                                    const nextWeek = new Date();
                                    nextWeek.setDate(now.getDate() + 7);
                                    return exp > now && exp < nextWeek;
                                }).map(m => (
                                    <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'var(--muted)', borderRadius: '8px' }}>
                                        <p style={{ fontSize: '0.9rem', fontWeight: '500' }}>{m.name}</p>
                                        <p style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: '600' }}>{new Date(m.expiryDate).toLocaleDateString()}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @media (min-width: 1024px) {
                    .layout-grid-custom {
                        grid-template-columns: 1fr 1.5fr;
                    }
                }
            `}</style>
        </div>
    );
};

export default MasterDashboard;
