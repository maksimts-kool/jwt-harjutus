import { Check, CircleDot, X } from 'lucide-react';
import { InlineText } from '@/components/inline-text';
import type { MatchingResponse } from '@/lib/grading';
import type { Messages } from '@/lib/messages';
import { FALSE_LABEL, matchingLeft, optionLetter, type Question, TRUE_LABEL } from '@/lib/questions';
import { cn } from '@/lib/utils';

type Mark = 'correct' | 'wrong' | 'missed' | 'neutral';

const markStyles: Record<Mark, string> = {
  correct: 'border-emerald-500/50 bg-emerald-500/10',
  wrong: 'border-red-500/50 bg-red-500/10',
  missed: 'border-emerald-500/50 border-dashed bg-transparent',
  neutral: 'border-border bg-transparent opacity-70',
};

function MarkIcon({ mark }: { mark: Mark }) {
  if (mark === 'correct' || mark === 'missed')
    return <Check className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />;
  if (mark === 'wrong') return <X className="size-4 shrink-0 text-red-600 dark:text-red-400" />;
  return <CircleDot className="size-4 shrink-0 text-muted-foreground/50" />;
}

function OptionRow({
  label,
  text,
  mark,
  chosen,
}: {
  label?: string;
  text: string;
  mark: Mark;
  chosen?: string;
}) {
  return (
    <li className={cn('flex items-start gap-2.5 rounded-lg border px-3 py-2 text-sm', markStyles[mark])}>
      <span className="mt-0.5">
        <MarkIcon mark={mark} />
      </span>
      {label && <span className="font-mono text-muted-foreground">{label}.</span>}
      <InlineText text={text} className="flex-1" />
      {chosen && (
        <span className="shrink-0 rounded-full bg-foreground/10 px-2 py-0.5 text-xs text-muted-foreground">
          {chosen}
        </span>
      )}
    </li>
  );
}

/**
 * Näitab küsimuse õiget vastust. Kui `response` on antud, märgitakse ka kasutaja valikud.
 * Komponent ei kasuta hooke, seega sobib nii serveri- kui kliendikomponendiks; tekstid tulevad `m` kaudu.
 */
export function AnswerKey({ q, m, response }: { q: Question; m: Messages; response?: unknown }) {
  const answered = response !== undefined;

  switch (q.type) {
    case 'single':
    case 'multiple': {
      const correctSet = new Set(q.type === 'single' ? [q.answer] : q.answer);
      const chosen = new Set(
        answered && response !== null ? (Array.isArray(response) ? response : [response]).map(Number) : [],
      );
      return (
        <ul className="flex flex-col gap-1.5">
          {q.options.map((opt, i) => {
            const isCorrect = correctSet.has(i);
            const isChosen = chosen.has(i);
            let mark: Mark = isCorrect ? 'correct' : 'neutral';
            if (answered) {
              if (isChosen && !isCorrect) mark = 'wrong';
              else if (!isChosen && isCorrect) mark = 'missed';
            }
            return <OptionRow key={i} label={optionLetter(i)} text={opt} mark={mark} chosen={answered && isChosen ? m.yourChoice : undefined} />;
          })}
        </ul>
      );
    }
    case 'truefalse': {
      const chosen = answered ? String(response) : undefined;
      return (
        <ul className="grid grid-cols-2 gap-1.5">
          {[true, false].map((v) => {
            const isCorrect = v === q.answer;
            const isChosen = chosen === String(v);
            const mark: Mark = isCorrect ? 'correct' : answered && isChosen ? 'wrong' : 'neutral';
            return (
              <OptionRow
                key={String(v)}
                text={v ? TRUE_LABEL : FALSE_LABEL}
                mark={mark}
                chosen={isChosen ? m.yourChoice : undefined}
              />
            );
          })}
        </ul>
      );
    }
    case 'text': {
      const given = typeof response === 'string' ? response.trim() : '';
      return (
        <div className="flex flex-col gap-1.5 text-sm">
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-3 py-2">
            <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-muted-foreground">{m.correctAnswer}</span>
            <code className="inline-code text-sm font-semibold">{q.answer}</code>
          </div>
          {answered && (
            <div className="flex flex-wrap items-center gap-2 px-3 text-muted-foreground">
              {m.yourAnswer}: {given ? <code className="inline-code">{given}</code> : <em>{m.unanswered}</em>}
            </div>
          )}
        </div>
      );
    }
    case 'matching': {
      const resp = (response ?? {}) as MatchingResponse;
      return (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
              <tr>
                <th className="px-3 py-2 font-medium">{m.statement}</th>
                <th className="px-3 py-2 font-medium">{m.correctMatch}</th>
                {answered && <th className="px-3 py-2 font-medium">{m.yourAnswer}</th>}
              </tr>
            </thead>
            <tbody>
              {q.pairs.map((p, i) => {
                const mine = resp[String(i)]?.v;
                const ok = mine === p.right;
                return (
                  <tr key={i} className="border-t border-border">
                    <td className="px-3 py-2">
                      <InlineText text={matchingLeft(q, i)} />
                    </td>
                    <td className="px-3 py-2 font-medium text-emerald-700 dark:text-emerald-400">{p.right}</td>
                    {answered && (
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1.5">
                          {ok ? (
                            <Check className="size-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <X className="size-4 text-red-600 dark:text-red-400" />
                          )}
                          {mine ?? <em className="text-muted-foreground">{m.unanswered}</em>}
                        </span>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    case 'essay':
      return (
        <div className="flex flex-col gap-3 text-sm">
          {answered && typeof response === 'string' && response.trim() && (
            <div className="rounded-lg border border-border bg-muted/40 p-3">
              <div className="mb-1 text-xs font-medium text-muted-foreground">{m.yourAnswer}</div>
              <p className="whitespace-pre-wrap">{response}</p>
            </div>
          )}
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/5 p-3">
            <div className="mb-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">{m.modelAnswer}</div>
            <InlineText as="p" text={q.modelAnswer} className="leading-relaxed" />
          </div>
        </div>
      );
  }
}
