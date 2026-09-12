import { GeoPoint, Hotel, TouristSpot } from '../types';

/**
 * Calculates straight-line distance in kilometers using the Haversine formula
 * (Equivalent to PostGIS ST_DistanceSphere / ST_DWithin)
 */
export function calculateHaversineDistance(pt1: GeoPoint, pt2: GeoPoint): number {
  const R = 6371; // Earth radius in kilometers
  const dLat = ((pt2.lat - pt1.lat) * Math.PI) / 180;
  const dLng = ((pt2.lng - pt1.lng) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((pt1.lat * Math.PI) / 180) *
      Math.cos((pt2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 100) / 100; // 2 decimal places
}

/**
 * Estimates commute time in minutes based on distance and typical urban traffic
 */
export function estimateCommuteTime(distanceKm: number): {
  minutes: number;
  mode: 'walk' | 'auto' | 'cab';
  label: string;
} {
  if (distanceKm <= 1.0) {
    // Walkable distance (assume ~4.5 km/h walking speed)
    const walkMins = Math.max(3, Math.round((distanceKm / 4.5) * 60));
    return {
      minutes: walkMins,
      mode: 'walk',
      label: `${walkMins} min walk (${Math.round(distanceKm * 1000)}m)`
    };
  } else if (distanceKm <= 3.0) {
    // Short auto-rickshaw or taxi commute (~16 km/h old city traffic)
    const autoMins = Math.max(6, Math.round((distanceKm / 16) * 60));
    return {
      minutes: autoMins,
      mode: 'auto',
      label: `${autoMins} min auto-rickshaw (${distanceKm} km)`
    };
  } else {
    // Cab drive (~22 km/h city speed)
    const cabMins = Math.max(12, Math.round((distanceKm / 22) * 60));
    return {
      minutes: cabMins,
      mode: 'cab',
      label: `${cabMins} min cab drive (${distanceKm} km)`
    };
  }
}

/**
 * Filters and annotates hotels within radius (PostGIS ST_DWithin equivalent)
 */
export function filterHotelsByRadius(
  spot: TouristSpot,
  hotels: Hotel[],
  radiusKm: number = 5.0
): Array<{ hotel: Hotel; distanceKm: number; commute: ReturnType<typeof estimateCommuteTime> }> {
  return hotels
    .map((hotel) => {
      const distanceKm = calculateHaversineDistance(spot.location, hotel.location);
      return {
        hotel,
        distanceKm,
        commute: estimateCommuteTime(distanceKm)
      };
    })
    .filter((item) => item.distanceKm <= radiusKm);
}

/**
 * Builds a Google Maps Directions URL
 */
export function getGoogleMapsDirectionsUrl(origin: GeoPoint, destination: GeoPoint, destName?: string): string {
  const originParam = `${origin.lat},${origin.lng}`;
  const destParam = `${destination.lat},${destination.lng}`;
  return `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${destParam}${destName ? `&destination_place_id=${encodeURIComponent(destName)}` : ''}`;
}
