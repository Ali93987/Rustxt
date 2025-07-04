import Link from 'next/link';
import { categories } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
            <CardTitle>مدیریت دسته‌بندی‌ها</CardTitle>
            <Button>
              <PlusCircle className="ml-2 h-4 w-4" />
              افزودن دسته‌بندی
            </Button>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>عنوان</TableHead>
                    <TableHead>تعداد درس‌ها</TableHead>
                    <TableHead className="text-left">عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.title}</TableCell>
                      <TableCell>{category.lessons.length}</TableCell>
                      <TableCell className="text-left space-x-2 space-x-reverse">
                        <Button variant="ghost" size="icon" aria-label="ویرایش">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" aria-label="حذف" className="text-destructive hover:text-destructive/90">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-xs text-muted-foreground">
              در حال حاضر دکمه‌های ویرایش، حذف و افزودن غیرفعال هستند و در مراحل بعدی پیاده‌سازی خواهند شد.
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
