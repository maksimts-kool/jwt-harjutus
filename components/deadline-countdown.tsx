'use client';

import { CalendarClock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useHydrated } from '@/lib/progress';
import { useMessages } from '@/lib/use-messages';

/** Testi tähtaeg: 30. oktoober kell 12:00 (UTC+2). */
export const DEADLINE = new Date('2026-10-30T12:00:00+02:00');

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

const pad = (n: number) => n.toString().padStart(2, '0');

/** Päise keskel olev loendur: „Tähtajani 1 p 15:08:34”. */
export function DeadlineCountdown({ className }: { className?: string }) {
  const hydrated = useHydrated();
  const now = useNow();
  const m = useMessages();
  // Staatilisel ehitusel aega ei tea – näitame loendurit alles brauseris.
  if (!hydrated) return null;

  const left = Math.max(0, Math.floor((DEADLINE.getTime() - now) / 1000));
  const deadline = DEADLINE.toLocaleString(m.dateLocale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Etc/GMT-2',
  });
  const days = Math.floor(left / 86400);
  const time = `${pad(Math.floor((left % 86400) / 3600))}:${pad(Math.floor((left % 3600) / 60))}:${pad(left % 60)}`;

  // Laial ekraanil päise täpselt keskel; kitsal logo ja menüünupu vahelise vaba ruumi keskel.
  return (
    <div
      className={cn(
        'flex justify-center max-lg:flex-1 max-lg:px-2 lg:absolute lg:inset-y-0 lg:left-1/2 lg:-translate-x-1/2 lg:items-center',
        className,
      )}
    >
      <span
        role="timer"
        title={m.countdownLabel(`${deadline} (UTC+2)`)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap shadow-sm animate-in fade-in duration-300',
          left === 0 ? 'bg-destructive text-white' : 'bg-primary text-primary-foreground',
        )}
      >
        <CalendarClock className="size-3.5 shrink-0" />
        {left === 0 ? (
          m.countdownEnded
        ) : (
          <>
            <span className="max-sm:hidden">{m.countdownIn}</span>
            <span className="tabular-nums">
              {days > 0 && `${m.countdownDays(days)} `}
              {time}
            </span>
          </>
        )}
      </span>
    </div>
  );
}
