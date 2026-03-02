import React, { useState } from 'react';
import { useData } from '../../../context/DataContext';
import { Calendar as CalendarIcon, Filter, Download } from 'lucide-react';

const Attendance = () => {
    const { members, attendance } = useData();
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Global Attendance</h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <input
                        type="month"
                        className="input-field"
                        style={{ width: '200px' }}
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    />
                    <button className="btn-outline"><Download size={18} /> Export</button>
                </div>
            </div>

            <div className="premium-card">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                            <th style={{ padding: '1rem' }}>Member</th>
                            <th style={{ padding: '1rem' }}>Workouts This Month</th>
                            <th style={{ padding: '1rem' }}>Rest Days</th>
                            <th style={{ padding: '1rem' }}>Streak</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Status Today</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.length === 0 ? (
                            <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>No members joined.</td></tr>
                        ) : (
                            members.map(member => {
                                const [year, month] = selectedMonth.split('-');
                                const memberRecords = (attendance[member.id] || []).filter(a => {
                                    const d = new Date(a.date);
                                    return d.getFullYear() === parseInt(year) && (d.getMonth() + 1) === parseInt(month);
                                });

                                const presentCount = memberRecords.filter(a => a.status === 'present').length;
                                const restCount = memberRecords.filter(a => a.status === 'rest').length;

                                const today = new Date().toISOString().split('T')[0];
                                const todayRecord = (attendance[member.id] || []).find(a => a.date === today);

                                return (
                                    <tr key={member.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <p style={{ fontWeight: '700', margin: 0 }}>{member.name}</p>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', margin: 0 }}>ID: {member.id}</p>
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: '800', color: 'var(--primary)' }}>{presentCount}</td>
                                        <td style={{ padding: '1rem', fontWeight: '800', color: '#3b82f6' }}>{restCount}</td>
                                        <td style={{ padding: '1rem' }}>{member.streak || 0} 🔥</td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                                            {todayRecord ? (
                                                <div className="badge" style={{
                                                    backgroundColor: todayRecord.status === 'present' ? 'rgba(132, 204, 22, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                                                    color: todayRecord.status === 'present' ? 'var(--primary)' : '#3b82f6',
                                                    border: `1px solid ${todayRecord.status === 'present' ? 'rgba(132, 204, 22, 0.2)' : 'rgba(59, 130, 246, 0.2)'}`
                                                }}>
                                                    {todayRecord.status.toUpperCase()}
                                                </div>
                                            ) : (
                                                <div className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--muted-foreground)' }}>
                                                    NO RECORD
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Attendance;
