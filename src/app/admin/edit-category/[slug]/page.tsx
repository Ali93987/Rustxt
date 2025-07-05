import { notFound } from 'next/navigation';
import { getCategory } from '@/lib/data';
import { EditCategoryForm } from './edit-category-form';

export default async function EditCategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategory(params.slug);

  if (!category) {
    notFound();
  }

  // Client components cannot receive non-serializable props like Timestamp objects.
  // We only pass the data that the form needs.
  const { icon, lessons, createdAt, ...serializableCategory } = category;

  return <EditCategoryForm category={serializableCategory} />;
}
