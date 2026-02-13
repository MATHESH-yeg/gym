import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { Send, MessageSquare, Terminal, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MemberChat = () => {
    const { user } = useAuth();
    const { members, chats, connectToTrainer, saveChatMessage } = useData();
    const [trainerCode, setTrainerCode] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef(null);

    const memberData = members.find(m => m.id === user.id) || user;
    const trainerId = memberData.trainerId;
    const myChats = (chats[trainerId] && chats[trainerId][user.id]) || [];

    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [myChats]);

    const handleConnect = (e) => {
        e.preventDefault();
        const success = connectToTrainer(user.id, trainerCode);
        if (success) {
            alert('Successfully connected to your trainer!');
        } else {
            alert('Invalid trainer code. Please check and try again.');
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;
        saveChatMessage(user.id, trainerId, newMessage);
        setNewMessage('');
    };

    if (!trainerId) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center', gap: '2rem' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(132, 204, 22, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Terminal size={40} color="var(--primary)" />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1rem' }}>Ask Trainer</h2>
                    <p style={{ color: 'var(--muted-foreground)', maxWidth: '400px' }}>To start a private chat, please enter the trainer code provided to you by the gym management.</p>
                </div>
                <form onSubmit={handleConnect} style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '400px' }}>
                    <input
                        className="input-field"
                        placeholder="ENTER TRAINER CODE"
                        value={trainerCode}
                        onChange={e => setTrainerCode(e.target.value)}
                        style={{ textAlign: 'center', letterSpacing: '0.2em' }}
                    />
                    <button className="btn-primary" type="submit">Connect</button>
                </form>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)', maxWidth: '800px', margin: '0 auto', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', backgroundColor: 'var(--surface)' }}>
            <header style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black' }}>
                    <User size={20} />
                </div>
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Master Trainer</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--primary)' }}>• Online</p>
                </div>
            </header>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {myChats.length === 0 ? (
                    <div style={{ textAlign: 'center', marginTop: '20%', opacity: 0.5 }}>
                        <MessageSquare size={48} style={{ margin: '0 auto 1rem' }} />
                        <p>No messages yet. Say hello to your trainer!</p>
                    </div>
                ) : (
                    myChats.map((msg, idx) => (
                        <div key={msg.id} style={{
                            alignSelf: msg.senderId === user.id ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: msg.senderId === user.id ? 'flex-end' : 'flex-start'
                        }}>
                            <div style={{
                                padding: '0.75rem 1rem',
                                borderRadius: msg.senderId === user.id ? '16px 16px 0 16px' : '16px 16px 16px 0',
                                backgroundColor: msg.senderId === user.id ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                color: msg.senderId === user.id ? 'black' : 'white',
                                fontSize: '0.9rem',
                                border: msg.senderId === user.id ? 'none' : '1px solid var(--border)'
                            }}>
                                {msg.text}
                            </div>
                            <span style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    ))
                )}
                <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={{ padding: '1.25rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                <input
                    className="input-field"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                />
                <button className="btn-primary" type="submit" style={{ width: '50px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Send size={20} />
                </button>
            </form>
        </div>
    );
};

export default MemberChat;
