import type { Metadata } from 'next';
import { QuizLoader } from '@/components/quiz/quiz-loader';
import { toLang } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';

export async function generateMetadata(props: PageProps<'/[lang]/harjutustest'>): Promise<Metadata> {
  const m = getMessages(toLang((await props.params).lang));
  return {
    title: m.practice,
    description: m.practiceDescription,
  };
}

export default function HarjutustestPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
      <QuizLoader />
    </main>
  );
}
