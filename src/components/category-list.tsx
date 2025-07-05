import Link from 'next/link';
import type { Category } from '@/lib/data';
import { getIcon } from '@/lib/data';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';

interface CategoryListProps {
  categories: Category[];
}

export function CategoryList({ categories }: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-16">
        <h2 className="text-2xl font-headline mb-2">هنوز محتوایی وجود ندارد</h2>
        <p>مدیر سایت به زودی دسته‌بندی‌ها و درس‌های جدیدی اضافه خواهد کرد.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {categories.map((category) => {
        const IconComponent = getIcon(category.icon);
        return (
          <Link
            href={`/category/${category.slug}`}
            key={category.id}
            className="group"
            aria-label={`رفتن به دسته بندی: ${category.title}`}
          >
            <Card className="h-full transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1.5 border-2 border-transparent hover:border-primary/50 bg-card">
              <CardHeader className="flex flex-row items-center gap-4 p-5">
                <IconComponent className="w-12 h-12 text-primary shrink-0" />
                <div className="flex-grow">
                  <CardTitle className="font-headline text-2xl mb-1">
                    {category.title}
                  </CardTitle>
                  <CardDescription className="font-body text-base">
                    {category.description}
                  </CardDescription>
                </div>
                <ArrowLeft className="w-8 h-8 text-muted-foreground transition-transform group-hover:translate-x-[-4px]" />
              </CardHeader>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
