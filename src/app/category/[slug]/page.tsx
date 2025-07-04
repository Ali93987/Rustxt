import { notFound } from 'next/navigation';
import Link from 'next/link';
import { categories, getCategory } from '@/lib/data';
import { LessonList } from '@/components/lesson-list';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = getCategory(params.slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
          {category.title}
        </h1>
        <Button asChild variant="ghost">
          <Link href="/">
            بازگشت به صفحه اصلی
            <ArrowRight className="mr-2 h-4 w-4" />
          </Link>
        </Button>
      </header>

      <main>
        <LessonList lessons={category.lessons} />
      </main>
    </div>
  );
}
