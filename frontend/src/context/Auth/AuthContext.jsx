import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import config from '../../config/api';

const AuthContext = createContext();

// Configure axios defaults
axios.defaults.baseURL = `${config.apiUrl}/api`;
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
  const [authStep, setAuthStep] = useState('form'); // 'form' | 'otp'
  const [tempUserId, setTempUserId] = useState(null);
  const [authType, setAuthType] = useState(null); // 'login' | 'register'

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/user-auth/me');
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

  // Passwordless: Request OTP (name + email)
  const requestOtp = async (data) => {
    try {
      const response = await axios.post('/user-auth/request-otp', data);
      if (response.data.success) {
        setTempUserId(response.data.userId);
        setAuthType('login');
        setAuthStep('otp');
        toast.success(response.data.message);
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to request OTP';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Passwordless: Verify OTP
  const verifyOtp = async (otp) => {
    try {
      const response = await axios.post('/user-auth/verify-otp', {
        userId: tempUserId,
        otp
      });
      if (response.data.success) {
        setUser(response.data.user);
        setAuthStep('form');
        setTempUserId(null);
        setAuthType(null);
        toast.success(response.data.message);
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Verification failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Deprecated legacy login (kept for compatibility)
  const login = async (credentials) => {
    try {
      const response = await axios.post('/user-auth/login', credentials);
      if (response.data.success) {
        setTempUserId(response.data.userId);
        setAuthType('login');
        setAuthStep('otp');
        toast.success(response.data.message);
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Deprecated legacy verify login (kept for compatibility)
  const verifyLogin = async (otp) => {
    try {
      const response = await axios.post('/user-auth/verify-login', {
        userId: tempUserId,
        otp
      });
      if (response.data.success) {
        setUser(response.data.user);
        setAuthStep('form');
        setTempUserId(null);
        setAuthType(null);
        toast.success(response.data.message);
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Verification failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Resend OTP
  const resendOTP = async () => {
    if (!tempUserId) {
      toast.error('No active verification session');
      return { success: false };
    }

    try {
      const response = await axios.post('/user-auth/resend-otp', {
        userId: tempUserId,
        type: 'login'
      });
      if (response.data.success) {
        toast.success(response.data.message);
        return { success: true };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend OTP';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await axios.post('/user-auth/logout');
      setUser(null);
      setAuthStep('form');
      setTempUserId(null);
      setAuthType(null);
      toast.success('Logged out successfully');
    } catch (error) {
      // Even if logout fails on server, clear local state
      setUser(null);
      setAuthStep('form');
      setTempUserId(null);
      setAuthType(null);
      console.error('Logout error:', error);
    }
  };

  // Reset auth state (for canceling OTP step)
  const resetAuth = () => {
    setAuthStep('form');
    setTempUserId(null);
    setAuthType(null);
  };

  const value = {
    user,
    loading,
    authStep,
    authType,
    // New passwordless flow
    requestOtp,
    verifyOtp,
    resendOTP,
    // Legacy (still exported just in case)
    login,
    verifyLogin,
    logout,
    resetAuth,
    checkAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
