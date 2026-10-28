import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { BookOpenCheck, ListChecks } from 'lucide-react';
import Image from 'next/image';
import { DeadlineCountdown } from '@/components/deadline-countdown';
import { type Lang, withLang } from './i18n';
import { getMessages } from './messages';
import { basePath, docsRoute } from './shared';

export function baseOptions(lang: Lang): BaseLayoutProps {
  const m = getMessages(lang);
  return {
    nav: {
      url: withLang(lang),
      title: (
        <span className="flex items-center gap-2 font-semibold">
          <Image src={`${basePath}/logo.png`} alt="" width={28} height={28} className="size-7" priority />
          {m.appName}
        </span>
      ),
      children: <DeadlineCountdown />,
    },
    links: [
      {
        text: m.practice,
        url: withLang(lang, '/harjutustest'),
        icon: <ListChecks />,
        active: 'nested-url',
      },
      {
        text: m.answers,
        url: withLang(lang, docsRoute),
        icon: <BookOpenCheck />,
        active: 'nested-url',
      },
    ],
  };
}
