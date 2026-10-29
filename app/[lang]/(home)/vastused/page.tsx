import type { Metadata } from 'next';
import { QuestionExplorer } from '@/components/answers/question-explorer';
import { InlineText } from '@/components/inline-text';
import { toLang } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';

export async function generateMetadata(props: PageProps<'/[lang]/vastused'>): Promise<Metadata> {
  const m = getMessages(toLang((await props.params).lang));
  return {
    title: m.allAnswers,
    description: m.answersDescription,
  };
}

export default async function VastusedPage({ params }: PageProps<'/[lang]/vastused'>) {
  const m = getMessages(toLang((await params).lang));
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:py-12">
      <div className="flex max-w-3xl flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{m.allAnswers}</h1>
        <p className="text-muted-foreground">{m.answersDescription}</p>
        <InlineText as="p" text={m.missingNote} className="text-sm text-muted-foreground" />
      </div>
      <QuestionExplorer />
    </main>
  );
}
