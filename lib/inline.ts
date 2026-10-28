const escapeMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => escapeMap[c]);
}

/**
 * Teisendab küsimuste lihtsa markdowni (`kood`, **paks**, *kaldkiri*, reavahetused) HTML-iks.
 * Sisend tuleb ainult meie enda küsimustepangast ja escapitakse enne vormindamist.
 */
export function inlineToHtml(text: string): string {
  const parts = text.split(/(`[^`]+`)/g);
  return parts
    .map((part) => {
      if (part.startsWith('`') && part.endsWith('`') && part.length > 1) {
        return `<code class="inline-code">${escapeHtml(part.slice(1, -1))}</code>`;
      }
      return escapeHtml(part)
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        .replace(/\n\n/g, '<br /><br />')
        .replace(/\n/g, '<br />');
    })
    .join('');
}
