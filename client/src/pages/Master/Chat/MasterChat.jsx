import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { Send, MessageSquare, User, Search, ChevronRight, Edit2, Trash2, X, Check } from 'lucide-react';

const MasterChat = () => {
    const { user } = useAuth();
    const { members, chats, saveChatMessage, updateChatMessage, deleteChatMessage } = useData();
    const [selectedMemberId, setSelectedMemberId] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingMsgId, setEditingMsgId] = useState(null);
    const [editedText, setEditedText] = useState('');
    const chatEndRef = useRef(null);

    // Filter members who are connected to this trainer and have a chat history or are in the chat object
    const trainerChats = chats[user.id] || {};
    const chatMemberIds = Object.keys(trainerChats);
    const linkedMembers = members.filter(m => {
        const isLinked = m.trainerId === user.id || chatMemberIds.includes(m.id);
        if (!isLinked) return false;

        // Apply Search Filter
        if (searchTerm.trim() === '') return true;
        const lowerSearch = searchTerm.toLowerCase();
        return m.name.toLowerCase().includes(lowerSearch) || m.id.toLowerCase().includes(lowerSearch);
    });

    const selectedMember = linkedMembers.find(m => m.id === selectedMemberId);
    const currentMessages = (trainerChats[selectedMemberId]) || [];

    const scrollToBottom = () => {
        if (!editingMsgId) {
            chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [currentMessages, selectedMemberId, editingMsgId]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedMemberId) return;
        saveChatMessage(user.id, selectedMemberId, newMessage);
        setNewMessage('');
    };

    const startEditing = (msg) => {
        setEditingMsgId(msg.id);
        setEditedText(msg.text);
    };

    const cancelEditing = () => {
        setEditingMsgId(null);
        setEditedText('');
    };

    const saveEdit = (msgId) => {
        if (editedText.trim() !== '') {
            updateChatMessage(user.id, selectedMemberId, msgId, editedText);
        }
        setEditingMsgId(null);
        setEditedText('');
    };

    const handleDelete = (msgId) => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            deleteChatMessage(user.id, selectedMemberId, msgId);
        }
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', height: 'calc(100vh - 150px)', border: '1px solid var(--border)', borderRadius: '16px', overflow: 'hidden', backgroundColor: 'var(--surface)' }}>
            {/* Sidebar - Member List */}
            <div style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                <header style={{ padding: '1.25rem', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '1rem' }}>Member Chats</h3>
                    <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted-foreground)' }} />
                        <input
                            className="input-field"
                            placeholder="Search members..."
                            style={{ paddingLeft: '36px', fontSize: '0.8rem' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {linkedMembers.length === 0 ? (
                        <p style={{ textAlign: 'center', padding: '2rem', fontSize: '0.8rem', color: 'var(--muted-foreground)' }}>No connected members yet.</p>
                    ) : (
                        linkedMembers.map(m => (
                            <button
                                key={m.id}
                                onClick={() => setSelectedMemberId(m.id)}
                                style={{
                                    width: '100%',
                                    padding: '1rem 1.25rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    backgroundColor: selectedMemberId === m.id ? 'rgba(132, 204, 22, 0.1)' : 'transparent',
                                    border: 'none',
                                    borderBottom: '1px solid var(--border)',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: selectedMemberId === m.id ? 'var(--primary)' : 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black' }}>
                                    <User size={18} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontWeight: '600', fontSize: '0.9rem', color: selectedMemberId === m.id ? 'var(--primary)' : 'white' }}>{m.name}</p>
                                    <p style={{ fontSize: '0.7rem', color: 'var(--muted-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {trainerChats[m.id]?.slice(-1)[0]?.text || 'No messages'}
                                    </p>
                                </div>
                                <ChevronRight size={14} color="var(--muted-foreground)" />
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Window */}
            <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                {selectedMember ? (
                    <>
                        <header style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'black' }}>
                                <User size={20} />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>{selectedMember.name}</h3>
                                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>Member ID: {selectedMember.id}</p>
                            </div>
                        </header>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {currentMessages.length === 0 ? (
                                <div style={{ textAlign: 'center', marginTop: '15%', opacity: 0.5 }}>
                                    <MessageSquare size={48} style={{ margin: '0 auto 1rem' }} />
                                    <p>Start a conversation with {selectedMember.name}</p>
                                </div>
                            ) : (
                                currentMessages.map((msg, idx) => (
                                    <div key={msg.id} style={{
                                        alignSelf: msg.senderId === user.id ? 'flex-end' : 'flex-start',
                                        maxWidth: '70%',
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
                                            border: msg.senderId === user.id ? 'none' : '1px solid var(--border)',
                                            position: 'relative',
                                            group: 'hover' // Pseudo-implementation for hover handling via JS usually, or CSS
                                        }}
                                            className="message-bubble"
                                        >
                                            {editingMsgId === msg.id ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <input
                                                        autoFocus
                                                        value={editedText}
                                                        onChange={(e) => setEditedText(e.target.value)}
                                                        style={{
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            padding: '4px',
                                                            fontSize: '0.9rem',
                                                            outline: 'none',
                                                            width: '100%',
                                                            minWidth: '200px'
                                                        }}
                                                    />
                                                    <button onClick={() => saveEdit(msg.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}><Check size={16} color="black" /></button>
                                                    <button onClick={cancelEditing} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}><X size={16} color="black" /></button>
                                                </div>
                                            ) : (
                                                <>
                                                    {msg.text}
                                                    {/* Edit/Delete Actions for Sent Messages */}
                                                    {msg.senderId === user.id && (
                                                        <div className="message-actions" style={{
                                                            display: 'flex',
                                                            gap: '0.5rem',
                                                            marginTop: '0.5rem',
                                                            paddingTop: '0.5rem',
                                                            borderTop: '1px solid rgba(0,0,0,0.1)',
                                                            justifyContent: 'flex-end'
                                                        }}>
                                                            <button
                                                                onClick={() => startEditing(msg)}
                                                                style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, padding: 0, color: 'black' }}
                                                                title="Edit"
                                                            >
                                                                <Edit2 size={12} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(msg.id)}
                                                                style={{ background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6, padding: 0, color: '#991b1b' }}
                                                                title="Delete"
                                                            >
                                                                <Trash2 size={12} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        <span style={{ fontSize: '0.65rem', color: 'var(--muted-foreground)', marginTop: '0.25rem' }}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <form onSubmit={handleSendMessage} style={{ padding: '1.25rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem' }}>
                            <input
                                className="input-field"
                                placeholder={`Reply to ${selectedMember.name}...`}
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                            />
                            <button className="btn-primary" type="submit" style={{ width: '50px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Send size={20} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.3 }}>
                        <MessageSquare size={80} style={{ marginBottom: '1.5rem' }} />
                        <h3>Select a member to start chatting</h3>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MasterChat;
