'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { deleteUserAction } from '@/lib/actions';
import { Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useTransition } from 'react';
import { useToast } from '@/hooks/use-toast';

export function UserActions({ userId }: { userId: string }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteUserAction(userId);
      if (result?.message) {
        toast({
          variant: 'destructive',
          title: 'خطا',
          description: result.message,
        });
      } else {
         toast({
          title: 'موفقیت',
          description: 'کاربر با موفقیت حذف شد.',
        });
      }
    });
  };

  return (
    <div className="space-x-2 space-x-reverse">
      <Button asChild variant="ghost" size="icon" aria-label="ویرایش کاربر">
        <Link href={`/admin/edit-user/${userId}`}>
          <Edit className="h-4 w-4" />
        </Link>
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="حذف کاربر" className="text-destructive hover:text-destructive/90">
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>آیا از حذف این کاربر اطمینان دارید؟</AlertDialogTitle>
            <AlertDialogDescription>
              این عمل قابل بازگشت نیست. این کاربر برای همیشه از پایگاه داده حذف خواهد شد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isPending ? 'در حال حذف...' : 'حذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
