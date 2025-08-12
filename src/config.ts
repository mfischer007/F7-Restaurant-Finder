import 'dotenv/config';

const list = (v?: string) => (v ? v.split(',').map(s=>s.trim()).filter(Boolean) : []);

export const cfg = {
  port: Number(process.env.PORT || 8080),
  env: process.env.NODE_ENV || 'development',
  dbUrl: process.env.DATABASE_URL!,
  googleKey: process.env.GOOGLE_MAPS_API_KEY!,
  yelpKey: process.env.YELP_API_KEY || '',
  foursquareKey: process.env.FOURSQUARE_API_KEY || '',
  apiKeys: list(process.env.APP_API_KEYS),
  publicKey: process.env.APP_PUBLIC_API_KEY || '',
  rlWindowMin: Number(process.env.RATE_LIMIT_WINDOW_MIN || 1),
  rlMax: Number(process.env.RATE_LIMIT_MAX || 60)
};
