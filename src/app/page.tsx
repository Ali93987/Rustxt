import { CategoryList } from '@/components/category-list';
import { getCategories } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UserStatus } from '@/components/user-status';
import { ArrowLeftRight } from 'lucide-react';

export default async function Home() {
  const categories = await getCategories();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto p-4 md:p-8 flex justify-between items-center">
        <div className="w-32 text-left">
          <UserStatus />
        </div>
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary text-center">
          !говорю
        </h1>
        <div className="w-32 text-right">
          <Button asChild variant="outline">
            <Link href="/admin">ورود مدیر</Link>
          </Button>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        <div className="text-center mt-2 mb-12">
            <p className="text-muted-foreground text-lg">
                سفر خود را برای صحبت کردن به زبان روسی از اینجا شروع کنید.
            </p>
            <Button asChild size="lg" className="mt-6">
                <Link href="/translate">
                    <ArrowLeftRight className="ml-2 h-5 w-5" />
                    رفتن به مترجم آنلاین
                </Link>
            </Button>
        </div>
        <CategoryList categories={categories} />
      </main>
    </div>
  );
}
