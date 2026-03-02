import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { Users, TrendingUp, MessageSquare, Flame, CheckCircle, Megaphone, Send } from 'lucide-react';

const TrainerDashboard = () => {
    const { user } = useAuth();
    const { members = [], trainers = [], streaks = {}, attendance = {}, logAttendance, saveAnnouncement } = useData();
    const [announcement, setAnnouncement] = useState({ title: '', message: '' });
    const [isAnnouncing, setIsAnnouncing] = useState(false);

    const trainerData = (trainers || []).find(t => t.id === user?.id);
    const assignedMembers = (members || []).filter(m => m.trainerId === user?.id);
    const activeMembers = assignedMembers.filter(m => m.status === 'active').length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '900' }}>Trainer Hub</h1>
                    <p style={{ color: 'var(--muted-foreground)' }}>Welcome back, Coach {user.name || 'Pro'}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div className="badge badge-primary" style={{ padding: '0.5rem 1rem' }}>
                        ID: {user?.id || '---'}
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                <div className="premium-card">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={20} color="#3b82f6" /> Assigned Members List
                    </h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>Name</th>
                                    <th style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>Streak</th>
                                    <th style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>Status</th>
                                    <th style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>Attendance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignedMembers.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>No members assigned to you yet.</td>
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
                                                    <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', margin: 0 }}>ID: {m.id}</p>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: userStreak.current > 0 ? '#ef4444' : 'var(--muted-foreground)' }}>
                                                        <Flame size={14} fill={userStreak.current > 0 ? '#ef4444' : 'none'} />
                                                        <span style={{ fontWeight: '700' }}>{userStreak.current}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    <span className={`badge ${m.status === 'active' ? 'badge-primary' : ''}`} style={{ fontSize: '0.65rem' }}>{m.status}</span>
                                                </td>
                                                <td style={{ padding: '1rem' }}>
                                                    {hasAttended ? (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: '0.85rem' }}>
                                                            <CheckCircle size={16} /> Present
                                                        </div>
                                                    ) : (
                                                        <button
                                                            className="btn-primary"
                                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                                            onClick={() => logAttendance(m.id, today, 'present')}
                                                        >
                                                            Mark Present
                                                        </button>
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="premium-card" style={{ border: '1px solid var(--primary)', background: 'linear-gradient(135deg, rgba(132, 204, 22, 0.05), transparent)' }}>
                        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Megaphone size={20} color="var(--primary)" /> Send Announcement
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>Broadcast a message to all your members instantly.</p>
                            <input
                                className="input-field"
                                placeholder="Announcement Title"
                                value={announcement.title}
                                onChange={(e) => setAnnouncement({ ...announcement, title: e.target.value })}
                            />
                            <textarea
                                className="input-field"
                                placeholder="Write your message here..."
                                style={{ minHeight: '100px', resize: 'none' }}
                                value={announcement.message}
                                onChange={(e) => setAnnouncement({ ...announcement, message: e.target.value })}
                            />
                            <button
                                className="btn-primary"
                                style={{ width: '100%', justifyContent: 'center', gap: '0.5rem' }}
                                onClick={() => {
                                    if (!announcement.title || !announcement.message) return;
                                    saveAnnouncement(announcement.title, announcement.message);
                                    setAnnouncement({ title: '', message: '' });
                                    alert('Announcement sent to all members!');
                                }}
                            >
                                <Send size={18} /> Send Broadcast
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TrainerDashboard;
