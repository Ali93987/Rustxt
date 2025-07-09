'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Dummy authentication. In a real app, use a proper auth system.
    setTimeout(() => {
      if (username === 'Alireza93987' && password === '2480055884') {
        toast({
          title: 'ورود موفقیت‌آمیز',
          description: 'به پنل مدیریت خوش آمدید.',
        });
        router.push('/admin/dashboard');
      } else {
        toast({
          variant: 'destructive',
          title: 'خطا در ورود',
          description: 'نام کاربری یا رمز عبور اشتباه است.',
        });
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl text-center font-headline">ورود مدیر</CardTitle>
          <CardDescription className="text-center pt-2">
            برای مدیریت درس‌ها وارد شوید.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">نام کاربری</Label>
              <Input
                id="username"
                type="text"
                placeholder="نام کاربری"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                dir="ltr"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">رمز عبور</Label>
              <Input
                id="password"
                type="password"
                placeholder="رمز عبور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                dir="ltr"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'در حال ورود...' : 'ورود'}
            </Button>
            <Button variant="link" asChild>
                <Link href="/">بازگشت به صفحه اصلی</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
