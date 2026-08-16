import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../lib/apiClient.js';

// ─── Auth Context ─────────────────────────────────────────────────────────────
// Manages global user authentication state, session checks, and bookmarks.
// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState([]);

  // Check current user session from HTTP-only cookie on mount
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/auth/me');
      if (res.data?.user) {
        setUser(res.data.user);
        setBookmarks(res.data.user.bookmarks || []);
      } else {
        setUser(null);
        setBookmarks([]);
      }
    } catch (err) {
      setUser(null);
      setBookmarks([]);
    } fontFinally: {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    apiClient
      .get('/auth/me')
      .then((res) => {
        if (isMounted) {
          if (res.data?.user) {
            setUser(res.data.user);
            setBookmarks(res.data.user.bookmarks || []);
          } else {
            setUser(null);
            setBookmarks([]);
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
          setBookmarks([]);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Login handler
  const login = async (email, password) => {
    const res = await apiClient.post('/auth/login', { email, password });
    if (res.data?.user) {
      setUser(res.data.user);
      setBookmarks(res.data.user.bookmarks || []);
    }
    return res;
  };

  // Register handler
  const register = async (name, email, password, confirmPassword) => {
    const res = await apiClient.post('/auth/register', {
      name,
      email,
      password,
      confirmPassword,
    });
    if (res.data?.user) {
      setUser(res.data.user);
      setBookmarks(res.data.user.bookmarks || []);
    }
    return res;
  };

  // Google OAuth handler
  const googleAuth = async (googlePayload) => {
    const res = await apiClient.post('/auth/google', googlePayload);
    if (res.data?.user) {
      setUser(res.data.user);
      setBookmarks(res.data.user.bookmarks || []);
    }
    return res;
  };

  // Logout handler
  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      setUser(null);
      setBookmarks([]);
    }
  };

  // Toggle bookmark for an event
  const toggleBookmark = async (eventId) => {
    if (!user) return false;

    try {
      const res = await apiClient.post(`/users/bookmarks/${eventId}`);
      if (res.data?.bookmarks) {
        setBookmarks(res.data.bookmarks);
        setUser((prev) => (prev ? { ...prev, bookmarks: res.data.bookmarks } : null));
      }
      return res.data?.isBookmarked;
    } catch (err) {
      console.error('Bookmark error:', err);
      return false;
    }
  };

  const isBookmarked = (eventId) => {
    return bookmarks.some((id) => id.toString() === eventId?.toString());
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    bookmarks,
    login,
    register,
    googleAuth,
    logout,
    toggleBookmark,
    isBookmarked,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
