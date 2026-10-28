'use client';

import { ArrowRight, Check, LogOut, RotateCcw, SkipForward, Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AnswerFeedback, StatusIcon } from '@/components/quiz/answer-feedback';
import { createSurvey, SurveyView } from '@/components/quiz/survey-view';
import { InlineText } from '@/components/inline-text';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { grade, type GradeResult, isEmptyResponse } from '@/lib/grading';
import type { Messages } from '@/lib/messages';
import { type PracticeLabel, recordAnswer, savePractice } from '@/lib/progress';
import type { Bank, Question } from '@/lib/questions';
import { toSurveyElements } from '@/lib/survey';
import { useBank, useMessages } from '@/lib/use-messages';

export function formatPracticeLabel(label: PracticeLabel, bank: Bank, m: Messages): string {
  if (typeof label === 'string') return label;
  switch (label.kind) {
    case 'topics':
      return label.topics.length === 0 ? m.allTopics : label.topics.map((t) => bank.getTopic(t).title).join(', ');
    case 'retry':
      return m.retryLabel;
    case 'question':
      return m.questionN(label.number);
  }
}

interface Checked {
  response: unknown;
  result: GradeResult;
  selfGrade?: boolean;
}

function QuestionStep({
  q,
  checked,
  onCheck,
}: {
  q: Question;
  checked: Checked | null;
  onCheck: (response: unknown) => void;
}) {
  const m = useMessages();
  // Iga küsimus saab oma SurveyJS mudeli; `key` vanemas tagab uue mudeli.
  const [model] = useState(() =>
    createSurvey({ showNavigationButtons: false, elements: toSurveyElements(q, m, { shuffle: false }) }, m),
  );
  const [hint, setHint] = useState(false);

  useEffect(() => {
    model.readOnly = checked !== null;
  }, [model, checked]);

  function submit() {
    const value = model.getValue(q.id);
    if (isEmptyResponse(value) && q.type !== 'essay') {
      setHint(true);
      return;
    }
    setHint(false);
    onCheck(value);
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        onKeyDown={(e) => {
          // Enter lühivastuse väljal = „Kontrolli”
          if (e.key === 'Enter' && e.target instanceof HTMLInputElement && e.target.type === 'text' && !checked) {
            e.preventDefault();
            submit();
          }
        }}
      >
        <SurveyView model={model} />
      </div>
      {hint && <p className="text-sm text-amber-600 dark:text-amber-400">{m.answerFirst}</p>}
      {!checked && (
        <div className="flex flex-wrap gap-2">
          <Button onClick={submit}>
            <Check />
            {m.check}
          </Button>
        </div>
      )}
    </div>
  );
}

export function PracticeSession({
  label,
  ids,
  startIndex = 0,
  onExit,
  onRetry,
}: {
  label: PracticeLabel;
  ids: string[];
  startIndex?: number;
  onExit: () => void;
  onRetry: (ids: string[]) => void;
}) {
  const m = useMessages();
  const bank = useBank();
  const title = formatPracticeLabel(label, bank, m);
  const [index, setIndex] = useState(startIndex);
  const [attempt, setAttempt] = useState(0);
  const [checked, setChecked] = useState<Checked | null>(null);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const finished = index >= ids.length;
  const q = finished ? undefined : bank.getQuestion(ids[index]);

  useEffect(() => {
    // Ühe küsimuse harjutust (otselink vastuste lehelt) pole mõtet „pooleli” jätta.
    savePractice(finished || ids.length === 1 ? undefined : { label, ids, index });
  }, [finished, label, ids, index]);

  function handleCheck(response: unknown) {
    if (!q) return;
    const result = grade(q, response);
    setChecked({ response, result });
    if (q.type !== 'essay') {
      const ok = result.status === 'correct';
      recordAnswer(q.id, ok);
      setResults((r) => ({ ...r, [q.id]: ok }));
    }
  }

  function handleSelfGrade(ok: boolean) {
    if (!q || !checked) return;
    recordAnswer(q.id, ok);
    setResults((r) => ({ ...r, [q.id]: ok }));
    setChecked({ ...checked, selfGrade: ok });
  }

  function next() {
    setChecked(null);
    setAttempt(0);
    setIndex((i) => i + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function retry() {
    setChecked(null);
    setAttempt((a) => a + 1);
  }

  if (finished) {
    const answered = Object.keys(results).length;
    const correct = Object.values(results).filter(Boolean).length;
    const wrong = ids.filter((id) => results[id] === false);
    return (
      <Card className="animate-in fade-in zoom-in-95 duration-300">
        <CardContent className="flex flex-col items-center gap-4 py-8 text-center">
          <div className="grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
            <Trophy className="size-7" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{m.practiceDone}</h2>
            <p className="text-muted-foreground">
              {m.practiceScore(title, correct, answered)}
            </p>
          </div>
          {answered > 0 && <Progress value={(correct / answered) * 100} className="max-w-xs" />}
          <div className="flex flex-wrap justify-center gap-2">
            {wrong.length > 0 && (
              <Button onClick={() => onRetry(wrong)}>
                <RotateCcw />
                {m.retryWrongN(wrong.length)}
              </Button>
            )}
            <Button variant="outline" onClick={onExit}>
              {m.backToPracticeHome}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!q) return null;
  const topic = bank.getTopic(q.topic);
  const isLast = index === ids.length - 1;
  const canRetry = checked && q.type !== 'essay' && checked.result.status !== 'correct';

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex items-center justify-between gap-2 text-sm">
            <span className="truncate font-medium">{title}</span>
            <span className="shrink-0 text-muted-foreground tabular-nums">
              {index + 1} / {ids.length}
            </span>
          </div>
          <Progress value={(index / ids.length) * 100} />
        </div>
        <Button variant="ghost" size="sm" onClick={onExit} aria-label={m.abortPractice}>
          <LogOut />
          <span className="hidden sm:inline">{m.abort}</span>
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {ids.map((id, i) => {
          const r = results[id];
          return (
            <span
              key={id}
              className={
                'h-1.5 w-4 rounded-full transition-colors ' +
                (i === index
                  ? 'bg-primary'
                  : r === true
                    ? 'bg-emerald-500'
                    : r === false
                      ? 'bg-red-500'
                      : 'bg-muted')
              }
            />
          );
        })}
      </div>

      <Card key={`${q.id}-${attempt}`} className="animate-in fade-in slide-in-from-right-4 duration-300">
        <CardHeader className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary">{m.questionN(q.number)}</Badge>
          <Badge variant="outline">{topic.title}</Badge>
          <Badge variant="outline">{m.typeLabels[q.type]}</Badge>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <QuestionStep q={q} checked={checked} onCheck={handleCheck} />

          {checked && (
            <>
              <AnswerFeedback
                q={q}
                response={checked.response}
                result={checked.result}
                selfGrade={checked.selfGrade}
                onSelfGrade={handleSelfGrade}
              />
              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                <Button onClick={next}>
                  {isLast ? m.seeSummary : m.nextQuestion}
                  <ArrowRight />
                </Button>
                {canRetry && (
                  <Button variant="outline" onClick={retry}>
                    <RotateCcw />
                    {m.tryAgain}
                  </Button>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {!checked && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={next}>
            <SkipForward />
            {m.skip}
          </Button>
        </div>
      )}

      {Object.keys(results).length > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <StatusIcon status="correct" className="size-3.5" />
          {m.correctThisSession(Object.values(results).filter(Boolean).length)}
          <span className="mx-1">·</span>
          <InlineText text={m.autoSaved} />
        </p>
      )}
    </div>
  );
}
