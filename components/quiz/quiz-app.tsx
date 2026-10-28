'use client';

import {
  GraduationCap,
  History,
  ListChecks,
  Play,
  RotateCcw,
  Shuffle,
  Timer,
  Trash2,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { ExamResults, gradedScore } from '@/components/quiz/exam-results';
import { type ExamOutcome, ExamSession } from '@/components/quiz/exam-session';
import { formatPracticeLabel, PracticeSession } from '@/components/quiz/practice-session';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  type PracticeLabel,
  recordAnswer,
  recordExam,
  resetProgress,
  savePractice,
  useProgress,
  wrongIds,
} from '@/lib/progress';
import type { Bank, TopicId } from '@/lib/questions';
import { useBank, useMessages } from '@/lib/use-messages';

type View =
  | { kind: 'hub' }
  | { kind: 'practice'; label: PracticeLabel; ids: string[]; index: number; key: number }
  | { kind: 'exam'; ids: string[]; timeLimit: number; key: number }
  | { kind: 'results'; outcome: ExamOutcome };

function shuffle<T>(items: T[]): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const byNumber = (bank: Bank, ids: string[]) =>
  [...ids].sort((a, b) => bank.getQuestion(a)!.number - bank.getQuestion(b)!.number);

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Button
      type="button"
      size="xs"
      variant={active ? 'default' : 'outline'}
      onClick={onClick}
      aria-pressed={active}
      className="rounded-full"
    >
      {children}
    </Button>
  );
}

export function QuizApp() {
  const params = useSearchParams();
  const progress = useProgress();
  const m = useMessages();
  const bank = useBank();
  const { questions, topics, getQuestion } = bank;
  const [view, setView] = useState<View>(() => {
    const q = params.get('q');
    const question = q ? getQuestion(q) : undefined;
    if (question) {
      return { kind: 'practice', label: { kind: 'question', number: question.number }, ids: [question.id], index: 0, key: 0 };
    }
    return { kind: 'hub' };
  });

  const [selectedTopics, setSelectedTopics] = useState<TopicId[]>([]);
  const [shuffled, setShuffled] = useState(false);
  const [examSize, setExamSize] = useState<number>(20);
  const [useTimer, setUseTimer] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);

  const wrong = wrongIds(progress);
  const answered = Object.keys(progress.stats).length;

  const toHub = useCallback(() => {
    setView({ kind: 'hub' });
    window.scrollTo({ top: 0 });
  }, []);

  const startPractice = useCallback((label: PracticeLabel, ids: string[], index = 0) => {
    setView({ kind: 'practice', label, ids, index, key: Date.now() });
    window.scrollTo({ top: 0 });
  }, []);

  const startExam = useCallback(() => {
    const ids = shuffle(questions.map((q) => q.id)).slice(0, examSize);
    setView({ kind: 'exam', ids, timeLimit: useTimer ? ids.length * 60 : 0, key: Date.now() });
    window.scrollTo({ top: 0 });
  }, [questions, examSize, useTimer]);

  const finishExam = useCallback((outcome: ExamOutcome) => {
    const { graded, correct, total } = gradedScore(outcome, bank);
    for (const g of graded) {
      if (g.q.type !== 'essay' && g.result.status !== 'unanswered') recordAnswer(g.q.id, g.result.status === 'correct');
    }
    recordExam({ at: Date.now(), score: correct, total, seconds: outcome.seconds });
    setView({ kind: 'results', outcome });
    window.scrollTo({ top: 0 });
  }, [bank]);

  const retry = useCallback(
    (ids: string[]) => startPractice({ kind: 'retry' }, byNumber(bank, ids)),
    [startPractice, bank],
  );

  if (view.kind === 'practice') {
    return (
      <PracticeSession
        key={view.key}
        label={view.label}
        ids={view.ids}
        startIndex={view.index}
        onExit={toHub}
        onRetry={retry}
      />
    );
  }
  if (view.kind === 'exam') {
    return (
      <ExamSession key={view.key} ids={view.ids} timeLimit={view.timeLimit} onFinish={finishExam} onExit={toHub} />
    );
  }
  if (view.kind === 'results') {
    return <ExamResults outcome={view.outcome} onRetry={retry} onNewExam={startExam} onExit={toHub} />;
  }

  const practiceIds = questions
    .filter((q) => selectedTopics.length === 0 || selectedTopics.includes(q.topic))
    .map((q) => q.id);
  const practiceLabel: PracticeLabel = { kind: 'topics', topics: selectedTopics };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{m.practice}</h1>
        <p className="max-w-2xl text-muted-foreground">{m.hubIntro}</p>
      </header>

      {progress.practice && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-medium">
                {m.unfinishedPractice(formatPracticeLabel(progress.practice.label, bank, m))}
              </div>
              <div className="text-sm text-muted-foreground">
                {m.questionOf(progress.practice.index + 1, progress.practice.ids.length)}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  startPractice(progress.practice!.label, progress.practice!.ids, progress.practice!.index)
                }
              >
                <Play />
                {m.resume}
              </Button>
              <Button variant="ghost" onClick={() => savePractice(undefined)}>
                {m.discard}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="size-5 text-primary" />
              {m.practiceMode}
            </CardTitle>
            <CardDescription>{m.practiceModeDesc}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            <div className="flex flex-wrap gap-1.5">
              <Chip active={selectedTopics.length === 0} onClick={() => setSelectedTopics([])}>
                {m.all}
              </Chip>
              {topics.map((t) => (
                <Chip
                  key={t.id}
                  active={selectedTopics.includes(t.id)}
                  onClick={() =>
                    setSelectedTopics((s) => (s.includes(t.id) ? s.filter((x) => x !== t.id) : [...s, t.id]))
                  }
                >
                  {t.title}
                </Chip>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Switch id="shuffle" checked={shuffled} onCheckedChange={setShuffled} />
              <Label htmlFor="shuffle">{m.shuffleOrder}</Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={() => startPractice(practiceLabel, shuffled ? shuffle(practiceIds) : byNumber(bank, practiceIds))}
            >
              <Play />
              {m.startPracticeN(practiceIds.length)}
            </Button>
          </CardFooter>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="size-5 text-primary" />
              {m.examMode}
            </CardTitle>
            <CardDescription>{m.examModeDesc}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-4">
            <div className="flex flex-wrap gap-1.5">
              {[10, 20, questions.length].map((n) => (
                <Chip key={n} active={examSize === n} onClick={() => setExamSize(n)}>
                  {n === questions.length ? m.allN(n) : n}
                </Chip>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Switch id="timer" checked={useTimer} onCheckedChange={setUseTimer} />
              <Label htmlFor="timer" className="flex items-center gap-1.5">
                <Timer className="size-4" />
                {m.timerMinutes(examSize)}
              </Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={startExam}>
              <Shuffle />
              {m.startExam}
            </Button>
          </CardFooter>
        </Card>
      </section>

      {wrong.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3">
          <span className="flex items-center gap-2 text-sm">
            <RotateCcw className="size-4 text-red-600 dark:text-red-400" />
            {m.needsReview(wrong.length)}
          </span>
          <Button size="sm" variant="outline" onClick={() => retry(wrong)}>
            {m.retryWrongN(wrong.length)}
          </Button>
        </div>
      )}

      {(progress.exams.length > 0 || answered > 0) && (
        <section className="flex flex-col gap-2">
          {progress.exams.length > 0 && (
            <>
              <h2 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <History className="size-4" />
                {m.examHistory}
              </h2>
              <ul className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card px-4 text-sm">
                {progress.exams.slice(0, 5).map((e) => {
                  const pct = Math.round((e.score / e.total) * 100);
                  return (
                    <li key={e.at} className="flex items-center justify-between gap-2 py-2">
                      <span className="text-muted-foreground">
                        {new Date(e.at).toLocaleString(m.dateLocale, { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                      <span className="text-muted-foreground">{m.formatDuration(e.seconds)}</span>
                      <span className="font-medium tabular-nums">
                        {e.score}/{e.total} ({pct}%)
                      </span>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          <div className="flex justify-end gap-2">
            {confirmReset ? (
              <>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    resetProgress();
                    setConfirmReset(false);
                  }}
                >
                  {m.confirmDelete}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmReset(false)}>
                  {m.cancel}
                </Button>
              </>
            ) : (
              <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setConfirmReset(true)}>
                <Trash2 />
                {m.resetProgress}
              </Button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
