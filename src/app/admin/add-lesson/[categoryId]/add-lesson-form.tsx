'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';
import type { Category } from '@/lib/data';

import { addLessonAction } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';

const initialState = {
  message: '',
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'در حال افزودن...' : 'افزودن درس'}
    </Button>
  );
}

const normalizeWord = (word: string) => {
  return word.trim().replace(/[.,!?;:"()]/g, '').toLowerCase();
};

export function AddLessonForm({ category }: { category: Pick<Category, 'id' | 'title'> }) {
  const { toast } = useToast();
  const [state, formAction] = useFormState(addLessonAction, initialState);

  const [text, setText] = useState('');
  const [vocabulary, setVocabulary] = useState<Record<string, string>>({});
  const [selectedWord, setSelectedWord] = useState('');
  const [currentTranslation, setCurrentTranslation] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // State for audio trimmer
  const [audioSrc, setAudioSrc] = useState('');
  const [audioDuration, setAudioDuration] = useState(0);
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 0]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (state?.message && !state.success) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: state.message,
      });
    }
  }, [state, toast]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleLoadedMetadata = () => {
        const duration = audio.duration;
        if (isFinite(duration)) {
          setAudioDuration(duration);
          // Set end time to full duration if it's not already set
          if (timeRange[1] === 0 || timeRange[1] > duration) {
            setTimeRange([timeRange[0], duration]);
          }
        }
      };
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      };
    }
  }, [audioSrc]);

  const handleWordClick = (word: string) => {
    const normalized = normalizeWord(word);
    if (!normalized) return;
    setSelectedWord(normalized);
    setCurrentTranslation(vocabulary[normalized] || '');
    setIsDialogOpen(true);
  };

  const handleSaveTranslation = () => {
    if (selectedWord) {
      setVocabulary(prev => ({ ...prev, [selectedWord]: currentTranslation }));
    }
    setIsDialogOpen(false);
    setSelectedWord('');
    setCurrentTranslation('');
  };

  const wordsAndSeparators = text.split(/([ \n\t]+)/);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">افزودن درس جدید به دسته‌بندی «{category.title}»</CardTitle>
          <CardDescription>
            اطلاعات درس جدید را وارد کنید. پس از وارد کردن متن، روی کلمات کلیک کنید تا ترجمه آن‌ها را اضافه کنید.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <input type="hidden" name="categoryId" value={category.id} />
          <input type="hidden" name="vocabulary" value={JSON.stringify(vocabulary)} />
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="title">عنوان درس</Label>
                    <Input id="title" name="title" placeholder="مثلا: سلام و احوالپرسی" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="subtitle">زیرنویس (اختیاری)</Label>
                    <Input id="subtitle" name="subtitle" placeholder="اولین قدم برای شروع مکالمه" />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="logoSrc">آدرس اینترنتی لوگو (اختیاری)</Label>
                <div className="space-y-1">
                    <Input
                        id="logoSrc"
                        name="logoSrc"
                        placeholder="https://placehold.co/100x100.png"
                        dir="ltr"
                    />
                    <p className="text-sm text-muted-foreground">
                        آدرس کامل تصویر را وارد کنید. اگر خالی بماند، از تصویر پیش‌فرض استفاده می‌شود.
                    </p>
                </div>
            </div>
             <div className="space-y-2">
              <Label>نوع درس</Label>
              <RadioGroup name="isVip" defaultValue="false" className="flex items-center gap-x-4">
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="false" id="isVip-false" />
                  <Label htmlFor="isVip-false" className="font-normal">عادی (برای همه)</Label>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse">
                  <RadioGroupItem value="true" id="isVip-true" />
                  <Label htmlFor="isVip-true" className="font-normal">ویژه (VIP)</Label>
                </div>
              </RadioGroup>
              <p className="text-sm text-muted-foreground">
                درس‌های ویژه فقط برای کاربرانی که وارد شده‌اند نمایش داده می‌شود.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="text-area">متن کامل درس (روسی)</Label>
              <Textarea
                id="text-area"
                name="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="متن کامل درس را اینجا وارد کنید. سپس روی کلمات در پیش‌نمایش زیر کلیک کنید."
                rows={8}
                className="resize-none"
                dir="ltr"
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="translationFa-area">ترجمه فارسی درس</Label>
               <Textarea
                id="translationFa-area"
                name="translationFa"
                placeholder="ترجمه کامل و روان فارسی درس را اینجا وارد کنید. اگر خالی بماند، ترجمه با هوش مصنوعی انجام می‌شود."
                rows={8}
                className="resize-none"
                dir="rtl"
              />
              <p className="text-sm text-muted-foreground">
                این ترجمه در تب «Fa» به کاربر نمایش داده می‌شود.
              </p>
            </div>
            {text && (
              <div className="space-y-2">
                <Label>پیش‌نمایش واژگان</Label>
                <Card className="p-4 bg-muted/50" dir="ltr">
                  <p className="leading-relaxed whitespace-pre-wrap">
                    {wordsAndSeparators.map((segment, index) => {
                      const normalized = normalizeWord(segment);
                      if (!normalized) {
                        return <span key={index}>{segment}</span>;
                      }
                      const hasTranslation = vocabulary[normalized];
                      return (
                        <span
                          key={index}
                          onClick={() => handleWordClick(segment)}
                          className={cn(
                            'cursor-pointer transition-colors duration-200 rounded-sm p-0.5',
                            {
                              'bg-primary/20 hover:bg-primary/30 text-primary-foreground font-semibold': hasTranslation,
                              'hover:bg-accent/50': !hasTranslation
                            }
                          )}
                        >
                          {segment}
                        </span>
                      );
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground mt-3 text-right" dir="rtl">
                    روی کلمات کلیک کنید تا معنی آن‌ها را اضافه یا ویرایش کنید.
                  </p>
                </Card>
              </div>
            )}
             <div className="space-y-2">
                <Label htmlFor="audioSrc">آدرس اینترنتی فایل صوتی (اختیاری)</Label>
                <Input
                    id="audioSrc"
                    name="audioSrc"
                    type="text"
                    placeholder="https://example.com/audio.mp3"
                    dir="ltr"
                    value={audioSrc}
                    onChange={(e) => {
                        setAudioSrc(e.target.value);
                        setAudioDuration(0);
                        setTimeRange([0, 0]);
                    }}
                />
                <p className="text-sm text-muted-foreground">
                    آدرس کامل فایل صوتی (مثلاً MP3) را وارد کنید.
                </p>
            </div>

            {audioSrc && (
                <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <audio ref={audioRef} src={audioSrc} controls className="w-full" preload="metadata" />
                    {audioDuration > 0 && (
                        <div className="space-y-2 pt-2">
                            <Label>برش فایل صوتی</Label>
                            <Slider
                                value={timeRange}
                                onValueChange={(newRange) => setTimeRange(newRange as [number, number])}
                                max={audioDuration}
                                step={0.1}
                            />
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>شروع: {formatTime(timeRange[0])}</span>
                                <span>پایان: {formatTime(timeRange[1])}</span>
                            </div>
                            <p className="text-xs text-muted-foreground pt-2">
                                با استفاده از دستگیره‌ها، بخش مورد نظر برای پخش را انتخاب کنید.
                            </p>
                        </div>
                    )}
                </div>
            )}

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="audioStartTime">زمان شروع پخش (ثانیه)</Label>
                    <Input
                        id="audioStartTime"
                        name="audioStartTime"
                        type="number"
                        placeholder="0"
                        min="0"
                        value={Math.round(timeRange[0])}
                        onChange={e => setTimeRange([Number(e.target.value), timeRange[1]])}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="audioEndTime">زمان پایان پخش (ثانیه)</Label>
                    <Input
                        id="audioEndTime"
                        name="audioEndTime"
                        type="number"
                        placeholder={audioDuration ? Math.round(audioDuration).toString() : "0"}
                        min="0"
                        value={Math.round(timeRange[1])}
                        onChange={e => setTimeRange([timeRange[0], Number(e.target.value)])}
                    />
                </div>
            </div>
            <p className="text-sm text-muted-foreground -mt-2">
                برای پخش بخشی از فایل صوتی، زمان شروع و پایان را به ثانیه وارد کنید یا از دستگیره‌های بالا استفاده کنید. اگر خالی بماند، کل فایل پخش می‌شود.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
             <Button variant="link" asChild>
                <Link href="/admin/dashboard">انصراف و بازگشت</Link>
            </Button>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              ترجمه کلمه: <Badge variant="secondary" className="text-lg font-bold">{selectedWord}</Badge>
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="translation-input">معنی فارسی</Label>
            <Input
              id="translation-input"
              value={currentTranslation}
              onChange={(e) => setCurrentTranslation(e.target.value)}
              placeholder="معنی را اینجا وارد کنید..."
              className="mt-2"
              dir="rtl"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">لغو</Button>
            </DialogClose>
            <Button onClick={handleSaveTranslation}>ذخیره</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
