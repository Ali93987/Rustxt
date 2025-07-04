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
            Audio Lesson
          </h2>
          <div className="bg-muted p-4 rounded-lg">
            <audio controls className="w-full">
              <source src={lesson.audioSrc} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        </div>
        <div className="text-center pt-4">
          <Button
            size="lg"
            onClick={() => toggleComplete(lesson.id)}
            variant={completed ? "secondary" : "default"}
            aria-label={completed ? 'Mark lesson as incomplete' : 'Mark lesson as complete'}
          >
            {completed ? (
              <>
                <RotateCcw className="mr-2 h-4 w-4" /> Mark as Incomplete
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" /> Mark as Complete
              </>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
