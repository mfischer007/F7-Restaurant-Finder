import { cfg } from '../config.js';
import { fetch } from 'undici';

export async function googleNearby(lat:number, lng:number, radiusMeters=16093) { // ~10 miles
  const url = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json');
  url.searchParams.set('location', `${lat},${lng}`);
  url.searchParams.set('radius', String(radiusMeters));
  url.searchParams.set('type', 'restaurant');
  url.searchParams.set('key', cfg.googleKey);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Google Nearby failed');
  return res.json();
}

export async function googleDetails(placeId: string) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('fields', [
    'name','formatted_address','geometry/location','website','formatted_phone_number','rating','user_ratings_total','opening_hours','business_status'
  ].join(','));
  url.searchParams.set('key', cfg.googleKey);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Google Details failed');
  return res.json();
}
