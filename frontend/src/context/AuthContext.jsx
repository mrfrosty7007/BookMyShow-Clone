import { createContext, useState, useEffect, useCallback } from 'react';
import authService from '../services/authService.js';

export const AuthContext = createContext(null);

/**
 * Authentication Provider managing user session via HTTP-only cookies
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token') || localStorage.getItem('authToken');
      return savedUser && savedToken ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Refreshes the user session by querying /api/auth/me
   */
  const refreshSession = useCallback(async () => {
    try {
      const response = await authService.getCurrentUser();
      setUser(response.user);
      try {
        localStorage.setItem('user', JSON.stringify(response.user));
      } catch {
        // ignore storage errors
      }
      setError(null);
      return response.user;
    } catch {
      setUser(null);
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } catch {
        // ignore storage errors
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch session automatically on application mount
  useEffect(() => {
    let ignore = false;

    const checkSession = async () => {
      try {
        const response = await authService.getCurrentUser();
        if (!ignore) {
          setUser(response.user);
          try {
            localStorage.setItem('user', JSON.stringify(response.user));
          } catch {
            // ignore storage errors
          }
          setError(null);
        }
      } catch {
        if (!ignore) {
          setUser(null);
          try {
            localStorage.removeItem('token');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
          } catch {
            // ignore storage errors
          }
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    checkSession();

    return () => {
      ignore = true;
    };
  }, []);

  /**
   * Log in user with credentials
   */
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      if (response.token) {
        try {
          localStorage.setItem('token', response.token);
        } catch {
          // ignore storage errors
        }
      }
      if (response.user) {
        try {
          localStorage.setItem('user', JSON.stringify(response.user));
        } catch {
          // ignore storage errors
        }
        setUser(response.user);
      }
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register user with profile details
   */
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      if (response.token) {
        try {
          localStorage.setItem('token', response.token);
        } catch {
          // ignore storage errors
        }
      }
      if (response.user) {
        try {
          localStorage.setItem('user', JSON.stringify(response.user));
        } catch {
          // ignore storage errors
        }
        setUser(response.user);
      }
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log in administrator with credentials
   */
  const adminLogin = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.adminLogin(credentials);
      if (response.token) {
        try {
          localStorage.setItem('token', response.token);
        } catch {
          // ignore storage errors
        }
      }
      if (response.user) {
        try {
          localStorage.setItem('user', JSON.stringify(response.user));
        } catch {
          // ignore storage errors
        }
        setUser(response.user);
      }
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Log out user and clear cookie & token
   */
  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err.message);
    } finally {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } catch {
        // ignore storage errors
      }
      setUser(null);
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    login,
    adminLogin,
    register,
    logout,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
