'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useEffect } from 'react';

import { addCategoryAction } from '@/lib/actions';
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
      {pending ? 'در حال افزودن...' : 'افزودن دسته‌بندی'}
    </Button>
  );
}

export function AddCategoryForm() {
  const { toast } = useToast();
  const [state, formAction] = useFormState(addCategoryAction, initialState);

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
          <CardTitle className="text-2xl font-headline">افزودن دسته‌بندی جدید</CardTitle>
          <CardDescription>
            اطلاعات دسته‌بندی جدید را وارد کنید. این اطلاعات در پایگاه داده ذخیره خواهد شد.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان</Label>
              <Input
                id="title"
                name="title"
                placeholder="مثلا: مکالمات روزمره"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">توضیحات</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="توضیح کوتاهی درباره این دسته‌بندی بنویسید."
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
