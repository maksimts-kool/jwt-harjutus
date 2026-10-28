'use client';

import { CircleAlert, CircleCheck, CircleHelp, CircleMinus, CircleX, ThumbsDown, ThumbsUp } from 'lucide-react';
import { AnswerKey } from '@/components/answers/answer-key';
import { InlineText } from '@/components/inline-text';
import { Button } from '@/components/ui/button';
import type { GradeResult, ResultStatus } from '@/lib/grading';
import type { Messages } from '@/lib/messages';
import { correctAnswerText, matchingLeft, type Question } from '@/lib/questions';
import { useMessages } from '@/lib/use-messages';
import { cn } from '@/lib/utils';

type StatusLabel = 'resultCorrect' | 'resultPartial' | 'resultWrong' | 'resultUnanswered' | 'resultSelf';

const statusMeta: Record<ResultStatus, { label: StatusLabel; icon: typeof CircleCheck; className: string }> = {
  correct: {
    label: 'resultCorrect',
    icon: CircleCheck,
    className: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  },
  partial: {
    label: 'resultPartial',
    icon: CircleAlert,
    className: 'border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  },
  wrong: {
    label: 'resultWrong',
    icon: CircleX,
    className: 'border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300',
  },
  unanswered: {
    label: 'resultUnanswered',
    icon: CircleMinus,
    className: 'border-border bg-muted text-muted-foreground',
  },
  self: {
    label: 'resultSelf',
    icon: CircleHelp,
    className: 'border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  },
};

const iconTone: Record<ResultStatus, string> = {
  correct: 'text-emerald-600 dark:text-emerald-400',
  partial: 'text-amber-600 dark:text-amber-400',
  wrong: 'text-red-600 dark:text-red-400',
  unanswered: 'text-muted-foreground',
  self: 'text-sky-600 dark:text-sky-400',
};

export function StatusIcon({ status, className }: { status: ResultStatus; className?: string }) {
  const Icon = statusMeta[status].icon;
  return <Icon className={cn('size-4 shrink-0', iconTone[status], className)} />;
}

function SelfAssess({ value, onGrade }: { value?: boolean; onGrade: (ok: boolean) => void }) {
  const m = useMessages();
  return (
    <div className="rounded-lg border border-sky-500/30 bg-sky-500/5 p-3">
      <p className="mb-2 text-sm font-medium">{m.compareWithModel}</p>
      {value === undefined ? (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => onGrade(true)}>
            <ThumbsUp />
            {m.iWasRight}
          </Button>
          <Button size="sm" variant="outline" onClick={() => onGrade(false)}>
            <ThumbsDown />
            {m.needMorePractice}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          {m.gradeSaved} <strong>{value ? m.gradeRight : m.gradeNeedsPractice}</strong>
        </p>
      )}
    </div>
  );
}

/** Lühike õige vastus; seostamise puhul ainult valesti seostatud read. */
function Correction({ q, result }: { q: Question; result: GradeResult }) {
  if (q.type === 'matching') {
    return (
      <ul className="flex flex-col gap-1">
        {q.pairs.map((p, i) =>
          result.rows?.[i] ? null : (
            <li key={i}>
              <InlineText text={matchingLeft(q, i)} /> → <strong>{p.right}</strong>
            </li>
          ),
        )}
      </ul>
    );
  }
  return <InlineText text={correctAnswerText(q)} className="font-semibold" />;
}

/**
 * Tagasiside pärast vastamist.
 * - harjutuses (vaikimisi) on kasutaja vastus küsimuse väljal näha, seega näidatakse ainult
 *   tulemust ja vale vastuse korral õiget vastust – ühel real, ilma kordusteta;
 * - `review` (eksami ülevaade) näitab nii kasutaja kui ka õiget vastust, sest küsimust pole ekraanil.
 */
export function AnswerFeedback({
  q,
  response,
  result,
  selfGrade,
  onSelfGrade,
  review = false,
}: {
  q: Question;
  response: unknown;
  result: GradeResult;
  selfGrade?: boolean;
  onSelfGrade?: (ok: boolean) => void;
  review?: boolean;
}) {
  const m = useMessages();
  if (q.type === 'essay') {
    return (
      <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <AnswerKey q={q} m={m} response={review ? (response ?? null) : undefined} />
        {onSelfGrade && <SelfAssess value={selfGrade} onGrade={onSelfGrade} />}
      </div>
    );
  }

  if (review) {
    return (
      <div className="animate-in fade-in duration-300">
        <AnswerKey q={q} m={m} response={result.status === 'correct' ? undefined : (response ?? null)} />
      </div>
    );
  }

  const meta = statusMeta[result.status];
  const Icon = meta.icon;
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm animate-in fade-in slide-in-from-bottom-2 duration-300',
        meta.className,
      )}
    >
      <Icon className="mt-0.5 size-5 shrink-0" />
      <div className="flex flex-col gap-1">
        <span className="font-medium">{m[meta.label]}</span>
        {result.status !== 'correct' && (
          <div className="text-foreground">
            <span className="text-muted-foreground">{m.correctAnswer} </span>
            <Correction q={q} result={result} />
          </div>
        )}
      </div>
    </div>
  );
}
