"use client";

import Link from "next/link";
import type { Lesson } from "@/lib/data";
import { useProgress } from "@/hooks/use-progress";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { CheckCircle2, BookOpen } from "lucide-react";

interface LessonListProps {
  lessons: Lesson[];
}

export function LessonList({ lessons }: LessonListProps) {
  const { isCompleted } = useProgress();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {lessons.map((lesson) => {
        const completed = isCompleted(lesson.id);
        return (
          <Link
            href={`/lessons/${lesson.slug}`}
            key={lesson.id}
            className="group"
            aria-label={`Go to lesson: ${lesson.title}`}
          >
            <Card className="h-full transition-all duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1.5 border-2 border-transparent hover:border-primary/50 bg-card">
              <CardHeader>
                <div className="flex justify-between items-start mb-4">
                  <BookOpen className="w-8 h-8 text-primary" />
                  {completed && (
                    <CheckCircle2 className="w-6 h-6 text-green-500" aria-label="Lesson completed" />
                  )}
                </div>
                <CardTitle className="font-headline text-xl">
                  {lesson.title}
                </CardTitle>
                <CardDescription className="font-body pt-1">
                  {lesson.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
