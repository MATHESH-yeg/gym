import React from 'react';
import { useData } from '../../../context/DataContext';
import { Flame, Trophy, TrendingUp } from 'lucide-react';

const Streaks = () => {
    const { members, streaks } = useData();

    const sortedStreaks = Object.entries(streaks)
        .map(([id, s]) => ({ id, ...s, name: members.find(m => m.id === id)?.name || id }))
        .sort((a, b) => b.current - a.current);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div className="premium-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Flame color="var(--primary)" />
                        <h4 style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Top Current Streak</h4>
                    </div>
                    <h3 style={{ fontSize: '2rem' }}>{sortedStreaks[0]?.current || 0} Days</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: '600' }}>{sortedStreaks[0]?.name || 'N/A'}</p>
                </div>
                <div className="premium-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <Trophy color="#f59e0b" />
                        <h4 style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>All-Time Record</h4>
                    </div>
                    <h3 style={{ fontSize: '2rem' }}>{Math.max(...Object.values(streaks).map(s => s.best), 0)} Days</h3>
                    <p style={{ fontSize: '0.875rem', color: '#f59e0b', fontWeight: '600' }}>Gym Record</p>
                </div>
            </div>

            <div className="premium-card">
                <h3 style={{ marginBottom: '1.5rem' }}>Member Leaderboard</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {sortedStreaks.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--muted-foreground)', padding: '2rem' }}>No streak data available.</p>
                    ) : (
                        sortedStreaks.map((s, i) => (
                            <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: '800', opacity: 0.3, width: '30px' }}>{i + 1}</span>
                                    <div>
                                        <p style={{ fontWeight: '600' }}>{s.name}</p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Best: {s.best} Days</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: '800', fontSize: '1.25rem' }}>
                                    <Flame size={20} />
                                    {s.current}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Streaks;
