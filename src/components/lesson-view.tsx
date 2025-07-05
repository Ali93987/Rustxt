"use client";

import { useEffect, useRef } from 'react';
import type { Lesson, Category } from '@/lib/data';
import { useProgress } from '@/hooks/use-progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Check, CirclePlay, RotateCcw } from 'lucide-react';

type SerializableCategory = Omit<Category, 'icon'>;

interface LessonViewProps {
  lesson: Lesson;
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
          { src: 'https://placehold.co/192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'https://placehold.co/512x512.png', sizes: '512x512', type: 'image/png' },
        ]
      });

      const playAction = () => audio.play();
      const pauseAction = () => audio.pause();

      navigator.mediaSession.setActionHandler('play', playAction);
      navigator.mediaSession.setActionHandler('pause', pauseAction);

      // Clean up on component unmount
      return () => {
        navigator.mediaSession.setActionHandler('play', null);
        navigator.mediaSession.setActionHandler('pause', null);
      };
    }
  }, [lesson, category]);

  return (
    <>
      <Separator className="my-8" />
      <div className="mt-8 space-y-6">
        <div>
          <h2 className="text-2xl font-headline mb-4 flex items-center gap-2">
            <CirclePlay className="text-primary" />
            درس صوتی
          </h2>
          <div className="bg-muted p-4 rounded-lg">
            <audio ref={audioRef} controls className="w-full">
              <source src={lesson.audioSrc} type="audio/mpeg" />
              مرورگر شما از این فایل صوتی پشتیبانی نمی‌کند.
            </audio>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            با استفاده از کنترل‌های مدیا در گوشی خود (حتی در صفحه قفل) می‌توانید پخش را کنترل کنید.
          </p>
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
