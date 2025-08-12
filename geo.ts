const MILES_TO_METERS = 1609.344;
export function milesToMeters(miles: number) { return miles * MILES_TO_METERS; }
export function haversineMiles(a: {lat:number;lng:number}, b:{lat:number;lng:number}) {
  const toRad = (x:number)=>x*Math.PI/180;
  const R = 3958.7613; // miles
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat/2);
  const sinDLng = Math.sin(dLng/2);
  const h = sinDLat*sinDLat + Math.cos(lat1)*Math.cos(lat2)*sinDLng*sinDLng;
  return 2*R*Math.asin(Math.min(1, Math.sqrt(h)));
}
