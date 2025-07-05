'use client';

import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AuthUser {
  id: string;
  username: string;
  activeSessionToken: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('currentUser');
    setUser(null);
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const syncUser = () => {
      // If a listener is already active, unsubscribe before creating a new one.
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }

      try {
        const storedUserJSON = localStorage.getItem('currentUser');
        if (storedUserJSON) {
          const storedUser: AuthUser = JSON.parse(storedUserJSON);
          setUser(storedUser);

          // Set up a real-time listener on the user's document
          const userDocRef = doc(db, 'users', storedUser.id);
          unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
              const dbUser = docSnap.data();
              // If the token in the DB does not match the token in localStorage,
              // it means a newer session has been created. Log this session out.
              if (dbUser.activeSessionToken && dbUser.activeSessionToken !== storedUser.activeSessionToken) {
                console.log('Newer session detected. Logging out this session.');
                logout();
              }
            } else {
              // The user document was deleted, so log out.
              console.log('User document not found. Logging out.');
              logout();
            }
          }, (error) => {
            console.error("Error with session listener:", error);
            logout();
          });

        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to process user session', error);
        logout(); // Logout on error to be safe
      } finally {
        setIsLoading(false);
      }
    };

    syncUser();

    window.addEventListener('storage', syncUser);

    return () => {
      window.removeEventListener('storage', syncUser);
      if (unsubscribe) {
        unsubscribe(); // Cleanup the listener on component unmount
      }
    };
  }, [logout]);

  return { user, logout, isLoading };
};
