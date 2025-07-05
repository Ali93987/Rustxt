import { notFound } from 'next/navigation';
import { getLessonAndCategory } from '@/lib/data';
import { EditLessonForm } from './edit-lesson-form';

export default function EditLessonPage({ params }: { params: { slug: string } }) {
  const data = getLessonAndCategory(params.slug);

  if (!data) {
    notFound();
  }
  
  const { lesson } = data;

  // Since EditLessonForm is a client component, we only pass the serializable lesson object.
  return <EditLessonForm lesson={lesson} />;
}
