import 'server-only';

import type { LucideIcon } from 'lucide-react';
import { collection, getDocs, getDoc, doc, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { BookHeart, BookCheck, Feather, LibraryBig, Milestone, Drama } from 'lucide-react';

// --- Interfaces ---
// These now reflect what's stored in Firestore.
export interface Lesson {
  id: string; // Firestore document ID
  slug: string;
  title: string;
  subtitle: string;
  text: string;
  audioSrc: string;
  logoSrc: string;
  logoAiHint: string;
  vocabulary?: Record<string, string>;
  createdAt?: Timestamp;
}

export interface Category {
  id: string; // Firestore document ID
  slug: string;
  title: string;
  description: string;
  icon: string; // Note: We store the icon's name as a string
  lessons: Lesson[];
  createdAt?: Timestamp;
}

// --- Icon Mapping ---
// This map helps us convert the icon name string from Firestore into a renderable component.
export const iconMap: { [key: string]: LucideIcon } = {
  BookHeart,
  BookCheck,
  Feather,
  LibraryBig,
  Milestone,
  Drama,
};

export function getIcon(name: string): LucideIcon {
  return iconMap[name] || BookHeart; // Fallback to a default icon
}

export const availableIcons = Object.keys(iconMap);

// --- Data Fetching Functions ---

/**
 * Corrects common typos in image placeholder URLs and provides a fallback.
 * This version uses a more robust regex to avoid future issues.
 * @param url The original image URL from the database.
 * @returns A corrected, valid URL string.
 */
function correctImageUrl(url: string | undefined | null): string {
  if (!url || url.trim() === '') {
    return 'https://placehold.co/100x100.png';
  }
  // This regex specifically finds placehold.c or placehold.coo and replaces it with placehold.co
  // It ensures it's part of the domain by looking for what comes before and after.
  return url.replace(/(\/\/placehold\.)(c|coo)(\/|$)/, '$1co$3');
}

export async function getCategories(): Promise<Category[]> {
  try {
    const categoriesCollection = collection(db, 'categories');
    const q = query(categoriesCollection, orderBy('createdAt', 'asc'));
    const categorySnapshot = await getDocs(q);

    const categoriesList = await Promise.all(categorySnapshot.docs.map(async (categoryDoc) => {
      const categoryData = {
        id: categoryDoc.id,
        ...categoryDoc.data(),
      } as Category;

      const lessonsCollection = collection(db, `categories/${categoryDoc.id}/lessons`);
      const lessonsQuery = query(lessonsCollection, orderBy('createdAt', 'asc'));
      const lessonsSnapshot = await getDocs(lessonsQuery);
      categoryData.lessons = lessonsSnapshot.docs.map(lessonDoc => {
          const lesson = {
              id: lessonDoc.id,
              ...lessonDoc.data(),
          } as Lesson;
          lesson.logoSrc = correctImageUrl(lesson.logoSrc);
          return lesson;
      });

      return categoryData;
    }));

    return categoriesList;
  } catch (error) {
    console.error("Error fetching categories: ", error);
    return [];
  }
}

export async function getCategory(slug: string): Promise<Category | undefined> {
  try {
    const q = query(collection(db, 'categories'), where('slug', '==', slug));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return undefined;
    }

    const categoryDoc = querySnapshot.docs[0];
    const categoryData = {
      id: categoryDoc.id,
      ...categoryDoc.data(),
    } as Category;
    
    const lessonsCollection = collection(db, `categories/${categoryDoc.id}/lessons`);
    const lessonsQuery = query(lessonsCollection, orderBy('createdAt', 'asc'));
    const lessonsSnapshot = await getDocs(lessonsQuery);
    categoryData.lessons = lessonsSnapshot.docs.map(lessonDoc => {
        const lesson = {
            id: lessonDoc.id,
            ...lessonDoc.data(),
        } as Lesson;
        lesson.logoSrc = correctImageUrl(lesson.logoSrc);
        return lesson;
    });
    
    return categoryData;

  } catch (error) {
    console.error(`Error fetching category with slug ${slug}:`, error);
    return undefined;
  }
}

export async function getCategoryById(id: string): Promise<Category | undefined> {
  try {
    const categoryDocRef = doc(db, 'categories', id);
    const categoryDoc = await getDoc(categoryDocRef);

    if (!categoryDoc.exists()) {
      return undefined;
    }

    const categoryData = {
      id: categoryDoc.id,
      ...categoryDoc.data(),
    } as Category;
    
    categoryData.lessons = []; // Lessons not needed for this helper's current use case.
    
    return categoryData;

  } catch (error) {
    console.error(`Error fetching category with id ${id}:`, error);
    return undefined;
  }
}


export async function getLessonAndCategory(
  lessonSlug: string
): Promise<{ lesson: Lesson; category: Category } | undefined> {
  try {
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));

    for (const categoryDoc of categoriesSnapshot.docs) {
      const lessonsCollectionRef = collection(db, `categories/${categoryDoc.id}/lessons`);
      const q = query(lessonsCollectionRef, where('slug', '==', lessonSlug));
      const lessonSnapshot = await getDocs(q);

      if (!lessonSnapshot.empty) {
        const lessonDoc = lessonSnapshot.docs[0];
        const lesson = { id: lessonDoc.id, ...lessonDoc.data() } as Lesson;
        const category = { id: categoryDoc.id, ...categoryDoc.data() } as Category;
        
        lesson.logoSrc = correctImageUrl(lesson.logoSrc);

        category.lessons = []; 
        return { lesson, category };
      }
    }
  } catch(error) {
     console.error(`Error fetching lesson with slug ${lessonSlug}:`, error);
  }
  return undefined;
}
