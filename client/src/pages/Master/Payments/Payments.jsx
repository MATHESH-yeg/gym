import React, { useState, useEffect } from 'react';
import { useData } from '../../../context/DataContext';
import { CreditCard, Plus, Search, Filter, AlertCircle, FileDown, X, Trash2 } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Payments = () => {
    const { members, payments, addPayment, updatePayment, deletePayment, deleteMember, membershipPlans } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState(null);
    const [newPay, setNewPay] = useState({ memberId: '', amount: '', plan: 'Monthly', mode: 'UPI', date: new Date().toISOString().slice(0, 10), duration: 1 });
    const [memberSearch, setMemberSearch] = useState('');
    const [isExpiredModalOpen, setIsExpiredModalOpen] = useState(false);

    // --- Filter State ---
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        modes: [],
        status: '',
        plan: ''
    });
    const [filteredPayments, setFilteredPayments] = useState([]);
    const [loading, setLoading] = useState(false);

    // Initial load
    useEffect(() => {
        setFilteredPayments(payments);
    }, [payments]);

    // Apply Filters Logic
    const applyFilters = () => {
        setLoading(true);
        setTimeout(() => {
            let result = [...payments];

            // 1. Date Range
            if (filters.startDate) {
                result = result.filter(p => new Date(p.date) >= new Date(filters.startDate));
            }
            if (filters.endDate) {
                // Include the end date fully by setting time to end of day or just string comparison
                // Simple string comparison works for ISO yyyy-mm-dd if formatted correctly
                result = result.filter(p => new Date(p.date) <= new Date(filters.endDate));
            }

            // 2. Mode
            if (filters.modes.length > 0) {
                result = result.filter(p => filters.modes.includes(p.mode));
            }

            // 3. Plan
            if (filters.plan) {
                result = result.filter(p => p.plan === filters.plan);
            }

            // 4. Status (Calculated from Expiry)
            // Active = expiry > today
            // Expired = expiry < today
            // Expiring Soon = expiry > today AND expiry < today + 7 days
            if (filters.status) {
                const now = new Date();
                result = result.filter(p => {
                    if (!p.expiryDate) return filters.status === 'Expired'; // No expiry treated as expired? Or excluded? Assume expired.
                    const exp = new Date(p.expiryDate);

                    if (filters.status === 'Active') return exp > now;
                    if (filters.status === 'Expired') return exp < now;
                    if (filters.status === 'Expiring Soon') {
                        const nextWeek = new Date();
                        nextWeek.setDate(now.getDate() + 7);
                        return exp > now && exp < nextWeek;
                    }
                    return true;
                });
            }

            setFilteredPayments(result);
            setLoading(false);
            setIsFilterOpen(false); // Close panel on apply
        }, 300); // Fake delay for UX
    };

    const clearFilters = () => {
        setFilters({ startDate: '', endDate: '', modes: [], status: '', plan: '' });
        setFilteredPayments(payments);
    };

    const toggleMode = (mode) => {
        setFilters(prev => {
            const modes = prev.modes.includes(mode)
                ? prev.modes.filter(m => m !== mode)
                : [...prev.modes, mode];
            return { ...prev, modes };
        });
    };

    const handleQuickDate = (type) => {
        const today = new Date();
        let start = '';
        let end = today.toISOString().slice(0, 10);

        if (type === 'today') {
            start = end;
        } else if (type === 'week') {
            const d = new Date();
            d.setDate(d.getDate() - 7);
            start = d.toISOString().slice(0, 10);
        } else if (type === 'month') {
            const d = new Date();
            d.setDate(d.getDate() - 30);
            start = d.toISOString().slice(0, 10);
        } else if (type === 'thisMonth') {
            start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
            end = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0, 10);
        }

        setFilters(prev => ({ ...prev, startDate: start, endDate: end }));
    };

    // --- PDF Export ---
    const exportPDF = () => {
        setLoading(true);
        setTimeout(() => {
            const doc = new jsPDF();

            // Header
            doc.setFontSize(20);
            doc.setTextColor(132, 204, 22); // Primary Green
            doc.text("OLIVA FITNESS", 14, 20);

            doc.setFontSize(14);
            doc.setTextColor(0, 0, 0);
            doc.text("Payment Report", 14, 30);

            // Filter Summary
            doc.setFontSize(10);
            doc.setTextColor(100);
            let filterText = `Generated on: ${new Date().toLocaleString()}\n`;
            if (filters.startDate || filters.endDate) filterText += `Date: ${filters.startDate || 'Start'} to ${filters.endDate || 'Present'}\n`;
            if (filters.modes.length) filterText += `Modes: ${filters.modes.join(', ')}\n`;
            if (filters.status) filterText += `Status: ${filters.status}\n`;
            if (filters.plan) filterText += `Plan: ${filters.plan}`;

            doc.text(filterText, 14, 40);

            // Table
            const tableColumn = ["Member", "Amount", "Plan", "Mode", "Date", "Status"];
            const tableRows = [];

            filteredPayments.forEach(p => {
                const m = members.find(mbr => mbr.id === p.memberId);
                const status = (p.expiryDate && new Date(p.expiryDate) > new Date()) ? "Active" : "Expired";
                const paymentData = [
                    m ? m.name : p.memberId,
                    `Rs. ${p.amount}`,
                    p.plan,
                    p.mode,
                    new Date(p.date).toLocaleDateString(),
                    status
                ];
                tableRows.push(paymentData);
            });

            doc.autoTable({
                head: [tableColumn],
                body: tableRows,
                startY: 65,
                theme: 'grid',
                headStyles: { fillColor: [132, 204, 22] }, // Primary color
            });

            // Total Revenue
            const finalY = doc.lastAutoTable.finalY || 65;
            const total = filteredPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`Total Revenue: Rs. ${total}`, 14, finalY + 15);

            doc.save(`Oliva_Payments_${new Date().toISOString().slice(0, 10)}.pdf`);
            setLoading(false);
        }, 500);
    };


    // --- Existing Handlers ---
    const handleAddPayment = (e) => {
        e.preventDefault();
        // Try to resolve memberId from search term if missing
        let validMemberId = newPay.memberId;
        if (!validMemberId && memberSearch) {
            const lowerSearch = memberSearch.toLowerCase();
            const match = members.find(m =>
                `${m.name} (${m.id})`.toLowerCase() === lowerSearch ||
                m.id.toLowerCase() === lowerSearch ||
                m.name.toLowerCase() === lowerSearch
            );
            if (match) validMemberId = match.id;
        }

        if (validMemberId && newPay.amount) {
            const paymentData = { ...newPay, memberId: validMemberId };
            if (editingPayment) {
                updatePayment(editingPayment.id, paymentData);
            } else {
                const expiry = new Date();
                expiry.setMonth(expiry.getMonth() + parseInt(newPay.duration));
                addPayment({ ...paymentData, expiryDate: expiry.toISOString() });
            }
            setIsModalOpen(false);
            setEditingPayment(null);
            setNewPay({ memberId: '', amount: '', plan: 'Monthly', mode: 'UPI', date: new Date().toISOString().slice(0, 10), duration: 1 });
            setMemberSearch('');
        } else {
            alert("Please select a valid member from the list.");
        }
    };

    const handleEditClick = (payment) => {
        setEditingPayment(payment);
        setNewPay(payment);
        const m = members.find(mbr => mbr.id === payment.memberId);
        setMemberSearch(m ? `${m.name} (${m.id})` : payment.memberId);
        setIsModalOpen(true);
    };

    const handleDeletePaymentAction = (id) => {
        if (window.confirm('Are you sure you want to delete this payment record?')) {
            deletePayment(id);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem' }}>Payment Management</h3>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        className={`btn-outline ${loading ? 'opacity-50' : ''}`}
                        onClick={exportPDF}
                        disabled={loading}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <FileDown size={18} /> {loading ? 'Processing...' : 'Export PDF'}
                    </button>
                    <button
                        className="btn-outline"
                        onClick={() => setIsFilterOpen(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: Object.values(filters).some(f => f.length > 0) ? 'rgba(132, 204, 22, 0.1)' : 'transparent' }}
                    >
                        <Filter size={18} /> Filters
                        {Object.values(filters).some(f => f.length > 0) && (
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></span>
                        )}
                    </button>
                    <button className="btn-primary" onClick={() => { setEditingPayment(null); setIsModalOpen(true); }}>
                        <Plus size={20} /> Record Payment
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                <div className="premium-card" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>
                        Total Revenue {Object.values(filters).some(v => v.length) ? '(Filtered)' : '(Life-time)'}
                    </p>
                    <h3 style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>
                        ₹{filteredPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0)}
                    </h3>
                </div>
                <div
                    className="premium-card"
                    style={{ borderLeft: '4px solid #ef4444', cursor: 'pointer' }}
                    onClick={() => setIsExpiredModalOpen(true)}
                >
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '0.875rem' }}>Expired Memberships</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.5rem', marginTop: '0.5rem' }}>
                            {members.filter(m => !m.expiryDate || new Date(m.expiryDate) < new Date()).length}
                        </h3>
                        <span style={{ fontSize: '0.75rem', color: '#ef4444', textDecoration: 'underline' }}>View List</span>
                    </div>
                </div>
            </div>

            {/* Payments Table */}
            <div className="premium-card" style={{ padding: '0', overflowX: 'auto', minHeight: '300px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                        <tr style={{ textAlign: 'left' }}>
                            <th style={{ padding: '1.25rem' }}>Member</th>
                            <th style={{ padding: '1.25rem' }}>Amount</th>
                            <th style={{ padding: '1.25rem' }}>Plan</th>
                            <th style={{ padding: '1.25rem' }}>Mode</th>
                            <th style={{ padding: '1.25rem' }}>Date</th>
                            <th style={{ padding: '1.25rem' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="6" style={{ padding: '3rem', textAlign: 'center' }}>Loading...</td></tr>
                        ) : filteredPayments.length === 0 ? (
                            <tr><td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>No payment history found.</td></tr>
                        ) : (
                            filteredPayments.map(p => {
                                const m = members.find(mbr => mbr.id === p.memberId);
                                return (
                                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1.25rem' }}>{m?.name || p.memberId}</td>
                                        <td style={{ padding: '1.25rem', fontWeight: 'bold' }}>₹{p.amount}</td>
                                        <td style={{ padding: '1.25rem' }}>{p.plan}</td>
                                        <td style={{ padding: '1.25rem' }}><span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>{p.mode}</span></td>
                                        <td style={{ padding: '1.25rem' }}>{new Date(p.date).toLocaleDateString()}</td>
                                        <td style={{ padding: '1.25rem' }}>
                                            {p.expiryDate && new Date(p.expiryDate) > new Date() ? (
                                                <span className="badge badge-primary">ACTIVE</span>
                                            ) : (
                                                <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>EXPIRED</span>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Filter Right Drawer */}
            {isFilterOpen && (
                <>
                    <div
                        onClick={() => setIsFilterOpen(false)}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }}
                    />
                    <div className="premium-card" style={{
                        position: 'fixed', right: 0, top: 0, bottom: 0, width: '350px', zIndex: 1000,
                        borderRadius: '16px 0 0 16px', display: 'flex', flexDirection: 'column',
                        padding: '1.5rem', overflowY: 'auto', backgroundColor: 'var(--surface)', borderLeft: '1px solid var(--border)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.25rem' }}>Filter Payments</h3>
                            <button onClick={() => setIsFilterOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted-foreground)' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
                            {/* Date Filter */}
                            <div>
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: '600' }}>Date Range</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>From</label>
                                        <input type="date" className="input-field" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>To</label>
                                        <input type="date" className="input-field" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {['Today', 'Last 7 Days', 'Last 30 Days', 'This Month'].map(label => {
                                        const map = { 'Today': 'today', 'Last 7 Days': 'week', 'Last 30 Days': 'month', 'This Month': 'thisMonth' };
                                        return (
                                            <button key={label} onClick={() => handleQuickDate(map[label])} style={{ fontSize: '0.7rem', padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--muted-foreground)', cursor: 'pointer' }}>
                                                {label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Payment Mode */}
                            <div>
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: '600' }}>Payment Mode</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                    {['Cash', 'UPI', 'Card', 'Bank Transfer', 'Online'].map(mode => (
                                        <button
                                            key={mode}
                                            onClick={() => toggleMode(mode)}
                                            style={{
                                                fontSize: '0.8rem', padding: '0.4rem 0.8rem', borderRadius: '20px',
                                                border: filters.modes.includes(mode) ? '1px solid var(--primary)' : '1px solid var(--border)',
                                                backgroundColor: filters.modes.includes(mode) ? 'rgba(132, 204, 22, 0.1)' : 'transparent',
                                                color: filters.modes.includes(mode) ? 'var(--primary)' : 'var(--muted-foreground)',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            {mode}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: '600' }}>Subscription Status</h4>
                                <select className="input-field" value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                                    <option value="">All Statuses</option>
                                    <option value="Active">Active</option>
                                    <option value="Expiring Soon">Expiring Soon</option>
                                    <option value="Expired">Expired</option>
                                </select>
                            </div>

                            {/* Plan */}
                            <div>
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem', fontWeight: '600' }}>Membership Plan</h4>
                                <select className="input-field" value={filters.plan} onChange={e => setFilters({ ...filters, plan: e.target.value })}>
                                    <option value="">All Plans</option>
                                    {/* Dynamically distinct plans from payments or predefined plans */}
                                    {Array.from(new Set(payments.map(p => p.plan))).map(plan => (
                                        <option key={plan} value={plan}>{plan}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ marginTop: 'auto', display: 'flex', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                            <button onClick={clearFilters} className="btn-outline" style={{ flex: 1 }}>Clear All</button>
                            <button onClick={applyFilters} className="btn-primary" style={{ flex: 1 }}>Apply Filters</button>
                        </div>
                    </div>
                </>
            )}

            {/* Record Payment Modal */}
            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="premium-card" style={{ width: '400px' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>{editingPayment ? 'Edit Payment' : 'Record Payment'}</h3>
                        <form onSubmit={handleAddPayment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem' }}>Member</label>
                                <input
                                    className="input-field"
                                    list="member-options"
                                    value={memberSearch}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setMemberSearch(val);
                                        const match = members.find(m => `${m.name} (${m.id})` === val || m.id === val);
                                        if (match) {
                                            setNewPay({ ...newPay, memberId: match.id });
                                        } else {
                                            setNewPay({ ...newPay, memberId: '' });
                                        }
                                    }}
                                    placeholder="Search Member Name or ID"
                                    required
                                    disabled={!!editingPayment}
                                />
                                <datalist id="member-options">
                                    {members.map(m => (
                                        <option key={m.id} value={`${m.name} (${m.id})`} />
                                    ))}
                                </datalist>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem' }}>Amount</label>
                                    <input className="input-field" type="number" value={newPay.amount} onChange={(e) => setNewPay({ ...newPay, amount: e.target.value })} required />
                                </div>
                                {!editingPayment && (
                                    <div style={{ flex: 1 }}>
                                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem' }}>Duration (Months)</label>
                                        <input className="input-field" type="number" value={newPay.duration} onChange={(e) => setNewPay({ ...newPay, duration: e.target.value })} required />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem' }}>Plan Name</label>
                                <input className="input-field" value={newPay.plan} onChange={(e) => setNewPay({ ...newPay, plan: e.target.value })} placeholder="e.g. Monthly, Quarterly" required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.8rem' }}>Mode</label>
                                <select className="input-field" value={newPay.mode} onChange={(e) => setNewPay({ ...newPay, mode: e.target.value })}>
                                    <option>UPI</option>
                                    <option>Cash</option>
                                    <option>Card</option>
                                    <option>Other</option>
                                    <option>Online</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" className="btn-outline" style={{ flex: 1 }} onClick={() => { setIsModalOpen(false); setEditingPayment(null); }}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Expired Members Modal */}
            {isExpiredModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="premium-card" style={{ width: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{}}>Expired Members</h3>
                            <button onClick={() => setIsExpiredModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--muted-foreground)', cursor: 'pointer' }}>Close</button>
                        </div>

                        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {members.filter(m => !m.expiryDate || new Date(m.expiryDate) < new Date()).length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--muted-foreground)', padding: '2rem' }}>No expired memberships found.</p>
                            ) : (
                                members.filter(m => !m.expiryDate || new Date(m.expiryDate) < new Date()).map(m => (
                                    <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'rgba(255,255,255, 0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                                        <div>
                                            <p style={{ fontWeight: 'bold' }}>{m.name}</p>
                                            <p style={{ fontSize: '0.75rem', color: '#ef4444' }}>Expired: {m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : 'N/A'}</p>
                                        </div>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                className="btn-primary"
                                                style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}
                                                onClick={() => {
                                                    setIsExpiredModalOpen(false);
                                                    setEditingPayment(null);
                                                    setNewPay({ memberId: m.id, amount: '', plan: 'Monthly', mode: 'UPI', date: new Date().toISOString().slice(0, 10), duration: 1 });
                                                    setMemberSearch(`${m.name} (${m.id})`);
                                                    setIsModalOpen(true);
                                                }}
                                            >
                                                Renew
                                            </button>
                                            <button
                                                className="btn-outline"
                                                style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }}
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to delete this member?')) {
                                                        deleteMember(m.id);
                                                    }
                                                }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Payments;
