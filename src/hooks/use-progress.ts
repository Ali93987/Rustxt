"use client";

import { useState, useEffect, useCallback } from 'react';

const PROGRESS_KEY = 'russian_lesson_progress';

export const useProgress = () => {
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());

  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem(PROGRESS_KEY);
      if (savedProgress) {
        const parsedProgress: number[] = JSON.parse(savedProgress);
        setCompletedLessons(new Set(parsedProgress));
      }
    } catch (error) {
      console.error("Failed to load progress from localStorage", error);
    }
  }, []);

  const saveProgress = (newProgress: Set<number>) => {
    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(Array.from(newProgress)));
    } catch (error) {
      console.error("Failed to save progress to localStorage", error);
    }
  };

  const toggleComplete = useCallback((lessonId: number) => {
    setCompletedLessons(prev => {
      const newProgress = new Set(prev);
      if (newProgress.has(lessonId)) {
        newProgress.delete(lessonId);
      } else {
        newProgress.add(lessonId);
      }
      saveProgress(newProgress);
      return newProgress;
    });
  }, []);

  const isCompleted = useCallback((lessonId: number) => {
    return completedLessons.has(lessonId);
  }, [completedLessons]);

  return { isCompleted, toggleComplete, completedLessons };
};
