import { notFound } from 'next/navigation';
import { getCategoryById } from '@/lib/data';
import { AddLessonForm } from './add-lesson-form';

export default async function AddLessonPage({ params }: { params: { categoryId: string } }) {
  const category = await getCategoryById(params.categoryId);

  if (!category) {
    notFound();
  }

  // We only need id and title for the form header
  const { id, title } = category;

  return <AddLessonForm category={{ id, title }} />;
}
