
'use server';

import { z } from 'zod';
import { addDoc, collection, Timestamp, query, where, getDocs, doc, updateDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { availableIcons, getCategoryById } from './data';
import { randomUUID } from 'crypto';

// A more robust slugify function that correctly handles Unicode characters.
function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD') // Split accents from letters
    .replace(/[\u0300-\u036f]/g, '') // Remove combining diacritical marks
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-'); // Replace multiple - with single -
}

const CategorySchema = z.object({
  title: z.string().min(3, { message: 'عنوان باید حداقل ۳ حرف باشد.' }),
  description: z.string().optional(),
});

export async function addCategoryAction(prevState: any, formData: FormData) {
  const validatedFields = CategorySchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
  });

  if (!validatedFields.success) {
    const errorMessage = validatedFields.error.errors.map(e => e.message).join(', ');
    return {
      message: errorMessage,
      success: false,
    };
  }

  const { title, description } = validatedFields.data;
  const newSlug = slugify(title);

  try {
    const q = query(collection(db, 'categories'), where('slug', '==', newSlug));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return { message: 'یک دسته‌بندی با این عنوان از قبل وجود دارد.', success: false };
    }

    const randomIcon = availableIcons[Math.floor(Math.random() * availableIcons.length)];

    await addDoc(collection(db, 'categories'), {
      title,
      description: description || '',
      slug: newSlug,
      icon: randomIcon,
      createdAt: Timestamp.now(),
    });

    revalidatePath('/admin/dashboard');
    revalidatePath('/');
    
  } catch (error) {
    console.error("Error adding category:", error);
    return { message: 'یک خطای غیرمنتظره در سرور رخ داد.', success: false };
  }

  redirect('/admin/dashboard');
}

// --- Edit Category Action ---
const EditCategorySchema = CategorySchema.extend({
    id: z.string().min(1, { message: 'شناسه دسته‌بندی الزامی است.' }),
});

export async function editCategoryAction(prevState: any, formData: FormData) {
    const validatedFields = EditCategorySchema.safeParse({
        id: formData.get('id'),
        title: formData.get('title'),
        description: formData.get('description'),
    });

    if (!validatedFields.success) {
        const errorMessage = validatedFields.error.errors.map(e => e.message).join(' ');
        return { message: errorMessage, success: false };
    }

    const { id, title, description } = validatedFields.data;
    const newSlug = slugify(title);

    try {
        const categoryDocRef = doc(db, 'categories', id);
        const categoryDoc = await getDoc(categoryDocRef);

        if (!categoryDoc.exists()) {
            return { message: 'دسته‌بندی مورد نظر یافت نشد.', success: false };
        }

        const currentSlug = categoryDoc.data().slug;
        if (newSlug !== currentSlug) {
            const q = query(collection(db, 'categories'), where('slug', '==', newSlug));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                return { message: 'دسته‌بندی دیگری با این عنوان وجود دارد.', success: false };
            }
        }
        
        await updateDoc(categoryDocRef, {
            title,
            description: description || '',
            slug: newSlug,
        });

        revalidatePath('/admin/dashboard');
        revalidatePath('/');
        revalidatePath(`/category/${newSlug}`);
        if (newSlug !== currentSlug) {
            revalidatePath(`/category/${currentSlug}`);
        }
        
    } catch (error) {
        console.error("Error updating category:", error);
        return { message: 'خطای سرور: امکان ویرایش دسته‌بندی وجود ندارد.', success: false };
    }

    redirect('/admin/dashboard');
}

// --- Add Lesson Action ---

const LessonSchema = z.object({
  categoryId: z.string().min(1, 'شناسه دسته‌بندی الزامی است.'),
  title: z.string().min(1, { message: 'عنوان درس الزامی است.' }),
  subtitle: z.string().nullable().optional(),
  logoSrc: z.string().url({ message: "آدرس اینترنتی لوگو نامعتبر است." }).or(z.literal('')).nullable().optional(),
  isVip: z.enum(['false', 'true']).default('false'),
  text: z.string().nullable().optional(),
  translationFa: z.string().nullable().optional(),
  audioSrc: z.string().url({ message: "آدرس اینترنتی فایل صوتی نامعتبر است." }).or(z.literal('')).nullable().optional(),
  vocabulary: z.string().optional(),
});


export async function addLessonAction(prevState: any, formData: FormData) {
  const validatedFields = LessonSchema.safeParse({
    categoryId: formData.get('categoryId'),
    title: formData.get('title'),
    subtitle: formData.get('subtitle'),
    logoSrc: formData.get('logoSrc'),
    isVip: formData.get('isVip'),
    text: formData.get('text'),
    translationFa: formData.get('translationFa'),
    audioSrc: formData.get('audioSrc'),
    vocabulary: formData.get('vocabulary'),
  });

  if (!validatedFields.success) {
    const errorMessage = validatedFields.error.errors.map(e => e.message).join(' ');
    console.error("Validation error:", validatedFields.error);
    return { message: errorMessage, success: false };
  }
  
  const { categoryId, title, subtitle, text, translationFa, logoSrc, audioSrc, vocabulary, isVip } = validatedFields.data;
  const lessonSlug = slugify(title);
  
  const vocabularyData = vocabulary ? JSON.parse(vocabulary) : {};

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
    
    const finalLogoSrc = logoSrc || 'https://placehold.co/100x100.png';
    
    await addDoc(lessonCollectionRef, {
      title,
      subtitle: subtitle || '',
      slug: lessonSlug,
      logoSrc: finalLogoSrc,
      logoAiHint: "language lesson",
      isVip: isVip === 'true',
      text: text || '',
      translationFa: translationFa || '',
      audioSrc: audioSrc || '',
      vocabulary: vocabularyData,
      createdAt: Timestamp.now(),
    });
    
    revalidatePath('/admin/dashboard');
    revalidatePath(`/category/${category.slug}`);
    revalidatePath('/');
    
  } catch (error) {
    console.error("Error adding lesson:", error);
    return { message: 'خطای سرور: امکان افزودن درس وجود ندارد.', success: false };
  }
  
  redirect('/admin/dashboard');
}

// --- Edit Lesson Action ---

const EditLessonSchema = LessonSchema.extend({
  lessonId: z.string().min(1, 'شناسه درس الزامی است.'),
});

export async function editLessonAction(prevState: any, formData: FormData) {
  const validatedFields = EditLessonSchema.safeParse({
    lessonId: formData.get('lessonId'),
    categoryId: formData.get('categoryId'),
    title: formData.get('title'),
    subtitle: formData.get('subtitle'),
    logoSrc: formData.get('logoSrc'),
    isVip: formData.get('isVip'),
    text: formData.get('text'),
    translationFa: formData.get('translationFa'),
    audioSrc: formData.get('audioSrc'),
    vocabulary: formData.get('vocabulary'),
  });

  if (!validatedFields.success) {
    const errorMessage = validatedFields.error.errors.map(e => e.message).join(' ');
    return { message: errorMessage, success: false };
  }

  const { lessonId, categoryId, title, isVip, ...data } = validatedFields.data;
  const newSlug = slugify(title);
  const vocabularyData = data.vocabulary ? JSON.parse(data.vocabulary) : {};

  try {
    const category = await getCategoryById(categoryId);
    if (!category) {
      return { message: 'دسته‌بندی یافت نشد.', success: false };
    }

    const lessonDocRef = doc(db, `categories/${categoryId}/lessons`, lessonId);
    const currentLessonDoc = await getDoc(lessonDocRef);
    if (!currentLessonDoc.exists()) {
        return { message: 'درس مورد نظر یافت نشد.', success: false };
    }
    const currentSlug = currentLessonDoc.data().slug;
    
    if (currentSlug !== newSlug) {
      const q = query(collection(db, `categories/${categoryId}/lessons`), where('slug', '==', newSlug));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return { message: 'درس دیگری با این عنوان در این دسته‌بندی وجود دارد.', success: false };
      }
    }

    await updateDoc(lessonDocRef, {
      title,
      subtitle: data.subtitle || '',
      slug: newSlug,
      logoSrc: data.logoSrc || 'https://placehold.co/100x100.png',
      isVip: isVip === 'true',
      text: data.text || '',
      translationFa: data.translationFa || '',
      audioSrc: data.audioSrc || '',
      vocabulary: vocabularyData,
    });

    revalidatePath('/admin/dashboard');
    revalidatePath(`/category/${category.slug}`);
    revalidatePath(`/lessons/${newSlug}`);
    if (currentSlug && currentSlug !== newSlug) {
      revalidatePath(`/lessons/${currentSlug}`);
    }

  } catch (error) {
    console.error("Error updating lesson:", error);
    return { message: 'خطای سرور: امکان ویرایش درس وجود ندارد.', success: false };
  }

  redirect('/admin/dashboard');
}

// --- User Actions ---
const UserSchema = z.object({
  username: z.string().min(3, { message: 'نام کاربری باید حداقل ۳ حرف باشد.' }),
  email: z.string().email({ message: 'ایمیل وارد شده معتبر نیست.' }),
  password: z.string().min(6, { message: 'رمز عبور باید حداقل ۶ حرف باشد.' }),
});

export async function addUserAction(prevState: any, formData: FormData) {
  const validatedFields = UserSchema.safeParse({
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    const errorMessage = validatedFields.error.errors.map(e => e.message).join(', ');
    return {
      message: errorMessage,
      success: false,
    };
  }

  const { username, email, password } = validatedFields.data;

  try {
    // Check for existing user with same username or email
    const usernameQuery = query(collection(db, 'users'), where('username', '==', username));
    const emailQuery = query(collection(db, 'users'), where('email', '==', email));
    
    const usernameSnapshot = await getDocs(usernameQuery);
    if (!usernameSnapshot.empty) {
      return { message: 'این نام کاربری قبلا استفاده شده است.', success: false };
    }

    const emailSnapshot = await getDocs(emailQuery);
    if (!emailSnapshot.empty) {
      return { message: 'این ایمیل قبلا استفاده شده است.', success: false };
    }
    
    // In a real application, you should hash the password before storing it.
    await addDoc(collection(db, 'users'), {
      username,
      email,
      password,
      createdAt: Timestamp.now(),
    });

    revalidatePath('/admin/dashboard');

  } catch (error) {
    console.error("Error adding user:", error);
    return { message: 'یک خطای غیرمنتظره در سرور رخ داد.', success: false };
  }

  redirect('/admin/dashboard');
}

const EditUserBaseSchema = z.object({
  id: z.string().min(1, { message: 'شناسه کاربر الزامی است.' }),
  username: z.string().min(3, { message: 'نام کاربری باید حداقل ۳ حرف باشد.' }),
  email: z.string().email({ message: 'ایمیل وارد شده معتبر نیست.' }),
});

const EditUserSchema = EditUserBaseSchema.extend({
  password: z.string().optional(),
}).refine(data => !data.password || data.password.length === 0 || data.password.length >= 6, {
    message: "رمز عبور در صورت وارد شدن باید حداقل ۶ حرف باشد.",
    path: ["password"],
});

export async function editUserAction(prevState: any, formData: FormData) {
  const validatedFields = EditUserSchema.safeParse({
    id: formData.get('id'),
    username: formData.get('username'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.errors.map(e => e.message).join(', '),
      success: false,
    };
  }

  const { id, username, email, password } = validatedFields.data;

  try {
    const userDocRef = doc(db, 'users', id);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return { message: 'کاربر یافت نشد.', success: false };
    }

    const currentUser = userDoc.data();

    // Check if new username is taken by another user
    if (username !== currentUser.username) {
      const usernameQuery = query(collection(db, 'users'), where('username', '==', username));
      const usernameSnapshot = await getDocs(usernameQuery);
      if (!usernameSnapshot.empty) {
        return { message: 'این نام کاربری قبلا استفاده شده است.', success: false };
      }
    }

    // Check if new email is taken by another user
    if (email !== currentUser.email) {
      const emailQuery = query(collection(db, 'users'), where('email', '==', email));
      const emailSnapshot = await getDocs(emailQuery);
      if (!emailSnapshot.empty) {
        return { message: 'این ایمیل قبلا استفاده شده است.', success: false };
      }
    }

    const dataToUpdate: {username: string; email: string; password?: string} = {
      username,
      email,
    };
    
    // Only update password if a new one was provided
    if (password) {
        dataToUpdate.password = password;
    }

    await updateDoc(userDocRef, dataToUpdate);

    revalidatePath('/admin/dashboard');

  } catch (error) {
    console.error("Error updating user:", error);
    return { message: 'یک خطای غیرمنتظره در سرور رخ داد.', success: false };
  }

  redirect('/admin/dashboard');
}

export async function deleteUserAction(userId: string): Promise<{ message: string } | void> {
  try {
    if (!userId) {
        throw new Error("شناسه کاربر الزامی است.");
    }
    await deleteDoc(doc(db, 'users', userId));
    revalidatePath('/admin/dashboard');
  } catch (error) {
    console.error("Error deleting user:", error);
    const message = error instanceof Error ? error.message : 'یک خطای غیرمنتظره در سرور رخ داد.';
    return { message };
  }
}

// --- User Login Action ---
const LoginSchema = z.object({
  username: z.string().min(1, { message: 'نام کاربری الزامی است.' }),
  password: z.string().min(1, { message: 'رمز عبور الزامی است.' }),
});

export async function loginUserAction(prevState: any, formData: FormData) {
  const validatedFields = LoginSchema.safeParse({
    username: formData.get('username'),
    password: formData.get('password'),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.errors.map(e => e.message).join(', '),
      success: false,
      user: null,
    };
  }
  
  const { username, password } = validatedFields.data;

  try {
    const q = query(collection(db, 'users'), where('username', '==', username));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { message: 'نام کاربری یا رمز عبور اشتباه است.', success: false, user: null };
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    if (userData.password !== password) {
      return { message: 'نام کاربری یا رمز عبور اشتباه است.', success: false, user: null };
    }

    // Generate a new session token
    const newSessionToken = randomUUID();

    // Update the user document in Firestore with the new token
    await updateDoc(userDoc.ref, {
      activeSessionToken: newSessionToken,
    });

    // On successful login, return user data with the session token
    return {
      success: true,
      message: 'ورود موفقیت‌آمیز',
      user: {
        id: userDoc.id,
        username: userData.username,
        activeSessionToken: newSessionToken,
      },
    };

  } catch (error) {
    console.error("Error during login:", error);
    return { message: 'یک خطای غیرمنتظره در سرور رخ داد.', success: false, user: null };
  }
}
