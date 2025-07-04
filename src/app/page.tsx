import { LessonList } from '@/components/lesson-list';
import { lessons } from '@/lib/data';

export default function Home() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-12">
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-primary">
          говорю!
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Your journey to speaking Russian starts here.
        </p>
      </header>
      <LessonList lessons={lessons} />
    </main>
  );
}
