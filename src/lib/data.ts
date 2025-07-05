import 'server-only';

import type { LucideIcon } from 'lucide-react';
import { collection, getDocs, getDoc, query, where, orderBy, Timestamp } from 'firebase/firestore';
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

export async function getCategories(): Promise<Category[]> {
  try {
    const categoriesCollection = collection(db, 'categories');
    // Order by creation time to keep a consistent order
    const q = query(categoriesCollection, orderBy('createdAt', 'asc'));
    const categorySnapshot = await getDocs(q);

    // Using Promise.all to fetch all lessons for all categories in parallel
    const categoriesList = await Promise.all(categorySnapshot.docs.map(async (categoryDoc) => {
      const categoryData = {
        id: categoryDoc.id,
        ...categoryDoc.data(),
      } as Category;

      // In this version, we assume lessons might be a subcollection
      // For now, we'll return an empty array for simplicity.
      // This can be expanded later.
      categoryData.lessons = [];

      return categoryData;
    }));

    return categoriesList;
  } catch (error) {
    console.error("Error fetching categories: ", error);
    // In a real app, you might want to show an error page
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
    
    // Fetch lessons for this category from the subcollection
    const lessonsCollection = collection(db, `categories/${categoryDoc.id}/lessons`);
    const lessonsSnapshot = await getDocs(lessonsCollection);
    categoryData.lessons = lessonsSnapshot.docs.map(lessonDoc => ({
        id: lessonDoc.id,
        ...lessonDoc.data(),
    } as Lesson));
    
    return categoryData;

  } catch (error) {
    console.error(`Error fetching category with slug ${slug}:`, error);
    return undefined;
  }
}

export async function getLessonAndCategory(
  lessonSlug: string
): Promise<{ lesson: Lesson; category: Category } | undefined> {
  // This is not the most efficient way for large datasets, but works for this app.
  // A better schema might be a root-level `lessons` collection.
  const allCategories = await getCategories();
  for (const category of allCategories) {
    // We must fetch lessons for each category to find the lesson
    const lessonsCollection = collection(db, `categories/${category.id}/lessons`);
    const q = query(lessonsCollection, where('slug', '==', lessonSlug));
    const lessonSnapshot = await getDocs(q);

    if (!lessonSnapshot.empty) {
      const lessonDoc = lessonSnapshot.docs[0];
      const lesson = { id: lessonDoc.id, ...lessonDoc.data() } as Lesson;
      // We found the lesson, return it with its parent category
      return { lesson, category };
    }
  }

  return undefined;
}