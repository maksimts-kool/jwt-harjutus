import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { SiteFooter } from '@/components/site-footer';
import { toLang } from '@/lib/i18n';
import { baseOptions } from '@/lib/layout.shared';

export default async function Layout({ params, children }: LayoutProps<'/[lang]'>) {
  const lang = toLang((await params).lang);
  return (
    <HomeLayout {...baseOptions(lang)}>
      {children}
      <SiteFooter lang={lang} className="mx-auto mt-auto w-full max-w-5xl border-t border-border px-4 py-6 text-center" />
    </HomeLayout>
  );
}
