import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import config from '../../config/api';

const AuthContext = createContext();

// Configure axios defaults
axios.defaults.baseURL = config.apiUrl;
axios.defaults.withCredentials = true;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const response = await axios.get('/api/user-auth/me');
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Google OAuth login - redirect to backend OAuth flow
  const loginWithGoogle = useCallback(() => {
    window.location.href = `${config.apiUrl}/api/auth/google`;
  }, []);

  // Handle OAuth callback success
  const handleAuthSuccess = useCallback(async () => {
    try {
      const response = await axios.get('/api/user-auth/me');
      if (response.data.success) {
        setUser(response.data.user);
        toast.success('Welcome back!');
        return { success: true };
      }
      setUser(null);
      return { success: false };
    } catch (error) {
      setUser(null);
      const message = error.response?.data?.message || 'Authentication failed';
      toast.error(message);
      return { success: false, message };
    }
  }, []);

  // Logout user
  const logout = useCallback(async () => {
    try {
      await axios.post('/api/user-auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      toast.success('Logged out successfully');
      window.location.href = '/signin';
    }
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    loginWithGoogle,
    handleAuthSuccess,
    logout,
    checkAuth
  }), [user, loading, loginWithGoogle, handleAuthSuccess, logout, checkAuth]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
