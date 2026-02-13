import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../../context/DataContext';
import { useNavigate } from 'react-router-dom';
import { Check, Trash2, Plus, Clock, Play, Pause, RotateCcw, XCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WorkoutSession = () => {
    const { activeWorkout, updateActiveWorkout, finishWorkout, cancelActiveWorkout, workoutRecords } = useData();
    const navigate = useNavigate();
    const [timerState, setTimerState] = useState({ active: false, remaining: 0, initial: 0 });
    const timerRef = useRef(null);

    // Redirect if no active workout
    useEffect(() => {
        if (!activeWorkout) {
            navigate('/member/workout');
        }
    }, [activeWorkout, navigate]);

    if (!activeWorkout) return null;

    const handleToggleSet = (exIdx, setIdx) => {
        const updated = { ...activeWorkout };
        const set = updated.exercises[exIdx].sets[setIdx];
        set.completed = !set.completed;

        if (set.completed && set.restTime > 0) {
            startTimer(set.restTime);
        }

        updateActiveWorkout(updated);
    };

    const handleUpdateSet = (exIdx, setIdx, field, val) => {
        const updated = { ...activeWorkout };
        updated.exercises[exIdx].sets[setIdx][field] = field === 'completed' ? val : parseFloat(val) || 0;
        updateActiveWorkout(updated);
    };

    const addSet = (exIdx) => {
        const updated = { ...activeWorkout };
        const lastSet = updated.exercises[exIdx].sets[updated.exercises[exIdx].sets.length - 1];
        updated.exercises[exIdx].sets.push({
            reps: lastSet?.reps || 10,
            weight: lastSet?.weight || 0,
            restTime: lastSet?.restTime || 60,
            completed: false
        });
        updateActiveWorkout(updated);
    };

    const removeSet = (exIdx, setIdx) => {
        const updated = { ...activeWorkout };
        updated.exercises[exIdx].sets.splice(setIdx, 1);
        updateActiveWorkout(updated);
    };

    const startTimer = (seconds) => {
        setTimerState({ active: true, remaining: seconds, initial: seconds });
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimerState(prev => {
                if (prev.remaining <= 1) {
                    clearInterval(timerRef.current);
                    return { ...prev, active: false, remaining: 0 };
                }
                return { ...prev, remaining: prev.remaining - 1 };
            });
        }, 1000);
    };

    const stopTimer = () => {
        clearInterval(timerRef.current);
        setTimerState({ active: false, remaining: 0, initial: 0 });
    };

    const handleFinish = () => {
        if (window.confirm("Finish workout and save to records?")) {
            finishWorkout(activeWorkout);
            navigate('/member/progress');
        }
    };

    const handleCancel = () => {
        if (window.confirm("Cancel workout? All progress will be lost.")) {
            cancelActiveWorkout();
            navigate('/member/workout');
        }
    };

    return (
        <div style={{ paddingBottom: '120px' }}>
            {/* Header */}
            <header style={{ marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span className="badge badge-primary">LIVE SESSION</span>
                            <h2 style={{ fontSize: '2rem', fontWeight: '900' }}>{activeWorkout.routineName}</h2>
                        </div>
                        <p style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
                            Started: {new Date(activeWorkout.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Routine {activeWorkout.routineCode}
                        </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>REST TIMER</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: timerState.active ? 'var(--primary)' : 'var(--muted-foreground)' }}>
                                {Math.floor(timerState.remaining / 60)}:{(timerState.remaining % 60).toString().padStart(2, '0')}
                            </div>
                            {timerState.active && (
                                <button onClick={stopTimer} style={{ color: '#ef4444' }}><RotateCcw size={20} /></button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Exercises */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                {activeWorkout.exercises.map((ex, exIdx) => {
                    // Find previous data for this exercise
                    // We look for the MOST RECENT record with the SAME routineCode
                    const lastRecord = workoutRecords
                        .filter(r => r.routineCode === activeWorkout.routineCode && r.date < activeWorkout.date)
                        .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

                    const prevExerciseData = lastRecord?.completedExercises.find(e => e.exerciseName === ex.name);

                    return (
                        <section key={exIdx} className="premium-card" style={{ padding: '0' }}>
                            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>{ex.name}</h3>
                                <button className="btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }} onClick={() => addSet(exIdx)}>+ ADD SET</button>
                            </div>

                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ textAlign: 'left', fontSize: '0.7rem', color: 'var(--muted-foreground)', textTransform: 'uppercase' }}>
                                            <th style={{ padding: '1rem 1.5rem', width: '80px' }}>SET</th>
                                            <th style={{ padding: '1rem', width: '120px' }}>PREVIOUS</th>
                                            <th style={{ padding: '1rem' }}>KG</th>
                                            <th style={{ padding: '1rem' }}>REPS</th>
                                            <th style={{ padding: '1rem 1.5rem', textAlign: 'center', width: '80px' }}>DONE</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ex.sets.map((s, sIdx) => {
                                            // Get previous set data if available
                                            const prevSet = prevExerciseData?.completedSets.find(ps => ps.setNumber === sIdx + 1);
                                            const prevText = prevSet ? `${prevSet.weight}kg x ${prevSet.reps}` : '-';

                                            return (
                                                <tr key={sIdx} style={{
                                                    borderTop: '1px solid var(--border)',
                                                    backgroundColor: s.completed ? 'rgba(132, 204, 22, 0.03)' : 'transparent',
                                                    transition: 'background-color 0.2s'
                                                }}>
                                                    <td style={{ padding: '1rem 1.5rem', fontWeight: '800' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            {sIdx + 1}
                                                            {!s.completed && <button onClick={() => removeSet(exIdx, sIdx)} style={{ color: 'rgba(239, 68, 68, 0.3)' }}><Trash2 size={12} /></button>}
                                                        </div>
                                                    </td>
                                                    <td style={{ padding: '1rem', color: 'var(--muted-foreground)', fontSize: '0.9rem', fontWeight: '600' }}>
                                                        {prevText}
                                                    </td>
                                                    <td style={{ padding: '0.75rem' }}>
                                                        <input
                                                            className="input-field"
                                                            type="number"
                                                            value={s.weight}
                                                            onChange={(e) => handleUpdateSet(exIdx, sIdx, 'weight', e.target.value)}
                                                            style={{ width: '100%', maxWidth: '80px', textAlign: 'center', fontWeight: '700' }}
                                                            disabled={s.completed}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '0.75rem' }}>
                                                        <input
                                                            className="input-field"
                                                            type="number"
                                                            value={s.reps}
                                                            onChange={(e) => handleUpdateSet(exIdx, sIdx, 'reps', e.target.value)}
                                                            style={{ width: '100%', maxWidth: '80px', textAlign: 'center', fontWeight: '700' }}
                                                            disabled={s.completed}
                                                        />
                                                    </td>
                                                    <td style={{ padding: '0.75rem 1.5rem', textAlign: 'center' }}>
                                                        <button
                                                            onClick={() => handleToggleSet(exIdx, sIdx)}
                                                            style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                borderRadius: '10px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                border: '1px solid var(--border)',
                                                                backgroundColor: s.completed ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                                                color: s.completed ? 'black' : 'var(--muted-foreground)',
                                                                transition: 'all 0.2s'
                                                            }}
                                                        >
                                                            <Check size={20} strokeWidth={3} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    );
                })}
            </div>

            {/* Bottom Controls */}
            <div style={{
                position: 'fixed', bottom: '2rem', left: '280px', right: '2rem',
                padding: '1.5rem 2rem', backgroundColor: 'rgba(18, 18, 20, 0.95)',
                backdropFilter: 'blur(10px)', border: '1px solid var(--border)',
                borderRadius: '20px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 100
            }}>
                <button
                    className="btn-outline"
                    style={{ borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                    onClick={handleCancel}
                >
                    <XCircle size={20} /> CANCEL WORKOUT
                </button>

                <button
                    className="btn-primary"
                    style={{ height: '56px', padding: '0 4rem', fontSize: '1.1rem', fontWeight: '900', boxShadow: '0 0 30px rgba(132, 204, 22, 0.2)' }}
                    onClick={handleFinish}
                >
                    <CheckCircle2 size={24} /> FINISH WORKOUT
                </button>

                <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>
                    <p>Tracked</p>
                    <p style={{ fontWeight: '900', color: 'white' }}>
                        {activeWorkout.exercises.reduce((sum, ex) => sum + ex.sets.filter(s => s.completed).length, 0)} / {activeWorkout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0)} SETS
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WorkoutSession;
