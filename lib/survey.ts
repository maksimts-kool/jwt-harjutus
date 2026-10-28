import { inlineToHtml } from './inline';
import type { Messages } from './messages';
import {
  FALSE_LABEL,
  matchingChoices,
  matchingLeft,
  type Question,
  splitToken,
  TOKEN_SECRET,
  TRUE_LABEL,
} from './questions';

type SurveyElement = Record<string, unknown>;

export function tokenHtml(m: Messages): string {
  const { header, payload, signature } = splitToken();
  return `<div class="token-box">
  <div class="token-box__label">${m.useThisToken} (HS256, ${m.secretKey} <code class="inline-code">${TOKEN_SECRET}</code>):</div>
  <code class="token-box__value"><span class="tok-h">${header}</span>.<span class="tok-p">${payload}</span>.<span class="tok-s">${signature}</span></code>
</div>`;
}

/** Ehitab küsimusest SurveyJS-i elemendid (vajadusel koos tokeni plokiga). */
export function toSurveyElements(q: Question, m: Messages, opts: { shuffle?: boolean } = {}): SurveyElement[] {
  const order = opts.shuffle ? 'random' : 'none';
  const elements: SurveyElement[] = [];
  if (q.useToken) {
    elements.push({ type: 'html', name: `${q.id}__token`, html: tokenHtml(m) });
  }

  const base = { name: q.id, title: q.prompt, titleLocation: 'top' };

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
