'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/lib/types';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  setCurrentUser: (user: User) => void;
  isLoading: boolean;
  isJefa: boolean;
  isVendedor: boolean;
  isRepartidor: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  users: [],
  setCurrentUser: () => {},
  isLoading: true,
  isJefa: false,
  isVendedor: false,
  isRepartidor: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then((data: User[]) => {
        setUsers(data);
        if (data.length > 0) {
          // Intentar recuperar de localStorage o default al primer usuario (Bryan o Jefa)
          const savedId = typeof window !== 'undefined' ? localStorage.getItem('autoclima_active_user') : null;
          const found = data.find(u => u.id === savedId) || data.find(u => u.id === 'usr-bryan') || data[0];
          setCurrentUser(found);
        }
      })
      .catch(err => console.error('Error fetching users:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleSetUser = (user: User) => {
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      localStorage.setItem('autoclima_active_user', user.id);
    }
  };

  const isJefa = currentUser?.role === 'jefa';
  const isVendedor = currentUser?.role === 'vendedor';
  const isRepartidor = currentUser?.role === 'repartidor';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        setCurrentUser: handleSetUser,
        isLoading,
        isJefa,
        isVendedor,
        isRepartidor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
