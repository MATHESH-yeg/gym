import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../../context/DataContext';
import { useAuth } from '../../../context/AuthContext';
import {
    ChevronLeft, Play, Pause, CheckCircle2,
    MessageSquare, Timer, ChevronRight, X, Trophy,
    LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AssignedWorkoutRunner = () => {
    const navigate = useNavigate();
    const {
        todaysWorkout, activeWorkout, startWorkout,
        updateActiveWorkout, finishWorkout, cancelActiveWorkout
    } = useData();
    const { user } = useAuth();

    // 1. Initialize session if not active
    useEffect(() => {
        const hasData = todaysWorkout?.id || todaysWorkout?.code;
        if (!activeWorkout || activeWorkout.source !== 'ASSIGNED') {
            if (hasData) {
                startWorkout({ ...todaysWorkout, source: 'ASSIGNED' });
            } else {
                // If we are here and have no data, we might be loading or genuinely have nothing
                // But don't alert yet to avoid annoying the user while things hydrate
            }
        }
    }, [todaysWorkout, activeWorkout, startWorkout]);

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

    const hasData = todaysWorkout?.id || todaysWorkout?.code;

    if (!activeWorkout || activeWorkout.source !== 'ASSIGNED') {
        if (!hasData) return <div className="loading-screen">No assigned workout data found. Please check your code.</div>;
        return <div className="loading-screen">Preparing Assigned Session...</div>;
    }

    const currentEx = activeWorkout?.exercises?.[activeExerciseIdx];

    if (!currentEx) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                <h2>No exercises found in assigned workout</h2>
                <button onClick={() => navigate('/member/workout')} className="btn-primary" style={{ marginTop: '1rem' }}>Go Back</button>
            </div>
        );
    }

    const totalExercises = activeWorkout.exercises.length;
    const progressPercent = (activeWorkout.exercises.filter(ex => ex.sets.every(s => s.completed)).length / totalExercises) * 100;

    const handleBack = () => {
        if (sessionState !== 'idle' && !window.confirm('Exit assigned workout? Progress will be lost.')) {
            return;
        }
        cancelActiveWorkout();
        navigate('/member/workout', { replace: true });
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
            source: 'ASSIGNED'
        });
        navigate('/member/records', { replace: true });
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
                            <h2 style={{ fontSize: '1rem', fontWeight: '900', textTransform: 'uppercase', color: 'var(--primary)' }}>TRAINER ASSIGNED</h2>
                            <p style={{ fontSize: '1.2rem', fontWeight: '900', margin: 0 }}>{activeWorkout.name || activeWorkout.routineName}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem', borderRadius: '20px', backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid var(--border)' }}>
                            <Timer size={14} color="#BEFF00" />
                            <span style={{ fontSize: '0.9rem', fontWeight: '700', color: '#fff' }}>{formatTime(elapsed)}</span>
                        </div>
                        <button onClick={handleBack} style={{ color: '#ef4444', border: 'none', background: 'none' }}><LogOut size={18} /></button>
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
                        <div className="premium-card" style={{ padding: '0', overflow: 'hidden' }}>
                            <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
                                <h3 style={{ fontSize: '1.75rem', fontWeight: '900', marginBottom: '1rem' }}>{currentEx.name}</h3>
                                <div style={{ display: 'flex', gap: '1.5rem' }}>
                                    <div>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', display: 'block' }}>SETS</span>
                                        <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#BEFF00' }}>{currentEx.sets.length}</span>
                                    </div>
                                    <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--border)' }} />
                                    <div>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', display: 'block' }}>TARGET</span>
                                        <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>{currentEx.sets[0]?.reps || '8-12'} REPS</span>
                                    </div>
                                </div>
                            </div>

                            <div style={{ padding: '1.5rem 1rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr 50px', gap: '1rem', padding: '0 0.5rem', marginBottom: '1rem', color: 'var(--muted-foreground)', fontSize: '0.7rem', fontWeight: '800' }}>
                                    <span style={{ textAlign: 'center' }}>#</span>
                                    <span style={{ textAlign: 'center' }}>KG</span>
                                    <span style={{ textAlign: 'center' }}>REPS</span>
                                    <span style={{ textAlign: 'center' }}>REST</span>
                                    <span style={{ textAlign: 'center' }}>LOG</span>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {currentEx.sets.map((set, sIdx) => (
                                        <div key={set.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr 1fr 50px', alignItems: 'center', gap: '1rem', padding: '0.75rem 0.5rem', backgroundColor: set.completed ? 'rgba(190, 255, 0, 0.05)' : 'rgba(255,255,255,0.02)', borderRadius: '12px', border: set.completed ? '1px solid rgba(190, 255, 0, 0.3)' : '1px solid transparent' }}>
                                            <div style={{ fontWeight: '800', fontSize: '0.8rem', textAlign: 'center', color: set.completed ? '#BEFF00' : 'var(--muted-foreground)', backgroundColor: 'rgba(255,255,255,0.05)', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{sIdx + 1}</div>
                                            <input type="number" className="input-field" style={{ textAlign: 'center', border: 'none', background: 'transparent', borderBottom: '1px solid var(--border)', padding: '0.25rem' }} value={set.actualWeight} onChange={(e) => handleUpdateSet(activeExerciseIdx, sIdx, 'actualWeight', e.target.value)} placeholder={set.weight || '0'} />
                                            <input type="number" className="input-field" style={{ textAlign: 'center', border: 'none', background: 'transparent', borderBottom: '1px solid var(--border)', padding: '0.25rem' }} value={set.actualReps} onChange={(e) => handleUpdateSet(activeExerciseIdx, sIdx, 'actualReps', e.target.value)} placeholder={set.reps || '0'} />
                                            <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--muted-foreground)' }}>{set.restTime}s</div>
                                            <button onClick={() => handleToggleSet(activeExerciseIdx, sIdx)} style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: set.completed ? '#BEFF00' : 'rgba(255,255,255,0.1)', cursor: 'pointer', border: 'none' }}>
                                                {set.completed && <CheckCircle2 size={20} color="black" />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>

            <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '600px', display: 'flex', gap: '1rem', zIndex: 200 }}>
                <button onClick={() => setActiveExerciseIdx(Math.max(0, activeExerciseIdx - 1))} disabled={activeExerciseIdx === 0} className="btn-outline" style={{ width: '60px', opacity: activeExerciseIdx === 0 ? 0.3 : 1 }}><ChevronLeft size={24} /></button>
                <button onClick={sessionState === 'idle' ? handleStartWorkout : (activeExerciseIdx === totalExercises - 1 ? handleComplete : () => setActiveExerciseIdx(activeExerciseIdx + 1))} className="btn-primary" style={{ flex: 1, padding: '1.25rem', fontSize: '1.1rem' }}>
                    {sessionState === 'idle' ? 'START ASSIGNED WORKOUT' : (activeExerciseIdx === totalExercises - 1 ? 'FINISH WORKOUT' : 'NEXT EXERCISE')}
                </button>
                {sessionState === 'idle' && <button onClick={() => setActiveExerciseIdx(Math.min(totalExercises - 1, activeExerciseIdx + 1))} disabled={activeExerciseIdx === totalExercises - 1} className="btn-outline" style={{ width: '60px', opacity: activeExerciseIdx === totalExercises - 1 ? 0.3 : 1 }}><ChevronRight size={24} /></button>}
            </div>

            <AnimatePresence>
                {restTimer.active && (
                    <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} style={{ position: 'fixed', bottom: '8rem', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#BEFF00', color: 'black', padding: '1rem 2rem', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '1.5rem', fontWeight: '950', zIndex: 300 }}>
                        <Timer size={24} /> <span>RESTING: {formatTime(restTimer.remaining)}</span>
                        <button onClick={() => setRestTimer({ ...restTimer, active: false })} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={20} /></button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Finish Summary Modal */}
            <AnimatePresence>
                {showFinishModal && (
                    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="premium-card" style={{ maxWidth: '500px', width: '100%' }}>
                            <div style={{ textAlign: 'center', marginBottom: '2rem' }}><Trophy size={60} color="#BEFF00" style={{ marginBottom: '1rem' }} /><h2 style={{ fontSize: '2rem', fontWeight: '950' }}>ASSIGNED WORKOUT COMPLETE</h2></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                                <div className="glass-card" style={{ padding: '1rem' }}><p style={{ fontSize: '0.7rem' }}>DURATION</p><h4>{formatTime(elapsed)}</h4></div>
                                <div className="glass-card" style={{ padding: '1rem' }}><p style={{ fontSize: '0.7rem' }}>VOLUME</p><h4>{summary.totalVolume} KG</h4></div>
                            </div>
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '700', display: 'block', marginBottom: '0.5rem' }}>FEEDBACK FOR TRAINER</label>
                                <textarea className="input-field" style={{ minHeight: '100px' }} placeholder="Let your trainer know how it went..." value={summary.notes} onChange={e => setSummary({ ...summary, notes: e.target.value })} />
                            </div>
                            <button onClick={finishFinal} className="btn-primary" style={{ width: '100%', padding: '1.25rem' }}>SUBMIT TO TRAINER</button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AssignedWorkoutRunner;
