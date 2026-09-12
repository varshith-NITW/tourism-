/**
 * Client-Side API Integration Layer
 * Connects React.js frontend to Node.js Core Backend and Python FastAPI Microservice
 */

const NODE_API_BASE = (import.meta as any).env?.VITE_NODE_API_URL || 'http://localhost:5000';
const FASTAPI_AI_BASE = (import.meta as any).env?.VITE_AI_SERVICE_URL || 'http://localhost:8000';

export async function fetchHotelsFromNodeAPI(): Promise<any> {
  try {
    const res = await fetch(`${NODE_API_BASE}/api/hotels`);
    if (!res.ok) throw new Error(`Node API error: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.info('Node.js API unavailable locally; using client-side mock store.');
    return null;
  }
}

export async function onboardHotelViaNodeAPI(hotelData: any): Promise<any> {
  try {
    const res = await fetch(`${NODE_API_BASE}/api/hotels/onboard`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(hotelData)
    });
    return await res.json();
  } catch (err) {
    console.info('Node.js API unavailable; onboarded into client store.');
    return null;
  }
}

export async function calculateSplitViaNodeAPI(params: any): Promise<any> {
  try {
    const res = await fetch(`${NODE_API_BASE}/api/bookings/split-calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function rankHotelsViaPyTorchFastAPI(hotels: any[], distanceKms: number[]): Promise<any> {
  try {
    const res = await fetch(`${FASTAPI_AI_BASE}/ai/rank-hotels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hotels: hotels.map(h => ({
          id: h.id,
          name: h.name,
          checkin_count: h.checkinCount,
          weekly_checkins: h.weeklyCheckins,
          footfall_rank: h.footfallRank,
          price_per_night: h.pricePerNight
        })),
        distance_kms: distanceKms
      })
    });
    return await res.json();
  } catch (err) {
    console.info('FastAPI PyTorch service unavailable; using local tensor ranking.');
    return null;
  }
}

export async function parseQueryViaLangChain(query: string): Promise<any> {
  try {
    const res = await fetch(`${FASTAPI_AI_BASE}/ai/parse-query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    return await res.json();
  } catch (err) {
    console.info('FastAPI LangChain service unavailable; using local regex constraint parser.');
    return null;
  }
}
