'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Lesson } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function EditLessonForm({ lesson }: { lesson: Lesson }) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [title, setTitle] = useState(lesson.title);
  const [subtitle, setSubtitle] = useState(lesson.subtitle);
  const [logoSrc, setLogoSrc] = useState(lesson.logoSrc);
  const [text, setText] = useState(lesson.text);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // In a real app, you would save this data and upload the file.
    // For now, we'll just simulate a successful save.
    setTimeout(() => {
      toast({
        title: 'درس با موفقیت ویرایش شد',
        description: `تغییرات شما برای درس «${title}» (به صورت نمایشی) ذخیره شد.`,
      });
      router.push('/admin/dashboard');
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">ویرایش درس: {lesson.title}</CardTitle>
          <CardDescription>
            اطلاعات درس را در اینجا تغییر دهید. توجه: این تغییرات ذخیره نخواهند شد.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان درس</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">زیرنویس (توضیح کوتاه)</Label>
              <Input
                id="subtitle"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoSrc">آدرس URL لوگو</Label>
              {logoSrc && (
                <div className="mb-2">
                  <Image 
                    src={logoSrc}
                    alt="پیش‌نمایش لوگو"
                    width={80}
                    height={80}
                    className="rounded-lg border object-cover"
                  />
                </div>
              )}
              <Input
                id="logoSrc"
                value={logoSrc}
                onChange={(e) => setLogoSrc(e.target.value)}
                required
                dir="ltr"
              />
               <p className="text-sm text-muted-foreground">
                آدرس کامل تصویر لوگوی درس را وارد کنید.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="text">متن درس</Label>
              <Textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
                rows={10}
                className="resize-none"
              />
            </div>
             <div className="space-y-2">
              <Label htmlFor="audio">فایل صوتی</Label>
              <Input
                id="audio"
                type="file"
                accept="audio/*"
                onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
              />
              <p className="text-sm text-muted-foreground">
                فایل صوتی فعلی: <code className="dir-ltr">{lesson.audioSrc}</code>
                <br/>
                برای تغییر، فایل جدید را بارگذاری کنید. برای حذف فایل صوتی، کافیست فرم را بدون انتخاب فایل جدید ذخیره کنید (این قابلیت نمایشی است).
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
             <Button variant="link" asChild>
                <Link href="/admin/dashboard">انصراف و بازگشت</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
