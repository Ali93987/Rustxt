"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';

const PROGRESS_KEY_PREFIX = 'russian_lesson_progress_';

const loadProgress = (userId: string | null): Set<number> => {
    if (typeof window === 'undefined' || !userId) {
        return new Set();
    }
    try {
        const key = `${PROGRESS_KEY_PREFIX}${userId}`;
        const savedProgress = localStorage.getItem(key);
        if (savedProgress) {
            const parsedProgress: number[] = JSON.parse(savedProgress);
            return new Set(parsedProgress);
        }
    } catch (error) {
        console.error("Failed to load progress from localStorage", error);
    }
    return new Set();
};

const saveProgress = (userId: string | null, newProgress: Set<number>) => {
    if (typeof window === 'undefined' || !userId) {
        return;
    }
    try {
        const key = `${PROGRESS_KEY_PREFIX}${userId}`;
        localStorage.setItem(key, JSON.stringify(Array.from(newProgress)));
    } catch (error) {
        console.error("Failed to save progress to localStorage", error);
    }
};


export const useProgress = () => {
  const { user } = useAuth();
  const userId = user?.id || null;
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (userId) {
      setCompletedLessons(loadProgress(userId));
    } else {
      // If user logs out, clear the completed lessons state.
      setCompletedLessons(new Set());
    }
  }, [userId]);

  const toggleComplete = useCallback((lessonId: number) => {
    if (!userId) return; // Do nothing if not logged in.

    setCompletedLessons(prev => {
      const newProgress = new Set(prev);
      if (newProgress.has(lessonId)) {
        newProgress.delete(lessonId);
      } else {
        newProgress.add(lessonId);
      }
      saveProgress(userId, newProgress);
      return newProgress;
    });
  }, [userId]);

  const isCompleted = useCallback((lessonId: number) => {
    if (!userId) return false; // Not completed if not logged in.
    return completedLessons.has(lessonId);
  }, [completedLessons, userId]);

  return { isCompleted, toggleComplete, completedLessons };
};
