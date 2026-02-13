import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../../context/DataContext';
import { Play, Plus, Trash2, Edit2, Dumbbell, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const WorkoutPlans = () => {
    const { workoutPlans, deleteWorkoutPlan, startWorkout } = useData();
    const navigate = useNavigate();

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this plan?')) {
            deleteWorkoutPlan(id);
        }
    };

    return (
        <div style={{ padding: '1rem', paddingBottom: '80px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-0.03em', marginBottom: '0.5rem' }}>Planning Notebook</h1>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '1rem' }}>Design routines for execution elsewhere</p>
                </div>
                <button
                    className="btn-primary"
                    style={{
                        backgroundColor: '#BEFF00',
                        color: 'black',
                        fontWeight: '800',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.9rem'
                    }}
                    onClick={() => navigate('/member/workout-plans/create')}
                >
                    <Plus size={18} strokeWidth={3} /> Create New Plan
                </button>
            </div>

            {/* Section Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ color: '#BEFF00' }}><Calendar size={20} /></div>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Your Personal Notebook</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>Manage routine structure and metadata here.</p>
                </div>
            </div>

            {/* Grid of Plans */}
            {workoutPlans.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', border: '1px dashed var(--border)', borderRadius: '16px', color: 'var(--muted-foreground)' }}>
                    <p>No plans found. Create your first routine!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
                    {workoutPlans.map((plan) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            whileHover={{ y: -5 }}
                            className="premium-card"
                            style={{
                                padding: '1.5rem',
                                border: '1px solid var(--border)',
                                background: 'linear-gradient(145deg, rgba(255,255,255,0.03), rgba(0,0,0,0.5))',
                                position: 'relative',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1.5rem',
                                borderLeft: '4px solid #BEFF00',
                                borderRadius: '16px',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Card Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>{plan.name}</h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <span style={{
                                            backgroundColor: 'rgba(190, 255, 0, 0.1)',
                                            color: '#BEFF00',
                                            fontSize: '0.7rem',
                                            fontWeight: '900',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '6px',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em'
                                        }}>
                                            CODE: {plan.code}
                                        </span>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                            <Dumbbell size={14} /> {plan.exercises?.length || 0} Exercises
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        className="btn-icon"
                                        style={{ color: 'var(--muted-foreground)', padding: '0.5rem', borderRadius: '50%', border: '1px solid var(--border)' }}
                                        onClick={() => navigate('/member/workout-plans/create', { state: { planToEdit: plan } })}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        className="btn-icon"
                                        style={{ color: '#ef4444', padding: '0.5rem', borderRadius: '50%', border: '1px solid rgba(239, 68, 68, 0.3)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                                        onClick={() => handleDelete(plan.id)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={() => {
                                    startWorkout({ ...plan, source: 'PERSONAL' });
                                    navigate(`/plans/${plan.id}/start`);
                                }}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '12px',
                                    border: 'none',
                                    backgroundColor: '#BEFF00',
                                    color: 'black',
                                    fontSize: '1rem',
                                    fontWeight: '900',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    transition: 'transform 0.2s',
                                    boxShadow: '0 5px 20px rgba(190, 255, 0, 0.2)'
                                }}
                            >
                                <Play size={18} fill="black" /> START WORKOUT
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WorkoutPlans;
