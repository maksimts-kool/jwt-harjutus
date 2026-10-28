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
import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ExamResults, gradedScore } from '@/components/quiz/exam-results';
import { type ExamOutcome, ExamSession } from '@/components/quiz/exam-session';
import { formatPracticeLabel, PracticeSession } from '@/components/quiz/practice-session';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { withLang } from '@/lib/i18n';
import {
  deleteSession,
  type ExamSessionState,
  newSessionId,
  type PracticeLabel,
  recordAnswer,
  recordExam,
  resetProgress,
  saveSession,
  type QuizSession,
  unfinishedSession,
  updateSession,
  useProgress,
  wrongIds,
} from '@/lib/progress';
import type { Bank, TopicId } from '@/lib/questions';
import { basePath } from '@/lib/shared';
import { useBank, useLang, useMessages } from '@/lib/use-messages';

/** Kokkuvõtte / eksami tulemuste samm URL-is. */
const RESULTS = 'tulemus';
type Step = number | typeof RESULTS;

/** `/et/harjutustest/<id>/<samm>/` → `{ id, step }`; samm on 1-põhine küsimuse number või „tulemus”. */
function parseQuizPath(pathname: string): { id?: string; step?: Step } {
  const match = /\/harjutustest\/([^/]+)(?:\/([^/]+))?/.exec(pathname);
  if (!match) return {};
  const raw = match[2];
  const n = Number(raw);
  return { id: match[1], step: raw === RESULTS ? RESULTS : Number.isInteger(n) && n >= 1 ? n : undefined };
}

/** Õige samm sessiooni jaoks: vigane või puuduv samm asendatakse pooleli kohaga. */
function resolveStep(session: QuizSession, step: Step | undefined): Step {
  const total = session.ids.length;
  if (session.kind === 'exam') {
    if (session.outcome) return RESULTS;
    return typeof step === 'number' && step <= total ? step : Math.min(session.page, total - 1) + 1;
  }
  if (step === RESULTS || (typeof step === 'number' && step <= total)) return step;
  return session.index >= total ? RESULTS : session.index + 1;
}

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
  const pathname = usePathname();
  const lang = useLang();
  const progress = useProgress();
  const m = useMessages();
  const bank = useBank();
  const { questions, topics, getQuestion } = bank;

  const [selectedTopics, setSelectedTopics] = useState<TopicId[]>([]);
  const [shuffled, setShuffled] = useState(false);
  const [examSize, setExamSize] = useState<number>(20);
  const [useTimer, setUseTimer] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);

  const wrong = wrongIds(progress);
  const answered = Object.keys(progress.stats).length;

  // URL on vaate allikas: /harjutustest/ = avaleht, /harjutustest/<id>/<samm>/ = harjutus või eksam.
  const { id, step } = parseQuizPath(pathname);
  const session = id ? progress.sessions[id] : undefined;
  const resolvedStep = session ? resolveStep(session, step) : undefined;

  /** Muudab aadressi ilma lehte uuesti laadimata (Next.js sünkroniseerib `usePathname`-i). */
  const go = useCallback(
    (target?: { id: string; step: Step }, replace = false) => {
      const url = basePath + withLang(lang, target ? `/harjutustest/${target.id}/${target.step}/` : '/harjutustest/');
      if (url === window.location.pathname) return;
      window.history[replace ? 'replaceState' : 'pushState'](null, '', url);
      window.scrollTo({ top: 0 });
    },
    [lang],
  );

  // Tundmatu sessioon → avaleht; puuduv või vigane samm → pooleli koht.
  useEffect(() => {
    if (!id) return;
    if (!session || resolvedStep === undefined) go(undefined, true);
    else if (resolvedStep !== step) go({ id, step: resolvedStep }, true);
  }, [id, step, session, resolvedStep, go]);

  const toHub = useCallback(() => go(), [go]);

  const startPractice = useCallback(
    (label: PracticeLabel, ids: string[], replace = false) => {
      const id = newSessionId();
      saveSession({ kind: 'practice', id, at: Date.now(), label, ids, index: 0, results: {} });
      go({ id, step: 1 }, replace);
    },
    [go],
  );

  // Otselink vastuste lehelt: ?q=<küsimuse id> → uus ühe küsimuse harjutus.
  const handledQuery = useRef(false);
  useEffect(() => {
    if (handledQuery.current) return;
    handledQuery.current = true;
    const q = params.get('q');
    const question = q ? getQuestion(q) : undefined;
    if (question) startPractice({ kind: 'question', number: question.number }, [question.id], true);
  }, [params, getQuestion, startPractice]);

  const startExam = useCallback(() => {
    const ids = shuffle(questions.map((q) => q.id)).slice(0, examSize);
    const id = newSessionId();
    saveSession({
      kind: 'exam',
      id,
      at: Date.now(),
      ids,
      timeLimit: useTimer ? ids.length * 60 : 0,
      responses: {},
      seconds: 0,
      page: 0,
    });
    go({ id, step: 1 });
  }, [questions, examSize, useTimer, go]);

  const finishExam = useCallback(
    (outcome: ExamOutcome) => {
      if (!id) return;
      const { graded, correct, total } = gradedScore(outcome, bank);
      for (const g of graded) {
        if (g.q.type !== 'essay' && g.result.status !== 'unanswered') recordAnswer(g.q.id, g.result.status === 'correct');
      }
      recordExam({ at: Date.now(), score: correct, total, seconds: outcome.seconds });
      updateSession<ExamSessionState>(id, (s) => ({ ...s, outcome }));
      go({ id, step: RESULTS });
    },
    [bank, id, go],
  );

  const retry = useCallback(
    (ids: string[]) => startPractice({ kind: 'retry' }, byNumber(bank, ids)),
    [startPractice, bank],
  );

  const examPageChange = useCallback((page: number) => id && go({ id, step: page + 1 }), [id, go]);

  if (session && resolvedStep !== undefined) {
    const index = resolvedStep === RESULTS ? session.ids.length : resolvedStep - 1;
    if (session.kind === 'practice') {
      return (
        <PracticeSession
          key={session.id}
          session={session}
          index={index}
          onNavigate={(i) => go({ id: session.id, step: i >= session.ids.length ? RESULTS : i + 1 })}
          onExit={toHub}
          onRetry={retry}
        />
      );
    }
    if (session.outcome) {
      return <ExamResults outcome={session.outcome} onRetry={retry} onNewExam={startExam} onExit={toHub} />;
    }
    return (
      <ExamSession
        key={session.id}
        session={session}
        page={index}
        onPageChange={examPageChange}
        onFinish={finishExam}
        onExit={toHub}
      />
    );
  }
  // Sessiooni aadress, mida enam pole: efekt suunab avalehele.
  if (id) return null;

  const unfinished = unfinishedSession(progress);

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

      {unfinished && (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-medium">
                {unfinished.kind === 'practice'
                  ? m.unfinishedPractice(formatPracticeLabel(unfinished.label, bank, m))
                  : m.unfinishedExam}
              </div>
              <div className="text-sm text-muted-foreground">
                {m.questionOf(
                  (unfinished.kind === 'practice' ? unfinished.index : unfinished.page) + 1,
                  unfinished.ids.length,
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  go({ id: unfinished.id, step: resolveStep(unfinished, undefined) })
                }
              >
                <Play />
                {m.resume}
              </Button>
              <Button variant="ghost" onClick={() => deleteSession(unfinished.id)}>
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
