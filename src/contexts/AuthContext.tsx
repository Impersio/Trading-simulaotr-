import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (e: string, p: string) => Promise<void>;
  signUpWithEmail: (e: string, p: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('/api/auth/me')
        .then(res => {
          setUser(res.data.user);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem('token');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      const res = await axios.post('/api/auth/signin', { email, password: pass });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to sign in');
    }
  };

  const signUpWithEmail = async (email: string, pass: string) => {
    try {
      const res = await axios.post('/api/auth/signup', { email, password: pass });
      localStorage.setItem('token', res.data.token);
      setUser(res.data.user);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Failed to sign up');
    }
  };

  const signOut = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signUpWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
