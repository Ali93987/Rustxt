
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getCategories, getLessonAndCategory } from '@/lib/data';
import { LessonView } from '@/components/lesson-view';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface LessonPageProps {
  params: {
    slug: string;
  };
}

// This function is still useful for SEO and build-time optimization,
// but we need to fetch all lessons from all categories to generate all possible slugs.
export async function generateStaticParams() {
  const categories = await getCategories();
  const allLessons = [];

  for (const category of categories) {
    // We need to get the full category data including lessons here
    const fullCategory = await getCategory(category.slug);
    if (fullCategory && fullCategory.lessons) {
      for (const lesson of fullCategory.lessons) {
        allLessons.push({ slug: lesson.slug });
      }
    }
  }
  return allLessons;
}

export default async function LessonPage({ params }: LessonPageProps) {
  // Decode the slug from the URL parameters as it might be URL-encoded.
  const decodedSlug = decodeURIComponent(params.slug);
  const data = await getLessonAndCategory(decodedSlug);

  if (!data) {
    notFound();
  }

  const { lesson, category } = data;

  // We can't pass non-serializable props like components or Timestamp objects to Client Components.
  // Let's create serializable versions of the objects we need to pass.
  const { icon, createdAt: _cAt, ...serializableCategory } = category;
  const { createdAt: _lAt, ...serializableLesson } = lesson;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-8">
          <Button asChild variant="ghost">
            <Link href={`/category/${category.slug}`}>
              بازگشت به درس‌ها
              <ArrowRight className="mr-2 h-4 w-4" />
            </Link>
          </Button>
        </header>

        <main className="bg-card p-6 md:p-10 rounded-lg shadow-lg">
          <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
            <Image
              src={serializableLesson.logoSrc}
              alt={`لوگوی درس ${lesson.title}`}
              width={100}
              height={100}
              className="rounded-lg border object-cover shrink-0"
              data-ai-hint={lesson.logoAiHint}
            />
            <div className="flex-1">
              <h1 className="font-headline text-3xl md:text-4xl font-bold text-primary">
                {lesson.title}
              </h1>
              <p className="text-muted-foreground mt-2 text-lg">{lesson.subtitle}</p>
            </div>
          </div>
          
          <LessonView lesson={serializableLesson} category={serializableCategory} />
        </main>
      </div>
    </div>
  );
}
