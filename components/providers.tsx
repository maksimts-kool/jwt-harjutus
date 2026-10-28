'use client';

import { RootProvider } from 'fumadocs-ui/provider/next';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { Lang } from '@/lib/i18n';
import { i18nUI } from '@/lib/translations';

// next-themes lisab teema skripti, mis peab käivituma ainult serveri HTML-ist (värelemise vältimiseks).
// Kliendis renderdatakse see `text/plain` tüübiga, muidu hoiatab React skripti eest komponendis.
const themeScriptProps = { type: typeof window === 'undefined' ? 'text/javascript' : 'text/plain' };

export function Providers({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <RootProvider
      i18n={i18nUI.provider(lang)}
      search={{ enabled: false }}
      theme={{ scriptProps: themeScriptProps }}
    >
      <TooltipProvider>{children}</TooltipProvider>
    </RootProvider>
  );
}
