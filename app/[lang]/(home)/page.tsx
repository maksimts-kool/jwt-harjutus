import { ArrowRight, BookOpenCheck, Code, FileBraces, Lightbulb, ListChecks, Server, ShieldCheck, Signature } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { HomeProgress } from '@/components/home-progress';
import { buttonVariants } from '@/components/ui/button';
import { toLang, withLang } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';
import { getBank, type TopicId } from '@/lib/questions';
import { docsRoute } from '@/lib/shared';

const topicIcons: Record<TopicId, typeof Lightbulb> = {
  pohitoed: Lightbulb,
  token: FileBraces,
  allkiri: Signature,
  pyjwt: Code,
  api: Server,
  turvalisus: ShieldCheck,
};

export default async function HomePage({ params }: PageProps<'/[lang]'>) {
  const lang = toLang((await params).lang);
  const m = getMessages(lang);
  const { questions, topics, questionsByTopic } = getBank(lang);

  return (
    <main className="flex w-full flex-col gap-12 pb-12 sm:gap-16 sm:pb-20">
      {/* Täislaiuses bänner: alumine osa sulandub taustaga, et pealkiri ja nupud oleksid loetavad. */}
      <section className="relative w-full animate-in fade-in duration-500">
        <div className="relative">
          <Image
            src="/banner.webp"
            alt="JWT: header, payload, signature"
            width={1982}
            height={792}
            sizes="100vw"
            priority
            className="h-auto max-h-[34rem] w-full object-cover"
          />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent from-45% to-background" />
        </div>
        <div className="relative mx-auto -mt-[min(9vw,5rem)] flex max-w-5xl flex-col items-center gap-5 px-4 text-center sm:gap-6">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-6xl">
            {m.heroTitle} <span className="text-primary">{m.heroHighlight}</span>
          </h1>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href={withLang(lang, '/harjutustest')}
              className={buttonVariants({ size: 'lg', className: 'h-11 px-5' })}
            >
              <ListChecks />
              {m.startPracticeTest}
            </Link>
            <Link
              href={withLang(lang, docsRoute)}
              className={buttonVariants({ size: 'lg', variant: 'outline', className: 'h-11 px-5' })}
            >
              <BookOpenCheck />
              {m.viewAnswers}
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-4">
        <HomeProgress />

        <section className="flex flex-col gap-4">
          <div>
            <h2 className="text-2xl font-semibold">{m.topicsHeading}</h2>
            <p className="text-muted-foreground">{m.topicsText}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((t) => {
              const Icon = topicIcons[t.id];
              const qs = questionsByTopic(t.id);
              return (
                <Link
                  key={t.id}
                  href={withLang(lang, `${docsRoute}#${t.id}`)}
                  className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </span>
                    <span className="text-xs text-muted-foreground">{m.nQuestions(qs.length)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{t.title}</h3>
                    <p className="text-sm text-muted-foreground">{t.description}</p>
                  </div>
                  <span className="mt-auto flex items-center gap-1 text-sm font-medium text-primary">
                    {m.viewAnswers}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
