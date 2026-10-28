'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useHydrated, useProgress, wrongIds } from '@/lib/progress';
import { withLang } from '@/lib/i18n';
import { useBank, useLang, useMessages } from '@/lib/use-messages';

export function HomeProgress() {
  const hydrated = useHydrated();
  const progress = useProgress();
  const lang = useLang();
  const m = useMessages();
  const { questions } = useBank();
  const answered = Object.keys(progress.stats).length;
  if (!hydrated || answered === 0) return null;

  const correct = Object.values(progress.stats).filter((s) => s.last).length;
  const wrong = wrongIds(progress).length;
  const pct = Math.round((correct / questions.length) * 100);

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-primary/30 bg-primary/5 p-6 animate-in fade-in duration-300 sm:flex-row sm:items-center">
      <div className="flex flex-1 flex-col gap-2">
        <h2 className="font-semibold">{m.yourProgress}</h2>
        <Progress value={pct} />
        <p className="text-sm text-muted-foreground">
          {m.progressText(correct, questions.length, wrong)}
        </p>
      </div>
      <Link href={withLang(lang, '/harjutustest')} className={buttonVariants({ className: 'shrink-0' })}>
        {m.continuePractice}
        <ArrowRight />
      </Link>
    </section>
  );
}
