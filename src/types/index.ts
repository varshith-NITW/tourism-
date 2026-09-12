export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface TouristSpot {
  id: string;
  name: string;
  city: string;
  location: GeoPoint;
  description: string;
  tags: string[];
  openingHours: string;
  image: string;
  googlePlaceId: string;
  googleMapsUrl: string;
  monthlyCheckins: number;
  checkinTrend: 'surging' | 'high' | 'steady';
  bestTimeToVisit: string;
}

export interface RoomType {
  id: string;
  name: string;
  pricePerNight: number;
  capacity: number;
  description: string;
  perks: string[];
}

export interface Hotel {
  id: string;
  name: string;
  city: string;
  address: string;
  location: GeoPoint;
  tier: 'Heritage Luxury' | 'Boutique Stay' | 'Urban Comfort' | 'Cultural Retreat';
  pricePerNight: number;
  commissionRate: number; // e.g. 0.15 = 15% platform commission
  status: 'verified' | 'pending';
  allowsIndependentGuides: boolean;
  perks: string[];
  roomTypes: RoomType[];
  inHouseGuideIds: string[];
  amenities: string[];
  // Google Maps Check-In Driven Metrics (Strict non-rating model)
  checkinCount: number; // Google Maps place check-ins count
  weeklyCheckins: number; // Live weekly visitor check-in velocity
  googlePlaceId: string;
  googleMapsUrl: string;
  footfallRank: number; // #1, #2 based on local check-in density
  image: string;
  businessRegNumber: string; // GST / Tourism License ID
  partnershipModel: 'in_house_guides' | 'community_pool' | 'hybrid';
  guideReferralKickbackPercent: number; // typically 5% to 8%
}

export type GuidePackageType = 'half_day' | 'full_day' | 'photography_walk';

export interface GuidePackageOption {
  type: GuidePackageType;
  title: string;
  duration: string;
  price: number;
  description: string;
}

export interface Guide {
  id: string;
  name: string;
  languages: string[];
  hourlyRate: number;
  halfDayRate: number;
  fullDayRate: number;
  photoWalkRate: number;
  verificationId: string; // Tourism Dept Badge / License
  completedToursCount: number; // Verified completed tours
  bio: string;
  specialties: string[];
  affiliatedHotelId: string | null; // null if part of community pool
  avatar: string;
  badgeVerified: boolean;
  phone: string;
}

export interface HotelGuidePartnership {
  id: string;
  hotelId: string;
  guideId: string;
  revSharePercent: number;
  status: 'active' | 'pending';
}

export interface SplitBreakdown {
  totalCharged: number;
  hotelGross: number;
  hotelPlatformCut: number;
  hotelNet: number;
  guideGross: number;
  guidePlatformCut: number;
  hotelReferralKickback: number;
  hotelGuideReferral?: number;
  guideNet: number;
  platformNetRevenue: number;
}

export interface Booking {
  id: string;
  userId: string;
  hotelId: string;
  hotelName: string;
  roomTypeId: string;
  roomTypeName: string;
  dates: {
    checkIn: string;
    checkOut: string;
    nights: number;
  };
  guests: number;
  guideId: string | null;
  guideName: string | null;
  guidePackageType: GuidePackageType | null;
  guidePackageTitle: string | null;
  totalAmount: number;
  splitBreakdown: SplitBreakdown;
  status: 'confirmed' | 'pending';
  createdAt: string;
  meetingPointInfo?: string;
}

export interface AIQueryFilters {
  targetLandmarkId: string;
  maxBudgetPerNight: number;
  needsGuide: boolean;
  preferredLanguage: string;
  stayStyle: 'heritage' | 'foodie' | 'family' | 'luxury' | 'budget' | 'all';
  searchQuery?: string;
}

export interface HotelRecommendation {
  hotel: Hotel;
  distanceKm: number;
  commuteMinutes: number;
  checkinScore: number;
  rationale: string;
  matchedGuide?: Guide;
}

export interface AIRecommendationResponse {
  queryParsed: {
    landmarkName: string;
    maxBudget: number;
    needsGuide: boolean;
    preferredLanguage: string;
    travelVibe: string;
  };
  targetSpot: TouristSpot;
  recommendedHotels: HotelRecommendation[];
  customItinerary: {
    day: number;
    title: string;
    activities: string[];
    localTip: string;
  }[];
}
