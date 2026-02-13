import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../../context/DataContext';
import { useAuth } from '../../../context/AuthContext';
import {
    User, Dumbbell, Utensils, BarChart2, Calendar,
    CreditCard, MessageSquare, ChevronLeft, Flame, Target, CheckCircle2, Trash2, Plus,
    Camera, FileText, Download, Save, ClipboardList, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import WorkoutRecords from '../../Member/WorkoutRecords/WorkoutRecords';

const MemberProfileTab = ({ member, payments, onUpdate, user, trainers = [] }) => {
    const [formData, setFormData] = useState({ ...member });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setFormData({ ...member });
    }, [member]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
        onUpdate(member.id, formData);
        setIsEditing(false);
        // alert('Profile updated!');
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

    const age = formData.dob ? Math.floor((new Date() - new Date(formData.dob)) / (31557600000)) : 'N/A';
    const daysRemaining = formData.expiryDate ? Math.ceil((new Date(formData.expiryDate) - new Date()) / (86400000)) : 0;
    const status = daysRemaining < 0 ? 'Expired' : daysRemaining <= 7 ? 'Expiring Soon' : 'Active';

    // Billing
    const totalPaid = payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    const lastPayment = payments.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    const isMaster = user.role === 'MASTER';

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
            {/* Left Column: Basic Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="premium-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={18} color="var(--primary)" /> Basic Profile Information
                        </h4>
                        {isMaster && (
                            !isEditing ? (
                                <button onClick={() => setIsEditing(true)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <FileText size={16} /> Edit
                                </button>
                            ) : (
                                <button onClick={handleSave} style={{ background: 'none', border: 'none', color: '#16a34a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Save size={16} /> Save
                                </button>
                            )
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
                        <div style={{ position: 'relative' }}>
                            <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--surface)', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {formData.profileImage ? (
                                    <img src={formData.profileImage} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <User size={40} color="var(--muted-foreground)" />
                                )}
                            </div>
                            {isEditing && (
                                <label style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: 'var(--primary)', borderRadius: '50%', padding: '0.4rem', cursor: 'pointer' }}>
                                    <Camera size={14} color="black" />
                                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                                </label>
                            )}
                        </div>
                        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Full Name</label>
                                <input className="input-field" disabled={!isEditing} value={formData.name || ''} onChange={e => handleChange('name', e.target.value)} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Phone Number</label>
                                <input className="input-field" disabled={!isEditing} value={formData.mobile || ''} onChange={e => handleChange('mobile', e.target.value)} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Email ID</label>
                                <input className="input-field" disabled={!isEditing} value={formData.email || ''} onChange={e => handleChange('email', e.target.value)} />
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
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>DOB</label>
                            <input type="date" className="input-field" disabled={!isEditing} value={formData.dob || ''} onChange={e => handleChange('dob', e.target.value)} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Age</label>
                            <div className="input-field" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>{age}</div>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Height (cm)</label>
                            <input className="input-field" disabled={!isEditing} value={formData.height || ''} onChange={e => handleChange('height', e.target.value)} />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Weight (kg)</label>
                            <input className="input-field" disabled={!isEditing} value={formData.weight || ''} onChange={e => handleChange('weight', e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Address</label>
                        <textarea className="input-field" rows="2" disabled={!isEditing} value={formData.address || ''} onChange={e => handleChange('address', e.target.value)} />
                    </div>

                    {isMaster && (
                        <div style={{ marginTop: '1.5rem' }}>
                            <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                <Award size={14} color="var(--primary)" /> Assigned Trainer
                            </label>
                            <select
                                className="input-field"
                                disabled={!isEditing}
                                value={formData.trainerId || ''}
                                onChange={e => handleChange('trainerId', e.target.value)}
                                style={{ color: formData.trainerId ? 'var(--primary)' : 'inherit' }}
                            >
                                <option value="">No Trainer Assigned</option>
                                {trainers.filter(t => t.status === 'Active').map(t => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.specialization || 'General'})</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                <div className="premium-card">
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <Target size={18} color="var(--primary)" /> Goals
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            {['Weight Loss', 'Weight Gain'].map(g => (
                                <label key={g} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: isEditing ? 'pointer' : 'default', opacity: formData.goalType === g ? 1 : 0.5 }}>
                                    <input type="radio" name="goalType" value={g} checked={formData.goalType === g} onChange={e => handleChange('goalType', e.target.value)} disabled={!isEditing} />
                                    {g}
                                </label>
                            ))}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

            {/* Right Column: Membership & Billing */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="premium-card" style={{ borderLeft: `4px solid ${status === 'Active' ? 'var(--primary)' : '#ef4444'}` }}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <CreditCard size={18} color="var(--primary)" /> Membership Details
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Plan</label>
                            <select className="input-field" disabled={!isMaster || !isEditing} value={formData.plan || ''} onChange={e => handleChange('plan', e.target.value)}>
                                <option value="">Select Plan</option>
                                <option value="Monthly">Monthly</option>
                                <option value="Quarterly">Quarterly</option>
                                <option value="Annual">Annual</option>
                                <option value="Personal Training">Personal Training</option>
                            </select>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Start Date</label>
                                <input type="date" className="input-field" disabled={!isMaster || !isEditing} value={formData.joinDate ? formData.joinDate.split('T')[0] : ''} onChange={e => handleChange('joinDate', e.target.value)} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>End Date</label>
                                <input type="date" className="input-field" disabled={!isMaster || !isEditing} value={formData.expiryDate ? formData.expiryDate.split('T')[0] : ''} onChange={e => handleChange('expiryDate', e.target.value)} />
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

                <div className="premium-card">
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <FileText size={18} color="var(--primary)" /> Billing Summary
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--muted-foreground)' }}>Total Amount Paid</span>
                            <span style={{ fontWeight: 'bold' }}>₹{totalPaid}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--muted-foreground)' }}>Last Payment Date</span>
                            <span>{lastPayment ? new Date(lastPayment.date).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--muted-foreground)' }}>Next Due Date</span>
                            <span>{formData.expiryDate ? new Date(formData.expiryDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--muted-foreground)' }}>Payment Mode</span>
                            <span>{lastPayment?.mode || 'N/A'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: 'var(--muted-foreground)' }}>Linked Trainer</span>
                            <span>{formData.trainerId ? 'Assigned' : 'None'}</span>
                        </div>
                        <button className="btn-outline" style={{ marginTop: '1rem', width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                            <Download size={16} /> Download Invoice
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MemberDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const {
        members, attendance, progress, payments, dietPlans,
        todaysWorkout, chats, saveChatMessage, deletePayment,
        saveWorkoutPlan, assignWorkout, updateMember, trainers
    } = useData();

    const [activeTab, setActiveTab] = useState('profile');



    // Routine Builder State
    const [routineBuilder, setRoutineBuilder] = useState({
        planName: '4 Day Class',
        daysCount: 4,
        schedule: Array(4).fill().map((_, i) => ({ day: i + 1, focus: '', exercises: [] }))
    });
    const [dayExerciseInputs, setDayExerciseInputs] = useState({});

    const updateDaysCount = (count) => {
        const newCount = parseInt(count);
        let newSchedule = [...routineBuilder.schedule];
        if (newCount > newSchedule.length) {
            for (let i = newSchedule.length; i < newCount; i++) {
                newSchedule.push({ day: i + 1, focus: '', exercises: [] });
            }
        } else {
            newSchedule = newSchedule.slice(0, newCount);
        }
        setRoutineBuilder({ ...routineBuilder, daysCount: newCount, schedule: newSchedule });
    };

    const handleAddExercise = (dayIdx) => {
        const inputs = dayExerciseInputs[dayIdx] || { name: '', sets: 3, reps: 10, weight: '' };
        if (!inputs.name) return alert('Exercise Name is required');

        const newSchedule = [...routineBuilder.schedule];
        newSchedule[dayIdx].exercises.push({ ...inputs, id: 'EX_' + Date.now() + Math.random() });
        setRoutineBuilder({ ...routineBuilder, schedule: newSchedule });

        // Reset inputs
        setDayExerciseInputs({
            ...dayExerciseInputs,
            [dayIdx]: { name: '', sets: 3, reps: 10, weight: '' }
        });
    };

    const handleAssignRoutine = () => {
        if (!routineBuilder.planName) return alert('Please enter a Plan Name');
        const hasExercises = routineBuilder.schedule.some(d => d.exercises.length > 0);
        if (!hasExercises) return alert('Please add at least one exercise to the routine.');

        const code = 'OLV-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        const newPlan = {
            code,
            name: routineBuilder.planName,
            type: 'multi_day',
            totalDays: routineBuilder.daysCount,
            schedule: routineBuilder.schedule,
            assignedTo: member.id,
            createdBy: 'MASTER01',
            createdAt: new Date().toISOString()
        };

        saveWorkoutPlan(newPlan);
        assignWorkout(member.id, { name: routineBuilder.planName, code, schedule: routineBuilder.schedule });
        alert(`Routine assigned successfully! Code: ${code}`);
    };

    const member = members.find(m => m.id === id);
    if (!member) {
        return (
            <div style={{ textAlign: 'center', padding: '5rem' }}>
                <h2>Member not found</h2>
                <button className="btn-primary" onClick={() => navigate('/master/members')}>Back to Members</button>
            </div>
        );
    }

    const memberAttendance = attendance[id] || [];
    const memberProgress = progress[id] || [];
    const memberPayments = payments.filter(p => p.memberId === id);
    const memberDiet = (dietPlans[id] || []).slice(-1)[0];
    const memberTodaysWorkout = todaysWorkout[id] || null;
    const memberChats = (chats['MASTER01'] && chats['MASTER01'][id]) || [];

    const tabs = [
        { id: 'profile', name: 'Profile', icon: User },
        { id: 'workout', name: "Today's Workout", icon: Dumbbell },
        { id: 'records', name: 'Records', icon: ClipboardList },
        { id: 'diet', name: 'Diet Plan', icon: Utensils },
        { id: 'progress', name: 'Progress', icon: BarChart2 },
        { id: 'attendance', name: 'Attendance', icon: Calendar },
        { id: 'membership', name: 'Membership', icon: CreditCard },
        { id: 'chat', name: 'Chat', icon: MessageSquare }
    ];

    const handleDeletePay = (payId) => {
        if (window.confirm('Delete this payment record?')) {
            deletePayment(payId);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <header style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <button className="btn-outline" style={{ padding: '0.5rem' }} onClick={() => navigate('/master/members')}>
                    <ChevronLeft size={20} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black', fontSize: '1.5rem', fontWeight: '800' }}>
                        {member.name[0]}
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: '800' }}>{member.name}</h1>
                        <p style={{ color: 'var(--muted-foreground)' }}>Member ID: {member.id} • {member.status || 'Active'}</p>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.75rem 1.25rem',
                            backgroundColor: activeTab === tab.id ? 'rgba(132, 204, 22, 0.1)' : 'transparent',
                            color: activeTab === tab.id ? 'var(--primary)' : 'var(--muted-foreground)',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s',
                            fontWeight: activeTab === tab.id ? '700' : '500'
                        }}
                    >
                        <tab.icon size={18} />
                        {tab.name}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="premium-card" style={{ minHeight: '400px' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                    >
                        {activeTab === 'profile' && (
                            <MemberProfileTab
                                member={member}
                                payments={memberPayments}
                                onUpdate={updateMember}
                                user={user}
                                trainers={trainers}
                            />
                        )}

                        {activeTab === 'workout' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <h4>Workout Plan Management</h4>
                                </div>

                                <div className="premium-card" style={{ padding: '2rem', border: '1px solid var(--border)' }}>
                                    <h5 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Target size={20} color="var(--primary)" />
                                        Assign New Routine
                                    </h5>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Plan Name</label>
                                                <input
                                                    className="input-field"
                                                    value={routineBuilder.planName}
                                                    onChange={(e) => setRoutineBuilder({ ...routineBuilder, planName: e.target.value })}
                                                    placeholder="e.g. 4-Day Muscle Split"
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Number of Days</label>
                                                <select
                                                    className="input-field"
                                                    value={routineBuilder.daysCount}
                                                    onChange={(e) => updateDaysCount(e.target.value)}
                                                >
                                                    {[3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Days</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                            {routineBuilder.schedule.map((day, dayIdx) => (
                                                <div key={dayIdx} className="glass-card" style={{ padding: '1.25rem', border: '1px solid var(--border)' }}>
                                                    <h6 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                        Day {day.day} Configuration
                                                    </h6>

                                                    <div style={{ marginBottom: '1.5rem' }}>
                                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem' }}>Day Focus</label>
                                                        <input
                                                            className="input-field"
                                                            value={day.focus}
                                                            onChange={(e) => {
                                                                const newSchedule = [...routineBuilder.schedule];
                                                                newSchedule[dayIdx].focus = e.target.value;
                                                                setRoutineBuilder({ ...routineBuilder, schedule: newSchedule });
                                                            }}
                                                            placeholder="e.g. Chest & Triceps"
                                                        />
                                                    </div>

                                                    {/* Exercise List */}
                                                    {day.exercises.length > 0 && (
                                                        <div style={{ marginBottom: '1rem' }}>
                                                            <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
                                                                <thead>
                                                                    <tr style={{ color: 'var(--muted-foreground)', textAlign: 'left' }}>
                                                                        <th style={{ padding: '0.5rem' }}>Exercise</th>
                                                                        <th style={{ padding: '0.5rem' }}>Sets</th>
                                                                        <th style={{ padding: '0.5rem' }}>Reps</th>
                                                                        <th style={{ padding: '0.5rem' }}>Weight</th>
                                                                        <th style={{ padding: '0.5rem' }}></th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {day.exercises.map((ex, exIdx) => (
                                                                        <tr key={ex.id || exIdx} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                                            <td style={{ padding: '0.5rem' }}>{ex.name}</td>
                                                                            <td style={{ padding: '0.5rem' }}>{ex.sets}</td>
                                                                            <td style={{ padding: '0.5rem' }}>{ex.reps}</td>
                                                                            <td style={{ padding: '0.5rem' }}>{ex.weight}</td>
                                                                            <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                                                                                <button onClick={() => {
                                                                                    const newSchedule = [...routineBuilder.schedule];
                                                                                    newSchedule[dayIdx].exercises.splice(exIdx, 1);
                                                                                    setRoutineBuilder({ ...routineBuilder, schedule: newSchedule });
                                                                                }} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                                                                                    <Trash2 size={14} />
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}

                                                    {/* Add Exercise Inputs */}
                                                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 0.8fr 1fr 1fr', gap: '0.5rem', alignItems: 'end' }}>
                                                        <div>
                                                            <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Name</label>
                                                            <input
                                                                className="input-field"
                                                                placeholder="Exercise Name"
                                                                style={{ padding: '0.5rem' }}
                                                                value={dayExerciseInputs[dayIdx]?.name || ''}
                                                                onChange={(e) => setDayExerciseInputs({ ...dayExerciseInputs, [dayIdx]: { ...(dayExerciseInputs[dayIdx] || {}), name: e.target.value } })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Sets</label>
                                                            <input
                                                                className="input-field"
                                                                type="number"
                                                                placeholder="3"
                                                                style={{ padding: '0.5rem' }}
                                                                value={dayExerciseInputs[dayIdx]?.sets || ''}
                                                                onChange={(e) => setDayExerciseInputs({ ...dayExerciseInputs, [dayIdx]: { ...(dayExerciseInputs[dayIdx] || {}), sets: e.target.value } })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Reps</label>
                                                            <input
                                                                className="input-field"
                                                                type="number"
                                                                placeholder="10"
                                                                style={{ padding: '0.5rem' }}
                                                                value={dayExerciseInputs[dayIdx]?.reps || ''}
                                                                onChange={(e) => setDayExerciseInputs({ ...dayExerciseInputs, [dayIdx]: { ...(dayExerciseInputs[dayIdx] || {}), reps: e.target.value } })}
                                                            />
                                                        </div>
                                                        <div>
                                                            <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Weight</label>
                                                            <input
                                                                className="input-field"
                                                                placeholder="kg"
                                                                style={{ padding: '0.5rem' }}
                                                                value={dayExerciseInputs[dayIdx]?.weight || ''}
                                                                onChange={(e) => setDayExerciseInputs({ ...dayExerciseInputs, [dayIdx]: { ...(dayExerciseInputs[dayIdx] || {}), weight: e.target.value } })}
                                                            />
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="btn-outline"
                                                            style={{ padding: '0.5rem', justifyContent: 'center' }}
                                                            onClick={() => handleAddExercise(dayIdx)}
                                                        >
                                                            <Plus size={16} /> Add
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <button onClick={handleAssignRoutine} className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                                            Generate Code & Assign Routine
                                        </button>
                                    </div>

                                    {member.assignedProgram && (
                                        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'rgba(132, 204, 22, 0.1)', borderRadius: '8px', border: '1px solid var(--primary)' }}>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 'bold' }}>CURRENTLY ASSIGNED</p>
                                            <h3 style={{ fontSize: '1.25rem', margin: '0.5rem 0' }}>{member.assignedProgram.name}</h3>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                <span style={{ fontSize: '1.5rem', fontWeight: '900', letterSpacing: '0.1em' }}>{member.assignedProgram.code}</span>
                                                <button className="btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem' }} onClick={() => {
                                                    navigator.clipboard.writeText(member.assignedProgram.code);
                                                    alert('Code copied!');
                                                }}>Copy Code</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'records' && (
                            <div>
                                <WorkoutRecords targetUserId={id} />
                            </div>
                        )}

                        {activeTab === 'diet' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                                    <h4>Active Diet Plan</h4>
                                    <button className="btn-outline" onClick={() => navigate('/master/diet-plans')}>Update Diet</button>
                                </div>
                                {!memberDiet ? (
                                    <p style={{ color: 'var(--muted-foreground)' }}>No diet plan assigned.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                                            <h5 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>{memberDiet.name} ({memberDiet.goal})</h5>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                                {Object.entries(memberDiet.meals || {}).map(([meal, content]) => (
                                                    <div key={meal}>
                                                        <h6 style={{ textTransform: 'uppercase', fontSize: '0.7rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>{meal}</h6>
                                                        <p style={{ fontSize: '0.9rem' }}>{content || 'Not specified'}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'progress' && (
                            <div>
                                <h4 style={{ marginBottom: '1.5rem' }}>Lifting History</h4>
                                {memberProgress.length === 0 ? (
                                    <p style={{ color: 'var(--muted-foreground)' }}>No progress logs yet.</p>
                                ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
                                                <th style={{ padding: '0.75rem 0' }}>Date</th>
                                                <th style={{ padding: '0.75rem 0' }}>Exercise</th>
                                                <th style={{ padding: '0.75rem 0' }}>Weight</th>
                                                <th style={{ padding: '0.75rem 0' }}>Sets/Reps</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {memberProgress.slice().reverse().map((log, idx) => (
                                                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                                    <td style={{ padding: '0.75rem 0' }}>{new Date(log.date).toLocaleDateString()}</td>
                                                    <td style={{ padding: '0.75rem 0', fontWeight: 'bold' }}>{log.exercise}</td>
                                                    <td style={{ padding: '0.75rem 0', color: 'var(--primary)' }}>{log.weight} kg</td>
                                                    <td style={{ padding: '0.75rem 0' }}>{log.sets} x {log.reps}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        )}

                        {activeTab === 'attendance' && (
                            <div>
                                <h4 style={{ marginBottom: '1.5rem' }}>Attendance & Rest Record</h4>
                                {memberAttendance.length === 0 ? (
                                    <p style={{ color: 'var(--muted-foreground)' }}>No attendance records yet.</p>
                                ) : (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {memberAttendance.slice().reverse().map((att, idx) => (
                                            <div key={idx} style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '8px',
                                                backgroundColor: att.status === 'rest' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(132, 204, 22, 0.1)',
                                                border: `1px solid ${att.status === 'rest' ? '#3b82f6' : 'var(--primary)'}`,
                                                fontSize: '0.8rem'
                                            }}>
                                                <p style={{ fontWeight: 'bold' }}>{new Date(att.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
                                                <p style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>{att.status}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'membership' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', borderLeft: '4px solid var(--primary)' }}>
                                    <div>
                                        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Current Plan</p>
                                        <h4 style={{ fontSize: '1.5rem' }}>{member.plan || 'No Active Plan'}</h4>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem', textTransform: 'uppercase' }}>Expiry Date</p>
                                        <h4 style={{ fontSize: '1.5rem', color: member.expiryDate && new Date(member.expiryDate) < new Date() ? '#ef4444' : 'var(--primary)' }}>
                                            {member.expiryDate ? new Date(member.expiryDate).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A'}
                                        </h4>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h4>Payment History</h4>
                                    <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={() => navigate('/master/payments')}>Record New</button>
                                </div>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--muted-foreground)' }}>
                                            <th style={{ padding: '0.75rem 0' }}>Date</th>
                                            <th style={{ padding: '0.75rem 0' }}>Plan</th>
                                            <th style={{ padding: '0.75rem 0' }}>Amount</th>
                                            <th style={{ padding: '0.75rem 0' }}>Status</th>
                                            <th style={{ padding: '0.75rem 0', textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {memberPayments.map(p => (
                                            <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                                <td style={{ padding: '0.75rem 0' }}>{new Date(p.paymentDate || p.date).toLocaleDateString()}</td>
                                                <td style={{ padding: '0.75rem 0' }}>{p.planName || p.plan}</td>
                                                <td style={{ padding: '0.75rem 0' }}>₹{p.amount}</td>
                                                <td style={{ padding: '0.75rem 0' }}>
                                                    <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{p.status || 'paid'}</span>
                                                </td>
                                                <td style={{ padding: '0.75rem 0', textAlign: 'right' }}>
                                                    <button onClick={() => handleDeletePay(p.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                                </td>
                                            </tr>
                                        ))}
                                        {memberPayments.length === 0 && (
                                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted-foreground)' }}>No payments found.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'chat' && (
                            <div style={{ display: 'flex', flexDirection: 'column', height: '500px' }}>
                                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem' }}>
                                    {memberChats.length === 0 ? (
                                        <div style={{ textAlign: 'center', color: 'var(--muted-foreground)', marginTop: '20%' }}>
                                            <MessageSquare size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                                            <p>No messages yet.</p>
                                        </div>
                                    ) : (
                                        memberChats.map(msg => (
                                            <div key={msg.id} style={{
                                                alignSelf: msg.senderId === 'MASTER01' ? 'flex-end' : 'flex-start',
                                                maxWidth: '80%',
                                                padding: '0.75rem 1rem',
                                                borderRadius: msg.senderId === 'MASTER01' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                                                backgroundColor: msg.senderId === 'MASTER01' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                                color: msg.senderId === 'MASTER01' ? 'black' : 'white',
                                                fontSize: '0.9rem',
                                                border: msg.senderId === 'MASTER01' ? 'none' : '1px solid var(--border)'
                                            }}>
                                                {msg.text}
                                                <p style={{ fontSize: '0.6rem', marginTop: '0.25rem', opacity: 0.7 }}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div style={{ padding: '1rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        className="input-field"
                                        placeholder={`Reply to ${member.name}...`}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && e.target.value.trim()) {
                                                saveChatMessage('MASTER01', id, e.target.value);
                                                e.target.value = '';
                                            }
                                        }}
                                    />
                                    <button className="btn-primary" onClick={(e) => {
                                        const input = e.currentTarget.previousSibling;
                                        if (input.value.trim()) {
                                            saveChatMessage('MASTER01', id, input.value);
                                            input.value = '';
                                        }
                                    }}>Send</button>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default MemberDetail;
