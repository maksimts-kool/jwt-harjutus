'use client';

import { Check, Play, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AnswerKey } from '@/components/answers/answer-key';
import { InlineText } from '@/components/inline-text';
import { TokenBox } from '@/components/token-box';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProgress } from '@/lib/progress';
import { withLang } from '@/lib/i18n';
import { correctAnswerText, plainText, type Question } from '@/lib/questions';
import { useBank, useLang, useMessages } from '@/lib/use-messages';
import { cn } from '@/lib/utils';

function QuestionCard({ q }: { q: Question }) {
  const progress = useProgress();
  const lang = useLang();
  const m = useMessages();
  const stat = progress.stats[q.id];

  return (
    <li id={q.id} className="scroll-mt-36 rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5">
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <Badge variant="secondary">{m.questionN(q.number)}</Badge>
        <Badge variant="outline">{m.typeLabels[q.type]}</Badge>
        {stat && (
          <span
            className={cn(
              'ml-auto inline-flex items-center gap-1 text-xs',
              stat.last ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400',
            )}
          >
            {stat.last ? <Check className="size-3.5" /> : <X className="size-3.5" />}
            {stat.last ? m.lastRight : m.lastWrong}
          </span>
        )}
      </div>
      <h3 className="mb-4 leading-snug font-semibold">
        <InlineText text={q.prompt} />
      </h3>

      {q.useToken && <TokenBox className="mb-4" />}

      <AnswerKey q={q} m={m} />

      {q.type === 'matching' && q.optionsNote && (
        <p className="mt-3 text-xs text-muted-foreground italic">
          <InlineText text={q.optionsNote} />
        </p>
      )}

      <div className="mt-3 flex justify-end">
        <Link href={withLang(lang, `/harjutustest?q=${q.id}`)} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
          <Play />
          {m.practiceThis}
        </Link>
      </div>
    </li>
  );
}

/** Kõik küsimused koos vastustega teemade kaupa; otsing filtreerib küsimuse ja vastuse teksti järgi. */
export function QuestionExplorer() {
  const m = useMessages();
  const { questions, topics, questionsByTopic } = useBank();
  const [query, setQuery] = useState('');

  const searchable = useMemo(
    () =>
      new Map(
        questions.map((q) => [
          q.id,
          `${q.number} ${plainText(q.prompt)} ${plainText(correctAnswerText(q))}`.toLowerCase(),
        ]),
      ),
    [questions],
  );

  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
  const matches = (q: Question) => terms.every((t) => searchable.get(q.id)!.includes(t));
  const groups = topics
    .map((t) => ({ topic: t, items: questionsByTopic(t.id).filter(matches) }))
    .filter((g) => g.items.length > 0);
  const count = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="sticky top-14 z-10 -mx-4 flex flex-col gap-2 bg-background/90 px-4 py-2 backdrop-blur">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={m.searchPlaceholder}
            className="h-10 px-9"
            aria-label={m.searchAria}
          />
          {query && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute top-1/2 right-1.5 -translate-y-1/2"
              onClick={() => setQuery('')}
              aria-label={m.clearSearch}
            >
              <X />
            </Button>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{m.found(count, questions.length)}</p>
      </div>

      {groups.map(({ topic, items }) => (
        <section key={topic.id} id={topic.id} className="flex scroll-mt-36 flex-col gap-3">
          <h2 className="text-xl font-semibold">{topic.title}</h2>
          <ul className="flex flex-col gap-3">
            {items.map((q) => (
              <QuestionCard key={q.id} q={q} />
            ))}
          </ul>
        </section>
      ))}

      {count === 0 && (
        <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {m.noResults}
        </div>
      )}
    </div>
  );
}
