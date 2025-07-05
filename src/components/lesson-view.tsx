"use client";

import { useEffect, useRef } from 'react';
import type { Lesson, Category } from '@/lib/data';
import { useProgress } from '@/hooks/use-progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Check, CirclePlay, RotateCcw } from 'lucide-react';

type SerializableCategory = Omit<Category, 'icon' | 'lessons' | 'createdAt'>;
type SerializableLesson = Omit<Lesson, 'createdAt'>;

interface LessonViewProps {
  lesson: SerializableLesson;
  category: SerializableCategory;
}

export function LessonView({ lesson, category }: LessonViewProps) {
  const { isCompleted, toggleComplete } = useProgress();
  const completed = isCompleted(lesson.id);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio && 'mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: lesson.title,
        artist: category.title,
        album: '!говорю - آموزش زبان روسی',
        artwork: [
          { src: lesson.logoSrc, sizes: '192x192', type: 'image/png' },
          { src: lesson.logoSrc, sizes: '512x512', type: 'image/png' },
        ]
      });
      navigator.mediaSession.setActionHandler('play', () => audio.play());
      navigator.mediaSession.setActionHandler('pause', () => audio.pause());
      return () => {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
      };
    }
  }, [lesson, category]);

  const handleWordClick = (word: string) => {
    // Clean the word from punctuation and check if it's a valid Russian word to translate
    const cleanedWord = word.trim().replace(/[.,!?;:"]+$/, '');
    if (!cleanedWord || !/^[а-яА-ЯёЁ]+$/.test(cleanedWord)) {
      return;
    }
    
    // Open Google Translate in a new tab
    const googleTranslateUrl = `https://translate.google.com/?sl=ru&tl=fa&text=${encodeURIComponent(cleanedWord)}&op=translate`;
    window.open(googleTranslateUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Interactive Lesson Text */}
      {lesson.text && (
        <div className="whitespace-pre-wrap font-body text-lg leading-relaxed text-foreground/90 mb-8 border p-4 rounded-md">
          {lesson.text.split(/(\s+)/).map((segment, index) => {
            if (segment.trim().length > 0) {
              return (
                <span
                  key={index}
                  className="cursor-pointer hover:bg-primary/20 p-1 rounded-md transition-colors"
                  onClick={() => handleWordClick(segment)}
                  onKeyDown={(e) => e.key === 'Enter' && handleWordClick(segment)}
                  role="button"
                  tabIndex={0}
                >
                  {segment}
                </span>
              );
            }
            return segment;
          })}
        </div>
      )}
      
      <Separator className="my-8" />
      
      <div className="mt-8 space-y-6">
        <div>
          <h2 className="text-2xl font-headline mb-4 flex items-center gap-2">
            <CirclePlay className="text-primary" />
            درس صوتی
          </h2>
          {lesson.audioSrc ? (
            <div className="bg-muted p-4 rounded-lg">
              <audio ref={audioRef} controls className="w-full">
                <source src={lesson.audioSrc} type="audio/mpeg" />
                مرورگر شما از این فایل صوتی پشتیبانی نمی‌کند.
              </audio>
              <p className="text-xs text-muted-foreground mt-2">
                می‌توانید پخش را با کنترل‌های مدیا در گوشی خود (حتی در صفحه قفل) کنترل کنید.
              </p>
            </div>
          ) : (
            <p className="text-muted-foreground p-4 bg-muted rounded-lg text-center">
              فایل صوتی برای این درس وجود ندارد.
            </p>
          )}
        </div>
        <div className="text-center pt-4">
          <Button
            size="lg"
            onClick={() => toggleComplete(lesson.id)}
            variant={completed ? "secondary" : "default"}
            aria-label={completed ? 'علامت‌گذاری به عنوان ناقص' : 'علامت‌گذاری به عنوان تکمیل شده'}
          >
            {completed ? (
              <>
                <RotateCcw className="ml-2 h-4 w-4" /> علامت‌گذاری به عنوان ناقص
              </>
            ) : (
              <>
                <Check className="ml-2 h-4 w-4" /> علامت‌گذاری به عنوان تکمیل شده
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
