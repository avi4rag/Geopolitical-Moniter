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

  // Check current user session from HTTP-only cookie or Bearer token on mount
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
        localStorage.removeItem('auth_token');
      }
    } catch (err) {
      setUser(null);
      setBookmarks([]);
      localStorage.removeItem('auth_token');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    // Check if OAuth callback redirected with a session bootstrap token
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const tokenParam = params.get('token');
        if (tokenParam) {
          localStorage.setItem('auth_token', tokenParam);
          params.delete('token');
          const cleanSearch = params.toString() ? `?${params.toString()}` : '';
          window.history.replaceState({}, document.title, window.location.pathname + cleanSearch);
        }
      } catch {
        // Ignore URL parsing errors
      }
    }

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
            localStorage.removeItem('auth_token');
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
          setBookmarks([]);
          localStorage.removeItem('auth_token');
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
    if (res.data?.token) {
      localStorage.setItem('auth_token', res.data.token);
    }
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
    if (res.data?.token) {
      localStorage.setItem('auth_token', res.data.token);
    }
    if (res.data?.user) {
      setUser(res.data.user);
      setBookmarks(res.data.user.bookmarks || []);
    }
    return res;
  };

  // Google OAuth handler
  const googleAuth = async (googlePayload) => {
    const res = await apiClient.post('/auth/google', googlePayload);
    if (res.data?.token) {
      localStorage.setItem('auth_token', res.data.token);
    }
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
    } catch {
      // Ignore logout request errors
    } finally {
      localStorage.removeItem('auth_token');
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

  // Update user profile avatar
  const updateAvatar = async (avatarUrl) => {
    try {
      const res = await apiClient.put('/users/avatar', { avatar: avatarUrl });
      const updatedUser = res.data?.data || res.data?.user;
      if (updatedUser) {
        setUser(updatedUser);
      } else {
        setUser((prev) => (prev ? { ...prev, avatar: avatarUrl } : null));
      }
      return true;
    } catch (err) {
      console.error('Failed to update avatar:', err);
      throw err;
    }
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
    updateAvatar,
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
