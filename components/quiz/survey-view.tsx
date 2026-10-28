'use client';

import 'survey-core/survey-core.css';
import 'survey-core/themes/adapters/shadcn-base-nova.css';
import 'survey-core/themes/adapters/icons/lucide';
import 'survey-core/i18n/estonian';
import 'survey-core/i18n/russian';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';
import type { Messages } from '@/lib/messages';
import { markdownHandler, surveyDefaults } from '@/lib/survey';

export function createSurvey(json: Record<string, unknown>, m: Messages): Model {
  const model = new Model({ ...surveyDefaults, locale: m.surveyLocale, ...json });
  model.onTextMarkdown.add(markdownHandler);
  return model;
}

export function SurveyView({ model }: { model: Model }) {
  return (
    <div className="quiz-survey">
      <Survey model={model} />
    </div>
  );
}
