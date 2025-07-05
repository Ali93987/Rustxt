
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCategories, getCategory } from '@/lib/data';
import { LessonList } from '@/components/lesson-list';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({
    slug: category.slug,
  }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  // Decode the slug from the URL parameters as it might be URL-encoded.
  const decodedSlug = decodeURIComponent(params.slug);
  const category = await getCategory(decodedSlug);

  if (!category) {
    notFound();
  }

  // Client components cannot receive non-serializable props like Timestamp objects.
  // We remove the `createdAt` field before passing the lessons to the client component.
  const serializableLessons = category.lessons.map(lesson => {
    const { createdAt, ...rest } = lesson;
    return rest;
  });

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
        <LessonList lessons={serializableLessons} />
      </main>
    </div>
  );
}
