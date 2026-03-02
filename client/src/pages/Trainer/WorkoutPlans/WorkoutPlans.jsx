import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { Plus, Search, Dumbbell, Edit, Trash2, Target, X, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TrainerWorkoutPlans = () => {
    const { user } = useAuth();
    const { members, assignWorkout, workoutPlans } = useData();

    // UI State
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMember, setSelectedMember] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
    const [workoutCode, setWorkoutCode] = useState('');

    // Routine Builder State
    const [routineBuilder, setRoutineBuilder] = useState({
        planName: 'New Workout Schedule',
        daysCount: 4,
        schedule: Array(4).fill().map((_, i) => ({ day: i + 1, focus: '', exercises: [] }))
    });
    const [dayExerciseInputs, setDayExerciseInputs] = useState({});

    const assignedMembers = members.filter(m => m.trainerId === user.id);
    const filteredMembers = assignedMembers.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
        if (!inputs.name) return;

        const newSchedule = [...routineBuilder.schedule];
        newSchedule[dayIdx].exercises.push({ ...inputs, id: 'EX_' + Date.now() + Math.random() });
        setRoutineBuilder({ ...routineBuilder, schedule: newSchedule });

        setDayExerciseInputs({
            ...dayExerciseInputs,
            [dayIdx]: { name: '', sets: 3, reps: 10, weight: '' }
        });
    };

    const handleAssign = () => {
        if (!selectedMember || !routineBuilder.planName) return;
        const hasExercises = routineBuilder.schedule.some(d => d.exercises.length > 0);
        if (!hasExercises) {
            alert('Please add at least one exercise to the routine.');
            return;
        }

        const code = 'TRN-' + Math.random().toString(36).substring(2, 6).toUpperCase();
        assignWorkout(selectedMember.id, {
            name: routineBuilder.planName,
            code,
            schedule: routineBuilder.schedule,
            assignedBy: user.id,
            date: new Date().toISOString()
        });

        setIsModalOpen(false);
        alert(`Workout schedule assigned to ${selectedMember.name}`);
    };

    const handleAssignByCode = () => {
        if (!selectedMember || !workoutCode) return;
        const plan = workoutPlans.find(p => p.code === workoutCode.toUpperCase());
        if (!plan) return alert('Invalid workout code. Please check and try again.');

        assignWorkout(selectedMember.id, {
            name: plan.name,
            code: plan.code,
            schedule: plan.schedule,
            assignedBy: user.id,
            date: new Date().toISOString()
        });

        setIsCodeModalOpen(false);
        setWorkoutCode('');
        alert(`Workout '${plan.name}' assigned to ${selectedMember.name}`);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '900' }}>Member Workout Plans</h1>
                    <p style={{ color: 'var(--muted-foreground)' }}>Create and assign personalized workout schedules for your members</p>
                </div>
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} size={18} />
                    <input
                        className="input-field"
                        style={{ paddingLeft: '2.5rem' }}
                        placeholder="Search members..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="premium-card" style={{ padding: '0', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                        <tr>
                            <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>Member</th>
                            <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>Current Schedule</th>
                            <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem' }}>Plan Code</th>
                            <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.875rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.length === 0 ? (
                            <tr>
                                <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>No members found.</td>
                            </tr>
                        ) : (
                            filteredMembers.map(member => (
                                <tr key={member.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        <p style={{ fontWeight: '600' }}>{member.name}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{member.id}</p>
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem' }}>
                                        {member.assignedProgram ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Dumbbell size={14} color="var(--primary)" />
                                                {member.assignedProgram.name}
                                            </div>
                                        ) : (
                                            <span style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>No schedule assigned</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--primary)' }}>
                                        {member.assignedProgram?.code || '-'}
                                    </td>
                                    <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                            <button
                                                className="btn-outline"
                                                style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                                                onClick={() => {
                                                    setSelectedMember(member);
                                                    setIsCodeModalOpen(true);
                                                }}
                                            >
                                                <Code size={14} /> Assign Code
                                            </button>
                                            <button
                                                className="btn-primary"
                                                style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                                                onClick={() => {
                                                    setSelectedMember(member);
                                                    if (member.assignedProgram && member.assignedProgram.schedule) {
                                                        setRoutineBuilder({
                                                            planName: member.assignedProgram.name,
                                                            daysCount: member.assignedProgram.schedule.length,
                                                            schedule: member.assignedProgram.schedule
                                                        });
                                                    } else {
                                                        setRoutineBuilder({
                                                            planName: 'New Workout Schedule',
                                                            daysCount: 4,
                                                            schedule: Array(4).fill().map((_, i) => ({ day: i + 1, focus: '', exercises: [] }))
                                                        });
                                                    }
                                                    setIsModalOpen(true);
                                                }}
                                            >
                                                <Plus size={14} /> {member.assignedProgram ? 'Update Schedule' : 'Assign Schedule'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {isCodeModalOpen && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="premium-card" style={{ width: '100%', maxWidth: '400px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0 }}>Assign Workout via Code</h3>
                                <button onClick={() => setIsCodeModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Entering a unique plan code will automatically assign that program to <strong>{selectedMember?.name}</strong>.</p>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Plan Code</label>
                                    <input
                                        className="input-field"
                                        style={{ textAlign: 'center', fontSize: '1.25rem', letterSpacing: '0.1em', fontWeight: 'bold' }}
                                        placeholder="PLN-XXXX"
                                        value={workoutCode}
                                        onChange={e => setWorkoutCode(e.target.value.toUpperCase())}
                                        autoFocus
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                    <button className="btn-outline" style={{ flex: 1 }} onClick={() => setIsCodeModalOpen(false)}>Cancel</button>
                                    <button className="btn-primary" style={{ flex: 1 }} onClick={handleAssignByCode}>Assign</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                {isModalOpen && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="premium-card" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ margin: 0 }}>Workout Builder for {selectedMember?.name}</h3>
                                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer' }}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Plan Name</label>
                                        <input className="input-field" value={routineBuilder.planName} onChange={e => setRoutineBuilder({ ...routineBuilder, planName: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Weekly Days</label>
                                        <select className="input-field" value={routineBuilder.daysCount} onChange={e => updateDaysCount(e.target.value)}>
                                            {[1, 2, 3, 4, 5, 6, 7].map(n => <option key={n} value={n}>{n} Days</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div style={{ backgroundColor: 'rgba(132, 204, 22, 0.05)', padding: '1rem', borderRadius: '12px', border: '1px dashed var(--primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary)' }}>Quick Load via Code</h4>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Instantly fill this builder using a workout plan code.</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            className="input-field"
                                            style={{ width: '120px', padding: '0.4rem', textAlign: 'center', fontSize: '0.8rem' }}
                                            placeholder="PLN-XXXX"
                                            value={workoutCode}
                                            onChange={e => setWorkoutCode(e.target.value.toUpperCase())}
                                        />
                                        <button
                                            className="btn-primary"
                                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                                            onClick={() => {
                                                const plan = workoutPlans.find(p => p.code === workoutCode.toUpperCase());
                                                if (!plan) return alert('Invalid code');
                                                setRoutineBuilder({
                                                    planName: plan.name,
                                                    daysCount: plan.schedule.length,
                                                    schedule: plan.schedule
                                                });
                                                setWorkoutCode('');
                                                alert(`Plan '${plan.name}' loaded!`);
                                            }}
                                        >
                                            Load
                                        </button>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    {routineBuilder.schedule.map((day, dayIdx) => (
                                        <div key={dayIdx} className="glass-card" style={{ padding: '1.25rem', border: '1px solid var(--border)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                <h4 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary)', textTransform: 'uppercase' }}>Day {day.day} Configuration</h4>
                                                <input
                                                    className="input-field"
                                                    style={{ width: '200px', padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                                                    placeholder="Day Focus (e.g. Chest)"
                                                    value={day.focus}
                                                    onChange={e => {
                                                        const next = [...routineBuilder.schedule];
                                                        next[dayIdx].focus = e.target.value;
                                                        setRoutineBuilder({ ...routineBuilder, schedule: next });
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
                                                                            const next = [...routineBuilder.schedule];
                                                                            next[dayIdx].exercises.splice(exIdx, 1);
                                                                            setRoutineBuilder({ ...routineBuilder, schedule: next });
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

                                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', position: 'sticky', bottom: 0, background: 'var(--surface)', padding: '1rem 0', borderTop: '1px solid var(--border)' }}>
                                    <button className="btn-outline" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                    <button className="btn-primary" style={{ flex: 1 }} onClick={handleAssign}>Assign Workout Schedule</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TrainerWorkoutPlans;
