'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useEffect } from 'react';
import type { Category } from '@/lib/data';
import { editCategoryAction } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type SerializableCategory = Omit<Category, 'icon' | 'lessons' | 'createdAt'>;

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

export function EditCategoryForm({ category }: { category: SerializableCategory }) {
  const { toast } = useToast();
  const [state, formAction] = useFormState(editCategoryAction, initialState);

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
          <CardTitle className="text-2xl font-headline">ویرایش دسته‌بندی: {category.title}</CardTitle>
          <CardDescription>
            اطلاعات دسته‌بندی را در اینجا تغییر دهید.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
           <input type="hidden" name="id" value={category.id} />
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان</Label>
              <Input
                id="title"
                name="title"
                defaultValue={category.title}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">توضیحات</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={category.description}
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
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
