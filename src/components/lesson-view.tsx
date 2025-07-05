"use client";

import { useEffect, useRef, useState } from 'react';
import type { Lesson, Category } from '@/lib/data';
import { useProgress } from '@/hooks/use-progress';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Check, CirclePlay, RotateCcw, Loader2, Volume2 } from 'lucide-react';
import { translateWord, type TranslateWordOutput } from '@/ai/flows/translate-word-flow';

type SerializableCategory = Omit<Category, 'icon'>;

interface LessonViewProps {
  lesson: Lesson;
  category: SerializableCategory;
}

export function LessonView({ lesson, category }: LessonViewProps) {
  const { isCompleted, toggleComplete } = useProgress();
  const completed = isCompleted(lesson.id);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // State for the translation dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWord, setSelectedWord] = useState('');
  const [translation, setTranslation] = useState<TranslateWordOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pronunciationAudioRef = useRef<HTMLAudioElement>(null);

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

  const handleWordClick = async (word: string) => {
    // Clean the word from punctuation and check if it's a valid Russian word to translate
    const cleanedWord = word.trim().replace(/[.,!?;:"]+$/, '');
    if (!cleanedWord || !/^[а-яА-ЯёЁ]+$/.test(cleanedWord)) {
      return;
    }
    
    setSelectedWord(cleanedWord);
    setIsDialogOpen(true);
    setIsLoading(true);
    setError(null);
    setTranslation(null);

    try {
      const result = await translateWord({ word: cleanedWord });
      setTranslation(result);
    } catch (e) {
      console.error(e);
      setError('متأسفانه ترجمه این کلمه با خطا مواجه شد.');
    } finally {
      setIsLoading(false);
    }
  };

  const playPronunciation = () => {
    pronunciationAudioRef.current?.play();
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

      {/* Translation Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="font-headline text-3xl text-primary" dir="ltr">{selectedWord}</DialogTitle>
            <DialogDescription>
              ترجمه و تلفظ کلمه با هوش مصنوعی
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 min-h-[150px] flex items-center justify-center">
            {isLoading && (
              <div className="flex items-center justify-center flex-col gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="mr-4 text-muted-foreground">در حال ترجمه...</p>
              </div>
            )}
            {error && <p className="text-destructive text-center">{error}</p>}
            {translation && (
              <div className="space-y-4 text-right w-full">
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-lg font-semibold text-muted-foreground">ترجمه:</h3>
                  <p className="text-xl font-bold">{translation.translation}</p>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <h3 className="text-lg font-semibold text-muted-foreground">تلفظ:</h3>
                  <p className="text-lg" dir="ltr">{translation.phonetic}</p>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-muted-foreground">بشنوید:</h3>
                  <Button variant="outline" size="icon" onClick={playPronunciation}>
                    <Volume2 className="h-6 w-6 text-primary" />
                  </Button>
                  <audio ref={pronunciationAudioRef} src={translation.audioDataUri} className="hidden" />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
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
