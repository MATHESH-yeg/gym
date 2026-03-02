import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { Users, TrendingUp, MessageSquare, Flame, CheckCircle, Megaphone, Send } from 'lucide-react';

const TrainerDashboard = () => {
    const { user } = useAuth();
    const { members = [], trainers = [], streaks = {}, attendance = {}, logAttendance, saveAnnouncement, announcements } = useData();
    const [announcement, setAnnouncement] = useState({ title: '', message: '', expiryDate: '' });
    const [isAnnouncing, setIsAnnouncing] = useState(false);

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

    const assignedMembers = (members || []).filter(m => m.trainerId === user?.id);
    const activeMembers = assignedMembers.filter(m => m.status === 'active').length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '900' }}>Trainer Hub</h1>
                    <p style={{ color: 'var(--muted-foreground)' }}>Welcome back, Coach {user?.name || 'Pro'}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="badge badge-primary" style={{ padding: '0.5rem 1rem' }}>
                        ID: {user?.id || '---'}
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="responsive-grid">
                <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #3b82f6' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: '12px' }}>
                        <Users size={24} color="#3b82f6" />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>My Members</p>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{assignedMembers.length}</h3>
                    </div>
                </div>
                <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--primary)' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(132, 204, 22, 0.1)', borderRadius: '12px' }}>
                        <TrendingUp size={24} color="var(--primary)" />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>Active Training</p>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>{activeMembers}</h3>
                    </div>
                </div>
                <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px' }}>
                        <MessageSquare size={24} color="#f59e0b" />
                    </div>
                    <div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>New Messages</p>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '800' }}>0</h3>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
                <div className="premium-card">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={20} color="#3b82f6" /> Assigned Members
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>Name</th>
                                    <th style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>Streak</th>
                                    <th style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>Log</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignedMembers.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>No members yet.</td>
                                    </tr>
                                ) : (
                                    assignedMembers.map(m => {
                                        const userStreak = streaks[m.id] || { current: 0 };
                                        const today = new Date().toISOString().split('T')[0];
                                        const hasAttended = (attendance[m.id] || []).some(a => a.date === today);

                                        return (
                                            <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                                <td style={{ padding: '1rem' }}>
                                                    <p style={{ fontWeight: '600', margin: 0 }}>{m.name}</p>
                                                    <span className="badge" style={{ fontSize: '0.6rem' }}>{m.status}</span>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                        <Flame size={14} color="#ef4444" /> {userStreak.current}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    {hasAttended ? (
                                                        <CheckCircle size={18} color="var(--primary)" />
                                                    ) : (
                                                        <button className="btn-primary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }} onClick={() => logAttendance(m.id, today, 'present')}>Mark</button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div className="premium-card" style={{ border: '1px solid var(--primary)', background: 'rgba(132, 204, 22, 0.02)' }}>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Megaphone size={20} color="var(--primary)" /> Announcement
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <input className="input-field" placeholder="Title" value={announcement.title} onChange={e => setAnnouncement({ ...announcement, title: e.target.value })} />
                            <textarea className="input-field" placeholder="Message" style={{ minHeight: '80px' }} value={announcement.message} onChange={e => setAnnouncement({ ...announcement, message: e.target.value })} />

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', display: 'block', marginBottom: '0.25rem' }}>Lifespan Preset</label>
                                    <select
                                        className="input-field"
                                        style={{ fontSize: '0.8rem', padding: '0.5rem' }}
                                        value=""
                                        onChange={(e) => {
                                            if (!e.target.value) return;
                                            const now = new Date();
                                            const durationHours = parseInt(e.target.value);
                                            const expiry = new Date(now.getTime() + durationHours * 60 * 60 * 1000);

                                            setAnnouncement({
                                                ...announcement,
                                                expiryDate: expiry.toISOString().split('T')[0]
                                            });
                                        }}
                                    >
                                        <option value="">Choose...</option>
                                        <option value="1">1 Hour</option>
                                        <option value="6">6 Hours</option>
                                        <option value="12">12 Hours</option>
                                        <option value="24">1 Day</option>
                                        <option value="72">3 Days</option>
                                        <option value="168">1 Week</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', display: 'block', marginBottom: '0.25rem' }}>Visible Until</label>
                                    <input type="date" className="input-field" style={{ fontSize: '0.8rem', padding: '0.5rem' }} value={announcement.expiryDate} onChange={e => setAnnouncement({ ...announcement, expiryDate: e.target.value })} />
                                </div>
                            </div>

                            <button className="btn-primary" onClick={() => {
                                if (!announcement.title || !announcement.message) return;
                                let expiryISO = announcement.expiryDate ? new Date(`${announcement.expiryDate}T23:59:59`).toISOString() : null;
                                saveAnnouncement(announcement.title, announcement.message, expiryISO);
                                setAnnouncement({ title: '', message: '', expiryDate: '' });
                                alert('Broadcast Sent!');
                            }}>
                                <Send size={16} /> Broadcast
                            </button>
                        </div>
                    </div>

                    <div className="premium-card">
                        <h4 style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '1rem' }}>RECENTLY SENT</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {(announcements || []).slice(0, 3).map((ann, i) => (
                                <div key={i} style={{ padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                        <p style={{ fontWeight: 'bold', fontSize: '0.85rem', margin: 0 }}>{ann.title}</p>
                                        <span style={{ fontSize: '0.6rem', color: 'var(--primary)', fontWeight: '700' }}>
                                            {ann.expiryDate ? format12h(ann.expiryDate) : 'Permanent'}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', margin: 0 }}>{ann.message.slice(0, 50)}...</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainerDashboard;
