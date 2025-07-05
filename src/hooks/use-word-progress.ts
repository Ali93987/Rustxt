"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';

const WORD_PROGRESS_KEY = 'russian_word_progress';

// Data structure: { [lessonId: string]: string[] } -> maps lessonId to list of known words
type WordProgressState = Record<string, string[]>;

const loadProgress = (): WordProgressState => {
    // localStorage is not available on the server, so we check for window
    if (typeof window === 'undefined') {
        return {};
    }
    try {
        const saved = localStorage.getItem(WORD_PROGRESS_KEY);
        return saved ? JSON.parse(saved) : {};
    } catch (e) {
        console.error("Failed to load word progress", e);
        return {};
    }
};

const saveProgress = (progress: WordProgressState) => {
    try {
        localStorage.setItem(WORD_PROGRESS_KEY, JSON.stringify(progress));
    } catch(e) {
        console.error("Failed to save word progress", e);
    }
};

export const useWordProgress = (lessonId: string) => {
  const [allProgress, setAllProgress] = useState<WordProgressState>({});

  useEffect(() => {
    setAllProgress(loadProgress());
  }, []);

  const knownWordsForLesson = useMemo(() => new Set(allProgress[lessonId] || []), [allProgress, lessonId]);

  const setWordKnownState = useCallback((word: string, isKnown: boolean) => {
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
          saveProgress(newState);
          return newState;
      });
  }, [lessonId]);

  const isWordKnown = useCallback((word: string) => {
      return knownWordsForLesson.has(word);
  }, [knownWordsForLesson]);

  return { knownWords: knownWordsForLesson, setWordKnownState, isWordKnown };
};
