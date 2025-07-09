import Link from 'next/link';
import { getCategories, getUsers } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PlusCircle, Edit, Trash2, LogOut, User, BookOpen, Settings } from 'lucide-react';
import { UserActions } from './user-actions';

export default async function AdminDashboardPage() {
  const categories = await getCategories();
  const users = await getUsers();

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary">
          پنل مدیریت
        </h1>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/settings">
              تنظیمات
              <Settings className="mr-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">
              خروج
              <LogOut className="mr-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Content Management Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <CardTitle>مدیریت محتوا</CardTitle>
            </div>
            <Button asChild>
              <Link href="/admin/add-category">
                <PlusCircle className="ml-2 h-4 w-4" />
                افزودن دسته‌بندی
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <p className="text-muted-foreground text-center p-8">
                هنوز هیچ دسته‌بندی‌ای اضافه نشده است. برای شروع یکی اضافه کنید.
              </p>
            ) : (
              <Accordion type="single" collapsible className="w-full">
                {categories.map((category) => (
                  <AccordionItem value={`category-${category.id}`} key={category.id}>
                    <AccordionTrigger className="text-xl hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <span>{category.title}</span>
                        <Button asChild variant="ghost" size="icon" aria-label="ویرایش دسته بندی">
                          <Link href={`/admin/edit-category/${category.slug}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-2">
                       {category.lessons.length === 0 ? (
                        <p className="text-muted-foreground text-center p-4">
                          در این دسته‌بندی هنوز درسی وجود ندارد.
                        </p>
                      ) : (
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
                       )}
                       <div className="text-right mt-4">
                          <Button asChild variant="outline">
                            <Link href={`/admin/add-lesson/${category.id}`}>
                              <PlusCircle className="ml-2 h-4 w-4" />
                              افزودن درس جدید
                            </Link>
                          </Button>
                        </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>

        {/* User Management Card */}
        <Card className="lg:col-span-1">
           <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              <CardTitle>مدیریت کاربران</CardTitle>
            </div>
            <Button asChild>
              <Link href="/admin/add-user">
                <PlusCircle className="ml-2 h-4 w-4" />
                افزودن کاربر
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
             {users.length === 0 ? (
              <p className="text-muted-foreground text-center p-8">
                هنوز هیچ کاربری اضافه نشده است.
              </p>
            ) : (
               <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>نام کاربری</TableHead>
                      <TableHead>ایمیل</TableHead>
                      <TableHead className="text-left">عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell className="text-left">
                           <UserActions userId={user.id} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
               </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
