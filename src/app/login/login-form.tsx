'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { loginUserAction } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface AuthUser {
  id: string;
  username: string;
  activeSessionToken: string;
}

const initialState: {
  message: string;
  success: boolean;
  user: AuthUser | null;
} = {
  message: '',
  success: false,
  user: null,
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
  const router = useRouter();
  const [state, formAction] = useFormState(loginUserAction, initialState);

  useEffect(() => {
    if (state.success && state.user) {
      // Login successful: store user in localStorage and redirect
      localStorage.setItem('currentUser', JSON.stringify(state.user));
      window.dispatchEvent(new Event('storage')); // Notify other tabs/components
      router.push('/');
      toast({
          title: 'ورود موفقیت آمیز',
          description: `خوش آمدید، ${state.user.username}!`,
      });
    } else if (state.message && !state.success) {
      // Login failed: show error toast
      toast({
        variant: 'destructive',
        title: 'خطا در ورود',
        description: state.message,
      });
    }
  }, [state, router, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-headline">ورود کاربر</CardTitle>
          <CardDescription className="text-center pt-2">
            برای دسترسی به حساب کاربری خود وارد شوید.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">نام کاربری</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="نام کاربری خود را وارد کنید"
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
