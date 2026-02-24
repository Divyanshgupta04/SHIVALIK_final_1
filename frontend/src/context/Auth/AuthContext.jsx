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
      const response = await axios.get('/api/auth/me');
      if (response.data.success) {
        setUser(response.data.user);
      } else {
        // Mock user for local preview
        setMockUser();
      }
    } catch (error) {
      // User is not authenticated, use mock for preview
      setMockUser();
    } finally {
      setLoading(false);
    }
  }, []);

  const setMockUser = () => {
    setUser({
      id: "mock_id_123",
      name: "Parkash Sharma",
      email: "shubh@gmail.com",
      phone: "+91 98765 43210",
      createdAt: "2025-01-01T00:00:00.000Z",
      avatar: null,
      isVerified: true,
      _isMock: true, // Flag so other contexts don't make authenticated API calls
      address: {
        line1: "123 Main St",
        city: "Jammu",
        state: "J&K",
        postalCode: "180001",
        country: "India"
      }
    });
  };

  // Google OAuth login - redirect to backend OAuth flow
  const loginWithGoogle = useCallback(() => {
    window.location.href = `${config.apiUrl}/api/auth/google`;
  }, []);

  // Handle OAuth callback success
  const handleAuthSuccess = useCallback(async () => {
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
  }, []);

  // Logout user
  const logout = useCallback(async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      // Even if logout fails on server, clear local state
      setUser(null);
      console.error('Logout error:', error);
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
