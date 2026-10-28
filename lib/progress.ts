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
  label: PracticeLabel;
  ids: string[];
  index: number;
}

export interface ProgressState {
  stats: Record<string, QuestionStat>;
  exams: ExamRecord[];
  practice?: PracticeSessionState;
}

const empty: ProgressState = { stats: {}, exams: [] };

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
    const parsed = raw ? (JSON.parse(raw) as Partial<ProgressState>) : {};
    cachedState = { stats: parsed.stats ?? {}, exams: parsed.exams ?? [], practice: parsed.practice };
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

export function savePractice(practice: PracticeSessionState | undefined) {
  write({ ...read(), practice });
}

export function resetProgress() {
  write(empty);
}

export function wrongIds(state: ProgressState): string[] {
  return Object.entries(state.stats)
    .filter(([, s]) => !s.last)
    .map(([id]) => id);
}
