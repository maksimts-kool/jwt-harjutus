import { inlineToHtml } from './inline';
import type { Messages } from './messages';
import {
  FALSE_LABEL,
  matchingChoices,
  matchingLeft,
  plainText,
  type Question,
  TRUE_LABEL,
} from './questions';

type SurveyElement = Record<string, unknown>;

/** Ehitab küsimusest SurveyJS-i elemendid. Pealkiri ja token on eraldi kaardil (`QuestionHeader`), siin ainult vastuseväli. */
export function toSurveyElements(q: Question, m: Messages, opts: { shuffle?: boolean } = {}): SurveyElement[] {
  const order = opts.shuffle ? 'random' : 'none';
  const elements: SurveyElement[] = [];
  // peidetud pealkiri jääb ekraanilugeja sildiks, seega ilma märgistuseta
  const base = { name: q.id, title: plainText(q.prompt), titleLocation: 'hidden' };

  switch (q.type) {
    case 'single':
      elements.push({
        ...base,
        type: 'radiogroup',
        choicesOrder: order,
        choices: q.options.map((text, i) => ({ value: i, text })),
      });
      break;
    case 'multiple':
      elements.push({
        ...base,
        type: 'checkbox',
        choicesOrder: order,
        choices: q.options.map((text, i) => ({ value: i, text })),
      });
      break;
    case 'truefalse':
      elements.push({
        ...base,
        type: 'radiogroup',
        choices: [
          { value: 'true', text: TRUE_LABEL },
          { value: 'false', text: FALSE_LABEL },
        ],
      });
      break;
    case 'text':
      elements.push({ ...base, type: 'text', placeholder: m.textPlaceholder });
      break;
    case 'matching':
      elements.push({
        ...base,
        type: 'matrixdropdown',
        columns: [
          {
            name: 'v',
            title: m.matchColumn,
            cellType: 'dropdown',
            choicesOrder: order,
            placeholder: m.choosePlaceholder,
            choices: matchingChoices(q),
          },
        ],
        rows: q.pairs.map((_, i) => ({ value: String(i), text: matchingLeft(q, i) })),
      });
      break;
    case 'essay':
      elements.push({ ...base, type: 'comment', rows: 6, placeholder: m.essayPlaceholder });
      break;
  }
  return elements;
}

export const surveyDefaults = {
  showQuestionNumbers: 'off',
  questionErrorLocation: 'bottom',
  widthMode: 'responsive',
  showCompletePage: false,
  // väärtus jõuab mudelisse kohe trükkimisel, mitte alles välja fookusest lahkumisel
  textUpdateMode: 'onTyping',
};

/** SurveyJS-i markdowni sündmus: muudab pealkirjades `kood` ja **paks** HTML-iks. */
export function markdownHandler(_: unknown, options: { text: string; html?: string }) {
  options.html = inlineToHtml(options.text);
}
