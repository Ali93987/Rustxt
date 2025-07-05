'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useEffect } from 'react';

import { loginUserAction } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const initialState = {
  message: '',
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'در حال ورود...' : 'ورود'}
    </Button>
  );
}

export function LoginForm() {
  const { toast } = useToast();
  const [state, formAction] = useFormState(loginUserAction, initialState);

  useEffect(() => {
    if (state?.message && !state.success) {
      toast({
        variant: 'destructive',
        title: 'خطا در ورود',
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-headline">ورود کاربر</CardTitle>
          <CardDescription className="text-center pt-2">
            برای دسترسی به حساب کاربری خود وارد شوید.
             <br />
            (رمز عبور پیش‌فرض: password)
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier">ایمیل یا نام کاربری</Label>
              <Input
                id="identifier"
                name="identifier"
                type="text"
                placeholder="user@example.com یا myusername"
                required
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                dir="ltr"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <SubmitButton />
            <Button variant="link" asChild>
                <Link href="/">بازگشت به صفحه اصلی</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
