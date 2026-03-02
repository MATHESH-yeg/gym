import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { useLocation } from 'react-router-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, StickyNote, Bell, Trash2, Plus, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Reminders = () => {
    const { user } = useAuth();
    const location = useLocation();
    const { reminders, notes, saveReminder, deleteReminder, saveNote, deleteNote, addNotification } = useData();

    const getTodayStr = (d = new Date()) => {
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(getTodayStr());
    const [activeTab, setActiveTab] = useState(location.pathname.includes('notes') ? 'notes' : 'reminders');

    useEffect(() => {
        setActiveTab(location.pathname.includes('notes') ? 'notes' : 'reminders');
    }, [location.pathname]);

    // Reminder Modal States
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [editingReminderId, setEditingReminderId] = useState(null);
    const [reminderText, setReminderText] = useState('');
    const [reminderTime, setReminderTime] = useState('10:00');

    // Note State
    const [noteText, setNoteText] = useState('');
    const [editingNoteId, setEditingNoteId] = useState(null);

    const userReminders = (reminders && user?.id) ? (reminders[user.id] || []) : [];
    const userNotes = (notes && user?.id) ? (notes[user.id] || []) : [];

    // Notification check logic
    useEffect(() => {
        const checkReminders = () => {
            const now = new Date();
            const todayStr = getTodayStr(now);
            const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

            userReminders.forEach(r => {
                if (r.date === todayStr && r.time === currentTime && !r.notified) {
                    // Trigger notification
                    if (Notification.permission === "granted") {
                        new Notification("Oliva Reminder", { body: r.text });
                    } else {
                        alert(`REMINDER: ${r.text}`);
                    }
                    // Mark as notified to avoid multiple alerts in the same minute
                    saveReminder(user.id, { ...r, notified: true });
                }
            });
        };

        const interval = setInterval(checkReminders, 10000); // Check every 10 seconds
        return () => clearInterval(interval);
    }, [userReminders, user.id, saveReminder]);

    // Request notification permission on mount
    useEffect(() => {
        if ("Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    }, []);

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const handleAddReminder = (e) => {
        if (e) e.preventDefault();
        if (reminderText.trim()) {
            saveReminder(user.id, {
                id: editingReminderId,
                date: selectedDate,
                time: reminderTime,
                text: reminderText
            });
            // Also add a local notification record only if creating
            if (!editingReminderId) {
                addNotification(user.id, `Reminder set: ${reminderText} at ${reminderTime} on ${selectedDate}`);
            }

            setIsReminderModalOpen(false);
            setReminderText('');
            setEditingReminderId(null);
        }
    };

    const startEditingReminder = (r) => {
        setReminderText(r.text);
        setReminderTime(r.time || '10:00');
        setSelectedDate(r.date);
        setEditingReminderId(r.id);
        setIsReminderModalOpen(true);
    };

    const closeReminderModal = () => {
        setIsReminderModalOpen(false);
        setReminderText('');
        setEditingReminderId(null);
    };

    const handleSaveNote = () => {
        if (noteText.trim()) {
            saveNote(user.id, {
                id: editingNoteId,
                text: noteText,
                date: new Date().toISOString()
            });
            setNoteText('');
            setEditingNoteId(null);
        }
    };

    const startEditingNote = (note) => {
        setNoteText(note.text);
        setEditingNoteId(note.id);
        setActiveTab('notes');
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', height: '100%' }}>
            {/* Left Column: Calendar and Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div className="premium-card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <CalendarIcon size={24} color="var(--primary)" />
                                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                            </h2>
                            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.9rem' }}>Plan your schedule and keep track of your goals</p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn-outline" style={{ padding: '0.5rem' }} onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
                                <ChevronLeft size={20} />
                            </button>
                            <button className="btn-outline" style={{ padding: '0.5rem' }} onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                        {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                            <div key={day} style={{ textAlign: 'center', paddingBottom: '1rem', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--muted-foreground)', letterSpacing: '0.05em' }}>
                                {day}
                            </div>
                        ))}
                        {Array(firstDayOfMonth).fill(0).map((_, i) => <div key={`empty-${i}`} />)}
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                            const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isSelected = selectedDate === dateStr;
                            const hasReminders = userReminders.some(r => r.date === dateStr);
                            const isToday = new Date().toISOString().split('T')[0] === dateStr;

                            return (
                                <motion.div
                                    key={day}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedDate(dateStr)}
                                    style={{
                                        aspectRatio: '1',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        borderRadius: '12px',
                                        backgroundColor: isSelected ? 'rgba(132, 204, 22, 0.15)' : 'rgba(255,255,255,0.02)',
                                        border: isSelected ? '2px solid var(--primary)' : isToday ? '1px solid var(--primary)' : '1px solid var(--border)',
                                        cursor: 'pointer',
                                        position: 'relative',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <span style={{ fontSize: '1rem', fontWeight: '700', color: isSelected || isToday ? 'var(--primary)' : 'white' }}>{day}</span>
                                    {hasReminders && (
                                        <div style={{ position: 'absolute', bottom: '6px', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: 'var(--primary)', boxShadow: '0 0 8px var(--primary)' }} />
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Tabbed Content: Daily View */}
                <div className="premium-card" style={{ flex: 1, padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
                        <button
                            onClick={() => setActiveTab('reminders')}
                            style={{
                                flex: 1,
                                padding: '1.25rem',
                                background: 'none',
                                border: 'none',
                                color: activeTab === 'reminders' ? 'var(--primary)' : 'var(--muted-foreground)',
                                fontWeight: '700',
                                cursor: 'pointer',
                                borderBottom: activeTab === 'reminders' ? '2px solid var(--primary)' : 'none',
                                transition: 'all 0.3s'
                            }}
                        >
                            <Bell size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                            Daily Reminders
                        </button>
                        <button
                            onClick={() => setActiveTab('notes')}
                            style={{
                                flex: 1,
                                padding: '1.25rem',
                                background: 'none',
                                border: 'none',
                                color: activeTab === 'notes' ? 'var(--primary)' : 'var(--muted-foreground)',
                                fontWeight: '700',
                                cursor: 'pointer',
                                borderBottom: activeTab === 'notes' ? '2px solid var(--primary)' : 'none',
                                transition: 'all 0.3s'
                            }}
                        >
                            <StickyNote size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                            My Notes
                        </button>
                    </div>

                    <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
                        <AnimatePresence mode="wait">
                            {activeTab === 'reminders' ? (
                                <motion.div
                                    key="reminders"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Schedule for {new Date(selectedDate).toLocaleDateString('default', { day: 'numeric', month: 'long' })}</h3>
                                        <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }} onClick={() => {
                                            setEditingReminderId(null);
                                            setReminderText('');
                                            setIsReminderModalOpen(true);
                                        }}>
                                            <Plus size={16} /> Add Reminder
                                        </button>
                                    </div>

                                    {userReminders.filter(r => r.date === selectedDate).length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted-foreground)', backgroundColor: 'rgba(255,255,255,0.01)', borderRadius: '16px', border: '1px dashed var(--border)' }}>
                                            <Bell size={32} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                                            <p>No reminders set for this day.</p>
                                        </div>
                                    ) : (
                                        userReminders.filter(r => r.date === selectedDate)
                                            .sort((a, b) => (a.time || '00:00').localeCompare(b.time || '00:00'))
                                            .map(r => (
                                                <div key={r.id} className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--primary)' }}>
                                                    <div style={{ backgroundColor: 'rgba(132, 204, 22, 0.1)', padding: '0.5rem', borderRadius: '8px' }}>
                                                        <Clock size={16} color="var(--primary)" />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <p style={{ fontWeight: '700', fontSize: '0.95rem', margin: 0 }}>{r.text}</p>
                                                        <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', margin: 0 }}>Starts at {r.time || 'All Day'}</p>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                        <button onClick={() => startEditingReminder(r)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700' }}>Edit</button>
                                                        <button onClick={() => deleteReminder(user.id, r.id)} style={{ padding: '0.5rem', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="notes"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
                                        <textarea
                                            placeholder="Write your thoughts, goals, or progress notes here..."
                                            value={noteText}
                                            onChange={(e) => setNoteText(e.target.value)}
                                            style={{
                                                width: '100%',
                                                minHeight: '120px',
                                                background: 'none',
                                                border: 'none',
                                                color: 'white',
                                                fontSize: '0.95rem',
                                                resize: 'none',
                                                outline: 'none'
                                            }}
                                        />
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                            {editingNoteId && (
                                                <button className="btn-outline" onClick={() => { setEditingNoteId(null); setNoteText(''); }}>Cancel</button>
                                            )}
                                            <button className="btn-primary" onClick={handleSaveNote}>
                                                <Save size={16} /> {editingNoteId ? 'Update Note' : 'Save Note'}
                                            </button>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                        {userNotes.length === 0 ? (
                                            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: 'var(--muted-foreground)' }}>
                                                <StickyNote size={32} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                                                <p>Your notebook is empty. Start taking notes!</p>
                                            </div>
                                        ) : (
                                            [...userNotes].reverse().map(note => (
                                                <div key={note.id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                                                    <p style={{ fontSize: '0.9rem', lineHeight: '1.5', margin: 0, color: 'rgba(255,255,255,0.9)' }}>{note.text}</p>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                        <span style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)' }}>{new Date(note.date || note.createdAt).toLocaleDateString()}</span>
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button onClick={() => startEditingNote(note)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: '700' }}>Edit</button>
                                                            <button onClick={() => deleteNote(user.id, note.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Right Column: Statistics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="premium-card">
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1.5rem' }}>Upcoming Reminders</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {userReminders
                            .filter(r => new Date(r.date) >= new Date(new Date().setHours(0, 0, 0, 0)))
                            .sort((a, b) => new Date(a.date + 'T' + (a.time || '00:00')) - new Date(b.date + 'T' + (b.time || '00:00')))
                            .slice(0, 5)
                            .map(r => (
                                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                                    <div style={{ width: '40px', textAlign: 'center' }}>
                                        <p style={{ fontSize: '0.9rem', fontWeight: '800', margin: 0 }}>{new Date(r.date).getDate()}</p>
                                        <p style={{ fontSize: '0.6rem', color: 'var(--muted-foreground)', margin: 0 }}>{new Date(r.date).toLocaleString('default', { month: 'short' })}</p>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: '0.85rem', fontWeight: '600', margin: 0 }}>{r.text}</p>
                                        <p style={{ fontSize: '0.7rem', color: 'var(--primary)', margin: 0 }}>{r.time || 'All Day'}</p>
                                    </div>
                                </div>
                            ))
                        }
                        {userReminders.length === 0 && <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', textAlign: 'center' }}>No upcoming reminders.</p>}
                    </div>
                </div>

                <div className="premium-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Recent Notes</h3>
                        <button
                            onClick={() => setActiveTab('notes')}
                            style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: '800', cursor: 'pointer' }}
                        >
                            View All
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {userNotes.length === 0 ? (
                            <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', textAlign: 'center' }}>No notes saved yet.</p>
                        ) : (
                            [...userNotes]
                                .reverse()
                                .slice(0, 3)
                                .map(note => (
                                    <div
                                        key={note.id}
                                        onClick={() => setActiveTab('notes')}
                                        style={{
                                            padding: '0.75rem',
                                            borderRadius: '12px',
                                            backgroundColor: 'rgba(255,255,255,0.02)',
                                            border: '1px solid var(--border)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <p style={{ fontSize: '0.8rem', margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                            {note.text}
                                        </p>
                                        <p style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', margin: '0.5rem 0 0' }}>
                                            {new Date(note.date || note.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))
                        )}
                        <button
                            className="btn-outline"
                            style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem', fontSize: '0.8rem' }}
                            onClick={() => { setActiveTab('notes'); setEditingNoteId(null); setNoteText(''); }}
                        >
                            + New Note
                        </button>
                    </div>
                </div>
            </div>

            {/* Reminder Modal */}
            {isReminderModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="premium-card"
                        style={{ width: '400px', padding: '2.5rem' }}
                    >
                        <h3 style={{ fontSize: '1.5rem', fontWeight: '900', marginBottom: '1.5rem', textAlign: 'center' }}>
                            {editingReminderId ? 'Edit Reminder' : 'Add Reminder'}
                        </h3>
                        <form onSubmit={handleAddReminder} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>

                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>Select Date</label>
                                <input
                                    className="input-field"
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>Set Time</label>
                                <input
                                    className="input-field"
                                    type="time"
                                    value={reminderTime}
                                    onChange={(e) => setReminderTime(e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--muted-foreground)' }}>What needs to be done?</label>
                                <input
                                    className="input-field"
                                    placeholder="e.g. Morning Protein Shake"
                                    value={reminderText}
                                    onChange={(e) => setReminderText(e.target.value)}
                                    autoFocus
                                    required
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={closeReminderModal}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{editingReminderId ? 'Update' : 'Add'}</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default Reminders;
