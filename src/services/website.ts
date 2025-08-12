import { fetch } from 'undici';
import * as cheerio from 'cheerio';
import { isLikelyMenuHref, normalizeUrl } from '../utils/normalize.js';

export async function discoverMenuAndSocials(siteUrl: string) {
  const out: { menuUrl?: string; socials: string[] } = { socials: [] };
  const url = normalizeUrl(siteUrl);
  if (!url) return out;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) return out;
  const html = await res.text();
  const $ = cheerio.load(html);

  const anchors = $('a[href]');
  let menuCandidates: string[] = [];
  anchors.each((_, el) => {
    const href = $(el).attr('href') || '';
    const text = ($(el).text() || '').toLowerCase();
    if (isLikelyMenuHref(href) || /menu|order|food/.test(text)) {
      const abs = new URL(href, url).href;
      menuCandidates.push(abs);
    }
    const abs = new URL(href, url).href;
    if (/facebook|instagram|tiktok|twitter|x\.com|linkedin/.test(abs)) {
      out.socials.push(abs);
    }
  });

  for (const m of menuCandidates) {
    try {
      const head = await fetch(m, { method: 'HEAD' });
      if (head.ok) { out.menuUrl = m; break; }
    } catch {}
  }

  out.socials = Array.from(new Set(out.socials));
  return out;
}
