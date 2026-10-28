'use client';

import { useSyncExternalStore } from 'react';
import type { TopicId } from './questions';

const KEY = 'jwt-harjutus:v1';
const EVENT = 'jwt-harjutus:progress';

export interface QuestionStat {
  attempts: number;
  correct: number;
  /** Viimase vastuse tulemus */
  last: boolean;
  at: number;
}

export interface ExamRecord {
  at: number;
  score: number;
  total: number;
  seconds: number;
}

/** Harjutuse nimi keelest sõltumatul kujul; vanemates salvestustes on see valmis tekst. */
export type PracticeLabel =
  | { kind: 'topics'; topics: TopicId[] }
  | { kind: 'retry' }
  | { kind: 'question'; number: number }
  | string;

export interface PracticeSessionState {
  kind: 'practice';
  /** Juhuslik tunnus, mis on ka URL-is: /harjutustest/<id>/<küsimus> */
  id: string;
  at: number;
  label: PracticeLabel;
  ids: string[];
  /** Pooleli küsimus; `ids.length` = harjutus lõpetatud */
  index: number;
  /** Selle harjutuse tulemused küsimuste kaupa */
  results: Record<string, boolean>;
}

export interface ExamOutcome {
  ids: string[];
  responses: Record<string, unknown>;
  seconds: number;
  timedOut: boolean;
}

export interface ExamSessionState {
  kind: 'exam';
  id: string;
  at: number;
  ids: string[];
  /** sekundites, 0 = taimer puudub */
  timeLimit: number;
  /** Pooleli eksami vastused ja kulunud aeg, et lehe uuesti laadimisel jätkata */
  responses: Record<string, unknown>;
  seconds: number;
  /** 0-põhine pooleli leht */
  page: number;
  /** Olemas, kui eksam on lõpetatud */
  outcome?: ExamOutcome;
}

export type QuizSession = PracticeSessionState | ExamSessionState;

export interface ProgressState {
  stats: Record<string, QuestionStat>;
  exams: ExamRecord[];
  sessions: Record<string, QuizSession>;
}

/** Vanemas salvestuses oli üks tunnuseta pooleli harjutus. */
interface LegacyPractice {
  label: PracticeLabel;
  ids: string[];
  index: number;
}

const MAX_SESSIONS = 20;
const ID_ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789';

/** 12-märgiline juhuslik tunnus (ilma segadust tekitavate l, o, 0, 1-ta). */
export function newSessionId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, (b) => ID_ALPHABET[b % ID_ALPHABET.length]).join('');
}

const empty: ProgressState = { stats: {}, exams: [], sessions: {} };

let cachedRaw: string | null | undefined;
let cachedState: ProgressState = empty;

function read(): ProgressState {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return empty;
  }
  if (raw === cachedRaw) return cachedState;
  cachedRaw = raw;
  try {
    const parsed = raw ? (JSON.parse(raw) as Partial<ProgressState> & { practice?: LegacyPractice }) : {};
    const sessions = { ...parsed.sessions };
    if (parsed.practice) {
      sessions.vana = { kind: 'practice', id: 'vana', at: 0, results: {}, ...parsed.practice };
    }
    cachedState = { stats: parsed.stats ?? {}, exams: parsed.exams ?? [], sessions };
  } catch {
    cachedState = empty;
  }
  return cachedState;
}

function write(next: ProgressState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // privaatne aken või täis salvestusruum – progressi lihtsalt ei salvestata
  }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener('storage', cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener('storage', cb);
    window.removeEventListener(EVENT, cb);
  };
}

export function useProgress(): ProgressState {
  return useSyncExternalStore(subscribe, read, () => empty);
}

/** true kui komponent jookseb brauseris (localStorage on loetav). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function recordAnswer(id: string, correct: boolean) {
  const state = read();
  const prev = state.stats[id] ?? { attempts: 0, correct: 0, last: false, at: 0 };
  write({
    ...state,
    stats: {
      ...state.stats,
      [id]: {
        attempts: prev.attempts + 1,
        correct: prev.correct + (correct ? 1 : 0),
        last: correct,
        at: Date.now(),
      },
    },
  });
}

export function recordExam(record: ExamRecord) {
  const state = read();
  write({ ...state, exams: [record, ...state.exams].slice(0, 20) });
}

/** Salvestab sessiooni; alles jäävad ainult viimased MAX_SESSIONS. */
export function saveSession(session: QuizSession) {
  const state = read();
  const sessions = Object.values({ ...state.sessions, [session.id]: { ...session, at: Date.now() } })
    .sort((a, b) => b.at - a.at)
    .slice(0, MAX_SESSIONS);
  write({ ...state, sessions: Object.fromEntries(sessions.map((s) => [s.id, s])) });
}

export function updateSession<T extends QuizSession>(id: string, patch: (s: T) => T) {
  const session = read().sessions[id] as T | undefined;
  if (session) saveSession(patch(session));
}

export function deleteSession(id: string) {
  const state = read();
  const { [id]: _removed, ...sessions } = state.sessions;
  write({ ...state, sessions });
}

/** Viimane pooleli harjutus või eksam avalehe „Jätka” kaardi jaoks. */
export function unfinishedSession(state: ProgressState): QuizSession | undefined {
  return Object.values(state.sessions)
    .filter((s) => (s.kind === 'practice' ? s.ids.length > 1 && s.index < s.ids.length : !s.outcome))
    .sort((a, b) => b.at - a.at)[0];
}

export function resetProgress() {
  write(empty);
}

export function wrongIds(state: ProgressState): string[] {
  return Object.entries(state.stats)
    .filter(([, s]) => !s.last)
    .map(([id]) => id);
}
