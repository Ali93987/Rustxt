import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { categories, getLessonAndCategory } from '@/lib/data';
import { LessonView } from '@/components/lesson-view';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface LessonPageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return categories.flatMap((category) =>
    category.lessons.map((lesson) => ({
      slug: lesson.slug,
    }))
  );
}

export default function LessonPage({ params }: LessonPageProps) {
  const data = getLessonAndCategory(params.slug);

  if (!data) {
    notFound();
  }

  const { lesson, category } = data;

  // We can't pass the icon component to a client component.
  // Let's create a serializable category object without the icon.
  const { icon, ...serializableCategory } = category;

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
              src={lesson.logoSrc}
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

          <p className="whitespace-pre-wrap font-body text-lg leading-relaxed text-foreground/90">
            {lesson.text}
          </p>
          <LessonView lesson={lesson} category={serializableCategory} />
        </main>
      </div>
    </div>
  );
}
