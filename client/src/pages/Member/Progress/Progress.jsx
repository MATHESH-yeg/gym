import React, { useState, useMemo } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import {
    Calendar, ChevronLeft, ChevronRight, Filter, Download, Share2,
    CheckCircle, XCircle, Moon, X, Trophy, Activity, TrendingUp,
    Dumbbell, Clock, User, List, BarChart2, Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Records = () => {
    const { user } = useAuth();
    const { workoutRecords, attendance, members } = useData();

    // State Management
    const [activeTab, setActiveTab] = useState('weekly');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedWorkout, setSelectedWorkout] = useState(null);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        dateStart: '',
        dateEnd: '',
        status: 'all',
        workoutType: 'all',
        exerciseName: '',
        prOnly: false
    });

    // Get user-specific data
    const userRecords = useMemo(() =>
        workoutRecords.filter(r => r.userId === user.id),
        [workoutRecords, user.id]
    );

    const userAttendance = attendance[user.id] || [];

    // Tabs Configuration
    const tabs = [
        { id: 'weekly', name: 'Weekly Progress', icon: Calendar },
        { id: 'monthly', name: 'Monthly Stats', icon: BarChart2 },
        { id: 'evolution', name: 'Evolution', icon: TrendingUp },
        { id: 'history', name: 'Full History', icon: List }
    ];

    // Helper Functions
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

    const getDayStatus = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        const workout = userRecords.find(r => r.date.split('T')[0] === dateStr);
        const attRecord = userAttendance.find(a => a.date === dateStr);

        const isPast = new Date() > date && !isToday(date);

        if (workout) return 'completed';
        if (attRecord?.status === 'rest') return 'rest';
        if (isPast) return 'skipped';
        return 'upcoming';
    };

    const isToday = (date) => {
        return new Date().toISOString().split('T')[0] === date.toISOString().split('T')[0];
    };

    const calculateVolume = (exercises) => {
        return exercises.reduce((total, ex) => {
            const exVolume = ex.completedSets.reduce((sum, set) =>
                sum + (set.weight * set.reps), 0
            );
            return total + exVolume;
        }, 0);
    };

    // Export Function
    const handleExport = () => {
        window.print();
    };

    const handleShare = () => {
        alert('Share functionality - Coming soon!');
    };

    // ============= WEEKLY PROGRESS VIEW =============
    const WeeklyView = () => {
        const weekDays = getWeekDays(currentDate);

        const weeklyData = weekDays.map(date => ({
            date,
            status: getDayStatus(date),
            workout: userRecords.find(r => r.date.split('T')[0] === date.toISOString().split('T')[0])
        }));

        const stats = {
            completed: weeklyData.filter(d => d.status === 'completed').length,
            volume: weeklyData.reduce((acc, d) => acc + (d.workout?.totalVolume || 0), 0),
            consistency: Math.round((weeklyData.filter(d => d.status === 'completed').length / 7) * 100)
        };

        const statusColors = {
            completed: { bg: 'rgba(34, 197, 94, 0.1)', border: '#22c55e', text: '#22c55e' },
            rest: { bg: 'rgba(156, 163, 175, 0.1)', border: '#9ca3af', text: '#9ca3af' },
            skipped: { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', text: '#ef4444' },
            upcoming: { bg: 'transparent', border: 'var(--border)', text: 'var(--muted-foreground)' }
        };

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-col"
                style={{ gap: '2rem' }}
            >
                {/* Week Navigation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '900' }}>WEEKLY PROGRESS</h3>
                        <p style={{ color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                            {weekDays[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: '12px' }}>
                        <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))} className="btn-icon">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={() => setCurrentDate(new Date())} className="btn-text" style={{ fontSize: '0.8rem', padding: '0 1rem' }}>
                            TODAY
                        </button>
                        <button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))} className="btn-icon">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Week Days Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                    {weeklyData.map((day, i) => {
                        const style = statusColors[day.status];
                        const isTodayDate = isToday(day.date);

                        return (
                            <motion.div
                                key={i}
                                whileHover={day.workout ? { scale: 1.03 } : {}}
                                onClick={() => day.workout && setSelectedWorkout(day.workout)}
                                style={{
                                    padding: '1.5rem 1rem',
                                    borderRadius: '16px',
                                    backgroundColor: isTodayDate ? 'rgba(190, 255, 0, 0.1)' : style.bg,
                                    border: `2px solid ${isTodayDate ? '#BEFF00' : style.border}`,
                                    textAlign: 'center',
                                    cursor: day.workout ? 'pointer' : 'default',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                    {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                                </p>
                                <h4 style={{ fontSize: '1.8rem', fontWeight: '900', marginBottom: '0.75rem', color: isTodayDate ? '#BEFF00' : 'white' }}>
                                    {day.date.getDate()}
                                </h4>
                                <div style={{ minHeight: '28px', display: 'flex', justifyContent: 'center' }}>
                                    {day.status === 'completed' && <CheckCircle size={22} color={style.text} />}
                                    {day.status === 'rest' && <Moon size={22} color={style.text} />}
                                    {day.status === 'skipped' && <XCircle size={22} color={style.text} />}
                                </div>
                                {day.workout && (
                                    <p style={{ marginTop: '0.5rem', fontSize: '0.7rem', color: style.text, fontWeight: 'bold' }}>
                                        {day.workout.routineCode}
                                    </p>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Summary Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    <div className="premium-card">
                        <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', fontWeight: '700', marginBottom: '0.5rem' }}>WORKOUTS COMPLETED</p>
                        <h4 style={{ fontSize: '2.5rem', fontWeight: '900', color: '#BEFF00' }}>{stats.completed}</h4>
                    </div>
                    <div className="premium-card">
                        <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', fontWeight: '700', marginBottom: '0.5rem' }}>TOTAL VOLUME</p>
                        <h4 style={{ fontSize: '2.5rem', fontWeight: '900' }}>{stats.volume.toLocaleString()} <span style={{ fontSize: '1rem', color: 'var(--muted-foreground)' }}>KG</span></h4>
                    </div>
                    <div className="premium-card">
                        <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', fontWeight: '700', marginBottom: '0.5rem' }}>CONSISTENCY</p>
                        <h4 style={{ fontSize: '2.5rem', fontWeight: '900' }}>{stats.consistency}%</h4>
                    </div>
                </div>
            </motion.div>
        );
    };

    // ============= MONTHLY STATS VIEW =============
    const MonthlyView = () => {
        const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

        const monthlyData = userRecords.filter(r => {
            const d = new Date(r.date);
            return d >= monthStart && d <= monthEnd;
        });

        const exerciseCounts = {};
        monthlyData.forEach(workout => {
            workout.completedExercises?.forEach(ex => {
                exerciseCounts[ex.exerciseName] = (exerciseCounts[ex.exerciseName] || 0) + 1;
            });
        });

        const mostPerformed = Object.entries(exerciseCounts).sort((a, b) => b[1] - a[1])[0];
        const totalVolume = monthlyData.reduce((sum, w) => sum + (w.totalVolume || 0), 0);

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-col"
                style={{ gap: '2rem' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: '900' }}>
                        {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}
                    </h3>
                    <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.25rem', borderRadius: '12px' }}>
                        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="btn-icon">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="btn-icon">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
                    <div className="premium-card" style={{ padding: '2rem', textAlign: 'center' }}>
                        <Activity size={40} style={{ margin: '0 auto 1rem', color: '#BEFF00' }} />
                        <h4 style={{ fontSize: '3rem', fontWeight: '900', color: '#BEFF00', lineHeight: 1 }}>{monthlyData.length}</h4>
                        <p style={{ fontWeight: '800', marginTop: '0.5rem', color: 'var(--muted-foreground)' }}>TOTAL WORKOUTS</p>
                    </div>
                    <div className="premium-card" style={{ padding: '2rem', textAlign: 'center' }}>
                        <Dumbbell size={40} style={{ margin: '0 auto 1rem', color: '#BEFF00' }} />
                        <h4 style={{ fontSize: '3rem', fontWeight: '900', lineHeight: 1 }}>{(totalVolume / 1000).toFixed(1)}k</h4>
                        <p style={{ fontWeight: '800', marginTop: '0.5rem', color: 'var(--muted-foreground)' }}>TOTAL VOLUME (KG)</p>
                    </div>
                    <div className="premium-card" style={{ padding: '2rem', textAlign: 'center' }}>
                        <Trophy size={40} style={{ margin: '0 auto 1rem', color: '#BEFF00' }} />
                        <h4 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#BEFF00', lineHeight: 1.2 }}>
                            {mostPerformed ? mostPerformed[0] : 'N/A'}
                        </h4>
                        <p style={{ fontWeight: '800', marginTop: '0.5rem', color: 'var(--muted-foreground)' }}>MOST PERFORMED</p>
                    </div>
                </div>

                {/* Consistency Chart */}
                <div className="premium-card" style={{ padding: '2rem' }}>
                    <h4 style={{ marginBottom: '1.5rem', fontWeight: '800' }}>DAILY CONSISTENCY</h4>
                    <div style={{ display: 'flex', gap: '3px', height: '80px', alignItems: 'flex-end' }}>
                        {[...Array(monthEnd.getDate())].map((_, i) => {
                            const hasWorkout = monthlyData.some(w => new Date(w.date).getDate() === i + 1);
                            return (
                                <div
                                    key={i}
                                    style={{
                                        flex: 1,
                                        backgroundColor: hasWorkout ? '#BEFF00' : 'rgba(255,255,255,0.1)',
                                        height: hasWorkout ? '100%' : '15%',
                                        borderRadius: '3px',
                                        transition: 'all 0.3s'
                                    }}
                                />
                            );
                        })}
                    </div>
                </div>
            </motion.div>
        );
    };

    // ============= EVOLUTION VIEW =============
    const EvolutionView = () => {
        const last12Weeks = [...Array(12)].map((_, i) => {
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - (i * 7));
            return weekStart;
        }).reverse();

        const weeklyVolumes = last12Weeks.map(weekDate => {
            const weekDays = getWeekDays(weekDate);
            const weekRecords = userRecords.filter(r => {
                const recordDate = new Date(r.date);
                return recordDate >= weekDays[0] && recordDate <= weekDays[6];
            });
            return weekRecords.reduce((sum, r) => sum + (r.totalVolume || 0), 0);
        });

        const maxVolume = Math.max(...weeklyVolumes, 1);

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-col"
                style={{ gap: '2rem' }}
            >
                <h3 style={{ fontSize: '1.5rem', fontWeight: '900' }}>EVOLUTION TRACKER</h3>

                {/* Weekly Volume Chart */}
                <div className="premium-card" style={{ padding: '2rem' }}>
                    <h4 style={{ marginBottom: '1.5rem', fontWeight: '800' }}>WEEKLY VOLUME PROGRESSION</h4>
                    <div style={{ display: 'flex', gap: '8px', height: '200px', alignItems: 'flex-end' }}>
                        {weeklyVolumes.map((volume, i) => {
                            const height = (volume / maxVolume) * 100;
                            return (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
                                    <span style={{ fontSize: '0.7rem', marginBottom: '0.5rem', color: '#BEFF00', fontWeight: '900' }}>
                                        {volume > 0 ? `${(volume / 1000).toFixed(1)}k` : ''}
                                    </span>
                                    <div
                                        style={{
                                            width: '100%',
                                            height: `${height}%`,
                                            backgroundColor: '#BEFF00',
                                            borderRadius: '4px',
                                            minHeight: volume > 0 ? '10px' : '0'
                                        }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* PR Summary */}
                <div className="premium-card" style={{ padding: '2rem', textAlign: 'center' }}>
                    <Trophy size={48} style={{ margin: '0 auto 1rem', color: '#BEFF00' }} />
                    <h4 style={{ fontSize: '3rem', fontWeight: '900', color: '#BEFF00' }}>
                        {userRecords.reduce((sum, r) => sum + (r.personalRecords?.length || 0), 0)}
                    </h4>
                    <p style={{ fontWeight: '800', marginTop: '0.5rem', color: 'var(--muted-foreground)' }}>PERSONAL RECORDS</p>
                </div>
            </motion.div>
        );
    };

    // ============= FULL HISTORY VIEW =============
    const FullHistoryView = () => {
        const filteredRecords = userRecords.filter(record => {
            const matchesSearch = !filters.exerciseName ||
                record.completedExercises?.some(ex =>
                    ex.exerciseName.toLowerCase().includes(filters.exerciseName.toLowerCase())
                );

            const recordDate = new Date(record.date);
            const matchesDateStart = !filters.dateStart || recordDate >= new Date(filters.dateStart);
            const matchesDateEnd = !filters.dateEnd || recordDate <= new Date(filters.dateEnd);

            return matchesSearch && matchesDateStart && matchesDateEnd;
        }).sort((a, b) => new Date(b.date) - new Date(a.date));

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-col"
                style={{ gap: '1.5rem' }}
            >
                {/* Search */}
                <div style={{ position: 'relative' }}>
                    <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} size={20} />
                    <input
                        className="input-field"
                        style={{ paddingLeft: '3rem' }}
                        placeholder="Search by exercise name..."
                        value={filters.exerciseName}
                        onChange={e => setFilters({ ...filters, exerciseName: e.target.value })}
                    />
                </div>

                {/* Records List */}
                {filteredRecords.length === 0 ? (
                    <div className="premium-card" style={{ padding: '4rem', textAlign: 'center' }}>
                        <Activity size={64} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                        <h3 style={{ opacity: 0.5 }}>No workout records found</h3>
                        <p style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>Start your fitness journey today!</p>
                    </div>
                ) : (
                    filteredRecords.map(record => (
                        <motion.div
                            key={record.recordId}
                            whileHover={{ scale: 1.01 }}
                            className="premium-card"
                            onClick={() => setSelectedWorkout(record)}
                            style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '12px', backgroundColor: 'rgba(190, 255, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Dumbbell size={24} color="#BEFF00" />
                                </div>
                                <div>
                                    <h4 style={{ fontWeight: '900', marginBottom: '0.25rem' }}>{record.routineName}</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
                                        {new Date(record.date).toLocaleDateString('en-US', { dateStyle: 'long' })} • {record.duration}
                                    </p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <h4 style={{ fontWeight: '900', color: '#BEFF00', marginBottom: '0.25rem' }}>
                                    {record.totalVolume?.toLocaleString() || 0} KG
                                </h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
                                    {record.completedExercises?.length || 0} Exercises
                                </p>
                            </div>
                        </motion.div>
                    ))
                )}
            </motion.div>
        );
    };

    // ============= WORKOUT DETAIL MODAL =============
    const WorkoutModal = () => {
        if (!selectedWorkout) return null;

        const trainer = selectedWorkout.trainerId ? members.find(m => m.id === selectedWorkout.trainerId) : null;

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
                    style={{ width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto', padding: '0' }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '2px solid var(--border)', position: 'sticky', top: 0, zIndex: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#BEFF00', marginBottom: '0.5rem' }}>
                                    {selectedWorkout.routineName}
                                </h3>
                                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Calendar size={16} />
                                        {new Date(selectedWorkout.date).toLocaleDateString('en-US', { dateStyle: 'long' })}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Clock size={16} />
                                        {selectedWorkout.duration}
                                    </span>
                                    {trainer && (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <User size={16} />
                                            {trainer.name}
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
                        {/* Stats Overview */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                            <div style={{ padding: '1rem', backgroundColor: 'rgba(190, 255, 0, 0.1)', borderRadius: '12px', textAlign: 'center' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>TOTAL VOLUME</p>
                                <h4 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#BEFF00' }}>
                                    {selectedWorkout.totalVolume?.toLocaleString() || 0} KG
                                </h4>
                            </div>
                            <div style={{ padding: '1rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '12px', textAlign: 'center' }}>
                                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '0.25rem' }}>EXERCISES</p>
                                <h4 style={{ fontSize: '1.5rem', fontWeight: '900' }}>
                                    {selectedWorkout.completedExercises?.length || 0}
                                </h4>
                            </div>
                        </div>

                        {/* Exercise Details */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {selectedWorkout.completedExercises?.map((exercise, i) => (
                                <div key={i} style={{ padding: '1.5rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h5 style={{ fontWeight: '900', fontSize: '1.1rem' }}>{exercise.exerciseName}</h5>
                                        <span style={{ fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>
                                            {exercise.completedSets?.length || 0} Sets
                                        </span>
                                    </div>

                                    {/* Sets Grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.75rem' }}>
                                        {exercise.completedSets?.map((set, si) => (
                                            <div key={si} style={{ padding: '1rem', backgroundColor: 'rgba(190, 255, 0, 0.05)', borderRadius: '8px', border: '1px solid rgba(190, 255, 0, 0.2)' }}>
                                                <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem' }}>
                                                    Set {si + 1}
                                                </p>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                                    <span style={{ fontSize: '1.2rem', fontWeight: '900', color: '#BEFF00' }}>
                                                        {set.weight}kg
                                                    </span>
                                                    <span style={{ color: 'var(--muted-foreground)' }}>×</span>
                                                    <span style={{ fontSize: '1.2rem', fontWeight: '900' }}>
                                                        {set.reps}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', textAlign: 'center', marginTop: '0.5rem' }}>
                                                    Vol: {(set.weight * set.reps).toLocaleString()}kg
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Exercise Notes */}
                                    {exercise.notes && (
                                        <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.85rem' }}>
                                            <strong>Notes:</strong> {exercise.notes}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Workout Notes */}
                        {selectedWorkout.overallNotes && (
                            <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'rgba(190, 255, 0, 0.05)', borderRadius: '12px', border: '1px solid rgba(190, 255, 0, 0.2)' }}>
                                <h5 style={{ fontWeight: '900', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Activity size={18} color="#BEFF00" />
                                    Workout Notes
                                </h5>
                                <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>{selectedWorkout.overallNotes}</p>
                            </div>
                        )}
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
                        <label style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem', display: 'block' }}>Start Date</label>
                        <input
                            type="date"
                            className="input-field"
                            value={filters.dateStart}
                            onChange={e => setFilters({ ...filters, dateStart: e.target.value })}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem', display: 'block' }}>End Date</label>
                        <input
                            type="date"
                            className="input-field"
                            value={filters.dateEnd}
                            onChange={e => setFilters({ ...filters, dateEnd: e.target.value })}
                        />
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
            <WorkoutModal />

            <div className="flex-col" style={{ gap: '2rem' }}>
                {/* Header */}
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '950', letterSpacing: '-0.03em' }}>RECORDS</h1>
                        <p style={{ color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>Analyze your performance and historical workouts</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button className="btn-outline" onClick={() => setShowFilters(!showFilters)}>
                            <Filter size={18} /> Filters
                        </button>
                        <button className="btn-outline" onClick={handleShare}>
                            <Share2 size={18} /> Share
                        </button>
                        <button className="btn-primary" onClick={handleExport}>
                            <Download size={18} /> Export
                        </button>
                    </div>
                </header>

                {/* Filters */}
                <AnimatePresence>
                    <FilterPanel />
                </AnimatePresence>

                {/* Tab Navigation */}
                <nav style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                flex: 1,
                                minWidth: '150px',
                                padding: '1rem',
                                borderRadius: '12px',
                                backgroundColor: activeTab === tab.id ? '#BEFF00' : 'rgba(255,255,255,0.05)',
                                color: activeTab === tab.id ? 'black' : 'var(--muted-foreground)',
                                fontWeight: '900',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                transition: 'all 0.3s'
                            }}
                        >
                            <tab.icon size={18} />
                            {tab.name.toUpperCase()}
                        </button>
                    ))}
                </nav>

                {/* Tab Content */}
                <div style={{ minHeight: '500px' }}>
                    <AnimatePresence mode="wait">
                        {activeTab === 'weekly' && <WeeklyView key="weekly" />}
                        {activeTab === 'monthly' && <MonthlyView key="monthly" />}
                        {activeTab === 'evolution' && <EvolutionView key="evolution" />}
                        {activeTab === 'history' && <FullHistoryView key="history" />}
                    </AnimatePresence>
                </div>
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

export default Records;
