"use client";

import type { Lesson } from '@/lib/data';
import { useProgress } from '@/hooks/use-progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Check, CirclePlay, RotateCcw } from 'lucide-react';

interface LessonViewProps {
  lesson: Lesson;
}

export function LessonView({ lesson }: LessonViewProps) {
  const { isCompleted, toggleComplete } = useProgress();
  const completed = isCompleted(lesson.id);

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
            <audio controls className="w-full">
              <source src={lesson.audioSrc} type="audio/mpeg" />
              مرورگر شما از این فایل صوتی پشتیبانی نمی‌کند.
            </audio>
          </div>
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
