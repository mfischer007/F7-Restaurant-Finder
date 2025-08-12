import { Router } from 'express';
import { prisma } from './db/client.js';
import { geocodeZip } from './services/geocode.js';
import { googleNearby, googleDetails } from './services/google.js';
import { normalizePhone, normalizeUrl } from './utils/normalize.js';
import { haversineMiles } from './utils/geo.js';
import { refreshRestaurant } from './services/refresh.js';
import { requireApiKey } from './middleware/auth.js';

const r = Router();

r.get('/health', (_req, res) => res.json({ ok: true }));

r.get('/search', requireApiKey({ allowPublic: true }), async (req, res, next) => {
  try {
    const zip = String(req.query.zip || '').trim();
    const radiusMiles = Number(req.query.radius_miles || 15);
    if (!zip) return res.status(400).json({ error: 'zip required' });

    let z = await prisma.zipSearch.findFirst({ where: { zip } });
    if (!z) {
      const ll = await geocodeZip(zip);
      z = await prisma.zipSearch.create({ data: { zip, latitude: ll.lat, longitude: ll.lng } });
    }

    const all = await prisma.restaurant.findMany();
    const within = all.filter(i => haversineMiles({ lat: z!.latitude, lng: z!.longitude }, { lat: i.latitude, lng: i.longitude }) <= radiusMiles);

    if (within.length < 75) {
      const g = await googleNearby(z.latitude, z.longitude, Math.round(radiusMiles*1609.344));
      const items = g.results || [];
      for (const it of items) {
        const det = await googleDetails(it.place_id);
        const d = det.result;
        if (!d) continue;
        const phone = normalizePhone(d.formatted_phone_number);
        const website = normalizeUrl(d.website);
        const addr = d.formatted_address || '';
        const [street, city, stZip] = addr.split(',').map(s=>s.trim());
        const [state, zipMaybe] = (stZip||'').split(' ').map(s=>s.trim());

        const up = await prisma.restaurant.upsert({
          where: { providerId: d.place_id || '' },
          update: {
            name: d.name,
            latitude: d.geometry.location.lat,
            longitude: d.geometry.location.lng,
            formattedAddress: addr,
            street, city, state, zip: zipMaybe,
            phonePrimary: phone ?? undefined,
            website: website ?? undefined,
            ratingAvg: d.rating ?? undefined,
            ratingCount: d.user_ratings_total ?? undefined,
            status: d.business_status?.toLowerCase() ?? undefined
          },
          create: {
            providerPrimary: 'google', providerId: d.place_id, name: d.name,
            latitude: d.geometry.location.lat, longitude: d.geometry.location.lng,
            formattedAddress: addr, street, city, state, zip: zipMaybe,
            phonePrimary: phone ?? undefined, website: website ?? undefined,
            ratingAvg: d.rating ?? undefined, ratingCount: d.user_ratings_total ?? undefined,
            status: d.business_status?.toLowerCase() ?? undefined, cuisineTags: []
          }
        });

        await prisma.source.upsert({
          where: { id: up.id + ':google' },
          update: { lastSyncedAt: new Date(), providerId: d.place_id },
          create: { id: up.id + ':google', restaurantId: up.id, provider: 'google', providerId: d.place_id, lastSyncedAt: new Date() }
        });
      }
    }

    const refreshed = await prisma.restaurant.findMany({ include: { menus: true, hours: true, socials: true } });
    const results = refreshed
      .map(i => ({ ...i, distance_miles: haversineMiles({ lat: z!.latitude, lng: z!.longitude }, { lat: i.latitude, lng: i.longitude }) }))
      .filter(i => i.distance_miles <= radiusMiles)
      .sort((a,b) => (a.distance_miles - b.distance_miles));

    res.json({ zip, radius_miles: radiusMiles, count: results.length, results });
  } catch (e) { next(e); }
});

r.get('/restaurants/:id', requireApiKey({ allowPublic: true }), async (req, res, next) => {
  try {
    const data = await prisma.restaurant.findUnique({ where: { id: req.params.id }, include: { menus: true, hours: true, contacts: true, socials: true, sources: true } });
    if (!data) return res.status(404).json({ error: 'not found' });
    res.json(data);
  } catch (e) { next(e); }
});

r.post('/refresh/:id', requireApiKey({ allowPublic: false }), async (req, res, next) => {
  try { await refreshRestaurant(req.params.id); res.json({ ok: true }); }
  catch (e) { next(e); }
});

export default r;
