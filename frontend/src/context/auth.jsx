import React, { useState, useEffect, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    try {
      const token = localStorage.getItem('token');
      const userInfo = localStorage.getItem('user');
      if (token && userInfo) {
        setUser(JSON.parse(userInfo));
      }
    } catch (error) {
      console.error('Error loading auth state:', error);
      // Clear potentially corrupted data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userData, token) => {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setError(null);
      // Navigate based on user role
      if (userData.role === 'ORGANIZER') {
        navigate('/dashboard/organizer');
      } else if (userData.role === 'USER') {
        navigate('/dashboard/user');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setError('Failed to save login information');
      throw error;
    }
  };

  const updateUser = (updatedUserData) => {
    try {
      const mergedUser = { ...user, ...updatedUserData };
      localStorage.setItem('user', JSON.stringify(mergedUser));
      setUser(mergedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setError(null);
      navigate('/login/user');
    } catch (error) {
      console.error('Error during logout:', error);
      setError('Failed to logout properly');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}