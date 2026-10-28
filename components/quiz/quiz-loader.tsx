'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-10 w-64 animate-pulse rounded-lg bg-muted" />
      <div className="grid gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}

// SurveyJS ja localStorage töötavad ainult brauseris.
const QuizApp = dynamic(() => import('./quiz-app').then((m) => m.QuizApp), { ssr: false, loading: Loading });

export function QuizLoader() {
  return (
    <Suspense fallback={<Loading />}>
      <QuizApp />
    </Suspense>
  );
}
