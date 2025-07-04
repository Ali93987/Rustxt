import { notFound } from 'next/navigation';
import { getCategory } from '@/lib/data';
import { EditCategoryForm } from './edit-category-form';

export default function EditCategoryPage({ params }: { params: { slug: string } }) {
  const category = getCategory(params.slug);

  if (!category) {
    notFound();
  }

  return <EditCategoryForm category={category} />;
}
