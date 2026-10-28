import { defineI18nUI, type Translations } from 'fumadocs-ui/i18n';
import { i18n } from './i18n';

const etTranslations: Partial<Translations> = {
  displayName: 'Eesti',
  'Choose a language(language switcher)': 'Vali keel',
  'Choose a language(language switcher)(aria-label)': 'Vali keel',
  'Copied Link(accordion)(aria-label)': 'Link kopeeritud',
  'Copy Link(accordion)(aria-label)': 'Kopeeri link',
  'Dark(theme switcher)(aria-label)': 'Tume',
  'Light(theme switcher)(aria-label)': 'Hele',
  'System(theme switcher)(aria-label)': 'Süsteem',
  'Toggle Menu(home layout header)(aria-label)': 'Ava menüü',
  'Toggle Theme(theme switcher)(aria-label)': 'Vaheta teemat',
};

// Fumadocs on vaikimisi inglise keeles.
const enTranslations: Partial<Translations> = {
  displayName: 'English',
};

const ruTranslations: Partial<Translations> = {
  displayName: 'Русский',
  'Choose a language(language switcher)': 'Выберите язык',
  'Choose a language(language switcher)(aria-label)': 'Выберите язык',
  'Copied Link(accordion)(aria-label)': 'Ссылка скопирована',
  'Copy Link(accordion)(aria-label)': 'Копировать ссылку',
  'Dark(theme switcher)(aria-label)': 'Тёмная',
  'Light(theme switcher)(aria-label)': 'Светлая',
  'System(theme switcher)(aria-label)': 'Системная',
  'Toggle Menu(home layout header)(aria-label)': 'Открыть меню',
  'Toggle Theme(theme switcher)(aria-label)': 'Сменить тему',
};

export const i18nUI = defineI18nUI(i18n, {
  et: etTranslations as Record<string, string>,
  en: enTranslations as Record<string, string>,
  ru: ruTranslations as Record<string, string>,
});
