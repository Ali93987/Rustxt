'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export function AddCategoryForm() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // In a real app, you would save this data to your database.
    // For now, we'll just simulate a successful save.
    setTimeout(() => {
      toast({
        title: 'دسته‌بندی با موفقیت افزوده شد',
        description: `دسته‌بندی «${title}» (به صورت نمایشی) ایجاد شد.`,
      });
      router.push('/admin/dashboard');
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">افزودن دسته‌بندی جدید</CardTitle>
          <CardDescription>
            اطلاعات دسته‌بندی جدید را وارد کنید. توجه: چون هنوز پایگاه داده نداریم، این تغییرات ذخیره نخواهند شد.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان</Label>
              <Input
                id="title"
                placeholder="مثلا: مکالمات روزمره"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">توضیحات</Label>
              <Textarea
                id="description"
                placeholder="توضیح کوتاهی درباره این دسته‌بندی بنویسید."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                className="resize-none"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
             <Button variant="link" asChild>
                <Link href="/admin/dashboard">انصراف و بازگشت</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'در حال افزودن...' : 'افزودن دسته‌بندی'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
