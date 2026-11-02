import React, { createContext, useState, useEffect, useContext } from 'react';
import { authenticateUser, seedInitialDataIfNeeded } from '../firebase/services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('fleet_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Run background seed and sync without blocking UI
    seedInitialDataIfNeeded().catch(err => {
      console.log("Background seeder note:", err.message);
    });
  }, []);

  const login = async (mobile, password) => {
    setLoading(true);
    try {
      const authenticatedUser = await authenticateUser(mobile, password);
      localStorage.setItem('fleet_user', JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);
      return authenticatedUser;
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('fleet_user');
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
