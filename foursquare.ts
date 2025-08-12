import { cfg } from '../config.js';
import { fetch } from 'undici';

const base = 'https://api.foursquare.com/v3/places';

export async function fsqSearch(lat:number, lng:number, radius=16093) {
  if (!cfg.foursquareKey) return null;
  const url = new URL(base + '/search');
  url.searchParams.set('ll', `${lat},${lng}`);
  url.searchParams.set('radius', String(radius));
  url.searchParams.set('categories', '13065'); // Food & Drink > Restaurants
  const res = await fetch(url, { headers: { Authorization: cfg.foursquareKey }});
  if (!res.ok) return null;
  return res.json();
}

export async function fsqDetails(fsq_id: string) {
  if (!cfg.foursquareKey) return null;
  const res = await fetch(base + '/' + fsq_id, { headers: { Authorization: cfg.foursquareKey }});
  if (!res.ok) return null;
  return res.json();
}
