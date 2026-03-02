import React, { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { useAuth } from '../../../context/AuthContext';
import { Plus, Dumbbell, ClipboardList, Trash2, Edit2, Code, Copy, Layout, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PlanBuilderModal = ({ plan, onSave, onClose }) => {
    const [formData, setFormData] = useState(plan || {
        name: '',
        description: '',
        daysCount: 4,
        schedule: Array(4).fill().map((_, i) => ({ day: i + 1, focus: '', exercises: [] }))
    });
    const [dayExerciseInputs, setDayExerciseInputs] = useState({});

    const updateDaysCount = (count) => {
        const newCount = parseInt(count);
        let newSchedule = [...formData.schedule];
        if (newCount > newSchedule.length) {
            for (let i = newSchedule.length; i < newCount; i++) {
                newSchedule.push({ day: i + 1, focus: '', exercises: [] });
            }
        } else {
            newSchedule = newSchedule.slice(0, newCount);
        }
        setFormData({ ...formData, daysCount: newCount, schedule: newSchedule });
    };

    const handleAddExercise = (dayIdx) => {
        const inputs = dayExerciseInputs[dayIdx] || { name: '', sets: 3, reps: 10, weight: '' };
        if (!inputs.name) return;

        const newSchedule = [...formData.schedule];
        newSchedule[dayIdx].exercises.push({ ...inputs, id: 'EX_' + Date.now() + Math.random() });
        setFormData({ ...formData, schedule: newSchedule });

        setDayExerciseInputs({
            ...dayExerciseInputs,
            [dayIdx]: { name: '', sets: 3, reps: 10, weight: '' }
        });
    };

    const handleSave = () => {
        if (!formData.name) return alert('Please enter a plan name');
        const hasExercises = formData.schedule.some(d => d.exercises.length > 0);
        if (!hasExercises) return alert('Please add at least one exercise to the plan');
        onSave(formData);
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="premium-card" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ margin: 0 }}>{plan ? 'Edit Plan' : 'Create New Workout Plan'}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Plan Name</label>
                            <input className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Muscle Building Advanced" />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Weekly Days</label>
                            <select className="input-field" value={formData.daysCount} onChange={e => updateDaysCount(e.target.value)}>
                                {[1, 2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n} Days</option>)}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        {formData.schedule.map((day, dayIdx) => (
                            <div key={dayIdx} className="glass-card" style={{ padding: '1.25rem', border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary)', textTransform: 'uppercase' }}>Day {day.day} Configuration</h4>
                                    <input
                                        className="input-field"
                                        style={{ width: '200px', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                                        placeholder="Day Focus (e.g. Chest)"
                                        value={day.focus}
                                        onChange={e => {
                                            const next = [...formData.schedule];
                                            next[dayIdx].focus = e.target.value;
                                            setFormData({ ...formData, schedule: next });
                                        }}
                                    />
                                </div>

                                {day.exercises.length > 0 && (
                                    <div style={{ marginBottom: '1rem' }}>
                                        <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ color: 'var(--muted-foreground)', textAlign: 'left' }}>
                                                    <th style={{ padding: '0.4rem' }}>Exercise</th>
                                                    <th style={{ padding: '0.4rem' }}>Sets</th>
                                                    <th style={{ padding: '0.4rem' }}>Reps</th>
                                                    <th style={{ padding: '0.4rem' }}>Weight</th>
                                                    <th style={{ padding: '0.4rem' }}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {day.exercises.map((ex, exIdx) => (
                                                    <tr key={exIdx} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <td style={{ padding: '0.4rem' }}>{ex.name}</td>
                                                        <td style={{ padding: '0.4rem' }}>{ex.sets}</td>
                                                        <td style={{ padding: '0.4rem' }}>{ex.reps}</td>
                                                        <td style={{ padding: '0.4rem' }}>{ex.weight}kg</td>
                                                        <td style={{ padding: '0.4rem', textAlign: 'right' }}>
                                                            <button onClick={() => {
                                                                const next = [...formData.schedule];
                                                                next[dayIdx].exercises.splice(exIdx, 1);
                                                                setFormData({ ...formData, schedule: next });
                                                            }} style={{ color: '#ef4444' }}><Trash2 size={14} /></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 0.8fr 0.8fr 1fr 1fr', gap: '0.5rem', alignItems: 'end' }}>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>Name</label>
                                        <input
                                            className="input-field"
                                            placeholder="Exercise"
                                            style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                                            value={dayExerciseInputs[dayIdx]?.name || ''}
                                            onChange={e => setDayExerciseInputs({ ...dayExerciseInputs, [dayIdx]: { ...(dayExerciseInputs[dayIdx] || { sets: 3, reps: 10, weight: '' }), name: e.target.value } })}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>Sets</label>
                                        <input
                                            className="input-field"
                                            type="number"
                                            style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                                            value={dayExerciseInputs[dayIdx]?.sets || ''}
                                            onChange={e => setDayExerciseInputs({ ...dayExerciseInputs, [dayIdx]: { ...(dayExerciseInputs[dayIdx] || {}), sets: e.target.value } })}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>Reps</label>
                                        <input
                                            className="input-field"
                                            type="number"
                                            style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                                            value={dayExerciseInputs[dayIdx]?.reps || ''}
                                            onChange={e => setDayExerciseInputs({ ...dayExerciseInputs, [dayIdx]: { ...(dayExerciseInputs[dayIdx] || {}), reps: e.target.value } })}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>Weight</label>
                                        <input
                                            className="input-field"
                                            placeholder="kg"
                                            style={{ padding: '0.4rem', fontSize: '0.8rem' }}
                                            value={dayExerciseInputs[dayIdx]?.weight || ''}
                                            onChange={e => setDayExerciseInputs({ ...dayExerciseInputs, [dayIdx]: { ...(dayExerciseInputs[dayIdx] || {}), weight: e.target.value } })}
                                        />
                                    </div>
                                    <button className="btn-outline" style={{ padding: '0.4rem', fontSize: '0.8rem', justifyContent: 'center' }} onClick={() => handleAddExercise(dayIdx)}>
                                        <Plus size={14} /> Add
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button className="btn-outline" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
                        <button className="btn-primary" style={{ flex: 1 }} onClick={handleSave}>Save Workout Plan</button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const MyWorkoutPlans = () => {
    const { user } = useAuth();
    const { workoutPlans, saveWorkoutPlan, deleteWorkoutPlan } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Bootstrap default templates into the user's library if they don't exist
    React.useEffect(() => {
        const bootstrapKey = `bootstrapped_templates_${user.id}`;
        if (!localStorage.getItem(bootstrapKey)) {
            const defaults = [
                {
                    id: 'PLN_DEFAULT_BEGINNER',
                    name: 'Beginner Full Body',
                    description: 'A balanced routine for beginners focusing on basic movements.',
                    daysCount: 3,
                    isTemplate: true,
                    createdBy: user.id,
                    trainerName: user.name,
                    schedule: [
                        { day: 1, focus: 'Full Body A', exercises: [{ name: 'Squats', sets: 3, reps: 12, weight: 0 }, { name: 'Pushups', sets: 3, reps: 10, weight: 0 }, { name: 'Rows', sets: 3, reps: 10, weight: 0 }] },
                        { day: 2, focus: 'Full Body B', exercises: [{ name: 'Lunges', sets: 3, reps: 12, weight: 0 }, { name: 'Dumbbell Press', sets: 3, reps: 10, weight: 5 }, { name: 'Lat Pulldown', sets: 3, reps: 10, weight: 20 }] },
                        { day: 3, focus: 'Full Body C', exercises: [{ name: 'Deadlift', sets: 3, reps: 8, weight: 20 }, { name: 'Plank', sets: 3, reps: '30s', weight: 0 }, { name: 'Shoulder Press', sets: 3, reps: 10, weight: 5 }] }
                    ]
                },
                {
                    id: 'PLN_DEFAULT_EXTENDED',
                    name: '4-Day Split (Upper/Lower)',
                    description: 'Classic hypertrophy split for intermediate lifters.',
                    daysCount: 4,
                    isTemplate: true,
                    createdBy: user.id,
                    trainerName: user.name,
                    schedule: [
                        { day: 1, focus: 'Upper A', exercises: [{ name: 'Bench Press', sets: 4, reps: 8, weight: 40 }, { name: 'Pullups', sets: 4, reps: 8, weight: 0 }] },
                        { day: 2, focus: 'Lower A', exercises: [{ name: 'Squat', sets: 4, reps: 8, weight: 60 }, { name: 'Leg Curls', sets: 3, reps: 12, weight: 20 }] },
                        { day: 3, focus: 'Upper B', exercises: [{ name: 'Overhead Press', sets: 4, reps: 10, weight: 30 }, { name: 'Seated Rows', sets: 4, reps: 10, weight: 30 }] },
                        { day: 4, focus: 'Lower B', exercises: [{ name: 'Hacksquat', sets: 4, reps: 10, weight: 40 }, { name: 'Calf Raises', sets: 4, reps: 15, weight: 40 }] }
                    ]
                }
            ];

            defaults.forEach(d => {
                const exists = workoutPlans.some(p => p.id === d.id);
                if (!exists) saveWorkoutPlan(d);
            });
            localStorage.setItem(bootstrapKey, 'true');
        }
    }, [user.id, saveWorkoutPlan, workoutPlans.length]);

    const displayedPlans = workoutPlans.filter(p =>
        p.createdBy === user.id &&
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSavePlan = (planData) => {
        const code = planData.code || 'PLN-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        saveWorkoutPlan({
            ...planData,
            id: planData.id || 'PLN_' + Date.now(),
            code,
            createdBy: user.id,
            trainerName: user.name
        });
        setIsModalOpen(false);
        setEditingPlan(null);
    };

    const handleCopyCode = (code) => {
        navigator.clipboard.writeText(code);
        alert(`Code ${code} copied to clipboard!`);
    };

    const handleUseTemplate = (template) => {
        const newPlan = {
            ...template,
            isTemplate: false,
            code: 'PLN-' + Math.random().toString(36).substring(2, 6).toUpperCase()
        };
        delete newPlan.id;
        saveWorkoutPlan({
            ...newPlan,
            createdBy: user.id,
            trainerName: user.name
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '900' }}>My Workout Plans</h1>
                    <p style={{ color: 'var(--muted-foreground)' }}>Create, manage and distribute your custom workout routines</p>
                </div>
                <button className="btn-primary" onClick={() => { setEditingPlan(null); setIsModalOpen(true); }}>
                    <Plus size={20} /> Create New Plan
                </button>
            </div>

            <div className="premium-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <Layout size={20} color="var(--primary)" />
                        <h3 style={{ margin: 0 }}>Workout Library</h3>
                    </div>
                    <div style={{ position: 'relative', width: '300px' }}>
                        <input
                            className="input-field"
                            placeholder="Search library..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
                    {displayedPlans.map((plan, idx) => (
                        <motion.div
                            key={plan.id || `temp-${idx}`}
                            className="glass-card"
                            style={{
                                padding: '1.5rem',
                                border: '1px solid var(--border)',
                                borderLeft: `4px solid ${plan.isTemplate ? '#3b82f6' : 'var(--primary)'}`
                            }}
                            whileHover={{ y: -4 }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '12px',
                                        backgroundColor: plan.isTemplate ? 'rgba(59, 130, 246, 0.1)' : 'rgba(132, 204, 22, 0.1)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Dumbbell size={22} color={plan.isTemplate ? '#3b82f6' : 'var(--primary)'} />
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{plan.name}</h4>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>{plan.daysCount} Days Schedule</p>
                                    </div>
                                </div>
                                {plan.createdBy === user.id && (
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => { setEditingPlan(plan); setIsModalOpen(true); }} style={{ color: 'var(--muted-foreground)' }}><Edit2 size={16} /></button>
                                        <button onClick={() => { if (window.confirm('Delete this plan?')) deleteWorkoutPlan(plan.id) }} style={{ color: '#ef4444' }}><Trash2 size={16} /></button>
                                    </div>
                                )}
                            </div>

                            <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '1.25rem', height: '40px', overflow: 'hidden' }}>
                                {plan.description || `Custom workout plan created by ${plan.trainerName || 'Trainer'}`}
                            </p>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                {plan.code ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                        <Code size={14} color="var(--primary)" />
                                        <span style={{ fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '0.05em' }}>{plan.code}</span>
                                        <button onClick={() => handleCopyCode(plan.code)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '2px' }} title="Copy Code">
                                            <Copy size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 'bold' }}>DEFAULT TEMPLATE</span>
                                )}

                                {plan.isTemplate ? (
                                    <button className="btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }} onClick={() => handleUseTemplate(plan)}>
                                        Use Template
                                    </button>
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '600' }}>
                                        <Info size={14} /> Ready to Assign
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {displayedPlans.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted-foreground)' }}>
                        <ClipboardList size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                        <p>No workout plans found matching your search.</p>
                    </div>
                )}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <PlanBuilderModal
                        plan={editingPlan}
                        onSave={handleSavePlan}
                        onClose={() => { setIsModalOpen(false); setEditingPlan(null); }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyWorkoutPlans;
