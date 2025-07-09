'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { adminLoginAction } from '@/lib/actions';
import { useEffect } from 'react';

const initialState = {
  success: false,
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? 'در حال ورود...' : 'ورود'}
    </Button>
  );
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [state, formAction] = useFormState(adminLoginAction, initialState);

  useEffect(() => {
    if (state.success) {
      toast({
        title: 'ورود موفقیت‌آمیز',
        description: 'به پنل مدیریت خوش آمدید.',
      });
      router.push('/admin/dashboard');
    } else if (state.message) {
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
          <CardTitle className="text-2xl text-center font-headline">ورود مدیر</CardTitle>
          <CardDescription className="text-center pt-2">
            برای مدیریت درس‌ها وارد شوید.
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
                placeholder="نام کاربری"
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
                placeholder="رمز عبور"
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
