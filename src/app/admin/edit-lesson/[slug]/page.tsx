
import { notFound } from 'next/navigation';
import { getLessonAndCategory } from '@/lib/data';
import { EditLessonForm } from './edit-lesson-form';
import type { Lesson } from '@/lib/data';

export default async function EditLessonPage({ params }: { params: { slug: string } }) {
  // Decode the slug from the URL parameters as it might be URL-encoded.
  const decodedSlug = decodeURIComponent(params.slug);
  const data = await getLessonAndCategory(decodedSlug);

  if (!data) {
    notFound();
  }
  
  const { lesson, category } = data;

  // Since EditLessonForm is a client component, we only pass serializable props.
  const { createdAt, ...serializableLesson } = lesson;

  return <EditLessonForm lesson={serializableLesson as Lesson} categoryId={category.id} />;
}
