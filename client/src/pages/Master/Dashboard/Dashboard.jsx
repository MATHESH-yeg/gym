import React from 'react';
import { useData } from '../../../context/DataContext';
import { Users, CreditCard, Calendar, Flame, AlertCircle, ArrowUpRight, Megaphone, CheckCircle2, Copy, RefreshCw, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const MasterDashboard = () => {
    const { members, payments, attendance, streaks, saveAnnouncement, announcements, todaysWorkout, trainers, saveTrainer } = useData();

    const activeMembers = members.filter(m => m.status === 'active').length;
    const expiringSoon = members.filter(m => {
        if (!m.expiryDate) return false;
        const expiry = new Date(m.expiryDate);
        const diff = expiry - new Date();
        return diff > 0 && diff < (7 * 24 * 60 * 60 * 1000); // 7 days
    }).length;

    const stats = [
        { title: 'Total Members', value: members.length, icon: Users, color: 'var(--primary)' },
        { title: 'Active Plans', value: activeMembers, icon: CreditCard, color: '#3b82f6' },
        { title: 'Gym Attendance', value: Object.values(attendance).flat().filter(a => a.date === new Date().toISOString().split('T')[0]).length, icon: Calendar, color: '#a855f7' },
        { title: 'Expiring Soon', value: expiringSoon, icon: AlertCircle, color: '#f59e0b' }
    ];

    const handleSubmitAnnouncement = (e) => {
        e.preventDefault();
        const title = e.target.title.value;
        const message = e.target.message.value;
        if (title && message) {
            saveAnnouncement(title, message);
            e.target.reset();
            alert('Announcement sent to all members!');
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

                    <form onSubmit={handleSubmitAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input name="title" className="input-field" placeholder="Topic (e.g. New Equipment)" required />
                        <textarea name="message" className="input-field" placeholder="What's the update?" style={{ minHeight: '120px' }} required></textarea>
                        <button type="submit" className="btn-primary" style={{ width: '100%' }}>Post to All Members</button>
                    </form>

                    <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
                        <h4 style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--muted-foreground)' }}>Recent Posts</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {announcements.slice(0, 3).map((ann, i) => (
                                <div key={ann.id || i} style={{ padding: '0.75rem', backgroundColor: 'var(--muted)', borderRadius: '8px' }}>
                                    <p style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>{ann.title}</p>
                                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem' }}>{new Date(ann.createdAt).toLocaleDateString()}</p>
                                </div>
                            ))}
                            {announcements.length === 0 && (
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
                            {members.filter(m => {
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
                                members.filter(m => {
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
