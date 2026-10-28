import type { Metadata } from 'next';
import { QuizLoader } from '@/components/quiz/quiz-loader';
import { toLang } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';

// Staatilises ekspordis luuakse ainult /harjutustest/ leht. Sessiooni aadressid (/harjutustest/<id>/<samm>/)
// loeb kliendikomponent URL-ist; serveris suunab need samale lehele public/.htaccess.
export function generateStaticParams() {
  return [{ session: [] }];
}

export async function generateMetadata(props: PageProps<'/[lang]/harjutustest/[[...session]]'>): Promise<Metadata> {
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
