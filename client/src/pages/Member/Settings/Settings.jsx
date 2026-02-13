import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import {
    User, Bell, Moon, Save, Camera, FileText, Target,
    CreditCard, Download, Activity, Calendar
} from 'lucide-react';

const Settings = () => {
    const { user } = useAuth();
    const { updateMember, settings, saveSettings, members, payments } = useData();

    // Get live member data or fallback to auth user
    const memberData = members.find(m => m.id === user.id) || user;
    const memberPayments = payments.filter(p => p.memberId === user.id);

    // Form State
    const [formData, setFormData] = useState({ ...memberData });
    const [isEditing, setIsEditing] = useState(false);

    // Preferences State
    const [isDarkMode, setIsDarkMode] = useState(settings.darkMode !== false);
    const [isNotifEnabled, setIsNotifEnabled] = useState(settings.notifications !== false);

    useEffect(() => {
        if (!isEditing) {
            setFormData({ ...memberData });
        }
    }, [members, user.id, isEditing]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveProfile = () => {
        updateMember(user.id, formData);
        setIsEditing(false);
        // Alert handled by system or context usually, but simple alert here
        alert('Profile updated successfully!');
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleChange('profileImage', reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleToggleNotif = () => {
        const newVal = !isNotifEnabled;
        setIsNotifEnabled(newVal);
        saveSettings({ ...settings, notifications: newVal });
    };

    const handleToggleDark = () => {
        const newVal = !isDarkMode;
        setIsDarkMode(newVal);
        saveSettings({ ...settings, darkMode: newVal });
        if (newVal) document.body.classList.remove('light-theme');
        else document.body.classList.add('light-theme');
    };

    // Derived Values
    const age = formData.dob ? Math.floor((new Date() - new Date(formData.dob)) / (31557600000)) : 'N/A';
    const daysRemaining = formData.expiryDate ? Math.ceil((new Date(formData.expiryDate) - new Date()) / (86400000)) : 0;
    const status = daysRemaining < 0 ? 'Expired' : daysRemaining <= 7 ? 'Expiring Soon' : 'Active';

    const totalPaid = memberPayments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const lastPayment = memberPayments.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: '800' }}>My Profile & Settings</h2>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={18} /> Edit Profile
                    </button>
                ) : (
                    <button onClick={handleSaveProfile} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#16a34a', color: 'white', border: 'none' }}>
                        <Save size={18} /> Save Changes
                    </button>
                )}
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>

                {/* LEFT COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Basic Info */}
                    <div className="premium-card">
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                            <User size={18} /> Basic Information
                        </h4>

                        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div style={{ position: 'relative' }}>
                                <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--surface)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {formData.profileImage ? (
                                        <img src={formData.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{formData.name?.[0]}</span>
                                    )}
                                </div>
                                {isEditing && (
                                    <label style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: 'var(--primary)', borderRadius: '50%', padding: '0.4rem', cursor: 'pointer' }}>
                                        <Camera size={14} color="black" />
                                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                                    </label>
                                )}
                            </div>
                            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Full Name</label>
                                    <input className="input-field" disabled={!isEditing} value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Email ID</label>
                                    <input className="input-field" disabled={!isEditing} value={formData.email || ''} onChange={e => handleChange('email', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Phone Number</label>
                                <input className="input-field" disabled={!isEditing} value={formData.mobile || ''} onChange={e => handleChange('mobile', e.target.value)} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Gender</label>
                                <select className="input-field" disabled={!isEditing} value={formData.gender || 'Male'} onChange={e => handleChange('gender', e.target.value)}>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Date of Birth</label>
                                <input type="date" className="input-field" disabled={!isEditing} value={formData.dob || ''} onChange={e => handleChange('dob', e.target.value)} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Age</label>
                                <div className="input-field" style={{ backgroundColor: 'rgba(255,255,255,0.05)', textAlign: 'center' }}>{age}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Height (cm)</label>
                                <input className="input-field" disabled={!isEditing} value={formData.height || ''} onChange={e => handleChange('height', e.target.value)} style={{ textAlign: 'center' }} />
                            </div>
                        </div>

                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Address</label>
                            <textarea className="input-field" rows="2" disabled={!isEditing} value={formData.address || ''} onChange={e => handleChange('address', e.target.value)} />
                        </div>
                    </div>

                    {/* Goals Section */}
                    <div className="premium-card">
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                            <Target size={18} /> Physical Goals
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', gap: '2rem', padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                                {['Weight Loss', 'Weight Gain'].map(g => (
                                    <label key={g} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: isEditing ? 'pointer' : 'default', opacity: formData.goalType === g ? 1 : 0.5 }}>
                                        <input type="radio" name="goalType" value={g} checked={formData.goalType === g} onChange={e => handleChange('goalType', e.target.value)} disabled={!isEditing} />
                                        {g}
                                    </label>
                                ))}
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Current Weight</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input className="input-field" disabled={!isEditing} value={formData.weight || ''} onChange={e => handleChange('weight', e.target.value)} />
                                        <span style={{ fontSize: '0.8rem' }}>kg</span>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Target Weight</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input className="input-field" disabled={!isEditing} value={formData.targetWeight || ''} onChange={e => handleChange('targetWeight', e.target.value)} />
                                        <span style={{ fontSize: '0.8rem' }}>kg</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Membership Details (READ ONLY) */}
                    <div className="premium-card" style={{ borderLeft: `4px solid ${status === 'Active' ? 'var(--primary)' : '#ef4444'}` }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                            <CreditCard size={18} /> Membership Details
                        </h4>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Current Plan</label>
                                <div className="input-field" style={{ backgroundColor: 'rgba(255,255,255,0.05)', fontWeight: 'bold' }}>{formData.plan || 'No Active Plan'}</div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Start Date</label>
                                    <div className="input-field" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                        {formData.joinDate ? new Date(formData.joinDate).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>End Date</label>
                                    <div className="input-field" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                                        {formData.expiryDate ? new Date(formData.expiryDate).toLocaleDateString() : 'N/A'}
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Days Remaining</label>
                                    <div className="input-field" style={{ backgroundColor: 'rgba(255,255,255,0.05)', fontWeight: 'bold' }}>{daysRemaining > 0 ? daysRemaining : 0}</div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Status</label>
                                    <div className="input-field" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: status === 'Active' ? 'var(--primary)' : '#ef4444', fontWeight: 'bold' }}>{status}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Billing Summary (READ ONLY) */}
                    <div className="premium-card">
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--primary)' }}>
                            <Activity size={18} /> Billing Summary
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: 'var(--muted-foreground)' }}>Total Amount Paid</span>
                                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>₹{totalPaid}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: 'var(--muted-foreground)' }}>Last Payment Date</span>
                                <span>{lastPayment ? new Date(lastPayment.date).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: 'var(--muted-foreground)' }}>Next Renewal Due</span>
                                <span>{formData.expiryDate ? new Date(formData.expiryDate).toLocaleDateString() : 'N/A'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <span style={{ color: 'var(--muted-foreground)' }}>Assigned Trainer</span>
                                <span>{formData.trainerId ? (members.find(m => m.id === formData.trainerId)?.name || 'Trainer Assigned') : 'None'}</span>
                            </div>

                            <div style={{ marginTop: '1rem' }}>
                                <h5 style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--muted-foreground)' }}>Recent Payments</h5>
                                {memberPayments.slice(0, 3).map((pay, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '0.25rem 0', opacity: 0.8 }}>
                                        <span>{new Date(pay.date).toLocaleDateString()}</span>
                                        <span>₹{pay.amount} ({pay.status || 'paid'})</span>
                                    </div>
                                ))}
                            </div>

                            <button className="btn-outline" style={{ marginTop: '1rem', width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                                <Download size={16} /> Download Invoices
                            </button>
                        </div>
                    </div>

                    {/* App Preferences */}
                    <div className="premium-card">
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
                            Settings
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Moon size={18} />
                                    <span style={{ fontSize: '0.9rem' }}>Dark Mode</span>
                                </div>
                                <div onClick={handleToggleDark} style={{ width: '40px', height: '22px', borderRadius: '11px', backgroundColor: isDarkMode ? 'var(--primary)' : 'var(--muted)', position: 'relative', cursor: 'pointer' }}>
                                    <div style={{ position: 'absolute', left: isDarkMode ? '20px' : '2px', top: '2px', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'white', transition: 'left 0.2s' }}></div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Bell size={18} />
                                    <span style={{ fontSize: '0.9rem' }}>Notifications</span>
                                </div>
                                <div onClick={handleToggleNotif} style={{ width: '40px', height: '22px', borderRadius: '11px', backgroundColor: isNotifEnabled ? 'var(--primary)' : 'var(--muted)', position: 'relative', cursor: 'pointer' }}>
                                    <div style={{ position: 'absolute', left: isNotifEnabled ? '20px' : '2px', top: '2px', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'white', transition: 'left 0.2s' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
