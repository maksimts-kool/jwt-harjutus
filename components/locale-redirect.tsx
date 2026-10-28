'use client';

import { useEffect } from 'react';
import { i18n } from '@/lib/i18n';

/** Suunab keeleta aadressi (nt vana link /harjutustest) alati eestikeelsele lehele. */
export function LocaleRedirect() {
  useEffect(() => {
    const { pathname, search, hash } = window.location;
    window.location.replace(`/${i18n.defaultLanguage}${pathname === '/' ? '' : pathname}${search}${hash}`);
  }, []);
  return null;
}
