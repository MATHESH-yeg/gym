import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useData } from '../../../context/DataContext';
import { Plus, X, Save, Trash2, Check, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CreatePlan = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { saveWorkoutPlan } = useData();
    const { planToEdit } = location.state || {};

    const [planName, setPlanName] = useState(planToEdit?.name || '');
    const [shortCode, setShortCode] = useState(planToEdit?.code || '');

    // Exercise Builder State
    const [exName, setExName] = useState('');
    const [sets, setSets] = useState([{ id: Date.now(), reps: 10, weight: 0, rest: 60 }]);

    // Final Composition
    const [exercises, setExercises] = useState(planToEdit?.exercises || []);

    const addSet = () => {
        setSets([...sets, { id: Date.now(), reps: 10, weight: 0, rest: 60 }]);
    };

    const updateSet = (id, field, value) => {
        setSets(sets.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const removeSet = (id) => {
        if (sets.length > 1) {
            setSets(sets.filter(s => s.id !== id));
        }
    };

    const addExerciseToPlan = () => {
        if (!exName.trim()) {
            alert('Please enter an exercise name');
            return;
        }
        const newEx = {
            id: 'EX_' + Date.now(),
            name: exName,
            sets: sets.map(s => ({
                id: 'SET_' + Math.random().toString(36).substr(2, 9),
                reps: parseInt(s.reps) || 0,
                weight: parseFloat(s.weight) || 0,
                restTime: parseInt(s.rest) || 60
            }))
        };
        setExercises([...exercises, newEx]);
        // Reset builder
        setExName('');
        setSets([{ id: Date.now(), reps: 10, weight: 0, rest: 60 }]);
    };

    const handleSavePlan = () => {
        if (!planName.trim() || !shortCode.trim()) {
            alert('Please fill in Plan Name and Short Code');
            return;
        }
        if (exercises.length === 0) {
            alert('Please add at least one exercise to the plan');
            return;
        }

        const newPlan = {
            id: planToEdit?.id,
            name: planName,
            code: shortCode.toUpperCase(),
            exercises: exercises,
            totalDays: 1, // Defaulting to 1 for this simple builder
            type: 'single_day'
        };

        saveWorkoutPlan(newPlan);
        navigate('/member/workout-plans');
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', paddingBottom: '100px' }}>
            {/* Header with Back Button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate('/member/workout-plans')}
                    className="btn-icon"
                    style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer' }}
                >
                    <ArrowLeft size={28} />
                </button>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '900', margin: 0 }}>
                    {planToEdit ? 'Edit Plan' : 'Create Plan'}
                </h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div>
                    <label style={{ color: '#BEFF00', fontWeight: '900', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>PLAN NAME</label>
                    <input
                        className="input-field"
                        placeholder="e.g. Upper Body Focus"
                        value={planName}
                        onChange={(e) => setPlanName(e.target.value)}
                    />
                </div>
                <div>
                    <label style={{ color: '#BEFF00', fontWeight: '900', fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>SHORT CODE</label>
                    <input
                        className="input-field"
                        placeholder="e.g. 01"
                        value={shortCode}
                        onChange={(e) => setShortCode(e.target.value)}
                    />
                </div>
            </div>

            {/* Design Exercise Section */}
            <div className="premium-card" style={{ padding: '2rem', border: '1px solid var(--border)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <h3 style={{ color: '#BEFF00', fontWeight: '900', fontSize: '1rem', marginBottom: '1.5rem' }}>DESIGN EXERCISE</h3>

                <div style={{ marginBottom: '1.5rem' }}>
                    <input
                        className="input-field"
                        placeholder="Exercise Name"
                        value={exName}
                        onChange={(e) => setExName(e.target.value)}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                    {sets.map((set, index) => (
                        <div key={set.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <span style={{ fontWeight: '900', color: 'var(--muted-foreground)', width: '20px' }}>#{index + 1}</span>
                            <div style={{ flex: 1 }}>
                                <input
                                    type="number"
                                    className="input-field"
                                    style={{ textAlign: 'center' }}
                                    value={set.reps}
                                    onChange={(e) => updateSet(set.id, 'reps', e.target.value)}
                                    placeholder="Reps"
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <input
                                    type="number"
                                    className="input-field"
                                    style={{ textAlign: 'center' }}
                                    value={set.weight}
                                    onChange={(e) => updateSet(set.id, 'weight', e.target.value)}
                                    placeholder="Weight"
                                />
                            </div>
                            <div style={{ flex: 1 }}>
                                <input
                                    type="number"
                                    className="input-field"
                                    style={{ textAlign: 'center' }}
                                    value={set.rest}
                                    onChange={(e) => updateSet(set.id, 'rest', e.target.value)}
                                    placeholder="Rest (s)"
                                />
                            </div>
                            <button onClick={() => removeSet(set.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    onClick={addSet}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: 'white',
                        fontWeight: '800',
                        cursor: 'pointer',
                        marginBottom: '1rem'
                    }}
                >
                    + Add Set
                </button>

                <button
                    onClick={addExerciseToPlan}
                    className="btn-primary"
                    style={{
                        width: '100%',
                        padding: '1rem',
                        backgroundColor: '#BEFF00',
                        color: 'black',
                        fontWeight: '950',
                        borderRadius: '12px',
                        fontSize: '1rem'
                    }}
                >
                    <Plus size={20} /> Add Exercise to Plan
                </button>
            </div>

            {/* Routine Composition Section */}
            <div style={{ marginTop: '3rem' }}>
                <h3 style={{ fontSize: '0.8rem', fontWeight: '900', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>ROUTINE COMPOSITION</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {exercises.length === 0 && <p style={{ color: 'var(--muted-foreground)', fontStyle: 'italic' }}>No exercises added yet.</p>}
                    {exercises.map((ex, idx) => (
                        <div key={ex.id} style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span style={{ color: '#BEFF00', fontWeight: '900', marginRight: '1rem' }}>{idx + 1}</span>
                                <span style={{ fontWeight: '800' }}>{ex.name}</span>
                                <span style={{ color: 'var(--muted-foreground)', fontSize: '0.8rem', marginLeft: '1rem' }}>{ex.sets.length} Sets</span>
                            </div>
                            <button onClick={() => setExercises(exercises.filter(e => e.id !== ex.id))} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Buttons */}
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '4rem' }}>
                <button
                    className="btn-outline"
                    style={{ flex: 1, padding: '1.25rem', borderRadius: '16px', fontWeight: '900', fontSize: '1rem' }}
                    onClick={() => navigate('/member/workout-plans')}
                >
                    Cancel
                </button>
                <button
                    className="btn-primary"
                    style={{ flex: 1, padding: '1.25rem', borderRadius: '16px', backgroundColor: '#BEFF00', color: 'black', fontWeight: '950', fontSize: '1rem' }}
                    onClick={handleSavePlan}
                >
                    Save Plan
                </button>
            </div>
        </div>
    );
};

export default CreatePlan;
