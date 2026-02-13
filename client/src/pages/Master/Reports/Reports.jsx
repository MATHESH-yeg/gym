import React from 'react';
import { useData } from '../../../context/DataContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const Reports = () => {
    const { attendance, payments, members, progress } = useData();
    const workoutLogs = Object.values(progress || {}).flat();

    if (!workoutLogs || workoutLogs.length === 0) {
        return (
            <div className="premium-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                <h3 style={{ marginBottom: '1rem' }}>No reports yet</h3>
                <p>Start logging workouts to see reports.</p>
            </div>
        );
    }

    // Transform attendance into chart data
    const getWeeklyAttendance = () => {
        const last7Days = [...Array(7)].map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        return last7Days.map(date => {
            let count = 0;
            Object.values(attendance).forEach(userLogs => {
                if (userLogs.some(l => l.date === date && l.status === 'present')) count++;
            });
            return {
                name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                attendance: count,
                fullDate: date
            };
        });
    };

    const weeklyData = getWeeklyAttendance();
    const totalPayments = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

    const COLORS = ['#84cc16', '#3b82f6', '#a855f7', '#f59e0b'];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                <div className="premium-card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Weekly Attendance</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                                <YAxis stroke="var(--muted-foreground)" />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
                                />
                                <Bar dataKey="attendance" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="premium-card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Recent Revenue</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center', height: '100%', minHeight: '250px' }}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ color: 'var(--muted-foreground)', fontSize: '1rem' }}>Total Life-time Revenue</p>
                            <h2 style={{ fontSize: '3rem', color: '#3b82f6', fontWeight: '800' }}>₹{totalPayments}</h2>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Total Transactions</p>
                            <h3 style={{ fontSize: '1.5rem' }}>{payments.length}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="premium-card">
                <h3 style={{ marginBottom: '1.5rem' }}>Membership Distribution</h3>
                <div style={{ display: 'flex', justifyContent: 'center', height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={[
                                    { name: 'Active', value: members.filter(m => m.status === 'active').length },
                                    { name: 'Expired', value: members.filter(m => m.status === 'expired').length || 0 },
                                    { name: 'Inactive', value: members.filter(m => !m.status).length || 0 },
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {weeklyData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Reports;
