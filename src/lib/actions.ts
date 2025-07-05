
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
  subtitle: z.string().optional(),
  logoSrc: z.string().url({ message: "آدرس اینترنتی لوگو نامعتبر است." }).or(z.literal('')).optional(),
  text: z.string().optional(),
  // Files will be validated separately in the action
  logoFile: z.instanceof(File).optional(),
  audio: z.instanceof(File).optional(),
});


export async function addLessonAction(prevState: any, formData: FormData) {
  const rawData = {
    categoryId: formData.get('categoryId'),
    title: formData.get('title'),
    subtitle: formData.get('subtitle'),
    logoSrc: formData.get('logoSrc'),
    text: formData.get('text'),
    logoFile: formData.get('logoFile'),
    audio: formData.get('audio'),
  };

  const validatedFields = LessonSchema.safeParse(rawData);

  if (!validatedFields.success) {
    const errorMessage = validatedFields.error.errors.map(e => e.message).join(' ');
    return { message: errorMessage, success: false };
  }
  
  const { categoryId, title, subtitle, text } = validatedFields.data;
  const urlLogoSrc = validatedFields.data.logoSrc;
  const logoFile = validatedFields.data.logoFile;
  const audioFile = validatedFields.data.audio;
  
  const lessonSlug = slugify(title);

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
    
    // --- Logo Handling Logic ---
    let finalLogoSrc = '';
    
    // 1. Prioritize file upload
    if (logoFile && logoFile.size > 0) {
      if (!logoFile.type.startsWith('image/')) {
        return { message: 'فایل لوگو باید از نوع تصویر باشد.', success: false };
      }
      const logoBuffer = Buffer.from(await logoFile.arrayBuffer());
      const logoFileName = `${Date.now()}-${lessonSlug}-${logoFile.name}`;
      const logoStorageRef = ref(storage, `lessons_logos/${logoFileName}`);
      await uploadBytes(logoStorageRef, logoBuffer, { contentType: logoFile.type });
      finalLogoSrc = await getDownloadURL(logoStorageRef);
    } 
    // 2. Fallback to URL if provided
    else if (urlLogoSrc) {
      finalLogoSrc = urlLogoSrc;
    } 
    // 3. Fallback to placeholder
    else {
      finalLogoSrc = 'https://placehold.co/100x100.png';
    }
    
    // --- Audio Handling Logic ---
    let audioSrc = '';
    if (audioFile && audioFile.size > 0) {
      if (!audioFile.type.startsWith('audio/')) {
        return { message: 'فایل انتخاب شده باید از نوع صوتی باشد.', success: false };
      }
      
      const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
      const audioFileName = `${Date.now()}-${lessonSlug}-${audioFile.name}`;
      const storageRef = ref(storage, `lessons_audio/${audioFileName}`);
      await uploadBytes(storageRef, audioBuffer, { contentType: audioFile.type });
      audioSrc = await getDownloadURL(storageRef);
    }
    
    // 3. Add lesson data to Firestore
    await addDoc(lessonCollectionRef, {
      title,
      subtitle: subtitle || '',
      slug: lessonSlug,
      logoSrc: finalLogoSrc,
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
