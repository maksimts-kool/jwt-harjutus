'use client';

import { LogOut, Timer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createSurvey, SurveyView } from '@/components/quiz/survey-view';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { type ExamOutcome, type ExamSessionState, updateSession } from '@/lib/progress';
import { useBank, useMessages } from '@/lib/use-messages';
import { toSurveyElements } from '@/lib/survey';
import { cn } from '@/lib/utils';

function formatClock(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export type { ExamOutcome };

export function ExamSession({
  session,
  page,
  onPageChange,
  onFinish,
  onExit,
}: {
  session: ExamSessionState;
  /** URL-ist: 0-põhine leht (küsimus) */
  page: number;
  onPageChange: (page: number) => void;
  onFinish: (outcome: ExamOutcome) => void;
  onExit: () => void;
}) {
  const m = useMessages();
  const { getQuestion } = useBank();
  const { id, ids, timeLimit } = session;
  const [model] = useState(() => {
    const model = createSurvey(
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
    );
    // Jätkame pooleli eksamit (leht laaditi uuesti või avati link uuesti).
    model.data = session.responses;
    model.timeSpent = session.seconds;
    model.currentPageNo = Math.min(page, ids.length - 1);
    return model;
  });
  const [remaining, setRemaining] = useState(Math.max(0, timeLimit - session.seconds));

  // URL → SurveyJS (brauseri edasi/tagasi nupud)
  useEffect(() => {
    const target = Math.min(Math.max(page, 0), ids.length - 1);
    if (model.currentPageNo !== target) model.currentPageNo = target;
  }, [model, page, ids.length]);

  // SurveyJS → URL ja salvestus
  useEffect(() => {
    const save = () =>
      updateSession<ExamSessionState>(id, (s) =>
        s.outcome ? s : { ...s, responses: { ...model.data }, seconds: model.timeSpent, page: model.currentPageNo },
      );
    const pageChanged = () => {
      save();
      onPageChange(model.currentPageNo);
    };
    let ticks = 0;
    const tick = () => {
      if (++ticks % 5 === 0) save();
    };
    model.onValueChanged.add(save);
    model.onCurrentPageChanged.add(pageChanged);
    model.onTimerTick.add(tick);
    return () => {
      model.onValueChanged.remove(save);
      model.onCurrentPageChanged.remove(pageChanged);
      model.onTimerTick.remove(tick);
    };
  }, [model, id, onPageChange]);

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
