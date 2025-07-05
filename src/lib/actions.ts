
'use server';

import { z } from 'zod';
import { addDoc, collection, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { availableIcons } from './data';

// Basic slugify function
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-'); // Replace multiple - with single -
}

const CategorySchema = z.object({
  title: z.string().min(3, { message: 'عنوان باید حداقل ۳ حرف باشد.' }),
  description: z.string().min(10, { message: 'توضیحات باید حداقل ۱۰ حرف باشد.' }),
});

export async function addCategoryAction(prevState: any, formData: FormData) {
  const validatedFields = CategorySchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    // Join all error messages for a more comprehensive error
    const errorMessage = validatedFields.error.errors.map(e => e.message).join(', ');
    return {
      message: errorMessage,
      success: false,
    };
  }

  const { title, description } = validatedFields.data;
  const newSlug = slugify(title);

  try {
    // Check if slug already exists to prevent duplicates
    const q = query(collection(db, 'categories'), where('slug', '==', newSlug));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return { message: 'یک دسته‌بندی با این عنوان از قبل وجود دارد.', success: false };
    }

    // Pick a random icon for the new category
    const randomIcon = availableIcons[Math.floor(Math.random() * availableIcons.length)];

    await addDoc(collection(db, 'categories'), {
      title,
      description,
      slug: newSlug,
      icon: randomIcon,
      createdAt: Timestamp.now(),
    });

    // Invalidate caches for pages that show categories
    revalidatePath('/admin/dashboard');
    revalidatePath('/');
    
  } catch (error) {
    console.error("Error adding category:", error);
    return { message: 'یک خطای غیرمنتظره در سرور رخ داد.', success: false };
  }

  // Redirect to dashboard on successful creation
  redirect('/admin/dashboard');
}
