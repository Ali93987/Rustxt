import Link from 'next/link';
import { categories } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlusCircle, Edit, Trash2, LogOut } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
          پنل مدیریت
        </h1>
        <Button asChild variant="outline">
          <Link href="/">
            خروج
            <LogOut className="mr-2 h-4 w-4" />
          </Link>
        </Button>
      </header>

      <main>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>مدیریت محتوا</CardTitle>
            <Button>
              <PlusCircle className="ml-2 h-4 w-4" />
              افزودن دسته‌بندی
            </Button>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {categories.map((category) => (
                <AccordionItem value={`category-${category.id}`} key={category.id}>
                  <AccordionTrigger className="text-xl hover:no-underline">
                    <div className="flex items-center justify-between w-full pr-4">
                      <span>{category.title}</span>
                      <Button asChild variant="ghost" size="icon" aria-label="ویرایش دسته بندی" onClick={(e) => e.stopPropagation()}>
                        <Link href={`/admin/edit-category/${category.slug}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-2">
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>عنوان درس</TableHead>
                            <TableHead className="text-left">عملیات</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {category.lessons.map((lesson) => (
                            <TableRow key={lesson.id}>
                              <TableCell className="font-medium">{lesson.title}</TableCell>
                              <TableCell className="text-left space-x-2 space-x-reverse">
                                <Button asChild variant="ghost" size="icon" aria-label="ویرایش درس">
                                  <Link href={`/admin/edit-lesson/${lesson.slug}`}>
                                    <Edit className="h-4 w-4" />
                                  </Link>
                                </Button>
                                <Button variant="ghost" size="icon" aria-label="حذف درس" className="text-destructive hover:text-destructive/90">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                     <div className="text-right mt-4">
                        <Button variant="outline">
                          <PlusCircle className="ml-2 h-4 w-4" />
                          افزودن درس جدید
                        </Button>
                      </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              در حال حاضر دکمه‌های حذف و افزودن غیرفعال هستند و در مراحل بعدی پیاده‌سازی خواهند شد.
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
