import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play, Hash, Info, Target, Calendar, Dumbbell, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GlowingBubbles from '../../../components/effects/GlowingBubbles';

const TodayWorkout = () => {
    const { user } = useAuth();
    const { workoutPlans, activeWorkout, startWorkout, attendance } = useData();
    const navigate = useNavigate();
    const location = useLocation();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [foundPlan, setFoundPlan] = useState(null);

    // If navigated from Dashboard or Plans with a code
    useEffect(() => {
        if (location.state?.code) {
            const initialCode = location.state.code;
            setCode(initialCode);
            const plan = workoutPlans.find(p => p.code === initialCode.toUpperCase());
            if (plan) setFoundPlan(plan);
        }
    }, [location.state, workoutPlans]);

    // Removed aggressive auto-redirect to allow users to switch workouts
    // useEffect(() => {
    //     if (activeWorkout) {
    //         navigate(`/member/workout/execute/${activeWorkout.routineCode}`);
    //     }
    // }, [activeWorkout, navigate]);

    const handleCodeChange = (newCode) => {
        const upCode = newCode.toUpperCase();
        setCode(upCode);
        setError('');

        const plan = workoutPlans.find(p => p.code === upCode);
        if (plan) {
            setFoundPlan(plan);
        } else {
            setFoundPlan(null);
        }
    };

    const handleStartWorkout = (e) => {
        if (e) e.preventDefault();
        if (foundPlan) {
            // We set this as the assigned workout with appropriate source
            startWorkout({ ...foundPlan, source: 'ASSIGNED' });
            navigate(`/today/start`);
        } else {
            setError('Invalid Routine Code. Please check your Notebook.');
        }
    };

    return (
        <div style={{ position: 'relative', minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1rem', overflow: 'hidden' }}>
            <GlowingBubbles />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="premium-card"
                style={{
                    width: '100%',
                    maxWidth: '500px',
                    padding: '3.5rem 2.5rem',
                    border: '1px solid var(--border)',
                    background: 'linear-gradient(145deg, rgba(20,20,20,0.95), rgba(0,0,0,0.98))',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    textAlign: 'center'
                }}
            >
                {/* Icon Container */}
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '24px',
                    backgroundColor: 'rgba(190, 255, 0, 0.1)',
                    color: '#BEFF00',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 2rem auto',
                    border: '1px solid rgba(190, 255, 0, 0.15)'
                }}>
                    <Dumbbell size={40} strokeWidth={2.5} />
                </div>

                {/* Typography */}
                <h1 style={{ fontSize: '2.5rem', fontWeight: '950', letterSpacing: '-0.02em', marginBottom: '1rem', color: 'white' }}>FIND WORKOUT</h1>
                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2.5rem', padding: '0 1rem' }}>
                    Enter the unique code assigned by your trainer to access today's routine.
                </p>

                {/* Input Section */}
                <form onSubmit={handleStartWorkout}>
                    <div style={{ position: 'relative', marginBottom: '2rem' }}>
                        <input
                            autoFocus
                            type="text"
                            value={code}
                            onChange={(e) => handleCodeChange(e.target.value)}
                            placeholder="ENTER CODE"
                            className="input-field"
                            style={{
                                height: '80px',
                                fontSize: '1.75rem',
                                fontWeight: '900',
                                letterSpacing: '0.15em',
                                textAlign: 'center',
                                borderColor: foundPlan ? '#BEFF00' : 'var(--border)',
                                color: foundPlan ? '#BEFF00' : 'white',
                                textTransform: 'uppercase',
                                backgroundColor: 'rgba(255,255,255,0.02)',
                                borderRadius: '16px'
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1.5rem', fontWeight: '600' }}>
                            {error}
                        </div>
                    )}

                    {/* Reveal Exercise List if code is valid */}
                    <AnimatePresence>
                        {foundPlan && (() => {
                            let exercises = foundPlan.exercises || [];
                            let focus = '';

                            if (foundPlan.schedule && foundPlan.schedule.length > 0 && exercises.length === 0) {
                                const userAttendance = attendance[user.id] || [];
                                const dayIndex = userAttendance.length % foundPlan.schedule.length;
                                exercises = foundPlan.schedule[dayIndex].exercises || [];
                                focus = foundPlan.schedule[dayIndex].focus || `Day ${dayIndex + 1}`;
                            }

                            return (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    style={{ overflow: 'hidden', marginBottom: '2rem' }}
                                >
                                    <div style={{ textAlign: 'left', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                        <p style={{ color: '#BEFF00', fontWeight: '900', fontSize: '0.75rem', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                                            Previewing: {foundPlan.name} {focus ? `(${focus})` : ''}
                                        </p>
                                        {(exercises || []).slice(0, 3).map((ex, i) => (
                                            <div key={i} style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', marginBottom: '0.4rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.4rem' }}>
                                                {i + 1}. {ex.name}
                                            </div>
                                        ))}
                                        {exercises?.length > 3 && <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontStyle: 'italic' }}>+ {exercises.length - 3} more exercises</p>}
                                        {exercises?.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>No exercises listed for this day.</p>}
                                    </div>
                                </motion.div>
                            );
                        })()}
                    </AnimatePresence>

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{
                            width: '100%',
                            height: '65px',
                            backgroundColor: foundPlan ? '#BEFF00' : 'rgba(255,255,255,0.1)',
                            color: foundPlan ? 'black' : 'rgba(255,255,255,0.4)',
                            fontSize: '1.1rem',
                            fontWeight: '900',
                            letterSpacing: '0.05em',
                            transition: 'all 0.3s ease',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.75rem',
                            cursor: foundPlan ? 'pointer' : 'not-allowed'
                        }}
                    >
                        START WORKOUT <Play size={20} fill="black" />
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

export default TodayWorkout;
