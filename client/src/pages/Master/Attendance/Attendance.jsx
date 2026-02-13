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
                            members.map(member => (
                                <tr key={member.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '1rem' }}>{member.name}</td>
                                    <td style={{ padding: '1rem' }}>{attendance[member.id]?.filter(a => a.status === 'present').length || 0}</td>
                                    <td style={{ padding: '1rem' }}>{attendance[member.id]?.filter(a => a.status === 'rest').length || 0}</td>
                                    <td style={{ padding: '1rem' }}>{member.streak || 0} 🔥</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <div className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>No Check-in</div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Attendance;
