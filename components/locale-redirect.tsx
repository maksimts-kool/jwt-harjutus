'use client';

import { useEffect } from 'react';
import { i18n } from '@/lib/i18n';
import { basePath } from '@/lib/shared';

/** Suunab keeleta aadressi (nt vana link /harjutustest) alati eestikeelsele lehele. */
export function LocaleRedirect() {
  useEffect(() => {
    const { pathname, search, hash } = window.location;
    const rest = pathname.startsWith(basePath) ? pathname.slice(basePath.length) : pathname;
    window.location.replace(`${basePath}/${i18n.defaultLanguage}${rest || '/'}${search}${hash}`);
  }, []);
  return null;
}
