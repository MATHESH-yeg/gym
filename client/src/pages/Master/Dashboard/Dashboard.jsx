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
            <div style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', display: 'grid', gap: '1.5rem' }}>
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
                            width: '50px',
                            height: '50px',
                            borderRadius: '12px',
                            backgroundColor: `rgba(255, 255, 255, 0.05)`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <stat.icon size={24} color={stat.color} />
                        </div>
                        <div>
                            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>{stat.title}</p>
                            <h3 style={{ fontSize: '1.5rem' }}>{stat.value}</h3>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
                {/* Announcement Creation */}
                <div className="premium-card" style={{ borderLeft: '6px solid var(--primary)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Megaphone size={20} color="var(--primary)" />
                        <h3 style={{ fontSize: '1.25rem' }}>Gym Announcements</h3>
                    </div>

                    <form onSubmit={handleSubmitAnnouncement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input name="title" className="input-field" placeholder="Topic (e.g. New Equipment)" required />
                        <textarea name="message" className="input-field" placeholder="What's the update?" style={{ minHeight: '100px' }} required></textarea>
                        <button type="submit" className="btn-primary">Post to All Members</button>
                    </form>

                    <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                        <h4 style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--muted-foreground)' }}>Recent Posts</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {announcements.slice(0, 3).map((ann, i) => (
                                <div key={ann.id || i} style={{ fontSize: '0.8rem', padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                    <p style={{ fontWeight: 'bold' }}>{ann.title}</p>
                                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.75rem' }}>{new Date(ann.createdAt).toLocaleDateString()}</p>
                                </div>
                            ))}
                            {announcements.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', textAlign: 'center' }}>No announcements yet.</p>}
                        </div>
                    </div>
                </div>



                {/* Recent Items Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="premium-card">
                        <h3 style={{ fontSize: '1.125rem', marginBottom: '1.5rem' }}>Upcoming Expiries (Next 7 Days)</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {members.filter(m => {
                                if (!m.expiryDate) return false;
                                const exp = new Date(m.expiryDate);
                                const now = new Date();
                                const nextWeek = new Date();
                                nextWeek.setDate(now.getDate() + 7);
                                return exp > now && exp < nextWeek;
                            }).length === 0 ? (
                                <p style={{ color: 'var(--muted-foreground)', textAlign: 'center' }}>No plans expiring soon.</p>
                            ) : (
                                members.filter(m => {
                                    if (!m.expiryDate) return false;
                                    const exp = new Date(m.expiryDate);
                                    const now = new Date();
                                    const nextWeek = new Date();
                                    nextWeek.setDate(now.getDate() + 7);
                                    return exp > now && exp < nextWeek;
                                }).map(m => (
                                    <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border)' }}>
                                        <p style={{ fontSize: '0.9rem' }}>{m.name}</p>
                                        <p style={{ fontSize: '0.8rem', color: '#f59e0b' }}>{new Date(m.expiryDate).toLocaleDateString()}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MasterDashboard;
