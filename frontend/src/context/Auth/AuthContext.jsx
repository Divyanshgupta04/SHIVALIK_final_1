import React, { createContext, useState, useContext, useEffect } from 'react';
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

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      // User is not authenticated
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Google OAuth login - redirect to backend OAuth flow
  const loginWithGoogle = () => {
    window.location.href = `${config.apiUrl}/api/auth/google`;
  };

  // Handle OAuth callback success
  const handleAuthSuccess = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      if (response.data.success) {
        setUser(response.data.user);
        toast.success('Welcome back!');
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Authentication failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      // Even if logout fails on server, clear local state
      setUser(null);
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    loading,
    loginWithGoogle,
    handleAuthSuccess,
    logout,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
