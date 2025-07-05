"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './use-auth';

const WORD_PROGRESS_KEY_PREFIX = 'russian_word_progress_';

// Data structure: { [lessonId: string]: string[] } -> maps lessonId to list of known words
type WordProgressState = Record<string, string[]>;

const loadProgress = (userId: string | null): WordProgressState => {
    if (typeof window === 'undefined' || !userId) {
        return {};
    }
    try {
        const key = `${WORD_PROGRESS_KEY_PREFIX}${userId}`;
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : {};
    } catch (e) {
        console.error("Failed to load word progress", e);
        return {};
    }
};

const saveProgress = (userId: string | null, progress: WordProgressState) => {
    if (typeof window === 'undefined' || !userId) {
        return;
    }
    try {
        const key = `${WORD_PROGRESS_KEY_PREFIX}${userId}`;
        localStorage.setItem(key, JSON.stringify(progress));
    } catch(e) {
        console.error("Failed to save word progress", e);
    }
};

export const useWordProgress = (lessonId: string) => {
  const { user } = useAuth();
  const userId = user?.id || null;

  const [allProgress, setAllProgress] = useState<WordProgressState>({});

  useEffect(() => {
    if (userId) {
      setAllProgress(loadProgress(userId));
    } else {
      // If user logs out, clear the progress from state.
      setAllProgress({});
    }
  }, [userId]);

  const knownWordsForLesson = useMemo(() => new Set(allProgress[lessonId] || []), [allProgress, lessonId]);

  const setWordKnownState = useCallback((word: string, isKnown: boolean) => {
      if (!userId) return; // Do nothing if no user is logged in.

      setAllProgress(prev => {
          const currentKnown = new Set(prev[lessonId] || []);
          if (isKnown) {
              currentKnown.add(word);
          } else {
              currentKnown.delete(word);
          }
          const newState = {
              ...prev,
              [lessonId]: Array.from(currentKnown)
          };
          saveProgress(userId, newState);
          return newState;
      });
  }, [lessonId, userId]);

  const isWordKnown = useCallback((word: string) => {
      // If no user, no words are "known".
      if (!userId) return false;
      return knownWordsForLesson.has(word);
  }, [knownWordsForLesson, userId]);

  const progressEnabled = !!userId;

  return { knownWords: knownWordsForLesson, setWordKnownState, isWordKnown, progressEnabled };
};
