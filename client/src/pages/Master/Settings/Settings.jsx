import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { Save, Download, Upload, Shield, User, MapPin, Phone, Mail, Building } from 'lucide-react';
import { exportData } from '../../../utils/db';

const Settings = () => {
    const { user, updateUser } = useAuth();
    const { refreshData } = useData();
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        gymName: user?.gymName || '',
        email: user?.email || '',
        mobile: user?.mobile || '',
        address: user?.address || '',
        city: user?.city || '',
        state: user?.state || '',
        zip: user?.zip || ''
    });

    const handleSaveProfile = (e) => {
        e.preventDefault();
        updateUser(profileData);
        alert('Profile updated successfully!');
    };

    const handleExport = () => {
        const data = exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `oliva-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px' }}>
            {/* Profile Settings */}
            <div className="premium-card">
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={20} color="var(--primary)" /> Gym Owner Profile
                </h3>
                <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                <User size={14} style={{ marginRight: '5px', display: 'inline' }} /> Owner Name
                            </label>
                            <input
                                className="input-field"
                                value={profileData.name}
                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                <Building size={14} style={{ marginRight: '5px', display: 'inline' }} /> Gym Name
                            </label>
                            <input
                                className="input-field"
                                value={profileData.gymName}
                                onChange={(e) => setProfileData({ ...profileData, gymName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                <Mail size={14} style={{ marginRight: '5px', display: 'inline' }} /> Email
                            </label>
                            <input
                                className="input-field"
                                type="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                                <Phone size={14} style={{ marginRight: '5px', display: 'inline' }} /> Mobile
                            </label>
                            <input
                                className="input-field"
                                value={profileData.mobile}
                                onChange={(e) => setProfileData({ ...profileData, mobile: e.target.value })}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', color: 'var(--muted-foreground)' }}>
                            <MapPin size={14} style={{ marginRight: '5px', display: 'inline' }} /> Address Details
                        </label>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Street Address</label>
                            <input
                                className="input-field"
                                value={profileData.address}
                                onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                            />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>City</label>
                                <input
                                    className="input-field"
                                    value={profileData.city}
                                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>State</label>
                                <input
                                    className="input-field"
                                    value={profileData.state}
                                    onChange={(e) => setProfileData({ ...profileData, state: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Zip Code</label>
                                <input
                                    className="input-field"
                                    value={profileData.zip}
                                    onChange={(e) => setProfileData({ ...profileData, zip: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>
                        <Save size={18} /> Update Profile
                    </button>
                </form>
            </div>

            {/* Security Wrapper */}
            <div className="premium-card" style={{ border: '1px solid #ef4444' }}>
                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
                    <Shield size={20} /> Data Backup & Security
                </h3>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
                    Protect your gym's data. Export everything to a JSON file or restore from a previous backup.
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="btn-outline" onClick={handleExport}><Download size={18} /> Export Data</button>
                    <button className="btn-outline"><Upload size={18} /> Restore Backup</button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
