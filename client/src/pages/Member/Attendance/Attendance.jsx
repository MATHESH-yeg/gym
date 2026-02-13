import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const Attendance = () => {
    const { user } = useAuth();
    const { attendance, reminders, logAttendance, saveReminder, deleteReminder } = useData();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

    const userAttendance = attendance[user.id] || [];
    const userReminders = reminders[user.id] || [];

    const getStatus = (dateStr) => {
        const record = userAttendance.find(a => a.date === dateStr);
        return record ? record.status : null;
    };

    const handleDateClick = (day) => {
        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        setSelectedDate(dateStr);
    };

    const handleToggleRest = (targetDate) => {
        const currentStatus = getStatus(targetDate);
        const newStatus = currentStatus === 'rest' ? null : 'rest';
        logAttendance(user.id, targetDate, newStatus);
    };

    const handleAddReminder = (e) => {
        e.preventDefault();
        const text = e.target.reminder.value;
        if (text) {
            saveReminder(user.id, { date: selectedDate, text });
            setIsReminderModalOpen(false);
            e.target.reset();
        }
    };

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 350px', gap: '2rem', alignItems: 'start' }}>
            <div className="premium-card" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CalendarIcon size={16} color="var(--primary)" />
                        {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h3>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                        <button className="btn-outline" style={{ padding: '0.2rem' }} onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}><ChevronLeft size={14} /></button>
                        <button className="btn-outline" style={{ padding: '0.2rem' }} onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}><ChevronRight size={14} /></button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center' }}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
                        <div key={day} style={{ padding: '0.25rem', fontSize: '0.6rem', fontWeight: 'bold', color: 'var(--muted-foreground)' }}>{day}</div>
                    ))}
                    {Array(firstDayOfMonth).fill(0).map((_, i) => <div key={`empty-${i}`} />)}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                        const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const status = getStatus(dateStr);
                        const isSelected = selectedDate === dateStr;
                        const hasReminder = userReminders.some(r => r.date === dateStr);

                        return (
                            <div
                                key={day}
                                onClick={() => setSelectedDate(dateStr)}
                                style={{
                                    aspectRatio: '1',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '6px',
                                    backgroundColor: status === 'present' ? 'var(--primary)' : status === 'rest' ? 'var(--muted)' : 'rgba(255,255,255,0.02)',
                                    color: status === 'present' ? 'var(--primary-foreground)' : 'white',
                                    fontWeight: '600',
                                    fontSize: '0.75rem',
                                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                            >
                                {day}
                                {hasReminder && <div style={{ position: 'absolute', bottom: '2px', width: '3px', height: '3px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="premium-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h4 style={{ fontSize: '0.9rem' }}>Day Info ({selectedDate})</h4>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <button
                            className={getStatus(selectedDate) === 'rest' ? 'btn-primary' : 'btn-outline'}
                            style={{ width: '100%', fontSize: '0.8125rem' }}
                            onClick={() => handleToggleRest(selectedDate)}
                        >
                            {getStatus(selectedDate) === 'rest' ? 'Remove Rest Day' : 'Mark as Rest Day'}
                        </button>

                        <hr style={{ border: '0', borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h5 style={{ fontSize: '0.8125rem' }}>Reminders</h5>
                            <button className="btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }} onClick={() => setIsReminderModalOpen(true)}>+ Add</button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {userReminders.filter(r => r.date === selectedDate).length === 0 ? (
                                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>No reminders.</p>
                            ) : (
                                userReminders.filter(r => r.date === selectedDate).map(r => (
                                    <div key={r.id} className="glass-card" style={{ padding: '0.5rem', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <span>{r.text}</span>
                                        <button onClick={() => deleteReminder(user.id, r.id)} style={{ color: '#ef4444', fontSize: '0.7rem' }}>Delete</button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {isReminderModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="premium-card" style={{ width: '350px' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Add Reminder</h3>
                        <form onSubmit={handleAddReminder} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem' }}>Date</label>
                                <input
                                    className="input-field"
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem' }}>Reminder Text</label>
                                <textarea name="reminder" className="input-field" rows="3" placeholder="Drink more water, track weight..." required></textarea>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => setIsReminderModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;
