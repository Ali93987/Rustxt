"use client";

import Link from "next/link";
import type { Lesson } from "@/lib/data";
import { useProgress } from "@/hooks/use-progress";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, BookOpen, Crown, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface LessonListProps {
  lessons: Lesson[];
}

export function LessonList({ lessons }: LessonListProps) {
  const { isCompleted } = useProgress();
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-36 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {lessons.map((lesson) => {
        const completed = isCompleted(lesson.id);
        const isVip = lesson.isVip;
        const isLocked = isVip && !user;
        const href = isLocked ? '/login' : `/lessons/${lesson.slug}`;

        return (
          <Link
            href={href}
            key={lesson.id}
            className="group"
            aria-label={isLocked ? `ورود برای دسترسی به درس: ${lesson.title}` : `رفتن به درس: ${lesson.title}`}
          >
            <Card className={cn(
                "h-full transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1.5 border-2 border-transparent bg-card",
                isLocked ? "bg-muted/50 border-dashed hover:border-yellow-500/50" : "hover:border-primary/50"
            )}>
              <CardHeader>
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center gap-2">
                    <BookOpen className="w-8 h-8 text-primary" />
                    {isVip && <Crown className="w-6 h-6 text-yellow-500" />}
                  </div>
                  {isLocked ? (
                     <Lock className="w-6 h-6 text-muted-foreground" aria-label="درس قفل است" />
                  ) : completed && (
                    <CheckCircle2 className="w-6 h-6 text-green-500" aria-label="درس تکمیل شد" />
                  )}
                </div>
                <CardTitle className="font-headline text-xl">
                  {lesson.title}
                </CardTitle>
              </CardHeader>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
