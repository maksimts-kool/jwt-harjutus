'use client';

import { useI18n } from 'fumadocs-ui/contexts/i18n';
import { type Lang, toLang } from './i18n';
import { getMessages, type Messages } from './messages';
import { type Bank, getBank } from './questions';

/** Aktiivne keel kliendikomponentides (Fumadocsi i18n kontekstist). */
export function useLang(): Lang {
  return toLang(useI18n().locale);
}

export function useMessages(): Messages {
  return getMessages(useLang());
}

export function useBank(): Bank {
  return getBank(useLang());
}
