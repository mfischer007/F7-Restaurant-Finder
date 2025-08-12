import dayjs from 'dayjs';

export const TTL = {
  ratingsDays: 7,
  phoneSiteHoursDays: 14,
  menuOfficialDays: 30,
  menuDeliveryDays: 7,
  peopleDays: 90
};

export function isStale(last?: Date | null, days = 30) {
  if (!last) return true;
  return dayjs().diff(dayjs(last), 'day') >= days;
}
