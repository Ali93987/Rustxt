'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { Lesson } from '@/lib/data';
import { editLessonAction } from '@/lib/actions';
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

const initialState = {
  message: '',
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
    </Button>
  );
}

const normalizeWord = (word: string) => {
  return word.trim().replace(/[.,!?;:"()]/g, '').toLowerCase();
};

export function EditLessonForm({ lesson, categoryId }: { lesson: Lesson; categoryId: string }) {
  const { toast } = useToast();
  const [state, formAction] = useFormState(editLessonAction, initialState);

  const [text, setText] = useState(lesson.text || '');
  const [vocabulary, setVocabulary] = useState<Record<string, string>>(lesson.vocabulary || {});
  const [selectedWord, setSelectedWord] = useState('');
  const [currentTranslation, setCurrentTranslation] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (state?.message && !state.success) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: state.message,
      });
    }
  }, [state, toast]);

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
          <CardTitle className="text-2xl font-headline">ویرایش درس: {lesson.title}</CardTitle>
          <CardDescription>
            اطلاعات درس را ویرایش کنید. برای افزودن یا تغییر ترجمه، روی کلمات متن کلیک کنید.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <input type="hidden" name="lessonId" value={lesson.id} />
          <input type="hidden" name="categoryId" value={categoryId} />
          <input type="hidden" name="vocabulary" value={JSON.stringify(vocabulary)} />
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان درس</Label>
              <Input
                id="title"
                name="title"
                defaultValue={lesson.title || ''}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">زیرنویس (توضیح کوتاه)</Label>
              <Input
                id="subtitle"
                name="subtitle"
                defaultValue={lesson.subtitle || ''}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoSrc">آدرس URL لوگو</Label>
              {lesson.logoSrc && (
                <div className="mb-2">
                  <Image 
                    src={lesson.logoSrc}
                    alt="پیش‌نمایش لوگو"
                    width={80}
                    height={80}
                    className="rounded-lg border object-cover"
                  />
                </div>
              )}
              <Input
                id="logoSrc"
                name="logoSrc"
                defaultValue={lesson.logoSrc || ''}
                dir="ltr"
              />
               <p className="text-sm text-muted-foreground">
                آدرس کامل تصویر لوگوی درس را وارد کنید.
              </p>
            </div>
            <div className="space-y-2">
              <Label>نوع درس</Label>
              <RadioGroup name="isVip" defaultValue={String(lesson.isVip || false)} className="flex items-center gap-x-4">
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
              <Label htmlFor="text">متن درس (روسی)</Label>
              <Textarea
                id="text"
                name="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={10}
                className="resize-none"
                dir="ltr"
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="translationFa-area">ترجمه فارسی درس</Label>
              <Textarea
                id="translationFa-area"
                name="translationFa"
                defaultValue={lesson.translationFa || ''}
                placeholder="ترجمه کامل و روان فارسی درس را اینجا وارد کنید. اگر خالی بماند، ترجمه با هوش مصنوعی انجام می‌شود."
                rows={10}
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
              <Label htmlFor="audioSrc">آدرس اینترنتی فایل صوتی</Label>
              <Input
                id="audioSrc"
                name="audioSrc"
                type="text"
                dir="ltr"
                placeholder="https://example.com/audio.mp3"
                defaultValue={lesson.audioSrc || ''}
              />
              <p className="text-sm text-muted-foreground">
                آدرس کامل فایل صوتی را وارد کنید.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="audioStartTime">زمان شروع پخش (ثانیه)</Label>
                    <Input
                        id="audioStartTime"
                        name="audioStartTime"
                        type="number"
                        placeholder="مثلا: 180"
                        min="0"
                        defaultValue={lesson.audioStartTime ?? ''}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="audioEndTime">زمان پایان پخش (ثانیه)</Label>
                    <Input
                        id="audioEndTime"
                        name="audioEndTime"
                        type="number"
                        placeholder="مثلا: 480"
                        min="0"
                        defaultValue={lesson.audioEndTime ?? ''}
                    />
                </div>
            </div>
            <p className="text-sm text-muted-foreground -mt-2">
                برای پخش بخشی از فایل صوتی، زمان شروع و پایان را به ثانیه وارد کنید. اگر خالی بماند، کل فایل پخش می‌شود.
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
