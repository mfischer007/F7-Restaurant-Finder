import { cfg } from './config.js';
import { createServer } from './server.js';
import cron from 'node-cron';
import { prisma } from './db/client.js';
import { isStale, TTL } from './utils/ttl.js';
import { refreshRestaurant } from './services/refresh.js';

const app = createServer();
app.listen(cfg.port, () => console.log(`API listening on :${cfg.port}`));

// Nightly refresh: ratings weekly cadence
cron.schedule('0 3 * * *', async () => {
  const all = await prisma.restaurant.findMany();
  for (const r of all) {
    if (isStale(r.updatedAt, TTL.ratingsDays)) {
      await refreshRestaurant(r.id).catch(()=>{});
    }
  }
});

// Menu + socials monthly
cron.schedule('0 4 * * 0', async () => {
  const all = await prisma.restaurant.findMany({ include: { menus: true } });
  for (const r of all) {
    const last = (r.menus[0]?.lastVerifiedAt as Date | undefined) || r.updatedAt;
    if (isStale(last, TTL.menuOfficialDays)) {
      await refreshRestaurant(r.id).catch(()=>{});
    }
  }
});
