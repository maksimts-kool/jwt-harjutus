import bank from '@/data/questions.json';
import en from '@/data/i18n/en.json';
import ru from '@/data/i18n/ru.json';
import type { Lang } from './i18n';

export type TopicId = 'pohitoed' | 'token' | 'allkiri' | 'pyjwt' | 'api' | 'turvalisus';

export interface Topic {
  id: TopicId;
  title: string;
  description: string;
}

interface BaseQuestion {
  id: string;
  /** Küsimuse number Moodle'i testis */
  number: number;
  topic: TopicId;
  prompt: string;
  /** Küsimus viitab ühisele näidistokenile */
  useToken?: boolean;
}

export interface SingleQuestion extends BaseQuestion {
  type: 'single';
  options: string[];
  answer: number;
}

export interface MultipleQuestion extends BaseQuestion {
  type: 'multiple';
  options: string[];
  answer: number[];
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'truefalse';
  answer: boolean;
}

export interface TextQuestion extends BaseQuestion {
  type: 'text';
  answer: string;
  accept: string[];
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  pairs: { left: string; right: string }[];
  /** Valikud rippmenüüs; vaikimisi kõik `right` väärtused */
  choices?: string[];
  leftIsCode?: boolean;
  optionsNote?: string;
}

export interface EssayQuestion extends BaseQuestion {
  type: 'essay';
  modelAnswer: string;
}

export type Question =
  | SingleQuestion
  | MultipleQuestion
  | TrueFalseQuestion
  | TextQuestion
  | MatchingQuestion
  | EssayQuestion;

export type QuestionType = Question['type'];

export const SAMPLE_TOKEN: string = bank.token;
export const TOKEN_SECRET: string = bank.tokenSecret;

/** Tõlgitakse ainult teemade nimed; küsimused ja vastused on alati eesti keeles nagu Moodle'i testis. */
interface Overlay {
  topics: Partial<Record<TopicId, Partial<Omit<Topic, 'id'>>>>;
}

const overlays: Partial<Record<Lang, Overlay>> = { en, ru };

export interface Bank {
  topics: Topic[];
  questions: Question[];
  getQuestion(id: string): Question | undefined;
  getTopic(id: TopicId): Topic;
  questionsByTopic(topic: TopicId): Question[];
}

function createBank(lang: Lang): Bank {
  const overlay = overlays[lang];
  const topics = (bank.topics as Topic[]).map((t) => ({ ...t, ...overlay?.topics[t.id] }));
  const questions = bank.questions as Question[];
  const byId = new Map(questions.map((q) => [q.id, q]));
  return {
    topics,
    questions,
    getQuestion: (id) => byId.get(id),
    getTopic: (id) => topics.find((t) => t.id === id)!,
    questionsByTopic: (topic) => questions.filter((q) => q.topic === topic),
  };
}

const banks = new Map<Lang, Bank>();

export function getBank(lang: Lang): Bank {
  let b = banks.get(lang);
  if (!b) {
    b = createBank(lang);
    banks.set(lang, b);
  }
  return b;
}

export function matchingChoices(q: MatchingQuestion): string[] {
  return q.choices ?? [...new Set(q.pairs.map((p) => p.right))];
}

export function matchingLeft(q: MatchingQuestion, i: number): string {
  const left = q.pairs[i].left;
  return q.leftIsCode ? `\`${left}\`` : left;
}

export function optionLetter(i: number): string {
  return String.fromCharCode(97 + i);
}

/** Õige vastus lühikese tekstina (otsingu ja kokkuvõtte jaoks). */
/** Tõene/väär vastusevariandid (alati eesti keeles). */
export const TRUE_LABEL = 'Tõene';
export const FALSE_LABEL = 'Väär';

export function correctAnswerText(q: Question): string {
  switch (q.type) {
    case 'single':
      return `${optionLetter(q.answer)}) ${q.options[q.answer]}`;
    case 'multiple':
      return q.answer.map((i) => `${optionLetter(i)}) ${q.options[i]}`).join('; ');
    case 'truefalse':
      return q.answer ? TRUE_LABEL : FALSE_LABEL;
    case 'text':
      return q.answer;
    case 'matching':
      return q.pairs.map((p, i) => `${matchingLeft(q, i)} → ${p.right}`).join('; ');
    case 'essay':
      return q.modelAnswer;
  }
}

/** Eemaldab lihtsa markdowni, et teksti saaks otsingus kasutada. */
export function plainText(s: string): string {
  return s.replace(/[`*]/g, '').replace(/\s+/g, ' ').trim();
}

export function splitToken(token: string = SAMPLE_TOKEN) {
  const [header, payload, signature] = token.split('.');
  return { header, payload, signature };
}
