'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useEffect } from 'react';
import type { Category } from '@/lib/data';

import { addLessonAction } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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

export function AddLessonForm({ category }: { category: Pick<Category, 'id' | 'title'> }) {
  const { toast } = useToast();
  const [state, formAction] = useFormState(addLessonAction, initialState);

  useEffect(() => {
    if (state?.message && !state.success) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">افزودن درس جدید به دسته‌بندی «{category.title}»</CardTitle>
          <CardDescription>
            اطلاعات درس جدید را وارد کنید. فقط عنوان درس اجباری است. برای فایل‌های صوتی و لوگو، باید آدرس اینترنتی (URL) آن‌ها را وارد کنید.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <input type="hidden" name="categoryId" value={category.id} />
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
              <Label htmlFor="text">متن کامل درس (اختیاری)</Label>
              <Textarea
                id="text"
                name="text"
                placeholder="متن کامل درس که شامل کلمات و جملات روسی و ترجمه آن‌هاست را اینجا وارد کنید."
                rows={10}
                className="resize-none"
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="audioSrc">آدرس اینترنتی فایل صوتی (اختیاری)</Label>
              <Input
                id="audioSrc"
                name="audioSrc"
                type="text"
                placeholder="https://example.com/audio.mp3"
                dir="ltr"
              />
               <p className="text-sm text-muted-foreground">
                آدرس کامل فایل صوتی (مثلاً MP3) را وارد کنید.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
             <Button variant="link" asChild>
                <Link href="/admin/dashboard">انصراف و بازگشت</Link>
            </Button>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
