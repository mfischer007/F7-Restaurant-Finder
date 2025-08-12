import { cfg } from '../config.js';
import { fetch } from 'undici';

const base = 'https://api.yelp.com/v3';

export async function yelpSearch(lat:number, lng:number, radius=16093) {
  if (!cfg.yelpKey) return null;
  const url = new URL(base + '/businesses/search');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lng));
  url.searchParams.set('radius', String(radius));
  url.searchParams.set('categories', 'restaurants');
  const res = await fetch(url, { headers: { Authorization: `Bearer ${cfg.yelpKey}` }});
  if (!res.ok) return null;
  return res.json();
}

export async function yelpBusiness(id: string) {
  if (!cfg.yelpKey) return null;
  const res = await fetch(base + '/businesses/' + id, { headers: { Authorization: `Bearer ${cfg.yelpKey}` }});
  if (!res.ok) return null;
  return res.json();
}
