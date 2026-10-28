'use client';

import { Accordion, Accordions } from 'fumadocs-ui/components/accordion';
import { Clock, RotateCcw, Shuffle, Trophy } from 'lucide-react';
import { useMemo, useState } from 'react';
import { AnswerFeedback, StatusIcon } from '@/components/quiz/answer-feedback';
import type { ExamOutcome } from '@/components/quiz/exam-session';
import { InlineText } from '@/components/inline-text';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { grade } from '@/lib/grading';
import { recordAnswer } from '@/lib/progress';
import type { Bank } from '@/lib/questions';
import { useBank, useMessages } from '@/lib/use-messages';
import { cn } from '@/lib/utils';

/** Indeks `scoreMessages` massiivis: 90%+, 75%+, 50%+, ülejäänud. */
export function scoreLevel(pct: number) {
  if (pct >= 90) return 0;
  if (pct >= 75) return 1;
  if (pct >= 50) return 2;
  return 3;
}

export function gradedScore(outcome: ExamOutcome, bank: Bank) {
  const graded = outcome.ids.map((id) => {
    const q = bank.getQuestion(id)!;
    return { q, response: outcome.responses[id], result: grade(q, outcome.responses[id]) };
  });
  const auto = graded.filter((g) => g.q.type !== 'essay');
  const correct = auto.filter((g) => g.result.status === 'correct').length;
  return { graded, correct, total: auto.length };
}

export function ExamResults({
  outcome,
  onRetry,
  onNewExam,
  onExit,
}: {
  outcome: ExamOutcome;
  onRetry: (ids: string[]) => void;
  onNewExam: () => void;
  onExit: () => void;
}) {
  const m = useMessages();
  const bank = useBank();
  const { graded, correct, total } = useMemo(() => gradedScore(outcome, bank), [outcome, bank]);
  const [selfGrades, setSelfGrades] = useState<Record<string, boolean>>({});
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const essays = graded.filter((g) => g.q.type === 'essay');
  const wrongIds = graded
    .filter((g) => (g.q.type === 'essay' ? selfGrades[g.q.id] === false : g.result.status !== 'correct'))
    .map((g) => g.q.id);

  return (
    <div className="flex flex-col gap-6">
      <Card className="animate-in fade-in zoom-in-95 duration-300">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <div
            className={cn(
              'grid size-16 place-items-center rounded-full',
              pct >= 75 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-primary/10 text-primary',
            )}
          >
            <Trophy className="size-8" />
          </div>
          <div>
            <div className="text-5xl font-bold tabular-nums">{pct}%</div>
            <p className="mt-1 text-muted-foreground">
              {m.examScore(correct, total)}
            </p>
          </div>
          <Progress value={pct} className="max-w-sm" />
          <p className="max-w-md">{m.scoreMessages[scoreLevel(pct)]}</p>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" />
              {m.formatDuration(outcome.seconds)}
            </span>
            {outcome.timedOut && <span className="text-amber-600 dark:text-amber-400">{m.timedOut}</span>}
            {essays.length > 0 && <span>{m.essaysToGrade(essays.length)}</span>}
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {wrongIds.length > 0 && (
              <Button onClick={() => onRetry(wrongIds)}>
                <RotateCcw />
                {m.retryWrongN(wrongIds.length)}
              </Button>
            )}
            <Button variant="outline" onClick={onNewExam}>
              <Shuffle />
              {m.newExam}
            </Button>
            <Button variant="ghost" onClick={onExit}>
              {m.toPracticeHome}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-3 text-lg font-semibold">{m.reviewHeading}</h3>
        <Accordions multiple className="bg-card">
          {graded.map(({ q, response, result }, i) => {
            const self = selfGrades[q.id];
            const status =
              q.type === 'essay' ? (self === undefined ? result.status : self ? 'correct' : 'wrong') : result.status;
            return (
              <Accordion
                key={q.id}
                value={q.id}
                title={
                  <span className="flex items-start gap-2 text-left">
                    <StatusIcon status={status} className="mt-0.5" />
                    <span className="text-muted-foreground tabular-nums">{i + 1}.</span>
                    <InlineText text={q.prompt} className="line-clamp-2 font-normal" />
                  </span>
                }
              >
                <AnswerFeedback
                  q={q}
                  response={response}
                  result={result}
                  selfGrade={self}
                  review
                  onSelfGrade={(ok) => {
                    recordAnswer(q.id, ok);
                    setSelfGrades((s) => ({ ...s, [q.id]: ok }));
                  }}
                />
              </Accordion>
            );
          })}
        </Accordions>
      </div>
    </div>
  );
}
