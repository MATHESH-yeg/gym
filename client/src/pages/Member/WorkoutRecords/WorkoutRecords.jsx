import React, { useState, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import {
    ChevronLeft, ChevronRight, Calendar, User, Dumbbell,
    CheckCircle, Moon, Filter, Download, X, Save, Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WorkoutRecords = ({ targetUserId }) => {
    const { user } = useAuth();
    const { workoutRecords, members, updateWorkoutRecord } = useData();

    // Determine whose records to show
    const userIdToView = targetUserId || user?.id;

    // State
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [workoutNotes, setWorkoutNotes] = useState('');
    const [isEditingNotes, setIsEditingNotes] = useState(false);
    const [filters, setFilters] = useState({
        dateRange: 'week', // week, 2weeks, custom
        customStart: '',
        customEnd: '',
        workoutName: 'all',
        exerciseName: ''
    });

    // Get user-specific workout records
    const userRecords = useMemo(() =>
        workoutRecords.filter(r => r.userId === userIdToView),
        [workoutRecords, userIdToView]
    );

    // Helper: Get week days
    const getWeekDays = (date) => {
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(date);
        monday.setDate(diff);

        return [...Array(7)].map((_, i) => {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            return d;
        });
    };

    // Get workouts for current view
    const getWorkoutsForView = () => {
        const weekDays = getWeekDays(currentDate);

        return weekDays.map(date => {
            const dateStr = date.toISOString().split('T')[0];
            const workout = userRecords.find(r => r.date.split('T')[0] === dateStr);

            return {
                date,
                workout,
                status: workout ? 'completed' : 'rest'
            };
        }).filter(d => d.status === 'completed');
    };

    const weeklyWorkouts = getWorkoutsForView();
    const weekDays = getWeekDays(currentDate);

    // Calculate total volume for workout
    const calculateWorkoutVolume = (workout) => {
        if (!workout?.completedExercises) return 0;
        return workout.completedExercises.reduce((total, exercise) => {
            const exerciseVolume = exercise.completedSets.reduce((sum, set) =>
                sum + (set.weight * set.reps), 0
            );
            return total + exerciseVolume;
        }, 0);
    };

    // Calculate exercise volume
    const calculateExerciseVolume = (sets) => {
        return sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
    };

    // Save workout notes
    const handleSaveNotes = () => {
        if (selectedWorkout && updateWorkoutRecord) {
            const updatedWorkout = {
                ...selectedWorkout,
                memberNotes: workoutNotes,
                notesSavedAt: new Date().toISOString()
            };
            updateWorkoutRecord(updatedWorkout);
            setIsEditingNotes(false);
            setSelectedWorkout(updatedWorkout);
        }
    };

    // Export to PDF
    const handleExport = () => {
        window.print();
    };

    // Open workout details
    const openWorkoutDetails = (workout) => {
        setSelectedWorkout(workout);
        setWorkoutNotes(workout.memberNotes || '');
        setIsEditingNotes(false);
    };

    // ============= WORKOUT DAY CARDS =============
    const WeekView = () => {
        return (
            <div className="flex-col" style={{ gap: '2rem' }}>
                {/* Week Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '900' }}>PAST WEEK</h3>
                        <p style={{ color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                            {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: '12px' }}>
                        <button
                            onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))}
                            className="btn-icon"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => setCurrentDate(new Date())}
                            className="btn-text"
                            style={{ fontSize: '0.8rem', padding: '0 1rem' }}
                        >
                            THIS WEEK
                        </button>
                        <button
                            onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))}
                            className="btn-icon"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Workout Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    {weeklyWorkouts.map((day, i) => {
                        const isCompleted = day.status === 'completed';

                        return (
                            <motion.div
                                key={i}
                                whileHover={isCompleted ? { scale: 1.02 } : {}}
                                onClick={() => isCompleted && openWorkoutDetails(day.workout)}
                                className="premium-card"
                                style={{
                                    padding: '1.5rem',
                                    cursor: isCompleted ? 'pointer' : 'default',
                                    opacity: isCompleted ? 1 : 0.6,
                                    border: `1px solid ${isCompleted ? 'rgba(190, 255, 0, 0.3)' : 'var(--border)'}`,
                                    transition: 'all 0.3s'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <div>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontWeight: '800', textTransform: 'uppercase' }}>
                                            {day.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                        </p>
                                        <h4 style={{ fontSize: '1.2rem', fontWeight: '900', marginTop: '0.25rem' }}>
                                            {isCompleted ? day.workout.routineName : 'Rest Day'}
                                        </h4>
                                    </div>
                                    {isCompleted ? (
                                        <CheckCircle size={24} color="#22c55e" />
                                    ) : (
                                        <Moon size={24} color="#9ca3af" />
                                    )}
                                </div>

                                {isCompleted && (
                                    <>
                                        <div style={{ marginBottom: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>Exercises</span>
                                                <span style={{ fontSize: '0.85rem', fontWeight: '900' }}>
                                                    {day.workout.completedExercises?.length || 0}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>Duration</span>
                                                <span style={{ fontSize: '0.85rem', fontWeight: '900' }}>{day.workout.duration}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>Total Volume</span>
                                                <span style={{ fontSize: '0.85rem', fontWeight: '900', color: '#BEFF00' }}>
                                                    {calculateWorkoutVolume(day.workout).toLocaleString()} kg
                                                </span>
                                            </div>
                                        </div>

                                        {day.workout.memberNotes && (
                                            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(190, 255, 0, 0.05)', borderRadius: '8px', border: '1px solid rgba(190, 255, 0, 0.2)' }}>
                                                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>Notes:</p>
                                                <p style={{ fontSize: '0.85rem', lineHeight: 1.4 }}>{day.workout.memberNotes}</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        );
    };

    // ============= WORKOUT DETAILS MODAL =============
    const WorkoutDetailsModal = () => {
        if (!selectedWorkout) return null;

        const trainer = selectedWorkout.trainerId ? members.find(m => m.id === selectedWorkout.trainerId) : null;
        const totalVolume = calculateWorkoutVolume(selectedWorkout);

        return (
            <div
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 50,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                    backgroundColor: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(8px)'
                }}
                onClick={() => setSelectedWorkout(null)}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="premium-card"
                    style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', padding: '0' }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '2px solid var(--border)', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(8px)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#BEFF00', marginBottom: '0.5rem' }}>
                                    {selectedWorkout.routineName}
                                </h3>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Calendar size={16} />
                                        {new Date(selectedWorkout.date).toLocaleDateString('en-US', { dateStyle: 'long' })}
                                    </span>
                                    {trainer && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <User size={16} />
                                            Trainer: {trainer.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button onClick={() => setSelectedWorkout(null)} className="btn-icon">
                                <X size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '1.5rem' }}>
                        {/* Workout Summary */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ padding: '1.25rem', backgroundColor: 'rgba(190, 255, 0, 0.1)', borderRadius: '12px', border: '1px solid rgba(190, 255, 0, 0.3)', textAlign: 'center' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Total Volume</p>
                                <h4 style={{ fontSize: '2rem', fontWeight: '900', color: '#BEFF00' }}>
                                    {totalVolume.toLocaleString()} kg
                                </h4>
                            </div>
                            <div style={{ padding: '1.25rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', textAlign: 'center' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Exercises</p>
                                <h4 style={{ fontSize: '2rem', fontWeight: '900' }}>
                                    {selectedWorkout.completedExercises?.length || 0}
                                </h4>
                            </div>
                            <div style={{ padding: '1.25rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', textAlign: 'center' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Duration</p>
                                <h4 style={{ fontSize: '2rem', fontWeight: '900' }}>
                                    {selectedWorkout.duration}
                                </h4>
                            </div>
                        </div>

                        {/* Exercise Details */}
                        <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ fontSize: '1.2rem', fontWeight: '900', marginBottom: '1.5rem' }}>EXERCISE HISTORY</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                {selectedWorkout.completedExercises?.map((exercise, i) => {
                                    const exerciseVolume = calculateExerciseVolume(exercise.completedSets);

                                    return (
                                        <div key={i} style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'rgba(190, 255, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Dumbbell size={20} color="#BEFF00" />
                                                    </div>
                                                    <h5 style={{ fontWeight: '900', fontSize: '1.1rem' }}>{exercise.exerciseName}</h5>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                    <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Volume</p>
                                                    <p style={{ fontSize: '1rem', fontWeight: '900', color: '#BEFF00' }}>{exerciseVolume.toLocaleString()} kg</p>
                                                </div>
                                            </div>

                                            {/* Sets List */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                {exercise.completedSets?.map((set, si) => (
                                                    <div
                                                        key={si}
                                                        style={{
                                                            padding: '0.75rem 1rem',
                                                            backgroundColor: 'rgba(190, 255, 0, 0.05)',
                                                            borderRadius: '8px',
                                                            border: '1px solid rgba(190, 255, 0, 0.15)',
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)', fontWeight: '700' }}>
                                                            Set {si + 1}
                                                        </span>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                            <span style={{ fontSize: '1rem', fontWeight: '900', color: '#BEFF00' }}>
                                                                {set.weight} kg
                                                            </span>
                                                            <span style={{ color: 'var(--muted-foreground)' }}>×</span>
                                                            <span style={{ fontSize: '1rem', fontWeight: '900' }}>
                                                                {set.reps} reps
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Workout Notes Section */}
                        <div style={{ padding: '1.5rem', backgroundColor: 'rgba(190, 255, 0, 0.05)', borderRadius: '12px', border: '2px solid rgba(190, 255, 0, 0.2)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: '900' }}>WORKOUT NOTES</h4>
                                {!isEditingNotes && (
                                    <button
                                        onClick={() => setIsEditingNotes(true)}
                                        className="btn-outline"
                                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                                    >
                                        <Edit2 size={16} /> {workoutNotes ? 'Edit' : 'Add Notes'}
                                    </button>
                                )}
                            </div>

                            {isEditingNotes ? (
                                <div>
                                    <textarea
                                        className="input-field"
                                        value={workoutNotes}
                                        onChange={(e) => setWorkoutNotes(e.target.value)}
                                        placeholder="Add your workout notes here... (e.g., 'Chest felt strong today', 'Increase bench press weight next week')"
                                        rows={4}
                                        style={{
                                            width: '100%',
                                            marginBottom: '1rem',
                                            resize: 'vertical',
                                            minHeight: '100px'
                                        }}
                                    />
                                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                                        <button
                                            onClick={handleSaveNotes}
                                            className="btn-primary"
                                            style={{ padding: '0.75rem 1.5rem' }}
                                        >
                                            <Save size={18} /> Save Notes
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsEditingNotes(false);
                                                setWorkoutNotes(selectedWorkout.memberNotes || '');
                                            }}
                                            className="btn-outline"
                                            style={{ padding: '0.75rem 1.5rem' }}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    {workoutNotes ? (
                                        <div>
                                            <p style={{ fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '0.75rem' }}>
                                                {workoutNotes}
                                            </p>
                                            {selectedWorkout.notesSavedAt && (
                                                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
                                                    Saved on {new Date(selectedWorkout.notesSavedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <p style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
                                            No notes added yet. Click "Add Notes" to record your thoughts about this workout.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    };

    // ============= FILTER PANEL =============
    const FilterPanel = () => {
        if (!showFilters) return null;

        return (
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="premium-card"
                style={{ overflow: 'hidden', marginBottom: '1.5rem' }}
            >
                <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem', display: 'block' }}>Date Range</label>
                        <select
                            className="input-field"
                            value={filters.dateRange}
                            onChange={e => setFilters({ ...filters, dateRange: e.target.value })}
                        >
                            <option value="week">Past Week</option>
                            <option value="2weeks">Past 2 Weeks</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>

                    {filters.dateRange === 'custom' && (
                        <>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem', display: 'block' }}>Start Date</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={filters.customStart}
                                    onChange={e => setFilters({ ...filters, customStart: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem', display: 'block' }}>End Date</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={filters.customEnd}
                                    onChange={e => setFilters({ ...filters, customEnd: e.target.value })}
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem', display: 'block' }}>Workout Name</label>
                        <select
                            className="input-field"
                            value={filters.workoutName}
                            onChange={e => setFilters({ ...filters, workoutName: e.target.value })}
                        >
                            <option value="all">All Workouts</option>
                            <option value="chest">Chest Day</option>
                            <option value="back">Back Day</option>
                            <option value="legs">Leg Day</option>
                            <option value="push">Push Day</option>
                            <option value="pull">Pull Day</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem', display: 'block' }}>Exercise Name</label>
                        <input
                            className="input-field"
                            placeholder="Search exercise..."
                            value={filters.exerciseName}
                            onChange={e => setFilters({ ...filters, exerciseName: e.target.value })}
                        />
                    </div>
                </div>
            </motion.div>
        );
    };

    // ============= MAIN RENDER =============
    return (
        <div style={{ position: 'relative' }}>
            <WorkoutDetailsModal />

            <div className="flex-col" style={{ gap: '2rem' }}>
                {/* Header */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '950', letterSpacing: '-0.03em' }}>WORKOUT RECORDS</h1>
                        <p style={{ color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                            Review past workouts and track your exercise history
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            className="btn-outline"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter size={18} /> Filters
                        </button>
                        <button className="btn-primary" onClick={handleExport}>
                            <Download size={18} /> Export PDF
                        </button>
                    </div>
                </header>

                {/* Filters */}
                <AnimatePresence>
                    <FilterPanel />
                </AnimatePresence>

                {/* Week View */}
                {weeklyWorkouts.length > 0 ? (
                    <WeekView />
                ) : (
                    <div className="premium-card" style={{ padding: '4rem', textAlign: 'center' }}>
                        <Dumbbell size={64} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                        <h3 style={{ opacity: 0.5, marginBottom: '0.5rem' }}>No workout records available</h3>
                        <p style={{ color: 'var(--muted-foreground)' }}>Complete your first workout to see records here!</p>
                    </div>
                )}
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    .premium-card, .premium-card * { visibility: visible; }
                    .premium-card { 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 100%; 
                        background: white !important;
                        color: black !important;
                    }
                    button, nav { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default WorkoutRecords;
