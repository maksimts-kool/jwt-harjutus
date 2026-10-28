'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { SAMPLE_TOKEN, splitToken, TOKEN_SECRET } from '@/lib/questions';
import { useMessages } from '@/lib/use-messages';
import { cn } from '@/lib/utils';

export function TokenBox({ className }: { className?: string }) {
  const m = useMessages();
  const [copied, setCopied] = useState(false);
  const { header, payload, signature } = splitToken();

  async function copy() {
    try {
      await navigator.clipboard.writeText(SAMPLE_TOKEN);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // lõikelaud pole saadaval
    }
  }

  return (
    <div className={cn('not-prose flex flex-col gap-2', className)}>
      <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>
          Token (HS256, {m.secretKey} <code className="inline-code">{TOKEN_SECRET}</code>)
        </span>
        <Button variant="ghost" size="sm" onClick={copy} aria-label={m.copyToken}>
          {copied ? <Check /> : <Copy />}
          {copied ? m.copied : m.copy}
        </Button>
      </div>
      <code className="token-box__value">
        <span className="tok-h">{header}</span>.<span className="tok-p">{payload}</span>.
        <span className="tok-s">{signature}</span>
      </code>
    </div>
  );
}
