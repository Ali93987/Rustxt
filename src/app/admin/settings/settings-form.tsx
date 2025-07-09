'use client';

import { useFormState, useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useEffect } from 'react';

import { updateAdminCredentialsAction } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { AdminCredentials } from '@/lib/data';

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

export function AdminSettingsForm({ credentials }: { credentials: AdminCredentials }) {
  const { toast } = useToast();
  const [state, formAction] = useFormState(updateAdminCredentialsAction, initialState);

  useEffect(() => {
    if (state?.message) {
        if (state.success) {
            toast({
                title: 'موفقیت',
                description: state.message,
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'خطا',
                description: state.message,
            });
        }
    }
  }, [state, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">تنظیمات مدیر</CardTitle>
          <CardDescription>
            نام کاربری و رمز عبور برای ورود به پنل مدیریت را تغییر دهید.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">نام کاربری جدید</Label>
              <Input
                id="username"
                name="username"
                defaultValue={credentials.username}
                required
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور جدید</Label>
              <Input
                id="password"
                name="password"
                type="password"
                defaultValue={credentials.password}
                required
                dir="ltr"
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
