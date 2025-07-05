'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect } from 'react';
import { ArrowLeftRight, Loader2 } from 'lucide-react';
import { translateAction } from '@/lib/actions';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const initialState = {
  translation: '',
  message: '',
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full md:w-auto">
      {pending ? (
        <>
          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
          در حال ترجمه...
        </>
      ) : (
        <>
          <ArrowLeftRight className="ml-2 h-4 w-4" />
          ترجمه کن
        </>
      )}
    </Button>
  );
}

export function TranslateForm() {
  const { toast } = useToast();
  const [state, formAction] = useFormState(translateAction, initialState);

  useEffect(() => {
    if (state.message) {
      toast({
        variant: 'destructive',
        title: 'خطا',
        description: state.message,
      });
    }
  }, [state.message, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-3xl font-headline">مترجم روسی به فارسی</CardTitle>
          <CardDescription>
            متن روسی خود را در کادر زیر وارد کرده و دکمه ترجمه را بزنید.
          </CardDescription>
        </CardHeader>
        <form action={formAction}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-2">
                <Label htmlFor="textToTranslate" className="text-lg">متن روسی</Label>
                <Textarea
                  id="textToTranslate"
                  name="textToTranslate"
                  placeholder="متن برای ترجمه..."
                  rows={10}
                  className="resize-y"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="translation" className="text-lg">ترجمه فارسی</Label>
                <Textarea
                  id="translation"
                  name="translation"
                  value={state.translation}
                  readOnly
                  placeholder="ترجمه در اینجا نمایش داده می‌شود..."
                  rows={10}
                  className="resize-y bg-muted/50"
                  dir="rtl"
                />
              </div>
            </div>
            <div className="flex flex-col-reverse md:flex-row justify-between items-center gap-4 pt-4">
              <Button variant="link" asChild>
                <Link href="/">بازگشت به صفحه اصلی</Link>
              </Button>
              <SubmitButton />
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
