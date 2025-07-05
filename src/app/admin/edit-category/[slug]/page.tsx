
import { notFound } from 'next/navigation';
import { getCategory } from '@/lib/data';
import { EditCategoryForm } from './edit-category-form';

export default async function EditCategoryPage({ params }: { params: { slug: string } }) {
  // Decode the slug from the URL parameters as it might be URL-encoded.
  const decodedSlug = decodeURIComponent(params.slug);
  const category = await getCategory(decodedSlug);

  if (!category) {
    notFound();
  }

  // Client components cannot receive non-serializable props like complex objects.
  // We only pass the data that the form needs.
  const { icon, lessons, createdAt, ...serializableCategory } = category;

  return <EditCategoryForm category={serializableCategory} />;
}
