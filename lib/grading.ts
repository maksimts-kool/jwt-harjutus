import type { Question } from './questions';

export type ResultStatus = 'correct' | 'partial' | 'wrong' | 'unanswered' | 'self';

export interface GradeResult {
  status: ResultStatus;
  /** Seostamisülesande ridade kaupa tulemus */
  rows?: boolean[];
}

export type MatchingResponse = Record<string, { v?: string } | undefined>;

function normalize(s: string): string {
  return s.trim().replace(/\s+/g, ' ').toLowerCase();
}

export function isEmptyResponse(value: unknown): boolean {
  if (value === undefined || value === null || value === '') return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') {
    return Object.values(value as MatchingResponse).every((row) => !row?.v);
  }
  return false;
}

/** Hindab SurveyJS-i vastuse küsimustepanga järgi. Vabavastus hinnatakse ise ('self'). */
export function grade(q: Question, value: unknown): GradeResult {
  if (q.type === 'essay') {
    return { status: isEmptyResponse(value) ? 'unanswered' : 'self' };
  }
  if (isEmptyResponse(value)) {
    if (q.type === 'matching') return { status: 'unanswered', rows: q.pairs.map(() => false) };
    return { status: 'unanswered' };
  }

  switch (q.type) {
    case 'single':
      return { status: Number(value) === q.answer ? 'correct' : 'wrong' };
    case 'truefalse':
      return { status: String(value) === String(q.answer) ? 'correct' : 'wrong' };
    case 'multiple': {
      const chosen = [...(value as number[])].map(Number).sort();
      const expected = [...q.answer].sort();
      const same = chosen.length === expected.length && chosen.every((v, i) => v === expected[i]);
      if (same) return { status: 'correct' };
      const hits = chosen.filter((v) => expected.includes(v)).length;
      return { status: hits > 0 && hits === chosen.length ? 'partial' : 'wrong' };
    }
    case 'text': {
      const given = normalize(String(value));
      const ok = [q.answer, ...q.accept].some((a) => normalize(a) === given);
      return { status: ok ? 'correct' : 'wrong' };
    }
    case 'matching': {
      const resp = value as MatchingResponse;
      const rows = q.pairs.map((p, i) => resp[String(i)]?.v === p.right);
      const hits = rows.filter(Boolean).length;
      const status = hits === rows.length ? 'correct' : hits > 0 ? 'partial' : 'wrong';
      return { status, rows };
    }
  }
}

export function isCorrect(result: GradeResult): boolean {
  return result.status === 'correct';
}
