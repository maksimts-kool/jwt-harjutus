import type { ReactNode } from 'react';
import { InlineText } from '@/components/inline-text';
import { TokenBox } from '@/components/token-box';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { Question } from '@/lib/questions';
import { cn } from '@/lib/utils';

/** Küsimuse tekst (ja vajadusel token) eraldi kaardil; vastusevariandid tulevad selle alla. */
export function QuestionHeader({ q, badges, className }: { q: Question; badges?: ReactNode; className?: string }) {
  return (
    <Card className={cn('sm:[--card-spacing:--spacing(6)]', className)}>
      {badges && <CardHeader className="flex flex-wrap items-center gap-1.5">{badges}</CardHeader>}
      <CardContent className="flex flex-col gap-4">
        <InlineText as="h2" text={q.prompt} className="text-lg leading-snug font-semibold sm:text-xl" />
        {q.useToken && <TokenBox />}
      </CardContent>
    </Card>
  );
}
