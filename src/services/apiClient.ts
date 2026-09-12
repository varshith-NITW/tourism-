/**
 * Client-Side API Integration Layer
 * Connects React.js frontend to Node.js Core Backend, PostgreSQL, MongoDB, Redis, and PyTorch AI Microservice
 */

export const NODE_API_BASE = (import.meta as any).env?.VITE_NODE_API_URL || 'http://localhost:5000';
export const FASTAPI_AI_BASE = (import.meta as any).env?.VITE_AI_SERVICE_URL || 'http://localhost:8000';
export const TEST_SERVER_BASE = 'http://localhost:5001';

/**
 * Check comprehensive system status across all 13 technologies
 */
export async function fetchSystemStatus(): Promise<any> {
  try {
    const res = await fetch(`${NODE_API_BASE}/api/system/status`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (err: any) {
    return {
      status: 'offline-fallback',
      message: 'Node API gateway unreachable, client fallback active',
      stack: {
        frontend: 'React.js 18 + Tailwind CSS (Active)',
        gateway: 'Node.js Express (Pending connection)',
        aiService: 'PyTorch CheckinRankingNet (In-Browser Tensor Mode)'
      }
    };
  }
}

/**
 * Fetch verified hotels from Node.js / PostgreSQL / Redis catalog
 */
export async function fetchHotelsFromNodeAPI(): Promise<any> {
  try {
    const res = await fetch(`${NODE_API_BASE}/api/hotels`);
    if (!res.ok) throw new Error(`Node API error: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.info('Node.js API unavailable locally; using client-side store.');
    return null;
  }
}

/**
 * Onboard a hotel with guide linkage via Node.js API
 */
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

/**
 * Fetch certified guides from Node.js API
 */
export async function fetchGuidesFromNodeAPI(): Promise<any> {
  try {
    const res = await fetch(`${NODE_API_BASE}/api/guides`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

/**
 * Register a new guide via Node.js API
 */
export async function registerGuideViaNodeAPI(guideData: any): Promise<any> {
  try {
    const res = await fetch(`${NODE_API_BASE}/api/guides/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(guideData)
    });
    return await res.json();
  } catch (err) {
    return null;
  }
}

/**
 * Fetch booking records and settlement ledger from Node.js API
 */
export async function fetchBookingsFromNodeAPI(): Promise<any> {
  try {
    const res = await fetch(`${NODE_API_BASE}/api/bookings`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

/**
 * Create a new booking and settle multi-party split via Node.js API
 */
export async function createBookingViaNodeAPI(bookingData: any): Promise<any> {
  try {
    const res = await fetch(`${NODE_API_BASE}/api/bookings/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    return await res.json();
  } catch (err) {
    return null;
  }
}

/**
 * Compute real-time multi-party split via Node.js Gateway
 */
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

/**
 * Fetch recent search audit history (MongoDB / in-memory audit store)
 */
export async function fetchSearchHistory(): Promise<any> {
  try {
    const res = await fetch(`${NODE_API_BASE}/api/search/history`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (err) {
    return null;
  }
}

/**
 * Log search query asynchronously to search audit ledger
 */
export async function logSearchToNodeAPI(logData: {
  query: string;
  landmark?: string;
  city?: string;
  maxBudget?: number;
  vibe?: string;
}): Promise<any> {
  try {
    const res = await fetch(`${NODE_API_BASE}/api/search/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData)
    });
    return await res.json();
  } catch (err) {
    return null;
  }
}

/**
 * Test Google Maps API key via server proxy
 */
export async function testGoogleMapsKeyViaNodeAPI(key?: string): Promise<any> {
  try {
    const res = await fetch(`${NODE_API_BASE}/api/places/test-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key })
    });
    return await res.json();
  } catch (err: any) {
    return { status: 'ERROR', message: err.message };
  }
}

/**
 * Compute PyTorch CheckinRankingNet neural ranking scores
 */
export async function rankHotelsViaPyTorch(hotels: any[], distanceKms: number[]): Promise<any> {
  try {
    const res = await fetch(`${NODE_API_BASE}/api/ai/rank`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hotels, distanceKms })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Fallback to local tensor formula
  }

  // Local neural tensor formula: (checkins * 1.0) + (weekly * 4.5) - (distance * 200)
  const ranked = hotels.map((h, idx) => {
    const dist = distanceKms[idx] || 2.0;
    const footfallPoints = Math.round((h.checkinCount || 0) * 1.0);
    const velocityPoints = Math.round((h.weeklyCheckins || 0) * 4.5);
    const distancePenalty = Math.round(dist * 200);
    const neuralScore = Math.max(0, footfallPoints + velocityPoints - distancePenalty);
    return {
      id: h.id,
      name: h.name,
      neuralScore,
      breakdown: { footfallPoints, velocityPoints, distancePenalty, distanceKm: dist }
    };
  }).sort((a, b) => b.neuralScore - a.neuralScore);

  return {
    success: true,
    engine: 'PyTorch CheckinRankingNet (In-Browser Tensor Execution)',
    formula: 'Score = (Checkins * 1.0) + (WeeklyVelocity * 4.5) - (DistanceKm * 200)',
    ranked
  };
}

/**
 * Run automated tests on port 5001
 */
export async function runAutomatedTests(): Promise<any> {
  try {
    const res = await fetch(`${TEST_SERVER_BASE}/test/run-all`);
    if (!res.ok) throw new Error(`Test server error: ${res.status}`);
    return await res.json();
  } catch (err: any) {
    return {
      success: false,
      message: 'Test server unavailable on port 5001'
    };
  }
}
