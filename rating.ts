export function combineRatings(parts: {avg?: number|null; count?: number|null}[]) {
  let total = 0, weight = 0;
  for (const p of parts) {
    if (!p.avg || !p.count) continue;
    total += p.avg * p.count;
    weight += p.count;
  }
  if (!weight) return { avg: null, count: null };
  return { avg: Number((total/weight).toFixed(2)), count: weight };
}
