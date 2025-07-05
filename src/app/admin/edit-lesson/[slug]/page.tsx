import { notFound } from 'next/navigation';
import { getLessonAndCategory } from '@/lib/data';
import { EditLessonForm } from './edit-lesson-form';
import type { Lesson } from '@/lib/data';

export default async function EditLessonPage({ params }: { params: { slug: string } }) {
  const data = await getLessonAndCategory(params.slug);

  if (!data) {
    notFound();
  }
  
  const { lesson, category } = data;

  // Since EditLessonForm is a client component, we only pass serializable props.
  const { createdAt, ...serializableLesson } = lesson;

  return <EditLessonForm lesson={serializableLesson as Lesson} categoryId={category.id} />;
}
