import { Hotel, TouristSpot, Guide, AIQueryFilters, AIRecommendationResponse, HotelRecommendation } from '../types';
import { calculateHaversineDistance, estimateCommuteTime } from './spatialService';

/**
 * Natural language intent parser for traveler queries
 */
export function parseNaturalLanguagePrompt(
  prompt: string,
  spots: TouristSpot[]
): {
  landmarkId: string;
  maxBudget: number;
  needsGuide: boolean;
  preferredLanguage: string;
  travelVibe: string;
} {
  const lower = prompt.toLowerCase();

  // 1. Identify Target Landmark
  let matchedSpot = spots[0]; // default Charminar
  if (lower.includes('golconda') || lower.includes('fort')) {
    const found = spots.find(s => s.id.includes('golconda'));
    if (found) matchedSpot = found;
  } else if (lower.includes('chowmahalla') || lower.includes('palace') || lower.includes('khilwat')) {
    const found = spots.find(s => s.id.includes('chowmahalla'));
    if (found) matchedSpot = found;
  } else if (lower.includes('salar jung') || lower.includes('museum') || lower.includes('clock')) {
    const found = spots.find(s => s.id.includes('salarjung'));
    if (found) matchedSpot = found;
  } else if (lower.includes('charminar') || lower.includes('bazaar') || lower.includes('old city')) {
    const found = spots.find(s => s.id.includes('charminar'));
    if (found) matchedSpot = found;
  }

  // 2. Extract Budget Constraint (e.g. "under 4000", "budget 3500", "₹5000", "rs 3000")
  let maxBudget = 100000; // default unconstrained
  const budgetMatch = lower.match(/(?:under|below|budget|max|upto|₹|rs\.?)\s*(\d{3,6})/);
  if (budgetMatch && budgetMatch[1]) {
    maxBudget = parseInt(budgetMatch[1], 10);
  }

  // 3. Extract Guide Need
  const needsGuide = lower.includes('guide') || lower.includes('tour') || lower.includes('walk') || lower.includes('curator') || lower.includes('history');

  // 4. Extract Preferred Language
  let preferredLanguage = 'English';
  if (lower.includes('hindi')) preferredLanguage = 'Hindi';
  else if (lower.includes('telugu')) preferredLanguage = 'Telugu';
  else if (lower.includes('urdu')) preferredLanguage = 'Urdu';
  else if (lower.includes('french')) preferredLanguage = 'French';

  // 5. Extract Travel Vibe
  let travelVibe = 'cultural';
  if (lower.includes('family') || lower.includes('kids')) travelVibe = 'family';
  else if (lower.includes('couple') || lower.includes('romantic') || lower.includes('honeymoon')) travelVibe = 'romantic';
  else if (lower.includes('food') || lower.includes('culinary') || lower.includes('biryani') || lower.includes('dining')) travelVibe = 'foodie';
  else if (lower.includes('photo') || lower.includes('sunset') || lower.includes('camera')) travelVibe = 'photography';
  else if (lower.includes('budget') || lower.includes('cheap') || lower.includes('affordable')) travelVibe = 'budget';
  else if (lower.includes('luxury') || lower.includes('royal') || lower.includes('palace')) travelVibe = 'luxury';

  return {
    landmarkId: matchedSpot.id,
    maxBudget,
    needsGuide,
    preferredLanguage,
    travelVibe
  };
}

/**
 * Check-In Driven Recommendation Engine (Strictly NO Star Ratings)
 * Evaluates partnered hotels based on Google Maps check-in volume, weekly check-in velocity, and proximity.
 */
export function executeAIRecommendationEngine(
  filters: AIQueryFilters,
  spots: TouristSpot[],
  hotels: Hotel[],
  guides: Guide[],
  maxRadiusKm: number = 5.0
): AIRecommendationResponse {
  const targetSpot = spots.find(s => s.id === filters.targetLandmarkId) || spots[0];

  // 1. Spatial Retrieval: Find verified partner hotels within radius
  const eligibleHotels = hotels.filter(hotel => hotel.status === 'verified');

  const scoredHotels: HotelRecommendation[] = eligibleHotels
    .map(hotel => {
      const distanceKm = calculateHaversineDistance(targetSpot.location, hotel.location);
      const commute = estimateCommuteTime(distanceKm);

      // Check-in algorithm score:
      // Heavy weight on Google Maps verified checkin counts and weekly velocity
      // Distance factor provides proximity bonus without overriding footfall credibility
      // Star ratings are intentionally completely omitted from this formula!
      const distancePenalty = distanceKm * 200;
      const checkinScore = Math.round(
        (hotel.checkinCount * 1.0) + (hotel.weeklyCheckins * 4.5) - distancePenalty
      );

      // Match suitable guide
      let matchedGuide: Guide | undefined;
      if (hotel.inHouseGuideIds && hotel.inHouseGuideIds.length > 0) {
        matchedGuide = guides.find(g => hotel.inHouseGuideIds.includes(g.id));
      }
      if (!matchedGuide) {
        // Match from community pool based on language or specialty
        matchedGuide = guides.find(g => 
          g.languages.includes(filters.preferredLanguage) ||
          g.specialties.some(s => s.toLowerCase().includes(filters.stayStyle))
        ) || guides[0];
      }

      // Generate check-in based rationale
      const rationale = generateCheckinRationale(hotel, targetSpot, distanceKm, commute.label, matchedGuide);

      return {
        hotel,
        distanceKm,
        commuteMinutes: commute.minutes,
        checkinScore,
        rationale,
        matchedGuide
      };
    })
    // Spatial boundary filter (< maxRadiusKm)
    .filter(item => item.distanceKm <= maxRadiusKm)
    // Budget filter (if specified and below threshold)
    .filter(item => {
      if (filters.maxBudgetPerNight && filters.maxBudgetPerNight < 50000) {
        return item.hotel.pricePerNight <= filters.maxBudgetPerNight * 1.15; // 15% allowance margin
      }
      return true;
    })
    // Sort strictly by Check-In Score (Highest Google Maps footfall & check-in activity first)
    .sort((a, b) => b.checkinScore - a.checkinScore);

  // Generate customized daily itinerary
  const customItinerary = generateItinerary(targetSpot, filters.stayStyle);

  return {
    queryParsed: {
      landmarkName: targetSpot.name,
      maxBudget: filters.maxBudgetPerNight,
      needsGuide: filters.needsGuide,
      preferredLanguage: filters.preferredLanguage,
      travelVibe: filters.stayStyle
    },
    targetSpot,
    recommendedHotels: scoredHotels,
    customItinerary
  };
}

/**
 * Creates transparent rationale explicitly explaining why the AI recommended
 * this hotel based on Google Maps check-in density and spatial proximity.
 */
function generateCheckinRationale(
  hotel: Hotel,
  spot: TouristSpot,
  distanceKm: number,
  commuteLabel: string,
  guide?: Guide
): string {
  const checkinStr = hotel.checkinCount.toLocaleString();
  const weeklyStr = hotel.weeklyCheckins.toLocaleString();

  let text = `Recommended based on ${checkinStr} verified Google Maps check-ins (${weeklyStr} active this week) — ranked #${hotel.footfallRank} in traveler footfall near ${spot.name}. `;
  
  if (distanceKm <= 0.8) {
    text += `Located just ${Math.round(distanceKm * 1000)}m away (${commuteLabel}), allowing you to bypass congested monument traffic and reach morning entry queues on foot. `;
  } else {
    text += `Convenient ${commuteLabel} from the monument with verified partner ride-hail bypasses. `;
  }

  if (guide) {
    text += `Pairs seamlessly with certified guide ${guide.name} (${guide.specialties[0]}), available for instant bundle at checkout.`;
  }

  return text;
}

/**
 * Generates structured 2-day micro itinerary based on landmark & vibe
 */
function generateItinerary(spot: TouristSpot, vibe: string) {
  return [
    {
      day: 1,
      title: `Arrival & ${spot.name} Exploration`,
      activities: [
        `09:30 AM: Check-in at verified partner stay and receive complimentary local refreshment`,
        `11:00 AM: Guided walk through ${spot.name} before midday crowds arrive`,
        `02:00 PM: Traditional lunch at partner-recommended local heritage dining room`,
        `05:30 PM: Golden hour rooftop photography and evening bazaar exploration`
      ],
      localTip: `Visit early in the morning when the site experiences 40% lower check-in density.`
    },
    {
      day: 2,
      title: 'Hidden Passages & Culinary Discovery',
      activities: [
        `08:30 AM: Heritage tea walk with your certified local guide`,
        `11:30 AM: Artisan craft and pearl workshop immersion`,
        `02:30 PM: Relax at your partner hotel with guaranteed late check-out privileges`
      ],
      localTip: `Bundle your local guide at checkout to receive the hotel partner's exclusive 5% local escort discount.`
    }
  ];
}
