import React, { createContext, useContext, useState, useEffect } from 'react';
import config from '../config/api';

const StatsContext = createContext();

export const useStats = () => {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
};

export const StatsProvider = ({ children }) => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalViews: 0,
    onlineUsers: 0
  });
  const [loading, setLoading] = useState(true);

  // Track page views (only increment on first load, not every component mount)
  useEffect(() => {
    const sessionKey = 'sessionViewed';
    const hasViewedThisSession = sessionStorage.getItem(sessionKey);
    
    if (!hasViewedThisSession) {
      // Only increment if user hasn't been counted this session
      const currentViews = parseInt(localStorage.getItem('siteViews') || '100'); // Start from 100
      const newViewCount = currentViews + 1;
      
      localStorage.setItem('siteViews', newViewCount.toString());
      sessionStorage.setItem(sessionKey, 'true');
      
      setStats(prev => ({
        ...prev,
        totalViews: newViewCount
      }));
    } else {
      // Just get existing count without incrementing
      const currentViews = parseInt(localStorage.getItem('siteViews') || '100');
      setStats(prev => ({
        ...prev,
        totalViews: currentViews
      }));
    }
  }, []);

  // Fetch user stats from API
  const fetchStats = async () => {
    try {
      const response = await fetch(`${config.apiUrl}/api/stats`);
      if (response.ok) {
        const data = await response.json();
        // Store user count in localStorage for consistency
        if (data.totalUsers) {
          localStorage.setItem('totalUsers', data.totalUsers.toString());
        }
        setStats(prev => ({
          ...prev,
          totalUsers: data.totalUsers || 245,
          onlineUsers: data.onlineUsers || 8
        }));
      }
    } catch (error) {
      console.log('Could not fetch user stats, using static fallback');
      // Static fallback: don't change on every refresh
      const storedUsers = localStorage.getItem('totalUsers') || '245';
      setStats(prev => ({
        ...prev,
        totalUsers: parseInt(storedUsers),
        onlineUsers: Math.floor(Math.random() * 15) + 3 // Only online users can vary slightly
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Update stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Increment view count
  const incrementViews = () => {
    setStats(prev => {
      const newViews = prev.totalViews + 1;
      localStorage.setItem('siteViews', newViews.toString());
      return {
        ...prev,
        totalViews: newViews
      };
    });
  };

  const value = {
    stats,
    loading,
    incrementViews
  };

  return (
    <StatsContext.Provider value={value}>
      {children}
    </StatsContext.Provider>
  );
};