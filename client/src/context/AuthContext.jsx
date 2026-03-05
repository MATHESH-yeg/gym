// AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { DB } from '../utils/db';
import { api } from '../utils/api';


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load session once, and refresh user from DB to avoid stale localStorage user
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUserStr = localStorage.getItem('oliva_auth_user');
        const token = localStorage.getItem('oliva_access_token');

        if (!savedUserStr || !token) {
          setUser(null);
          setLoading(false);
          return;
        }

        const savedUser = JSON.parse(savedUserStr);

        // Map brand_id to gymId for DataContext compatibility
        if (savedUser.brand_id && !savedUser.gymId) {
          savedUser.gymId = savedUser.brand_id;
        }

        // Safety normalization for UI consistency
        if (!savedUser.name) savedUser.name = savedUser.full_name || savedUser.fullName;
        if (!savedUser.gymName) savedUser.gymName = savedUser.gym_name;
        if (!savedUser.mobile) savedUser.mobile = savedUser.phone;
        if (!savedUser.address) savedUser.address = savedUser.gym_location || savedUser.gymLocation;

        setUser(savedUser);
      } catch (e) {
        console.error('AuthContext: Failed to restore session', e);
        setUser(null);
        localStorage.removeItem('oliva_auth_user');
        localStorage.removeItem('oliva_access_token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email, password, extra) => {
    try {
      setLoading(true);

      // 1. Try Real API Login first (for Master accounts and synced users)
      try {
        const { user: backendUser, accessToken, refreshToken } = await api.auth.login(email, password);

        const sessionUser = {
          ...backendUser,
          gymId: backendUser.brand_id,
          name: backendUser.full_name || backendUser.name,
          gymName: backendUser.gym_name || backendUser.gymName,
          mobile: backendUser.phone || backendUser.mobile,
          role: backendUser.role
        };

        setUser(sessionUser);
        localStorage.setItem('oliva_auth_user', JSON.stringify(sessionUser));
        localStorage.setItem('oliva_access_token', accessToken);
        localStorage.setItem('oliva_refresh_token', refreshToken);
        setLoading(false);
        return { success: true };
      } catch (apiError) {
        console.warn('API Login failed, checking localStorage fallback...', apiError.message);
        // If API fails, we continue to check localStorage fallback below
      }

      // 2. Fallback for LocalStorage Users (Members, Trainers added via Dashboard)
      const role = password; // LoginMember/LoginTrainer pass role as 2nd arg
      const searchId = email.trim();

      if (role === 'MEMBER') {
        const members = DB.getUsers();
        const found = members.find(u =>
          (u.id === searchId || u.login_code === searchId) && u.role === 'MEMBER'
        );
        if (found) {
          const sessionUser = { ...found, role: 'MEMBER' };
          setUser(sessionUser);
          localStorage.setItem('oliva_auth_user', JSON.stringify(sessionUser));
          setLoading(false);
          return { success: true };
        }
      }

      if (role === 'TRAINER') {
        const trainers = DB.getTrainers();
        const found = trainers.find(t =>
          (t.id === searchId || t.code === searchId || t.trainerCode === searchId) &&
          t.status !== 'Deleted'
        );
        if (found) {
          const sessionUser = { ...found, role: 'TRAINER' };
          setUser(sessionUser);
          localStorage.setItem('oliva_auth_user', JSON.stringify(sessionUser));
          setLoading(false);
          return { success: true };
        }
      }

      setLoading(false);
      return { success: false, message: 'Invalid credentials' };
    } catch (error) {
      console.error('Login process error:', error);
      setLoading(false);
      return { success: false, message: error.message || 'Login failed' };
    }
  }, []);

  const registerGymOwner = useCallback(async (formData) => {
    try {
      // Use the API to register on the backend (PostgreSQL)
      const { user: backendUser, accessToken, refreshToken } = await api.auth.registerMaster({
        email: formData.email,
        password: formData.password || 'password123', // Default for now if not in UI
        fullName: formData.name,
        accountType: formData.accountType,
        gymName: formData.gymName,
        gymLocation: formData.gymLocation,
        yearsOfExperience: formData.yearsOfExperience,
        phone: formData.phone
      });

      const sessionUser = {
        ...backendUser,
        id: backendUser.id, // Backend returns UUID
        gymId: backendUser.brand_id, // Map for DataContext compatibility
        name: backendUser.full_name || backendUser.name || formData.name, // Normalize name
        gymName: backendUser.gym_name || backendUser.gymName || formData.gymName, // Normalize gymName
        mobile: backendUser.phone || backendUser.mobile || formData.phone, // Normalize phone
        address: backendUser.gym_location || backendUser.gymLocation || formData.gymLocation, // Normalize address
        role: 'MASTER'
      };

      setUser(sessionUser);
      localStorage.setItem('oliva_auth_user', JSON.stringify(sessionUser));
      localStorage.setItem('oliva_access_token', accessToken);

      return { success: true, user: sessionUser };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, message: error.message || 'Registration failed' };
    }
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
