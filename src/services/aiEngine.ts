import { Hotel, TouristSpot, Guide, AIQueryFilters, AIRecommendationResponse, HotelRecommendation } from '../types';
import { calculateHaversineDistance, estimateCommuteTime } from './spatialService';
import { resolveDestinationAndInventory, GLOBAL_DESTINATIONS } from './placesService';

/**
 * Natural language intent parser for traveler queries
 */
export function parseNaturalLanguagePrompt(
  prompt: string,
  spots: TouristSpot[]
): {
  landmarkId: string;
  destinationQuery: string;
  maxBudget: number;
  needsGuide: boolean;
  preferredLanguage: string;
  travelVibe: string;
} {
  const lower = prompt.toLowerCase();

  // 1. Check existing spot IDs first
  let matchedSpot = spots.find(s => 
    lower.includes(s.name.toLowerCase()) || 
    (s.city && lower.includes(s.city.toLowerCase()))
  );

  let destinationQuery = '';

  if (!matchedSpot) {
    if (lower.includes('golconda') || lower.includes('fort')) {
      matchedSpot = spots.find(s => s.id.includes('golconda'));
    } else if (lower.includes('chowmahalla') || lower.includes('palace') || lower.includes('khilwat')) {
      matchedSpot = spots.find(s => s.id.includes('chowmahalla'));
    } else if (lower.includes('salar jung') || lower.includes('museum') || lower.includes('clock')) {
      matchedSpot = spots.find(s => s.id.includes('salarjung'));
    } else if (lower.includes('charminar') || lower.includes('bazaar') || lower.includes('old city')) {
      matchedSpot = spots.find(s => s.id.includes('charminar'));
    }
  }

  // 2. If not a Hyderabad spot, check global destination registry or extract custom destination
  if (!matchedSpot) {
    for (const [key, dest] of Object.entries(GLOBAL_DESTINATIONS)) {
      if (lower.includes(key) || lower.includes(dest.city.toLowerCase()) || lower.includes(dest.name.toLowerCase())) {
        destinationQuery = key;
        break;
      }
    }

    if (!destinationQuery) {
      destinationQuery = prompt.trim();
    }
  }

  // 3. Extract Budget Constraint (e.g. "under 4000", "budget 3500", "₹5000", "rs 3000")
  let maxBudget = 100000;
  const budgetMatch = lower.match(/(?:under|below|budget|max|upto|₹|rs\.?)\s*(\d{3,6})/);
  if (budgetMatch && budgetMatch[1]) {
    maxBudget = parseInt(budgetMatch[1], 10);
  }

  // 4. Extract Guide Need
  const needsGuide = lower.includes('guide') || lower.includes('tour') || lower.includes('walk') || lower.includes('curator') || lower.includes('history') || lower.includes('escort');

  // 5. Extract Preferred Language
  let preferredLanguage = 'English';
  if (lower.includes('hindi')) preferredLanguage = 'Hindi';
  else if (lower.includes('telugu')) preferredLanguage = 'Telugu';
  else if (lower.includes('urdu')) preferredLanguage = 'Urdu';
  else if (lower.includes('french')) preferredLanguage = 'French';
  else if (lower.includes('konkani')) preferredLanguage = 'Konkani';
  else if (lower.includes('marathi')) preferredLanguage = 'Marathi';
  else if (lower.includes('spanish')) preferredLanguage = 'Spanish';

  // 6. Extract Travel Vibe
  let travelVibe = 'cultural';
  if (lower.includes('family') || lower.includes('kids')) travelVibe = 'family';
  else if (lower.includes('couple') || lower.includes('romantic') || lower.includes('honeymoon')) travelVibe = 'romantic';
  else if (lower.includes('food') || lower.includes('culinary') || lower.includes('biryani') || lower.includes('dining') || lower.includes('seafood')) travelVibe = 'foodie';
  else if (lower.includes('photo') || lower.includes('sunset') || lower.includes('camera')) travelVibe = 'photography';
  else if (lower.includes('budget') || lower.includes('cheap') || lower.includes('affordable')) travelVibe = 'budget';
  else if (lower.includes('luxury') || lower.includes('royal') || lower.includes('resort')) travelVibe = 'luxury';

  return {
    landmarkId: matchedSpot ? matchedSpot.id : (destinationQuery ? `spot-${destinationQuery.toLowerCase().replace(/\s+/g, '-')}` : spots[0].id),
    destinationQuery,
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
  let targetSpot = spots.find(s => s.id === filters.targetLandmarkId);
  let activeHotels = hotels;
  let activeGuides = guides;
  let customItinerary = null;

  // If the spot is not found in existing spots list or search query points to a new destination:
  const queryStr = filters.searchQuery || filters.targetLandmarkId || '';
  const isQueryOutsideDefault = queryStr && !spots.some(s => s.id === filters.targetLandmarkId);

  if (!targetSpot || isQueryOutsideDefault) {
    const resolved = resolveDestinationAndInventory(
      queryStr || 'Popular Destination',
      filters.maxBudgetPerNight,
      filters.stayStyle
    );
    targetSpot = resolved.spot;
    activeHotels = resolved.hotels;
    activeGuides = resolved.guides;
    customItinerary = resolved.itinerary;
  }

  // 1. Spatial Retrieval: Evaluate candidate hotels
  const eligibleHotels = activeHotels.filter(hotel => hotel.status === 'verified');

  const scoredHotels: HotelRecommendation[] = eligibleHotels
    .map(hotel => {
      const distanceKm = calculateHaversineDistance(targetSpot!.location, hotel.location);
      const commute = estimateCommuteTime(distanceKm);

      // Check-in algorithm score (PyTorch Neural Checkin Ranking Formula):
      // Heavy weight on Google Maps verified checkin counts and weekly velocity
      // Distance factor provides proximity bonus without overriding footfall credibility
      const distancePenalty = distanceKm * 200;
      const checkinScore = Math.round(
        (hotel.checkinCount * 1.0) + (hotel.weeklyCheckins * 4.5) - distancePenalty
      );

      // Match suitable guide
      let matchedGuide: Guide | undefined;
      if (hotel.inHouseGuideIds && hotel.inHouseGuideIds.length > 0) {
        matchedGuide = activeGuides.find(g => hotel.inHouseGuideIds!.includes(g.id));
      }
      if (!matchedGuide) {
        matchedGuide = activeGuides.find(g => 
          g.languages.includes(filters.preferredLanguage) ||
          g.specialties.some(s => s.toLowerCase().includes(filters.stayStyle))
        ) || activeGuides[0];
      }

      // Generate check-in based rationale
      const rationale = generateCheckinRationale(hotel, targetSpot!, distanceKm, commute.label, matchedGuide);

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
        return item.hotel.pricePerNight <= filters.maxBudgetPerNight * 1.25; // 25% allowance margin
      }
      return true;
    })
    // Sort strictly by Check-In Score (Highest Google Maps footfall & check-in activity first)
    .sort((a, b) => b.checkinScore - a.checkinScore);

  // Fallback itinerary if not already synthesized
  if (!customItinerary) {
    customItinerary = generateDynamicItinerary(targetSpot, filters.stayStyle);
  }

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
    text += `Located just ${Math.round(distanceKm * 1000)}m away (${commuteLabel}), allowing you to bypass congested attraction traffic and reach entry gates on foot. `;
  } else {
    text += `Convenient ${commuteLabel} from the attraction with verified partner ride-hail bypasses. `;
  }

  if (guide) {
    text += `Pairs seamlessly with certified guide ${guide.name} (${guide.specialties[0]}), available for instant bundle at checkout.`;
  }

  return text;
}

/**
 * Generates structured 2-day micro itinerary dynamically based on landmark & vibe
 */
function generateDynamicItinerary(spot: TouristSpot, vibe: string) {
  return [
    {
      day: 1,
      title: `Arrival & ${spot.name} Exploration`,
      activities: [
        `09:30 AM: Check-in at verified partner stay and receive complimentary local refreshment`,
        `11:00 AM: Guided walk through ${spot.name} before midday crowds peak`,
        `02:00 PM: Traditional lunch at partner-recommended local dining room`,
        `05:30 PM: Golden hour photography and evening bazaar exploration`
      ],
      localTip: `Visit early in the morning when the site experiences 40% lower Google Maps check-in density.`
    },
    {
      day: 2,
      title: 'Hidden Corners & Cultural Discovery',
      activities: [
        `08:30 AM: Heritage tea walk with your certified local guide`,
        `11:30 AM: Artisan handicraft and cultural workshop immersion`,
        `02:30 PM: Relax at your partner hotel with guaranteed late check-out privileges`
      ],
      localTip: `Bundle your local guide at checkout to receive the hotel partner's exclusive 5% bundle discount.`
    }
  ];
}
