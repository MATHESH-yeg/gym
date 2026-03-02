import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { Send, MessageSquare, Terminal, User, ShieldCheck, ChevronRight, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MemberChat = () => {
    const { user } = useAuth();
    const { members, trainers, chats, master, connectToTrainer, saveChatMessage, markMessagesAsSeen } = useData();
    const [trainerCode, setTrainerCode] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [selectedTarget, setSelectedTarget] = useState('MASTER'); // 'MASTER' or 'TRAINER'
    const chatEndRef = useRef(null);

    const memberData = (members || []).find(m => m.id === user?.id) || user;
    const trainerId = memberData?.trainerId;
    const assignedTrainer = (trainers || []).find(t => t.id === trainerId);

    const activeRecipientId = selectedTarget === 'MASTER' ? master?.id : trainerId;
    const myChats = (activeRecipientId && chats[user?.id] && chats[user?.id][activeRecipientId]) || [];

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
        // Mark messages as seen when conversation is active
        if (activeRecipientId && user?.id) {
            markMessagesAsSeen(user.id, activeRecipientId);
        }
    }, [myChats, selectedTarget, activeRecipientId, user?.id]);

    const handleConnect = (e) => {
        e.preventDefault();
        const success = connectToTrainer(user.id, trainerCode);
        if (success) {
            alert('Successfully connected to trainer!');
            setTrainerCode('');
        } else {
            alert('Invalid trainer code. Please check and try again.');
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeRecipientId) return;
        saveChatMessage(user.id, activeRecipientId, newMessage);
        setNewMessage('');
    };

    const participants = [
        {
            id: 'MASTER',
            name: master?.name || 'Gym Master',
            role: 'Gym Owner',
            icon: ShieldCheck,
            color: '#3b82f6',
            connected: !!master
        },
        {
            id: 'TRAINER',
            name: assignedTrainer?.name || 'Private Trainer',
            role: assignedTrainer?.specialization || 'Coaching',
            icon: User,
            color: 'var(--primary)',
            connected: !!trainerId
        }
    ];

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', height: 'calc(100vh - 180px)', maxWidth: '1000px', margin: '0 auto', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', backgroundColor: 'var(--surface)' }}>
            {/* Sidebar */}
            <div style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <header style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800' }}>Inbox</h3>
                </header>

                {/* Trainer Connection Box */}
                {!trainerId && (
                    <div style={{
                        padding: '1.25rem',
                        borderBottom: '1px solid var(--border)',
                        background: 'linear-gradient(135deg, rgba(132, 204, 22, 0.08) 0%, transparent 100%)',
                        borderLeft: '3px solid var(--primary)'
                    }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: '800', marginBottom: '0.75rem', color: 'var(--primary)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Private Coaching</p>
                        <form onSubmit={handleConnect} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <input
                                className="input-field"
                                placeholder="ENTER TRAINER CODE"
                                value={trainerCode}
                                onChange={e => setTrainerCode(e.target.value)}
                                style={{ fontSize: '0.75rem', padding: '0.6rem', textAlign: 'center', letterSpacing: '0.1em' }}
                            />
                            <button className="btn-primary" type="submit" style={{ padding: '0.6rem', fontSize: '0.75rem', width: '100%' }}>Connect Trainer</button>
                        </form>
                    </div>
                )}

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {participants.map(p => {
                        const targetId = p.id === 'MASTER' ? master?.id : trainerId;
                        const chatList = (targetId && chats[user?.id] && chats[user?.id][targetId]) || [];
                        const unreadCount = chatList.filter(msg => msg.senderId === targetId && !msg.seen).length;

                        return (
                            <button
                                key={p.id}
                                onClick={() => setSelectedTarget(p.id)}
                                style={{
                                    width: '100%',
                                    padding: '1.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '1rem',
                                    backgroundColor: selectedTarget === p.id ? 'rgba(132, 204, 22, 0.1)' : 'transparent',
                                    border: 'none',
                                    borderBottom: '1px solid var(--border)',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{
                                    width: '45px',
                                    height: '45px',
                                    borderRadius: '12px',
                                    backgroundColor: p.connected ? p.color : 'var(--border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    opacity: p.connected ? 1 : 0.5
                                }}>
                                    <p.icon size={22} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: '700', fontSize: '0.95rem', color: selectedTarget === p.id ? 'var(--primary)' : 'white', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</p>
                                    <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', margin: 0 }}>{p.role}</p>
                                </div>

                                {unreadCount > 0 && (
                                    <div style={{
                                        backgroundColor: 'var(--primary)',
                                        color: 'black',
                                        fontSize: '0.7rem',
                                        fontWeight: '800',
                                        minWidth: '20px',
                                        height: '20px',
                                        borderRadius: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '0 6px'
                                    }}>
                                        {unreadCount}
                                    </div>
                                )}
                                <ChevronRight size={14} color="var(--muted-foreground)" />
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Chat Area */}
            <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                {selectedTarget === 'TRAINER' && !trainerId ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', gap: '2rem' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(132, 204, 22, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                            <ShieldCheck size={40} color="var(--primary)" />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1.75rem', fontWeight: '900', marginBottom: '0.75rem' }}>Private Training</h2>
                            <p style={{ color: 'var(--muted-foreground)', maxWidth: '400px', fontSize: '0.95rem', lineHeight: '1.6' }}>
                                Connect with your personal coach to get custom workouts, diet guidance, and 1-on-1 support.
                            </p>
                        </div>
                        <div style={{ padding: '2rem', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '24px', border: '1px solid var(--border)', width: '100%', maxWidth: '400px' }}>
                            <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', marginBottom: '1.5rem' }}>Enter the unique code provided by your trainer below</p>
                            <form onSubmit={handleConnect} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input
                                    className="input-field"
                                    placeholder="TRAINER-CODE-001"
                                    value={trainerCode}
                                    onChange={e => setTrainerCode(e.target.value)}
                                    style={{ textAlign: 'center', letterSpacing: '0.2em', fontSize: '1.1rem', padding: '1rem' }}
                                />
                                <button className="btn-primary" type="submit" style={{ padding: '1rem', fontWeight: 'bold' }}>Start Coaching Now</button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <>
                        <header style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: participants.find(p => p.id === selectedTarget).color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                {React.createElement(participants.find(p => p.id === selectedTarget).icon, { size: 20 })}
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>{participants.find(p => p.id === selectedTarget).name}</h3>
                                <p style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>• Online</p>
                            </div>
                        </header>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {myChats.length === 0 ? (
                                <div style={{ textAlign: 'center', marginTop: '15%', opacity: 0.3 }}>
                                    <MessageSquare size={48} style={{ margin: '0 auto 1rem' }} />
                                    <p>No messages yet. Start the conversation!</p>
                                </div>
                            ) : (
                                myChats.map((msg, idx) => (
                                    <div key={msg.id || idx} style={{
                                        alignSelf: msg.senderId === user.id ? 'flex-end' : 'flex-start',
                                        maxWidth: '75%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: msg.senderId === user.id ? 'flex-end' : 'flex-start'
                                    }}>
                                        <div style={{
                                            padding: '0.75rem 1rem',
                                            borderRadius: msg.senderId === user.id ? '16px 16px 0 16px' : '16px 16px 16px 0',
                                            backgroundColor: msg.senderId === user.id ? 'var(--primary)' : 'var(--surface-hover)',
                                            color: msg.senderId === user.id ? 'black' : 'white',
                                            fontSize: '0.9rem',
                                            border: msg.senderId === user.id ? 'none' : '1px solid var(--border)'
                                        }}>
                                            {msg.text}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.4rem' }}>
                                            <span style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)' }}>
                                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {msg.senderId === user.id && msg.seen && (
                                                <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: '700' }}>• Seen</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} style={{ padding: '1.25rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                            <input
                                className="input-field"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                            />
                            <button className="btn-primary" type="submit" style={{ width: '50px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} disabled={!newMessage.trim() || !activeRecipientId}>
                                <Send size={20} />
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default MemberChat;
