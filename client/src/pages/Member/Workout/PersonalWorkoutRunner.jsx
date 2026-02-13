import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../../context/DataContext';
import { useAuth } from '../../../context/AuthContext';
import {
    ChevronLeft, Play, Pause, CheckCircle2,
    MessageSquare, Timer, ChevronRight, X, Trophy,
    LogOut, Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PersonalWorkoutRunner = () => {
    const { planId } = useParams();
    const navigate = useNavigate();
    const {
        workoutPlans, activeWorkout, startWorkout,
        updateActiveWorkout, finishWorkout, cancelActiveWorkout
    } = useData();
    const { user } = useAuth();

    // 1. Initialize session if not active
    useEffect(() => {
        if (!activeWorkout || activeWorkout.routineId !== planId || activeWorkout.source !== 'PERSONAL') {
            const plan = workoutPlans.find(p => p.id === planId);
            if (plan) {
                // Wrap it with PERSONAL source
                startWorkout({ ...plan, source: 'PERSONAL' });
            } else {
                alert('Personal plan not found.');
                navigate('/member/workout-plans', { replace: true });
            }
        }
    }, [planId, workoutPlans, activeWorkout, startWorkout, navigate]);

    // 2. Local Session States
    const [sessionState, setSessionState] = useState('idle'); // idle, running, paused, completed
    const [elapsed, setElapsed] = useState(0);
    const [activeExerciseIdx, setActiveExerciseIdx] = useState(0);
    const [restTimer, setRestTimer] = useState({ active: false, remaining: 0, initial: 0 });
    const [showFinishModal, setShowFinishModal] = useState(false);
    const [summary, setSummary] = useState({ rating: 5, notes: '' });

    const timerRef = useRef(null);
    const restIntervalRef = useRef(null);

    // 3. Overall Timer
    useEffect(() => {
        if (activeWorkout && sessionState === 'running') {
            const startTime = activeWorkout.startTime || Date.now();
            timerRef.current = setInterval(() => {
                setElapsed(Math.floor((Date.now() - startTime) / 1000));
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [activeWorkout, sessionState]);

    // 4. Rest Timer Logic
    useEffect(() => {
        if (restTimer.active && restTimer.remaining > 0) {
            restIntervalRef.current = setInterval(() => {
                setRestTimer(prev => {
                    if (prev.remaining <= 1) {
                        clearInterval(restIntervalRef.current);
                        return { ...prev, active: false, remaining: 0 };
                    }
                    return { ...prev, remaining: prev.remaining - 1 };
                });
            }, 1000);
        }
        return () => clearInterval(restIntervalRef.current);
    }, [restTimer.active]);

    if (!activeWorkout || activeWorkout.routineId !== planId || activeWorkout.source !== 'PERSONAL') {
        return <div className="loading-screen">Loading Your Plan...</div>;
    }

    const currentEx = activeWorkout?.exercises?.[activeExerciseIdx];

    if (!currentEx) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                <h2>No exercises in this plan</h2>
                <button onClick={() => navigate('/member/workout-plans')} className="btn-primary" style={{ marginTop: '1rem' }}>Go Back</button>
            </div>
        );
    }

    const totalExercises = activeWorkout.exercises.length;
    const progressPercent = (activeWorkout.exercises.filter(ex => ex.sets.every(s => s.completed)).length / totalExercises) * 100;

    const handleBack = () => {
        if (sessionState !== 'idle' && !window.confirm('Exit personal session?')) {
            return;
        }
        cancelActiveWorkout();
        navigate('/member/workout-plans', { replace: true });
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleToggleSet = (exIdx, setIdx) => {
        const updated = { ...activeWorkout };
        const set = updated.exercises[exIdx].sets[setIdx];
        set.completed = !set.completed;

        if (set.completed) {
            const restValue = parseInt(set.restTime) || 60;
            setRestTimer({ active: true, remaining: restValue, initial: restValue });
        }
        updateActiveWorkout(updated);
    };

    const handleUpdateSet = (exIdx, setIdx, field, value) => {
        const updated = { ...activeWorkout };
        updated.exercises[exIdx].sets[setIdx][field] = parseInt(value) || 0;
        updateActiveWorkout(updated);
    };

    const handleStartWorkout = () => {
        if (!activeWorkout.startTime) {
            const updated = { ...activeWorkout, startTime: Date.now() };
            updateActiveWorkout(updated);
        }
        setSessionState('running');
    };

    const handleComplete = () => {
        setSessionState('paused');
        const totalVol = activeWorkout.exercises.reduce((v, ex) => {
            return v + ex.sets.reduce((sv, s) => s.completed ? sv + (s.actualWeight * s.actualReps) : sv, 0);
        }, 0);

        setShowFinishModal(true);
        setSummary(prev => ({ ...prev, totalVolume: totalVol }));
    };

    const finishFinal = () => {
        setSessionState('completed');
        finishWorkout(activeWorkout, {
            totalVolume: summary.totalVolume,
            feelingRating: summary.rating,
            overallNotes: summary.notes,
            source: 'PERSONAL'
        });
        navigate('/member/records', { replace: true });
    };

    const handleAddSet = () => {
        const updated = { ...activeWorkout };
        const lastSet = currentEx.sets[currentEx.sets.length - 1] || { reps: 12, weight: 10, restTime: 60 };
        updated.exercises[activeExerciseIdx].sets.push({
            id: 'SET_' + Date.now(),
            actualReps: lastSet.actualReps || lastSet.reps,
            actualWeight: lastSet.actualWeight || lastSet.weight,
            restTime: lastSet.restTime,
            completed: false
        });
        updateActiveWorkout(updated);
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '120px' }}>
            <header style={{
                position: 'sticky', top: 0, zIndex: 100,
                backgroundColor: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(16px)',
                padding: '1rem', borderBottom: '1px solid var(--border)',
                display: 'flex', flexDirection: 'column', gap: '1rem'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <button onClick={handleBack} className="btn-icon" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)' }}>
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: '900', margin: 0 }}>{activeWorkout.name}</h2>
                            <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--muted-foreground)' }}>PERSONAL PLAN</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', borderRadius: '20px', backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)' }}>
                            <Timer size={14} color="#BEFF00" />
                            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>{formatTime(elapsed)}</span>
                        </div>
                    </div>
                </div>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '0.4rem', fontWeight: '700', color: 'var(--muted-foreground)' }}>
                        <span>Exercise {activeExerciseIdx + 1} of {totalExercises}</span>
                        <span style={{ color: '#BEFF00' }}>{Math.round(progressPercent)}% DONE</span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', height: '3px', width: '100%' }}>
                        {activeWorkout.exercises.map((_, idx) => (
                            <div key={idx} style={{ flex: 1, backgroundColor: idx < activeExerciseIdx ? '#BEFF00' : idx === activeExerciseIdx ? '#fff' : 'rgba(255,255,255,0.1)', borderRadius: '2px' }} />
                        ))}
                    </div>
                </div>
            </header>

            <main style={{ marginTop: '2.5rem' }}>
                <AnimatePresence mode="wait">
                    <motion.div key={activeExerciseIdx} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                        <div className="premium-card">
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1.75rem', fontWeight: '900' }}>{currentEx.name}</h3>
                                <p style={{ color: 'var(--muted-foreground)' }}>Personal Session Log</p>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {currentEx.sets.map((set, sIdx) => (
                                    <div key={set.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr 50px', alignItems: 'center', gap: '1rem', padding: '0.75rem', backgroundColor: set.completed ? 'rgba(190, 255, 0, 0.05)' : 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                        <div style={{ fontWeight: '800', textAlign: 'center' }}>{sIdx + 1}</div>
                                        <input type="number" className="input-field" style={{ textAlign: 'center' }} value={set.actualWeight} onChange={(e) => handleUpdateSet(activeExerciseIdx, sIdx, 'actualWeight', e.target.value)} placeholder="0 kg" />
                                        <input type="number" className="input-field" style={{ textAlign: 'center' }} value={set.actualReps} onChange={(e) => handleUpdateSet(activeExerciseIdx, sIdx, 'actualReps', e.target.value)} placeholder="0 reps" />
                                        <div style={{ textAlign: 'center' }}>{set.restTime}s</div>
                                        <button onClick={() => handleToggleSet(activeExerciseIdx, sIdx)} style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: set.completed ? '#BEFF00' : 'rgba(255,255,255,0.1)', cursor: 'pointer', border: 'none' }}>
                                            {set.completed && <CheckCircle2 size={20} color="black" />}
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <button onClick={handleAddSet} className="btn-outline" style={{ width: '100%', marginTop: '1.5rem', border: '1px dashed var(--border)' }}>+ ADD SET</button>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>

            <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '600px', display: 'flex', gap: '1rem', zIndex: 200 }}>
                <button onClick={() => setActiveExerciseIdx(Math.max(0, activeExerciseIdx - 1))} disabled={activeExerciseIdx === 0} className="btn-outline" style={{ width: '60px' }}><ChevronLeft size={24} /></button>
                <button onClick={sessionState === 'idle' ? handleStartWorkout : (activeExerciseIdx === totalExercises - 1 ? handleComplete : () => setActiveExerciseIdx(activeExerciseIdx + 1))} className="btn-primary" style={{ flex: 1, padding: '1.25rem' }}>
                    {sessionState === 'idle' ? 'START WORKOUT' : (activeExerciseIdx === totalExercises - 1 ? 'COMPLETE LOG' : 'NEXT EXERCISE')}
                </button>
                {sessionState === 'idle' && <button onClick={() => setActiveExerciseIdx(Math.min(totalExercises - 1, activeExerciseIdx + 1))} disabled={activeExerciseIdx === totalExercises - 1} className="btn-outline" style={{ width: '60px' }}><ChevronRight size={24} /></button>}
            </div>

            <AnimatePresence>
                {restTimer.active && (
                    <motion.div initial={{ y: 100 }} animate={{ y: 0 }} style={{ position: 'fixed', bottom: '8rem', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#BEFF00', color: 'black', padding: '1rem 2rem', borderRadius: '50px', zIndex: 300 }}>
                        <span>RESTING: {formatTime(restTimer.remaining)}</span>
                        <button onClick={() => setRestTimer({ ...restTimer, active: false })} style={{ background: 'none', border: 'none', marginLeft: '1rem' }}><X size={20} /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showFinishModal && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                        <motion.div initial={{ scale: 0.9 }} className="premium-card">
                            <h2 style={{ textAlign: 'center', marginBottom: '2rem' }}>WELL DONE! SESSION RECORDED.</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                                <div className="glass-card" style={{ padding: '1rem' }}><p>DURATION</p><h4>{formatTime(elapsed)}</h4></div>
                                <div className="glass-card" style={{ padding: '1rem' }}><p>VOL</p><h4>{summary.totalVolume} KG</h4></div>
                            </div>
                            <textarea className="input-field" style={{ minHeight: '100px', marginBottom: '1.5rem' }} placeholder="Notes on today's session..." value={summary.notes} onChange={e => setSummary({ ...summary, notes: e.target.value })} />
                            <button onClick={finishFinal} className="btn-primary" style={{ width: '100%', padding: '1.25rem' }}>SAVE TO PROGRESS</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default PersonalWorkoutRunner;
