import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase';

const AuthContext = createContext(null);

/**
 * Check if dev mode is enabled
 * SECURITY: Dev mode requires EXPLICIT opt-in:
 * 1. VITE_DEV_MODE must be set to 'true'
 * 2. AND must be running in development mode (not production build)
 *
 * This prevents accidental dev mode in production deployments
 */
const isDevMode = () => {
  const devModeFlag = import.meta.env.VITE_DEV_MODE === 'true';
  const isDevelopmentBuild = import.meta.env.DEV === true;
  return devModeFlag && isDevelopmentBuild;
};

// Mock user for dev mode
const DEV_USER = {
  id: 'dev-user-id',
  email: 'dev@phuongle.store',
  role: 'authenticated',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Dev mode: bypass authentication
    if (isDevMode()) {
      setUser(DEV_USER);
      setSession({ user: DEV_USER });
      setIsLoading(false);
      return;
    }

    if (!isSupabaseConfigured()) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    // Dev mode: auto sign in
    if (isDevMode()) {
      setUser(DEV_USER);
      setSession({ user: DEV_USER });
      return { data: { user: DEV_USER, session: { user: DEV_USER } }, error: null };
    }

    if (!isSupabaseConfigured()) {
      return { error: { message: 'Supabase chưa được cấu hình' } };
    }

    setError(null);
    setIsLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }

      return { data, error: null };
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { data: null, error: { message: errorMessage } };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    // Dev mode: simple sign out
    if (isDevMode()) {
      setUser(null);
      setSession(null);
      return { error: null };
    }

    if (!isSupabaseConfigured()) {
      return { error: { message: 'Supabase chưa được cấu hình' } };
    }

    setError(null);

    try {
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      setUser(null);
      setSession(null);
      return { error: null };
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      return { error: { message: errorMessage } };
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    session,
    isLoading,
    error,
    isAuthenticated: !!user,
    isDevMode: isDevMode(),
    signIn,
    signOut,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
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

// Helper to translate error messages to Vietnamese
const getErrorMessage = (error) => {
  const message = error?.message || 'Đã xảy ra lỗi';

  const errorMap = {
    'Invalid login credentials': 'Email hoặc mật khẩu không đúng',
    'Email not confirmed': 'Email chưa được xác nhận',
    'User not found': 'Không tìm thấy tài khoản',
    'Invalid email or password': 'Email hoặc mật khẩu không đúng',
    'Too many requests': 'Quá nhiều yêu cầu, vui lòng thử lại sau',
    'Network error': 'Lỗi kết nối mạng',
  };

  for (const [key, value] of Object.entries(errorMap)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  return message;
};

export default AuthContext;
