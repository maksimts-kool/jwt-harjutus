'use client';

import { Check, Play, Search, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
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
    <li id={q.id} className="scroll-mt-48 rounded-xl border border-border bg-card p-4 shadow-xs sm:p-5">
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
  const all = topics.map((t) => ({ topic: t, items: questionsByTopic(t.id).filter(matches) }));
  const groups = all.filter((g) => g.items.length > 0);
  const count = groups.reduce((n, g) => n + g.items.length, 0);
  const active = useActiveSection(groups.map((g) => g.topic.id));
  const tocRef = useRef<HTMLUListElement>(null);

  // Mobiilis on teemad horisontaalne rida – hoia aktiivne teema nähtaval.
  useEffect(() => {
    const list = tocRef.current;
    const item = list?.querySelector<HTMLElement>('[aria-current]');
    if (!list || !item || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({ left: item.offsetLeft - 16, behavior: 'smooth' });
  }, [active]);

  return (
    <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
      <aside className="sticky top-14 z-10 -mx-4 flex min-w-0 flex-col gap-2 bg-background/90 px-4 py-2 backdrop-blur lg:top-20 lg:mx-0 lg:max-h-[calc(100dvh-6rem)] lg:gap-3 lg:self-start lg:overflow-y-auto lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={m.searchShort}
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

        <nav aria-label={m.topicsToc} className="flex min-w-0 flex-col gap-1 lg:border-t lg:border-border lg:pt-3">
          <p className="hidden px-2.5 text-xs font-medium tracking-wide text-muted-foreground uppercase lg:block">
            {m.topicsToc}
          </p>
          <ul
            ref={tocRef}
            className="relative -mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-0 lg:pb-0">
            {all.map(({ topic, items }) => {
              const empty = items.length === 0;
              const isActive = !empty && active === topic.id;
              return (
                <li key={topic.id} className="shrink-0">
                  <a
                    href={empty ? undefined : `#${topic.id}`}
                    aria-current={isActive ? 'location' : undefined}
                    aria-disabled={empty || undefined}
                    className={cn(
                      'flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors lg:border-transparent lg:whitespace-normal',
                      isActive
                        ? 'border-primary/40 bg-primary/10 font-medium text-primary'
                        : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground',
                      empty && 'pointer-events-none opacity-40',
                    )}
                  >
                    <span className="lg:leading-snug">{topic.title}</span>
                    <span className="text-xs tabular-nums opacity-70">{items.length}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      <div className="flex min-w-0 flex-col gap-8">
        {groups.map(({ topic, items }) => (
          <section key={topic.id} id={topic.id} className="flex scroll-mt-48 flex-col gap-3 lg:scroll-mt-20">
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
    </div>
  );
}

/** Sisukorra esiletõst: esimene teema, mis on ekraani ülaosas nähtav. */
function useActiveSection(ids: string[]): string | undefined {
  const [active, setActive] = useState<string>();
  const key = ids.join(',');

  useEffect(() => {
    const order = key ? key.split(',') : [];
    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        const first = order.find((id) => visible.has(id));
        if (first) setActive(first);
      },
      // riba algab kleepuva otsingu alt (mobiilis on see kõrgem)
      { rootMargin: `${matchMedia('(min-width: 1024px)').matches ? -100 : -200}px 0px -55% 0px` },
    );
    for (const id of order) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [key]);

  return ids.includes(active ?? '') ? active : ids[0];
}
