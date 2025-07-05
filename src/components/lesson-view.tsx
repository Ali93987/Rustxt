"use client";

import { useEffect, useMemo, useRef } from 'react';
import type { Lesson, Category } from '@/lib/data';
import { useProgress } from '@/hooks/use-progress';
import { useWordProgress } from '@/hooks/use-word-progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Check, CirclePlay, RotateCcw, ThumbsDown, ThumbsUp } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';


type SerializableCategory = Omit<Category, 'icon' | 'lessons' | 'createdAt'>;
type SerializableLesson = Omit<Lesson, 'createdAt'>;

interface LessonViewProps {
  lesson: SerializableLesson;
  category: SerializableCategory;
}

const normalizeWord = (word: string) => {
  return word.trim().replace(/[.,!?;:"()]/g, '').toLowerCase();
};

export function LessonView({ lesson, category }: LessonViewProps) {
  const { isCompleted, toggleComplete } = useProgress();
  const { knownWords, setWordKnownState, isWordKnown } = useWordProgress(lesson.id);
  const completed = isCompleted(lesson.id);
  const audioRef = useRef<HTMLAudioElement>(null);

  const totalWordsWithTranslation = useMemo(() => {
    return lesson.vocabulary ? Object.keys(lesson.vocabulary).length : 0;
  }, [lesson.vocabulary]);
  const knownWordsCount = knownWords.size;
  const learningProgress = totalWordsWithTranslation > 0 ? (knownWordsCount / totalWordsWithTranslation) * 100 : 0;


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

  const wordsAndSeparators = lesson.text ? lesson.text.split(/([ \n\t]+)/) : [];

  return (
    <>
      {totalWordsWithTranslation > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2 font-body">
            <p className="text-sm text-muted-foreground">میزان یادگیری کلمات</p>
            <p className="text-sm font-semibold text-primary">{knownWordsCount} / {totalWordsWithTranslation}</p>
          </div>
          <Progress value={learningProgress} className="w-full h-2" />
        </div>
      )}

      {/* Lesson Text */}
      {lesson.text && (
        <div className="whitespace-pre-wrap font-body text-lg leading-relaxed text-foreground/90 mb-8 border p-4 rounded-md bg-muted/30">
          {wordsAndSeparators.map((segment, index) => {
            const normalized = normalizeWord(segment);
            const translation = normalized && lesson.vocabulary?.[normalized];

            if (translation) {
              return (
                <Popover key={index}>
                  <PopoverTrigger asChild>
                    <span
                      className={cn(
                        "cursor-pointer rounded-sm p-0.5 transition-colors duration-200",
                        isWordKnown(normalized) && "bg-primary/20 text-primary font-semibold"
                      )}
                    >
                      {segment}
                    </span>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3" align="center">
                    <p className="font-body text-base text-center pb-2">{translation}</p>
                    <Separator />
                    <div className="flex justify-around pt-2 gap-2">
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setWordKnownState(normalized, false)}
                      >
                          نمیدانم
                          <ThumbsDown className="mr-2 h-4 w-4" />
                      </Button>
                      <Button
                          size="sm"
                          onClick={() => setWordKnownState(normalized, true)}
                      >
                          میدانم
                          <ThumbsUp className="mr-2 h-4 w-4" />
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              );
            }
            return <span key={index}>{segment}</span>;
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
