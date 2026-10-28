'use client';

import { LogOut, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createSurvey, SurveyView } from '@/components/quiz/survey-view';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useBank, useMessages } from '@/lib/use-messages';
import { toSurveyElements } from '@/lib/survey';
import { cn } from '@/lib/utils';

function formatClock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export interface ExamOutcome {
  ids: string[];
  responses: Record<string, unknown>;
  seconds: number;
  timedOut: boolean;
}

export function ExamSession({
  ids,
  timeLimit,
  onFinish,
  onExit,
}: {
  ids: string[];
  /** sekundites, 0 = taimer puudub */
  timeLimit: number;
  onFinish: (outcome: ExamOutcome) => void;
  onExit: () => void;
}) {
  const m = useMessages();
  const { getQuestion } = useBank();
  const [model] = useState(() =>
    createSurvey(
      {
        pages: ids.map((id) => ({
          name: `p-${id}`,
          elements: toSurveyElements(getQuestion(id)!, m, { shuffle: true }),
        })),
        showProgressBar: true,
        progressBarLocation: 'top',
        progressBarType: 'pages',
        showPrevButton: true,
        completeText: m.finishExam,
        pageNextText: m.next,
        pagePrevText: m.previous,
        // SurveyJS jälgib aega ja lõpetab eksami ise; taimerit näitame päises.
        ...(timeLimit > 0 ? { timeLimit, showTimer: false } : {}),
      },
      m,
    ),
  );
  const [remaining, setRemaining] = useState(timeLimit);

  useEffect(() => {
    if (timeLimit <= 0) return;
    const tick = () => setRemaining(Math.max(0, timeLimit - model.timeSpent));
    model.onTimerTick.add(tick);
    model.startTimer();
    return () => {
      model.onTimerTick.remove(tick);
      model.stopTimer();
    };
  }, [model, timeLimit]);

  useEffect(() => {
    const handler = () => {
      onFinish({
        ids,
        responses: { ...model.data },
        seconds: model.timeSpent,
        timedOut: timeLimit > 0 && model.timeSpent >= timeLimit,
      });
    };
    model.onComplete.add(handler);
    return () => model.onComplete.remove(handler);
  }, [model, ids, timeLimit, onFinish]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div>
          <h2 className="text-lg font-semibold">{m.examMode}</h2>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {m.examSubtitle(ids.length)}
          </p>
        </div>
        {timeLimit > 0 && (
          <div
            className={cn(
              'ml-auto flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-sm tabular-nums transition-colors',
              remaining <= 60
                ? 'border-red-500/50 bg-red-500/10 text-red-600 dark:text-red-400'
                : 'border-border bg-card',
            )}
            aria-label={m.timeLeft}
          >
            <Timer className="size-4" />
            {formatClock(remaining)}
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className={timeLimit > 0 ? undefined : 'ml-auto'}
          onClick={() => {
            if (window.confirm(m.confirmAbortExam)) onExit();
          }}
        >
          <LogOut />
          {m.abort}
        </Button>
      </div>
      <Card className="animate-in fade-in duration-300">
        <CardContent>
          <SurveyView model={model} />
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">
        {m.examNote}
      </p>
    </div>
  );
}
