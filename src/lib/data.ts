import type { LucideIcon } from 'lucide-react';
import { BookHeart, BookCheck, Feather, LibraryBig } from 'lucide-react';

export interface Lesson {
  id: number;
  slug: string;
  title: string;
  text: string;
  audioSrc: string;
}

export interface Category {
  id: number;
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  lessons: Lesson[];
}

export const categories: Category[] = [
  {
    id: 1,
    slug: 'children-stories',
    title: 'قصه‌های کودکانه',
    description: 'داستان‌های ساده و جذاب برای شروع یادگیری.',
    icon: BookHeart,
    lessons: [
      {
        id: 101,
        slug: 'the-turnip',
        title: 'شلغم',
        text: 'یک داستان کلاسیک روسی درباره خانواده‌ای که سعی در بیرون کشیدن یک شلغم غول‌پیکر دارند.',
        audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      },
      {
        id: 102,
        slug: 'kolobok',
        title: 'کُلوبوک',
        text: 'داستان یک نان زنجبیلی که از دست همه فرار می‌کند.',
        audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      },
    ],
  },
  {
    id: 2,
    slug: 'true-stories',
    title: 'داستان‌های واقعی',
    description: 'روایت‌های واقعی برای آشنایی با فرهنگ و تاریخ روسیه.',
    icon: BookCheck,
    lessons: [
      {
        id: 201,
        slug: 'yuri-gagarin',
        title: 'یوری گاگارین، اولین انسان در فضا',
        text: 'داستان پرواز تاریخی یوری گاگارین و تبدیل شدن او به اولین انسانی که به فضا سفر کرد.',
        audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      },
    ],
  },
  {
    id: 3,
    slug: 'poems',
    title: 'شعرها',
    description: 'آثار شاعران بزرگ روس.',
    icon: Feather,
    lessons: [
      {
        id: 301,
        slug: 'pushkin-i-loved-you',
        title: 'الکساندر پوشکین - من شما را دوست داشتم',
        text: 'یکی از معروف‌ترین اشعار عاشقانه پوشکین.',
        audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
      },
    ],
  },
    {
    id: 4,
    slug: 'novels',
    title: 'رمان‌ها',
    description: 'گزیده‌ای از رمان‌های کلاسیک روسی.',
    icon: LibraryBig,
    lessons: [
      {
        id: 401,
        slug: 'crime-and-punishment-excerpt',
        title: 'گزیده‌ای از جنایت و مکافات',
        text: 'بخشی از رمان مشهور فئودور داستایفسکی.',
        audioSrc: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
      },
    ],
  },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

export function getLessonAndCategory(
  lessonSlug: string
): { lesson: Lesson; category: Category } | undefined {
  for (const category of categories) {
    const lesson = category.lessons.find((l) => l.slug === lessonSlug);
    if (lesson) {
      return { lesson, category };
    }
  }
  return undefined;
}
