'use client';

import { useState } from 'react';
import { useRouter, notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategory } from '@/lib/data';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function EditCategoryPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  
  const category = getCategory(params.slug);
  
  if (!category) {
    notFound();
  }

  const [title, setTitle] = useState(category.title);
  const [description, setDescription] = useState(category.description);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // In a real app, you would save this data to your database.
    // For now, we'll just simulate a successful save.
    setTimeout(() => {
      toast({
        title: 'دسته‌بندی با موفقیت ویرایش شد',
        description: `تغییرات شما (به صورت نمایشی) ذخیره شد.`,
      });
      router.push('/admin/dashboard');
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">ویرایش دسته‌بندی: {category.title}</CardTitle>
          <CardDescription>
            اطلاعات دسته‌بندی را در اینجا تغییر دهید. توجه: چون هنوز پایگاه داده نداریم، این تغییرات ذخیره نخواهند شد.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">توضیحات</Label>
              <Textarea
                id="description"
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
              {isLoading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
