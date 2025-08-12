import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { getDomain } from 'tldts';

export function normalizePhone(raw?: string | null) {
  if (!raw) return undefined;
  const pn = parsePhoneNumberFromString(raw, 'US');
  return pn?.isValid() ? pn.number : undefined; // E.164
}

export function normalizeUrl(raw?: string | null) {
  if (!raw) return undefined;
  try {
    const u = new URL(raw, 'https://example.com');
    if (!u.protocol.startsWith('http')) return undefined;
    return u.href.replace(/\/$/, '');
  } catch {
    try {
      const u = new URL('https://' + raw);
      return u.href.replace(/\/$/, '');
    } catch { return undefined; }
  }
}

export function isLikelyMenuHref(href: string) {
  const h = href.toLowerCase();
  return /(menu|our-menu|food|order|order-online)/.test(h);
}

export function canonicalHost(url: string) {
  try { return getDomain(url) || undefined; } catch { return undefined; }
}
