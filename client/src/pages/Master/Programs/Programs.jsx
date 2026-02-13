import React, { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { Plus, Dumbbell, ChevronRight, Edit2, Trash2, Layout, X } from 'lucide-react';
import { motion } from 'framer-motion';

const ManageProgram = ({ program, onUpdateProgram, onClose }) => {
    const [editingExercise, setEditingExercise] = useState(null);
    const [newExercise, setNewExercise] = useState({ name: '', muscle: 'Full Body', sets: 3, reps: '10', weight: '', rest: '60s', instructions: '' });

    const handleSaveExercise = () => {
        if (!program.id) {
            alert('Error: Program ID is missing. Cannot save.');
            return;
        }
        if (!newExercise.name) {
            alert('Please enter an exercise name.');
            return;
        }

        console.log('Saving exercise to program:', program.id);

        let updatedExercises;
        if (editingExercise) {
            updatedExercises = program.exercises.map(ex => ex.id === editingExercise.id ? { ...newExercise, id: editingExercise.id } : ex);
        } else {
            updatedExercises = [...(program.exercises || []), { ...newExercise, id: Date.now() }];
        }

        const updatedProgram = { ...program, exercises: updatedExercises };
        onUpdateProgram(updatedProgram);
        // alert('Exercise saved successfully'); // Feedback

        setEditingExercise(null);
        setNewExercise({ name: '', muscle: 'Full Body', sets: 3, reps: '10', weight: '', rest: '60s', instructions: '' });
    };

    const removeExercise = (exerciseId) => {
        const updatedProgram = { ...program, exercises: program.exercises.filter(ex => ex.id !== exerciseId) };
        onUpdateProgram(updatedProgram);
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="premium-card" style={{ width: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0 }}>Manage Program</h3>
                        <input
                            className="input-field"
                            style={{ marginTop: '0.5rem', fontSize: '1.1rem' }}
                            value={program.name}
                            onChange={(e) => onUpdateProgram({ ...program, name: e.target.value })}
                        />
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'transparent', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer', padding: '0.5rem' }}
                    >
                        <X size={24} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-card" style={{ padding: '1rem' }}>
                        <h4 style={{ fontSize: '0.875rem', marginBottom: '1rem', color: 'var(--primary)', textTransform: 'uppercase' }}>{editingExercise ? 'Edit Exercise' : 'Add Exercise'}</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <input className="input-field" placeholder="Exercise Name" value={newExercise.name} onChange={e => setNewExercise({ ...newExercise, name: e.target.value })} />
                            <input className="input-field" placeholder="Muscle Group" value={newExercise.muscle} onChange={e => setNewExercise({ ...newExercise, muscle: e.target.value })} />
                            <input className="input-field" placeholder="Sets" type="number" value={newExercise.sets} onChange={e => setNewExercise({ ...newExercise, sets: e.target.value })} />
                            <input className="input-field" placeholder="Reps" value={newExercise.reps} onChange={e => setNewExercise({ ...newExercise, reps: e.target.value })} />
                            <input className="input-field" placeholder="Weight" value={newExercise.weight} onChange={e => setNewExercise({ ...newExercise, weight: e.target.value })} />
                            <input className="input-field" placeholder="Rest Time" value={newExercise.rest} onChange={e => setNewExercise({ ...newExercise, rest: e.target.value })} />
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            {editingExercise && <button className="btn-outline" style={{ flex: 1 }} onClick={() => { setEditingExercise(null); setNewExercise({ name: '', muscle: 'Full Body', sets: 3, reps: '10', weight: '', rest: '60s', instructions: '' }); }}>Cancel Edit</button>}
                            <button className="btn-primary" style={{ flex: 1 }} onClick={handleSaveExercise}>
                                {editingExercise ? 'Update Exercise' : 'Add to Program'}
                            </button>
                        </div>
                    </div>

                    <div>
                        <h4 style={{ marginBottom: '1rem' }}>Exercises in this Program</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {(program.exercises || []).length === 0 ? (
                                <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>No exercises added yet.</p>
                            ) : (
                                (program.exercises || []).map((ex, idx) => (
                                    <div key={ex.id || idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px', fontSize: '0.875rem' }}>
                                        <span>{ex.name} - {ex.sets}x{ex.reps} ({ex.muscle})</span>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => { setEditingExercise(ex); setNewExercise(ex); }} style={{ color: 'var(--primary)' }}>Edit</button>
                                            <button onClick={() => removeExercise(ex.id)} style={{ color: '#ef4444' }}>Remove</button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Programs = () => {
    const { programs, saveProgram, deleteProgram, settings, saveSettings } = useData();
    const [selectedProgram, setSelectedProgram] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const allCategories = [
        { name: 'Full Body', types: ['Type 1', 'Type 2', 'Type 3'] },
        { name: 'Four Day Class', types: ['Day 1', 'Day 2', 'Day 3', 'Day 4'] },
        { name: 'Six Day Class', types: ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6'] },
        { name: 'Power Lifting', types: ['Squat', 'Bench Press', 'Deadlift', 'Accessories'] }
    ];

    const visibleCategories = allCategories.filter(c => !(settings?.hiddenTemplates || []).includes(c.name));

    const handleUpdateProgram = (updatedProgram) => {
        saveProgram(updatedProgram);
        setSelectedProgram(updatedProgram);
    };

    const handleCreateProgram = (name = 'New Program', category = 'Manual', type = 'Custom') => {
        const newProgram = {
            id: 'PROG_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
            name,
            category,
            type,
            exercises: []
        };
        saveProgram(newProgram);
        setSelectedProgram(newProgram);
        return newProgram;
    };

    const handleDeleteCategory = (categoryName) => {
        const toDelete = programs.filter(p => p.category === categoryName);
        const confirmMessage = toDelete.length > 0
            ? `Delete '${categoryName}' template? This will delete ${toDelete.length} associated programs and hide this template.`
            : `Remove '${categoryName}' template from view?`;

        if (window.confirm(confirmMessage)) {
            // Delete all programs in this category
            toDelete.forEach(p => deleteProgram(p.id));

            // Hide the template
            const currentHidden = settings?.hiddenTemplates || [];
            saveSettings({ ...settings, hiddenTemplates: [...currentHidden, categoryName] });
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Workout Programs Manager</h3>
                <button
                    className="btn-primary"
                    onClick={() => {
                        const name = window.prompt('Enter Program Name:', 'New Program');
                        if (name) handleCreateProgram(name);
                    }}
                >
                    <Plus size={20} /> Create Program
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {visibleCategories.map((cat) => (
                    <div key={cat.name} className="premium-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Layout size={20} color="var(--primary)" />
                                <h4 style={{ fontSize: '1.125rem', margin: 0 }}>{cat.name}</h4>
                            </div>
                            <button
                                onClick={() => handleDeleteCategory(cat.name)}
                                style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}
                                title="Remove Template"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {cat.types.map(type => {
                                const existing = programs.find(p => p.category === cat.name && p.type === type);
                                return (
                                    <div
                                        key={type}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '0.75rem 1rem',
                                            backgroundColor: 'rgba(255,255,255,0.02)',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            border: existing ? '1px solid var(--primary)' : '1px solid transparent'
                                        }}
                                        onClick={() => {
                                            if (existing) {
                                                setSelectedProgram(existing);
                                            } else {
                                                handleCreateProgram(`${cat.name} - ${type}`, cat.name, type);
                                            }
                                        }}
                                    >
                                        <span style={{ fontSize: '0.925rem' }}>{type}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {existing ? (
                                                <>
                                                    <Edit2 size={14} color="var(--primary)" />
                                                    <div
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm('Are you sure you want to delete this program template?')) {
                                                                deleteProgram(existing.id);
                                                            }
                                                        }}
                                                        role="button"
                                                        aria-label="Delete template"
                                                    >
                                                        <Trash2 size={14} color="#ef4444" />
                                                    </div>
                                                </>
                                            ) : (
                                                <Plus size={14} color="var(--muted-foreground)" />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="premium-card">
                <h4 style={{ marginBottom: '1.5rem' }}>Program List</h4>
                {programs.length === 0 ? (
                    <p style={{ color: 'var(--muted-foreground)', textAlign: 'center', padding: '2rem' }}>No programs created yet.</p>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                        {programs.map(program => (
                            <div key={program.id} className="glass-card" style={{ padding: '1.25rem', border: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(132, 204, 22, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Dumbbell size={20} color="var(--primary)" />
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button onClick={() => setSelectedProgram(program)} style={{ color: 'var(--muted-foreground)' }}><Edit2 size={16} /></button>
                                        <button onClick={() => { if (window.confirm('Delete program?')) deleteProgram(program.id) }} style={{ color: '#ef4444' }}><Trash2 size={16} /></button>
                                    </div>
                                </div>
                                <h5 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{program.name}</h5>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--muted-foreground)' }}>{program.exercises?.length || 0} Exercises</p>
                                <button className="btn-outline" style={{ marginTop: '1rem', width: '100%', fontSize: '0.8125rem' }} onClick={() => setSelectedProgram(program)}>
                                    Manage Program
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedProgram && (
                <ManageProgram
                    program={selectedProgram}
                    onUpdateProgram={handleUpdateProgram}
                    onClose={() => setSelectedProgram(null)}
                />
            )}
        </div>
    );
};

export default Programs;
