import { cfg } from '../config.js';
import { fetch } from 'undici';

export async function geocodeZip(zip: string) {
  const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
  url.searchParams.set('address', zip);
  url.searchParams.set('components', 'country:US');
  url.searchParams.set('key', cfg.googleKey);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Geocode failed');
  const data = await res.json();
  const first = data.results?.[0];
  if (!first) throw new Error('ZIP not found');
  const loc = first.geometry.location;
  return { lat: loc.lat as number, lng: loc.lng as number };
}
