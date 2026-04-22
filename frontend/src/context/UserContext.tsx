import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types';

interface UserContextType {
  currentUser: User | null;
  token: string | null;
  setCurrentUser: (user: User | null, token?: string) => void;
}

const UserContext = createContext<UserContextType>({
  currentUser: null,
  token: null,
  setCurrentUser: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  const setCurrentUser = (user: User | null, newToken?: string) => {
    setCurrentUserState(user);
    if (user && newToken) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('token', newToken);
      setToken(newToken);
    } else {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
      setToken(null);
    }
  };

  return (
    <UserContext.Provider value={{ currentUser, token, setCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useCurrentUser() {
  return useContext(UserContext);
}