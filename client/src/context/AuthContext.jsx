// AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { DB } from '../utils/db';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load session once, and refresh user from DB to avoid stale localStorage user
  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem('oliva_auth_user');
      if (!savedUserStr) {
        setUser(null);
        setLoading(false);
        return;
      }

      const savedUser = JSON.parse(savedUserStr);

      // Refresh from DB (so gymId/status/subscription changes are reflected)
      const users = DB.getUsers?.() || [];
      const freshUser =
        users.find(u => u.id === savedUser.id && u.role === savedUser.role) || savedUser;

      setUser(freshUser);
      localStorage.setItem('oliva_auth_user', JSON.stringify(freshUser));
    } catch (e) {
      console.error('AuthContext: Failed to restore session', e);
      setUser(null);
      localStorage.removeItem('oliva_auth_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((id, role, extraData = {}) => {
    const users = DB.getUsers?.() || [];
    console.log('Logging in:', id, role, extraData);

    const foundUser = users.find(u => u.id === id && u.role === role);

    if (!foundUser) {
      return { success: false, message: 'Invalid Login Code/ID.' };
    }

    // Member name check
    if (role === 'MEMBER' && extraData?.name) {
      const dbName = (foundUser.name || '').toLowerCase();
      const inputName = (extraData.name || '').toLowerCase();
      if (!dbName.includes(inputName) && !inputName.includes(dbName)) {
        return { success: false, message: 'Name does not match our records for this ID.' };
      }
    }

    // Member expiry
    if (role === 'MEMBER' && foundUser.status === 'expired') {
      return { success: false, message: 'Membership expired. Please contact trainer.' };
    }

    // Master trial check
    let finalUser = { ...foundUser };
    if (role === 'MASTER' && finalUser.subscriptionStatus === 'trial' && finalUser.trialEndDate) {
      const now = new Date();
      const trialEnd = new Date(finalUser.trialEndDate);
      if (now > trialEnd) finalUser.isTrialExpired = true;
    }

    setUser(finalUser);
    localStorage.setItem('oliva_auth_user', JSON.stringify(finalUser));
    return { success: true };
  }, []);

  const registerGymOwner = useCallback((formData) => {
    const users = DB.getUsers?.() || [];

    const cleanGymName = (formData.gymName || '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    let masterLoginCode = `${cleanGymName}master`;

    if (users.some(u => u.id === masterLoginCode)) {
      let counter = 1;
      while (true) {
        const suffix = counter.toString().padStart(2, '0');
        const nextCode = `${cleanGymName}master${suffix}`;
        if (!users.some(u => u.id === nextCode)) {
          masterLoginCode = nextCode;
          break;
        }
        counter++;
      }
    }

    const gymId = `GYM_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const now = new Date();
    const trialEndDate = new Date(now);
    trialEndDate.setDate(trialEndDate.getDate() + 7);

    const accountType = formData.accountType || 'MASTER';

    const newMaster = {
      id: masterLoginCode,
      role: 'MASTER',
      name: formData.name || formData.fullName || 'User',
      gymId: (accountType === 'MASTER' || accountType === 'BOTH') ? gymId : null,
      ...formData,
      accountType,
      yearsOfExperience: (accountType === 'ONLINE_COACH' || accountType === 'BOTH') ? formData.yearsOfExperience : null,
      status: 'active',
      subscriptionStatus: 'trial',
      trialStartDate: now.toISOString(),
      trialEndDate: trialEndDate.toISOString(),
      createdAt: now.toISOString(),
    };

    DB.saveUsers?.([...users, newMaster]);

    // (Optional) If you still want global gymName
    const currentSettings = DB.getSettings?.() || {};
    DB.saveSettings?.({ ...currentSettings, gymName: formData.gymName });

    setUser(newMaster);
    localStorage.setItem('oliva_auth_user', JSON.stringify(newMaster));
    return { success: true, user: newMaster };
  }, []);

  const signup = useCallback((userData) => {
    const users = DB.getUsers?.() || [];
    const { name, mobile, gender, role } = userData;

    let newId = '';
    if (role === 'MASTER') {
      const masterCount = users.filter(u => u.role === 'MASTER').length;
      newId = `MASTER${(masterCount + 1).toString().padStart(2, '0')}`;
    } else {
      const memberCount = users.filter(u => u.role === 'MEMBER').length;
      newId = `OLIVA-${(memberCount + 1).toString().padStart(3, '0')}`;
    }

    const newUser = {
      id: newId,
      name,
      mobile,
      gender,
      role,
      status: 'active',
      joinDate: new Date().toISOString().split('T')[0],
    };

    DB.saveUsers?.([...users, newUser]);

    setUser(newUser);
    localStorage.setItem('oliva_auth_user', JSON.stringify(newUser));
    return { success: true, user: newUser };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('oliva_auth_user');
  }, []);

  const updateUser = useCallback((updates) => {
    if (!user) return;

    const users = DB.getUsers?.() || [];
    const updatedUser = { ...user, ...updates };
    const updatedUsers = users.map(u => (u.id === user.id ? updatedUser : u));

    DB.saveUsers?.(updatedUsers);

    setUser(updatedUser);
    localStorage.setItem('oliva_auth_user', JSON.stringify(updatedUser));
  }, [user]);

  const value = useMemo(() => ({
    user,
    loading,
    login,
    signup,
    registerGymOwner,
    logout,
    updateUser,
  }), [user, loading, login, signup, registerGymOwner, logout, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
