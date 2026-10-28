import { defineI18n } from 'fumadocs-core/i18n';

// Staatilises ekspordis pole middleware'i, seega on keele eesliide URL-is alati olemas (/et, /en, /ru).
export const i18n = defineI18n({
  defaultLanguage: 'et',
  languages: ['et', 'en', 'ru'],
  hideLocale: 'never',
});

export type Lang = (typeof i18n.languages)[number];

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (i18n.languages as string[]).includes(value);
}

export function toLang(value: unknown): Lang {
  return isLang(value) ? value : i18n.defaultLanguage;
}

/** Lisab teele keele eesliite: `withLang('ru', '/harjutustest')` → `/ru/harjutustest`. */
export function withLang(lang: Lang, path = ''): string {
  return `/${lang}${path}`;
}
