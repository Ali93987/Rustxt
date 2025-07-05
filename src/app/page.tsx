import { CategoryList } from '@/components/category-list';
import { getCategories } from '@/lib/data';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default async function Home() {
  const categories = await getCategories();

  return (
    <div className="flex flex-col min-h-screen">
      <header className="container mx-auto p-4 md:p-8 flex justify-between items-center">
        <div className="w-24 text-left">
          <Button asChild variant="outline">
            <Link href="/login">ورود کاربر</Link>
          </Button>
        </div>
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary text-center">
          !говорю
        </h1>
        <div className="w-24 text-right">
          <Button asChild variant="outline">
            <Link href="/admin">ورود مدیر</Link>
          </Button>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-8 flex-grow">
        <p className="text-center text-muted-foreground mt-2 mb-12 text-lg">
          سفر خود را برای صحبت کردن به زبان روسی از اینجا شروع کنید.
        </p>
        <CategoryList categories={categories} />
      </main>
    </div>
  );
}
