import { prisma } from '../db/client.js';
import { TTL, isStale } from '../utils/ttl.js';
import { googleDetails } from './google.js';
import { discoverMenuAndSocials } from './website.js';
import { normalizePhone, normalizeUrl } from '../utils/normalize.js';

export async function refreshRestaurant(id: string) {
  const r = await prisma.restaurant.findUnique({ where: { id }, include: { menus: true, hours: true } });
  if (!r) return;

  const src = await prisma.source.findFirst({ where: { restaurantId: id, provider: 'google' }});
  if (src?.providerId) {
    const g = await googleDetails(src.providerId);
    const d = g?.result;
    if (d) {
      await prisma.restaurant.update({ where: { id }, data: {
        phonePrimary: normalizePhone(d.formatted_phone_number) || r.phonePrimary,
        website: normalizeUrl(d.website) || r.website,
        ratingAvg: d.rating ?? r.ratingAvg,
        ratingCount: d.user_ratings_total ?? r.ratingCount,
        status: d.business_status?.toLowerCase() || r.status,
        updatedAt: new Date()
      }});

      if (d.opening_hours) {
        await prisma.hours.upsert({
          where: { restaurantId: id },
          update: { hoursJson: d.opening_hours, lastVerifiedAt: new Date() },
          create: { restaurantId: id, hoursJson: d.opening_hours, lastVerifiedAt: new Date() }
        });
      }
    }
  }

  const site = r.website;
  if (site && (isStale(r.menus[0]?.lastVerifiedAt, TTL.menuOfficialDays) || !r.menus.length)) {
    const got = await discoverMenuAndSocials(site);
    if (got.menuUrl) {
      await prisma.menu.upsert({
        where: { id: r.menus[0]?.id || '' },
        update: { menuUrl: got.menuUrl, lastVerifiedAt: new Date() },
        create: { restaurantId: id, menuUrl: got.menuUrl!, menuType: guessMenuType(got.menuUrl!), lastVerifiedAt: new Date() }
      }).catch(async () => {
        await prisma.menu.create({ data: { restaurantId: id, menuUrl: got.menuUrl!, menuType: guessMenuType(got.menuUrl!), lastVerifiedAt: new Date() }});
      });
    }

    if (got.socials?.length) {
      for (const url of got.socials) {
        const network = parseNetwork(url);
        if (!network) continue;
        await prisma.social.upsert({
          where: { restaurantId_network: { restaurantId: id, network } },
          update: { url, lastVerifiedAt: new Date() },
          create: { restaurantId: id, network, url, lastVerifiedAt: new Date() }
        });
      }
    }
  }
}

function guessMenuType(url: string) {
  const u = url.toLowerCase();
  if (u.endsWith('.pdf')) return 'pdf';
  if (/toasttab|clover|squareup|chownow|ubereats|doordash/.test(u)) return 'delivery';
  return 'official';
}

function parseNetwork(url: string) {
  const u = url.toLowerCase();
  if (u.includes('instagram.com')) return 'instagram';
  if (u.includes('facebook.com')) return 'facebook';
  if (u.includes('tiktok.com')) return 'tiktok';
  if (u.includes('x.com') || u.includes('twitter.com')) return 'x';
  if (u.includes('linkedin.com')) return 'linkedin';
  return null;
}
