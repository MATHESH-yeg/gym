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
    const isMember = user.role === 'MEMBER';
    const isTrainer = user.role === 'TRAINER';

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

    const menuItems = isMaster ? masterMenu : isTrainer ? trainerMenu : memberMenu;

    // Mobile Bottom Nav items configuration
    const mobileNavItems = isMaster ? [
        { name: 'Home', icon: Home, path: '/master' },
        { name: 'Members', icon: Users, path: '/master/members' },
        { name: 'Payments', icon: CreditCard, path: '/master/payments' },
        { name: 'Chats', icon: MessageSquare, path: '/master/chats' },
        { name: 'Settings', icon: Settings, path: '/master/settings' },
    ] : isMember ? [
        { name: 'Home', icon: Home, path: '/member' },
        { name: 'Workouts', icon: Dumbbell, path: '/member/workout' },
        { name: 'Diet', icon: Utensils, path: '/member/diet-plan' },
        { name: 'Payments', icon: CreditCard, path: '/member/membership' },
        { name: 'Profile', icon: Settings, path: '/member/settings' },
    ] : [
        { name: 'Home', icon: Home, path: '/trainer' },
        { name: 'Members', icon: Users, path: '/trainer/members' },
        { name: 'Diet', icon: Utensils, path: '/trainer/diet-plans' },
        { name: 'Messages', icon: MessageSquare, path: '/trainer/chats' },
        { name: 'Profile', icon: Settings, path: '/trainer/settings' },
    ];

    return (
        <div className="layout-shell">
            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar - Desktop & Mobile Drawer */}
            <aside className={`app-sidebar ${isMobileMenuOpen ? 'drawer-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="logo-brand">
                        <Dumbbell size={28} />
                        <span>OLIVA</span>
                    </div>
                    <button className="mobile-close" onClick={() => setIsMobileMenuOpen(false)}>
                        <X size={24} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <ul>
                        {menuItems.map((item) => (
                            <li key={item.name}>
                                <Link
                                    to={item.path}
                                    className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <item.icon size={20} />
                                    <span>{item.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="sidebar-footer">
                    <button
                        className="logout-btn"
                        onClick={() => {
                            if (window.confirm('Are you sure you want to logout?')) {
                                logout();
                                navigate('/login');
                            }
                        }}
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="main-wrapper">
                {/* Responsive Header */}
                <header className="app-header">
                    <div className="header-left">
                        <button className="mobile-menu-trigger" onClick={() => setIsMobileMenuOpen(true)}>
                            <Menu size={24} />
                        </button>

                        <div className="header-title-group">
                            {location.pathname !== (isMaster ? '/master' : isMember ? '/member' : '/trainer') && (
                                <button onClick={() => navigate(-1)} className="back-btn">
                                    <ChevronLeft size={20} />
                                </button>
                            )}
                            <h1 className="current-page-title">
                                {menuItems.find(i => i.path === location.pathname)?.name || 'Dashboard'}
                            </h1>
                        </div>
                    </div>

                    <div className="header-right">
                        {isMaster && (
                            <div className="header-search desktop-only">
                                <Users size={16} className="search-icon" />
                                <input
                                    placeholder="Search members..."
                                    className="search-input"
                                    onChange={(e) => {
                                        if (e.target.value.length > 2 && location.pathname !== '/master/members') {
                                            navigate('/master/members', { state: { search: e.target.value } });
                                        }
                                    }}
                                />
                            </div>
                        )}

                        <div className="header-actions">
                            <div className="notification-bell">
                                <Bell size={22} />
                                {notifications.filter(n => !n.read && (n.targetId === 'MASTER' || n.targetId === user.id)).length > 0 && <span className="unread-dot" />}
                            </div>

                            <div className="user-profile desktop-only">
                                <div className="user-info">
                                    <span className="user-name">{user.name || user.fullName || 'User'}</span>
                                    <span className="user-role">{user.role}</span>
                                </div>
                                <div className="user-avatar">
                                    {(user.name || user.fullName || 'U')[0]}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="main-content safe-bottom">
                    <div className="container">
                        {children}
                    </div>
                </main>

                {/* Mobile Bottom Navigation */}
                <nav className="mobile-bottom-nav">
                    {mobileNavItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`bottom-nav-item ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <item.icon size={22} />
                            <span>{item.name}</span>
                        </Link>
                    ))}
                </nav>
            </div>

            <style>{`
                .layout-shell {
                    display: flex;
                    min-height: 100vh;
                    background: var(--background);
                }

                .sidebar-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0,0,0,0.5);
                    backdrop-filter: blur(4px);
                    z-index: 99;
                }

                /* Sidebar Styles */
                .app-sidebar {
                    width: 280px;
                    background: var(--surface);
                    border-right: 1px solid var(--border);
                    display: flex;
                    flex-direction: column;
                    position: fixed;
                    height: 100vh;
                    z-index: 100;
                    transition: transform 0.3s ease;
                }

                .sidebar-header {
                    padding: 2rem 1.5rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .logo-brand {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-size: 1.5rem;
                    font-weight: 800;
                    color: var(--primary);
                }

                .mobile-close { display: none; }

                .sidebar-nav {
                    flex: 1;
                    padding: 0 1rem;
                    overflow-y: auto;
                }

                .sidebar-nav ul { list-style: none; }

                .nav-link {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.875rem 1rem;
                    border-radius: var(--radius);
                    color: var(--muted-foreground);
                    transition: all 0.2s;
                    margin-bottom: 0.25rem;
                }

                .nav-link:hover {
                    background: var(--surface-hover);
                    color: white;
                }

                .nav-link.active {
                    background: rgba(132, 204, 22, 0.1);
                    color: var(--primary);
                    font-weight: 600;
                }

                .sidebar-footer {
                    padding: 1.5rem;
                    border-top: 1px solid var(--border);
                }

                .logout-btn {
                    width: 100%;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 0.875rem 1rem;
                    color: var(--destructive);
                    font-weight: 600;
                }

                /* Main Body Styles */
                .main-wrapper {
                    flex: 1;
                    margin-left: 280px;
                    display: flex;
                    flex-direction: column;
                }

                .app-header {
                    height: 72px;
                    padding: 0 2rem;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: var(--background);
                    border-bottom: 1px solid var(--border);
                    position: sticky;
                    top: 0;
                    z-index: 50;
                }

                .header-left {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .mobile-menu-trigger { display: none; }

                .header-title-group {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .back-btn {
                    padding: 0.5rem;
                    border-radius: 50%;
                    background: var(--surface);
                    border: 1px solid var(--border);
                    display: flex;
                    color: white;
                }

                .current-page-title {
                    font-size: 1.25rem;
                    font-weight: 700;
                }

                .header-right {
                    display: flex;
                    align-items: center;
                    gap: 2rem;
                }

                .header-search {
                    position: relative;
                    width: 240px;
                }

                .search-icon {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--muted-foreground);
                }

                .search-input {
                    width: 100%;
                    background: var(--surface);
                    border: 1px solid var(--border);
                    border-radius: 99px;
                    padding: 0.5rem 1rem 0.5rem 2.5rem;
                    color: white;
                    font-size: 0.875rem;
                }

                .header-actions {
                    display: flex;
                    align-items: center;
                    gap: 1.5rem;
                }

                .notification-bell {
                    position: relative;
                    cursor: pointer;
                    color: var(--muted-foreground);
                }

                .unread-dot {
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    width: 8px;
                    height: 8px;
                    background: var(--primary);
                    border-radius: 50%;
                    border: 2px solid var(--background);
                }

                .user-profile {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .user-info {
                    text-align: right;
                    display: flex;
                    flex-direction: column;
                }

                .user-name { font-weight: 600; font-size: 0.875rem; }
                .user-role { font-size: 0.75rem; color: var(--muted-foreground); }

                .user-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: var(--primary);
                    color: var(--primary-foreground);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 800;
                }

                .main-content {
                    padding-top: 2rem;
                    padding-bottom: 2rem;
                }

                .mobile-bottom-nav { display: none; }

                /* MOBILE BREAKPOINTS */
                @media (max-width: 1024px) {
                    .app-sidebar {
                        transform: translateX(-100%);
                    }
                    .app-sidebar.drawer-open {
                        transform: translateX(0);
                    }
                    .main-wrapper { margin-left: 0; }
                    .mobile-menu-trigger { 
                        display: block; 
                        color: white; 
                    }
                    .mobile-close { display: block; color: white; }
                    .desktop-only { display: none; }
                    
                    .app-header {
                        padding: 0 1rem;
                    }

                    .mobile-bottom-nav {
                        display: flex;
                        position: fixed;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        height: calc(70px + env(safe-area-inset-bottom));
                        background: rgba(18, 18, 20, 0.95);
                        backdrop-filter: blur(16px);
                        border-top: 1px solid var(--border);
                        justify-content: space-around;
                        align-items: center;
                        padding-bottom: env(safe-area-inset-bottom);
                        z-index: 90;
                    }

                    .bottom-nav-item {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 0.25rem;
                        color: var(--muted-foreground);
                        font-size: 0.7rem;
                        font-weight: 500;
                        flex: 1;
                    }

                    .bottom-nav-item.active {
                        color: var(--primary);
                    }
                }

                @media (max-width: 425px) {
                    .current-page-title { font-size: 1.125rem; }
                    .header-left { gap: 0.75rem; }
                }
            `}</style>
        </div>
    );
};

export default Shell;
