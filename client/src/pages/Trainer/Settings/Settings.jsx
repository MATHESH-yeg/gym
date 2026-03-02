import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { Settings as SettingsIcon, Bell, Lock, User, FileText, Globe, LogOut } from 'lucide-react';

const TrainerSettings = () => {
    const { user, logout } = useAuth();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '900' }}>Settings</h1>
                    <p style={{ color: 'var(--muted-foreground)' }}>Customize your trainer profile and preferences</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
                {/* Navigation Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="premium-card" style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'flex-start', padding: '1rem', backgroundColor: 'rgba(var(--primary-rgb), 0.1)' }}>
                                <User size={20} color="var(--primary)" /> Profile Information
                            </button>
                            <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'flex-start', padding: '1rem' }}>
                                <Bell size={20} /> Notifications
                            </button>
                            <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'flex-start', padding: '1rem' }}>
                                <Lock size={20} /> Security & Password
                            </button>
                            <button className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'flex-start', padding: '1rem' }}>
                                <Globe size={20} /> Language
                            </button>
                            <div style={{ margin: '1rem 0', borderTop: '1px solid var(--border)' }}></div>
                            <button onClick={logout} className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'flex-start', padding: '1rem', color: '#ef4444' }}>
                                <LogOut size={20} /> Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="premium-card">
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={20} color="var(--primary)" /> Profile Details
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '20px', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
                                    {user.name?.charAt(0) || 'P'}
                                </div>
                                <div>
                                    <button className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Change Photo</button>
                                    <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>JPEG or PNG, max 1MB</p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>Full Name</label>
                                    <input type="text" value={user.name || 'Pro Trainer'} disabled style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', padding: '0.85rem', borderRadius: '12px', color: 'var(--foreground)' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                    <label style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>Username/ID</label>
                                    <input type="text" value={user.id || 'TRAINER_01'} disabled style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', padding: '0.85rem', borderRadius: '12px', color: 'var(--foreground)' }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>Professional Bio</label>
                                <textarea placeholder="Write something about your expertise..." style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', padding: '0.85rem', borderRadius: '12px', minHeight: '120px', resize: 'vertical' }}></textarea>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button className="btn btn-primary">Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainerSettings;
