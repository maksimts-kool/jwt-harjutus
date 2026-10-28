import { inlineToHtml } from '@/lib/inline';
import type { ElementType } from 'react';

export function InlineText({
  text,
  as: Tag = 'span',
  className,
}: {
  text: string;
  as?: ElementType;
  className?: string;
}) {
  return <Tag className={className} dangerouslySetInnerHTML={{ __html: inlineToHtml(text) }} />;
}
