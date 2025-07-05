'use client';

import { useState, useEffect, useCallback } from 'react';

interface AuthUser {
  id: string;
  username: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // This function syncs the user state from localStorage
  const syncUser = useCallback(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to parse user from localStorage', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Sync user on initial mount
    syncUser();

    // Add event listener to sync user across tabs
    window.addEventListener('storage', syncUser);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('storage', syncUser);
    };
  }, [syncUser]);

  const logout = useCallback(() => {
    localStorage.removeItem('currentUser');
    // syncUser will be called automatically by the storage event listener,
    // but we call it here to ensure immediate UI update in the current tab.
    syncUser();
  }, [syncUser]);

  return { user, logout, isLoading };
};
