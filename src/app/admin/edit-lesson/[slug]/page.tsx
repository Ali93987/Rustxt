import { notFound } from 'next/navigation';
import { getLessonAndCategory } from '@/lib/data';
import { EditLessonForm } from './edit-lesson-form';
import type { Lesson } from '@/lib/data';

export default async function EditLessonPage({ params }: { params: { slug: string } }) {
  const data = await getLessonAndCategory(params.slug);

  if (!data) {
    notFound();
  }
  
  const { lesson } = data;

  // Since EditLessonForm is a client component, we only pass a serializable lesson object.
  const { createdAt, ...serializableLesson } = lesson;
  
  // Fix for potential typos in image URL on the server before passing to the client.
  if (serializableLesson.logoSrc) {
    serializableLesson.logoSrc = (serializableLesson.logoSrc)
      .replace('placehold.c', 'placehold.co')
      .replace('placehold.coo', 'placehold.co');
  }

  return <EditLessonForm lesson={serializableLesson as Lesson} />;
}
