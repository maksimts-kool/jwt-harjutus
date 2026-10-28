import type { Metadata } from 'next';
import '../global.css';
import { Geist, Geist_Mono } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Providers } from '@/components/providers';
import { i18n, toLang } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';

const geist = Geist({ subsets: ['latin', 'latin-ext', 'cyrillic'], variable: '--font-sans' });
const geistMono = Geist_Mono({ subsets: ['latin', 'cyrillic'], variable: '--font-mono' });

export function generateStaticParams() {
  return i18n.languages.map((lang) => ({ lang }));
}

export async function generateMetadata(props: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const m = getMessages(toLang((await props.params).lang));
  return {
    title: { default: m.appName, template: `%s | ${m.appName}` },
    description: m.siteDescription,
  };
}

export default async function Layout({ params, children }: LayoutProps<'/[lang]'>) {
  const lang = toLang((await params).lang);
  return (
    <html lang={lang} className={cn('font-sans', geist.variable, geistMono.variable)} suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <Providers lang={lang}>{children}</Providers>
      </body>
    </html>
  );
}
