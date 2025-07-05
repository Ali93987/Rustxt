
'use server';

import { z } from 'zod';
import { addDoc, collection, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { availableIcons, getCategoryById } from './data';

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


// --- Add Lesson Action ---

const LessonSchema = z.object({
  categoryId: z.string().min(1, 'شناسه دسته‌بندی الزامی است.'),
  title: z.string().min(1, { message: 'عنوان درس الزامی است.' }),
  subtitle: z.string(),
  logoSrc: z.string(),
  text: z.string(),
  audio: z.instanceof(File),
});


export async function addLessonAction(prevState: any, formData: FormData) {
  const rawData = {
    categoryId: formData.get('categoryId'),
    title: formData.get('title'),
    subtitle: formData.get('subtitle'),
    logoSrc: formData.get('logoSrc'),
    text: formData.get('text'),
    audio: formData.get('audio'),
  };

  const validatedFields = LessonSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const errorMessage = validatedFields.error.errors.map(e => e.message).join(' ');
    return { message: errorMessage, success: false };
  }
  
  let { categoryId, title, subtitle, logoSrc, text, audio } = validatedFields.data;
  const lessonSlug = slugify(title);

  // Use a default placeholder if logoSrc is empty, otherwise validate it
  if (!logoSrc) {
    logoSrc = 'https://placehold.co/100x100.png';
  } else {
    const urlCheck = z.string().url().safeParse(logoSrc);
    if (!urlCheck.success) {
      return { message: 'آدرس لوگو باید یک URL معتبر باشد.', success: false };
    }
  }
  
  try {
    const category = await getCategoryById(categoryId);
    if (!category) {
      return { message: 'دسته‌بندی مورد نظر یافت نشد.', success: false };
    }

    const lessonCollectionRef = collection(db, `categories/${categoryId}/lessons`);
    const q = query(lessonCollectionRef, where('slug', '==', lessonSlug));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return { message: 'درسی با این عنوان در این دسته‌بندی وجود دارد.', success: false };
    }
    
    let audioSrc = '';
    // Check if a valid audio file was uploaded (size > 0)
    if (audio && audio.size > 0) {
      if (!audio.type.startsWith('audio/')) {
        return { message: 'فایل انتخاب شده باید از نوع صوتی باشد.', success: false };
      }
      
      // 1. Upload audio file to Firebase Storage
      const audioBuffer = Buffer.from(await audio.arrayBuffer());
      const audioFileName = `${Date.now()}-${lessonSlug}-${audio.name}`;
      const storageRef = ref(storage, `lessons_audio/${audioFileName}`);
      await uploadBytes(storageRef, audioBuffer, { contentType: audio.type });
      
      // 2. Get the public URL of the uploaded file
      audioSrc = await getDownloadURL(storageRef);
    }
    
    // 3. Add lesson data to Firestore
    await addDoc(lessonCollectionRef, {
      title,
      subtitle: subtitle || '',
      slug: lessonSlug,
      logoSrc,
      logoAiHint: "language lesson", // A default hint for AI image generation later
      text: text || '',
      audioSrc,
      createdAt: Timestamp.now(),
    });
    
    // 4. Revalidate and redirect
    revalidatePath('/admin/dashboard');
    revalidatePath(`/category/${category.slug}`);
    revalidatePath('/');
    
  } catch (error) {
    console.error("Error adding lesson:", error);
    return { message: 'خطای سرور: امکان افزودن درس وجود ندارد.', success: false };
  }
  
  redirect('/admin/dashboard');
}
