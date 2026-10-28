import type { Lang } from '@/lib/i18n';
import { getMessages } from '@/lib/messages';
import { author } from '@/lib/shared';
import { cn } from '@/lib/utils';

export function SiteFooter({ lang, className }: { lang: Lang; className?: string }) {
  return (
    <footer className={cn('text-xs text-muted-foreground', className)}>
      © {new Date().getFullYear()} {author}. {getMessages(lang).rights}
    </footer>
  );
}
