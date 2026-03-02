import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { MessageSquare, Send, Search, MoreVertical, Star, ShieldCheck } from 'lucide-react';

const TrainerChat = () => {
    const { user } = useAuth();
    const { members, master, chats, saveChatMessage } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedParticipant, setSelectedParticipant] = useState(null);
    const [messageText, setMessageText] = useState('');

    const assignedMembers = members.filter(m => m.trainerId === user.id);
    const participants = [];

    // Prioritize Master at the top
    if (master && master.id !== user.id) {
        participants.push({ ...master, category: 'Master' });
    }

    // Add Assigned Members
    assignedMembers.forEach(m => {
        participants.push({ ...m, category: 'Member' });
    });

    const filteredParticipants = participants.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const activeConversation = selectedParticipant ? (chats[user.id]?.[selectedParticipant.id] || []) : [];

    const handleSendMessage = (e) => {
        if (e) e.preventDefault();
        if (!messageText.trim() || !selectedParticipant) return;
        saveChatMessage(user.id, selectedParticipant.id, messageText.trim());
        setMessageText('');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '900' }}>Chats</h1>
                    <p style={{ color: 'var(--muted-foreground)' }}>Communicate with your members and gym owner</p>
                </div>
            </div>

            <div className="premium-card" style={{ padding: 0, overflow: 'hidden', height: 'calc(100vh - 250px)', display: 'grid', gridTemplateColumns: 'minmax(250px, 30%) 1fr' }}>
                {/* Conversations List */}
                <div style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--background)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                            <Search size={18} color="var(--muted-foreground)" />
                            <input
                                type="text"
                                placeholder="Search chats..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--foreground)', fontSize: '0.9rem', width: '100%' }}
                            />
                        </div>
                    </div>
                    <div style={{ overflowY: 'auto' }}>
                        {filteredParticipants.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>No participants found</div>
                        ) : (
                            filteredParticipants.map(participant => (
                                <div
                                    key={participant.id}
                                    onClick={() => setSelectedParticipant(participant)}
                                    style={{
                                        padding: '1rem 1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        cursor: 'pointer',
                                        borderBottom: '1px solid var(--border)',
                                        transition: 'background-color 0.2s',
                                        backgroundColor: selectedParticipant?.id === participant.id ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent'
                                    }}
                                    onMouseOver={(e) => { if (selectedParticipant?.id !== participant.id) e.currentTarget.style.backgroundColor = 'rgba(var(--primary-rgb), 0.05)' }}
                                    onMouseOut={(e) => { if (selectedParticipant?.id !== participant.id) e.currentTarget.style.backgroundColor = 'transparent' }}
                                >
                                    <div style={{ position: 'relative' }}>
                                        <div style={{
                                            width: '45px',
                                            height: '45px',
                                            borderRadius: '12px',
                                            backgroundColor: participant.category === 'Master' ? '#3b82f6' : 'var(--primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            color: 'white'
                                        }}>
                                            {participant.category === 'Master' ? <ShieldCheck size={20} /> : participant.name.charAt(0)}
                                        </div>
                                    </div>
                                    <div style={{ flexGrow: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <p style={{ fontWeight: '600', fontSize: '0.95rem', margin: 0 }}>{participant.name}</p>
                                            <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', margin: 0 }}>{participant.category}</p>
                                        </div>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--muted-foreground)', margin: '0.2rem 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '150px' }}>
                                            {chats[user.id]?.[participant.id]?.slice(-1)[0]?.text || `Start chatting with ${participant.name.split(' ')[0]}`}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Active Chat Area */}
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
                    {selectedParticipant ? (
                        <>
                            {/* Chat Header */}
                            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '10px',
                                        backgroundColor: selectedParticipant.category === 'Master' ? '#3b82f6' : 'var(--primary)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                        color: 'white'
                                    }}>
                                        {selectedParticipant.category === 'Master' ? <ShieldCheck size={18} /> : selectedParticipant.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>{selectedParticipant.name}</h4>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>{selectedParticipant.category}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button className="btn btn-ghost" style={{ padding: '0.5rem' }}><Star size={18} /></button>
                                    <button className="btn btn-ghost" style={{ padding: '0.5rem' }}><MoreVertical size={18} /></button>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div style={{ flexGrow: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {activeConversation.length === 0 ? (
                                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem', opacity: 0.5 }}>
                                        <MessageSquare size={48} />
                                        <p>No messages yet. Say hello!</p>
                                    </div>
                                ) : (
                                    activeConversation.map((msg, i) => (
                                        <div key={msg.id || i} style={{ alignSelf: msg.senderId === user.id ? 'flex-end' : 'flex-start', maxWidth: '70%' }}>
                                            <div style={{
                                                padding: '0.75rem 1rem',
                                                borderRadius: '16px',
                                                borderBottomRightRadius: msg.senderId === user.id ? '2px' : '16px',
                                                borderBottomLeftRadius: msg.senderId === user.id ? '16px' : '2px',
                                                backgroundColor: msg.senderId === user.id ? 'var(--primary)' : 'var(--background)',
                                                color: msg.senderId === user.id ? 'white' : 'var(--foreground)',
                                                border: msg.senderId === user.id ? 'none' : '1px solid var(--border)',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                            }}>
                                                {msg.text}
                                            </div>
                                            <p style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', marginTop: '0.25rem', textAlign: msg.senderId === user.id ? 'right' : 'left' }}>
                                                {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Chat Input */}
                            <form onSubmit={handleSendMessage} style={{ padding: '1.5rem', borderTop: '1px solid var(--border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--background)', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid var(--border)' }}>
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={messageText}
                                        onChange={(e) => setMessageText(e.target.value)}
                                        style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--foreground)', fontSize: '0.95rem', width: '100%' }}
                                    />
                                    <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem', borderRadius: '8px' }} disabled={!messageText.trim()}>
                                        <Send size={18} />
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        /* No Chat Selected State */
                        <div style={{ flexGrow: 1, padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', color: 'var(--muted-foreground)' }}>
                            <div style={{ padding: '2rem', backgroundColor: 'rgba(var(--primary-rgb), 0.05)', borderRadius: '50%' }}>
                                <MessageSquare size={64} style={{ opacity: 0.3 }} />
                            </div>
                            <h3 style={{ margin: 0, color: 'var(--foreground)' }}>Your Chat Hub</h3>
                            <p style={{ margin: 0, textAlign: 'center', maxWidth: '400px' }}>Select the Gym Master or a member from the sidebar to start a conversation.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrainerChat;

