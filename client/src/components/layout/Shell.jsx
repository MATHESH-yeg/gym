import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
    Home, Users, Dumbbell, Calendar, Flame, CreditCard,
    BarChart2, Settings, LogOut, Menu, X, Bell, Utensils, ClipboardList, ChevronLeft, MessageSquare, Award
} from 'lucide-react';


const Shell = ({ children }) => {
    const { user, logout } = useAuth();
    const { notifications } = useData();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    if (!user) return null;

    const isMaster = user.role === 'MASTER';

    const masterMenu = [
        { name: 'Dashboard', icon: Home, path: '/master' },
        { name: 'Members', icon: Users, path: '/master/members' },
        { name: 'Trainers', icon: Award, path: '/master/trainers' },
        { name: 'Subscriptions', icon: ClipboardList, path: '/master/manage-subscriptions' },
        { name: 'Programs', icon: Dumbbell, path: '/master/programs' },
        { name: 'Attendance', icon: Calendar, path: '/master/attendance' },
        { name: 'Streaks', icon: Flame, path: '/master/streaks' },
        { name: 'Payments', icon: CreditCard, path: '/master/payments' },
        { name: 'Member Chats', icon: MessageSquare, path: '/master/chats' },
        { name: 'Diet Plans', icon: Utensils, path: '/master/diet-plans' },
        { name: 'Settings', icon: Settings, path: '/master/settings' },
    ];

    const memberMenu = [
        { name: 'Dashboard', icon: Home, path: '/member' },
        { name: "Today's Workout", icon: Dumbbell, path: '/member/workout' },
        { name: 'Workout Plans', icon: ClipboardList, path: '/member/workout-plans' },
        { name: 'Records', icon: BarChart2, path: '/member/records' },
        { name: 'Workout Records', icon: ClipboardList, path: '/member/workout-records' },
        { name: 'Diet Plan', icon: Utensils, path: '/member/diet-plan' },
        { name: 'Ask Trainer', icon: MessageSquare, path: '/member/chat' },
        { name: 'Attendance', icon: Calendar, path: '/member/attendance' },
        { name: 'Streaks', icon: Flame, path: '/member/streaks' },
        { name: 'Membership', icon: CreditCard, path: '/member/membership' },
        { name: 'Settings', icon: Settings, path: '/member/settings' },
    ];

    const trainerMenu = [
        { name: 'Dashboard', icon: Home, path: '/trainer' },
        { name: 'My Members', icon: Users, path: '/trainer/members' },
        { name: 'Diet Plans', icon: Utensils, path: '/trainer/diet-plans' },
        { name: 'Messages', icon: MessageSquare, path: '/trainer/chats' },
        { name: 'Settings', icon: Settings, path: '/trainer/settings' },
    ];

    const menuItems = user.role === 'MASTER' ? masterMenu :
        user.role === 'TRAINER' ? trainerMenu : memberMenu;

    return (
        <div className="layout-container" style={{ display: 'flex', minHeight: '100vh' }}>

            {/* Sidebar - Desktop */}
            <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`} style={{
                width: '260px',
                backgroundColor: 'var(--surface)',
                borderRight: '1px solid var(--border)',
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                position: 'fixed',
                height: '100vh',
                zIndex: 100,
                transition: 'transform 0.3s ease'
            }}>
                <div className="logo" style={{
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    color: 'var(--primary)',
                    marginBottom: '2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <Dumbbell size={28} />
                    OLIVA
                </div>

                <nav style={{ flex: 1 }}>
                    <ul style={{ listStyle: 'none' }}>
                        {menuItems.map((item) => (
                            <li key={item.name} style={{ marginBottom: '0.5rem' }}>
                                <Link
                                    to={item.path}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.75rem',
                                        padding: '0.75rem 1rem',
                                        borderRadius: 'var(--radius)',
                                        color: location.pathname === item.path ? 'var(--primary)' : 'var(--muted-foreground)',
                                        backgroundColor: location.pathname === item.path ? 'rgba(132, 204, 22, 0.1)' : 'transparent',
                                        fontWeight: location.pathname === item.path ? '600' : '400',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <item.icon size={20} />
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <button
                    onClick={() => {
                        if (window.confirm('Are you sure you want to logout?')) {
                            logout();
                            navigate('/login');
                        }
                    }}
                    style={{
                        marginTop: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.75rem 1rem',
                        color: '#ef4444',
                        width: '100%',
                        textAlign: 'left'
                    }}
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </aside>

            {/* Main Content */}
            <main style={{
                flex: 1,
                marginLeft: '260px',
                padding: '2rem',
                maxWidth: '100vw',
                overflowX: 'hidden'
            }}>
                {/* Top Header */}
                <header style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem'
                }}>
                    <div className="mobile-only" style={{ display: 'none' }}>
                        <button onClick={() => setIsMobileMenuOpen(true)}>
                            <Menu size={24} color="white" />
                        </button>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {location.pathname !== (isMaster ? '/master' : '/member') && (
                            <button
                                onClick={() => navigate(-1)}
                                className="btn-outline"
                                style={{ padding: '0.4rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <ChevronLeft size={18} />
                            </button>
                        )}
                        <h2 style={{ fontSize: '1.25rem' }}>
                            {menuItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
                        </h2>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        {isMaster && (
                            <div style={{ position: 'relative', width: '200px' }}>
                                <input
                                    className="input-field"
                                    placeholder="Search Member..."
                                    style={{ padding: '0.4rem 0.8rem 0.4rem 2rem', fontSize: '0.8rem' }}
                                    onChange={(e) => {
                                        if (e.target.value.length > 2 && location.pathname !== '/master/members') {
                                            navigate('/master/members', { state: { search: e.target.value } });
                                        }
                                    }}
                                />
                                <div style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)' }}><Users size={14} color="var(--muted-foreground)" /></div>
                            </div>
                        )}
                        <div className="theme-toggle">
                            <button
                                onClick={() => {
                                    document.body.classList.toggle('light-theme');
                                    // You might want to save this preference to localStorage in a real app
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
                            >
                                <div style={{ filter: 'invert(1)' }}>☀️</div> {/* Simple placeholder icon, ideal is using Lucide Sun/Moon */}
                            </button>
                        </div>
                        <div style={{ position: 'relative', cursor: 'pointer' }}>
                            <Bell size={22} color="white" />
                            {notifications.filter(n => !n.read && (n.targetId === 'MASTER' || n.targetId === user.id)).length > 0 && (
                                <div style={{ position: 'absolute', top: '-5px', right: '-5px', width: '10px', height: '10px', backgroundColor: 'var(--primary)', borderRadius: '50%', border: '2px solid var(--surface)' }}></div>
                            )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>{user.name || user.fullName || 'User'}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{user.role}</div>
                            </div>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--muted)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid var(--border)',
                                fontWeight: '700'
                            }}>
                                {(user.name || user.fullName || 'U')[0]}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="content-area">
                    {children}
                </div>
            </main>

            <style>{`
        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.open {
            transform: translateX(0);
          }
          main {
            margin-left: 0 !important;
            padding: 1rem !important;
          }
          .mobile-only {
            display: block !important;
          }
        }
      `}</style>
        </div>
    );
};

export default Shell;
