import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { Users, Award, TrendingUp, Calendar, MessageSquare } from 'lucide-react';

const TrainerDashboard = () => {
    const { user } = useAuth();
    const { members, trainers } = useData();

    const trainerData = trainers.find(t => t.id === user.id);
    const assignedMembers = members.filter(m => m.trainerId === user.id);
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
                        ID: {user.id}
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
                                    <th style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>Status</th>
                                    <th style={{ padding: '1rem', fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>Progression</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignedMembers.length === 0 ? (
                                    <tr>
                                        <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>No members assigned to you yet.</td>
                                    </tr>
                                ) : (
                                    assignedMembers.map(m => (
                                        <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1rem', fontWeight: '600' }}>{m.name}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span className={`badge ${m.status === 'active' ? 'badge-primary' : ''}`}>{m.status}</span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>{m.progress || '0'}%</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="premium-card">
                    <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={20} color="#f59e0b" /> Today's Schedule
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <p style={{ color: 'var(--muted-foreground)', textAlign: 'center', padding: '2rem 0' }}>Schedule feature coming soon.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainerDashboard;
