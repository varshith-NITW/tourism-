import { TouristSpot, Hotel, Guide, RoomType } from '../types';

export interface ApiKeyConfig {
  googleMapsKey: string;
  openaiKey: string;
  isLiveGoogleMapsActive: boolean;
  billingStatus?: 'active' | 'billing_required' | 'invalid_key' | 'not_configured';
  statusMessage?: string;
}

const STORAGE_KEY_GOOGLE = 'tourmatch_google_maps_key';
const STORAGE_KEY_OPENAI = 'tourmatch_openai_key';

export function getStoredApiKeys(): { googleMapsKey: string; openaiKey: string } {
  const googleMapsKey = localStorage.getItem(STORAGE_KEY_GOOGLE) || (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';
  const openaiKey = localStorage.getItem(STORAGE_KEY_OPENAI) || (import.meta as any).env?.VITE_OPENAI_API_KEY || '';
  return { googleMapsKey, openaiKey };
}

export function saveStoredApiKeys(googleMapsKey: string, openaiKey: string) {
  if (googleMapsKey) {
    localStorage.setItem(STORAGE_KEY_GOOGLE, googleMapsKey.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_GOOGLE);
  }
  if (openaiKey) {
    localStorage.setItem(STORAGE_KEY_OPENAI, openaiKey.trim());
  } else {
    localStorage.removeItem(STORAGE_KEY_OPENAI);
  }
}

// Built-in Global Landmark Knowledgebase
export const GLOBAL_DESTINATIONS: Record<string, {
  name: string;
  city: string;
  country: string;
  location: { lat: number; lng: number };
  category: string;
  monthlyCheckins: number;
  highlight: string;
  languages: string[];
  hotelThemes: { name: string; tier: 'Heritage Luxury' | 'Boutique Stay' | 'Urban Comfort' | 'Cultural Retreat'; basePrice: number; perks: string[] }[];
  guideProfiles: { name: string; title: string; specialties: string[]; languages: string[]; fee: number }[];
  itineraryDays: { title: string; activities: string[]; localTip: string }[];
}> = {
  'taj mahal': {
    name: 'Taj Mahal',
    city: 'Agra',
    country: 'India',
    location: { lat: 27.1751, lng: 78.0421 },
    category: 'UNESCO World Heritage Site',
    monthlyCheckins: 142000,
    highlight: 'Ivory-white marble mausoleum on the south bank of the Yamuna river',
    languages: ['English', 'Hindi', 'Urdu', 'Spanish'],
    hotelThemes: [
      { name: 'The Taj View Heritage Retreat', tier: 'Heritage Luxury', basePrice: 4800, perks: ['Direct Taj Sunrise View', 'Private Garden Gate Escort', 'Marble Souvenir'] },
      { name: 'Mughal Courtyard Boutique Stay', tier: 'Boutique Stay', basePrice: 3200, perks: ['Traditional Mughlai Breakfast', 'Electric Golf Cart to East Gate', 'Courtyard Tea'] },
      { name: 'Yamuna Riverbank Heritage Homestay', tier: 'Urban Comfort', basePrice: 2200, perks: ['Rooftop Sunset Lounge', 'Free Monument Entry Map', 'Late Check-out'] },
      { name: 'Fatehpur Suites & Resort', tier: 'Cultural Retreat', basePrice: 3900, perks: ['Heritage Pool Access', 'Artisan Zardozi Walk Discount', 'Complimentary Chai'] }
    ],
    guideProfiles: [
      { name: 'Dr. Tariq Alvi', title: 'Mughal Architecture Historian & ASI Licensed Guide', specialties: ['Mughal Architecture', 'Marble Inlay Art', 'Sunrise Photography'], languages: ['English', 'Hindi', 'Urdu'], fee: 1800 },
      { name: 'Sunita Sharma', title: 'Agra Cultural Heritage Escort', specialties: ['Old Agra Bazaar Walk', 'Culinary Petha Tasting', 'Family Tours'], languages: ['English', 'Hindi'], fee: 1500 }
    ],
    itineraryDays: [
      {
        title: 'Dawn at the Taj Mahal & Mughal Artisan Quarters',
        activities: [
          '05:45 AM: Sunrise arrival at Taj Mahal East Gate to witness pristine early light with minimal footfall',
          '08:30 AM: Breakfast at your partner stay with rooftop views of the Yamuna riverbank',
          '11:00 AM: Guided walk through Agra Fort and the private quarters of Shah Jahan',
          '04:30 PM: Artisan marble inlay and pietra dura workshop with verified local master craftsmen',
          '07:00 PM: Authentic Mughlai dinner in Tajganj with partner dining privileges'
        ],
        localTip: 'Enter through the East Gate before 06:15 AM to experience 60% lower Google Maps check-in footfall.'
      },
      {
        title: 'Mehtab Bagh Reflection & Sunset Heritage Trail',
        activities: [
          '09:00 AM: Leisurely breakfast with partner hotel late check-out pass',
          '11:30 AM: Excursion to the Baby Taj (Itimad-ud-Daulah) and riverbank gardens',
          '04:30 PM: Sunset photography session at Mehtab Bagh capturing the golden reflection on the Yamuna'
        ],
        localTip: 'Bundle your ASI certified guide at checkout for complimentary roundtrip electric cart transfers.'
      }
    ]
  },
  'goa': {
    name: 'Calangute & Baga Coast',
    city: 'North Goa',
    country: 'India',
    location: { lat: 15.5439, lng: 73.7553 },
    category: 'Coastal Paradise & Portuguese Heritage',
    monthlyCheckins: 185000,
    highlight: 'Sun-drenched Arabian sea coastline with vibrant beach shacks and colonial architecture',
    languages: ['English', 'Hindi', 'Konkani', 'Russian'],
    hotelThemes: [
      { name: 'Azure Palm Beachfront Resort', tier: 'Boutique Stay', basePrice: 4200, perks: ['Direct Beach Access', 'Complimentary Sunset Kayak', 'Welcome Coconut Cooler'] },
      { name: 'Fontainhas Portuguese Villa', tier: 'Heritage Luxury', basePrice: 3800, perks: ['Latin Quarter Walk', 'Feni Tasting Experience', 'Artisan Bakery Voucher'] },
      { name: 'Candolim Coastline Haven', tier: 'Urban Comfort', basePrice: 2800, perks: ['Poolside Cabana', 'Scooter Rental Discount', 'Seafood Grill Voucher'] },
      { name: 'Aguada Fort Vista Retreat', tier: 'Cultural Retreat', basePrice: 6500, perks: ['Cliffside Ocean View', 'Private Speedboat Tour Linkage', 'Spa Credit'] }
    ],
    guideProfiles: [
      { name: 'Royston Fernandes', title: 'Goan Coastal & Heritage Naturalist', specialties: ['Portuguese Colonial History', 'Hidden Beach Trails', 'Seafood Dining'], languages: ['English', 'Konkani', 'Hindi'], fee: 1600 },
      { name: 'Ananya Prabhu', title: 'Latin Quarter Art & Architecture Escort', specialties: ['Fontainhas Architecture', 'Spice Plantation Immersion', 'Sunset Photography'], languages: ['English', 'Hindi', 'Marathi'], fee: 1400 }
    ],
    itineraryDays: [
      {
        title: 'Coastal Discovery & Sunset Beach Culture',
        activities: [
          '09:00 AM: Check-in at your verified beachfront partner stay with welcome tropical cooler',
          '11:00 AM: Guided coastal walk around Fort Aguada lighthouse and historical bastion',
          '02:00 PM: Authentic Goan fish thali lunch at partner heritage beach shack',
          '05:30 PM: Golden hour Arabian Sea sunset walk and beachside live acoustic lounge'
        ],
        localTip: 'Visit early morning before beach sports open for clean shorelines and 50% fewer crowds.'
      },
      {
        title: 'Old Goa Cathedrals & Spice Plantation Trail',
        activities: [
          '08:30 AM: Guided walk through Basilica of Bom Jesus and Se Cathedral in Old Goa',
          '12:00 PM: Organic spice plantation tour and traditional buffet cooked in clay pots',
          '04:30 PM: Fontainhas Latin Quarter colorful street photography walk with certified guide'
        ],
        localTip: 'Bundle a local guide at checkout to secure guaranteed priority seating at partner coastal dining spots.'
      }
    ]
  },
  'jaipur': {
    name: 'Hawa Mahal & Old Pink City',
    city: 'Jaipur',
    country: 'India',
    location: { lat: 26.9239, lng: 75.8267 },
    category: 'UNESCO Royal Heritage',
    monthlyCheckins: 110000,
    highlight: 'Iconic pink sandstone palace with 953 honeycombed jharokhas and royal bazaars',
    languages: ['English', 'Hindi', 'Rajasthani', 'French'],
    hotelThemes: [
      { name: 'Rawat Haveli Palace Stay', tier: 'Heritage Luxury', basePrice: 4500, perks: ['Rooftop Hawa Mahal Panorama', 'Royal Thali Dinner Voucher', 'Courtyard Folk Dance'] },
      { name: 'Johari Bazaar Boutique Suites', tier: 'Boutique Stay', basePrice: 3400, perks: ['Bazaar Escort Pass', 'Block-Printing Workshop Access', 'Welcome Masala Chai'] },
      { name: 'Amber Royal Gateway Hotel', tier: 'Urban Comfort', basePrice: 2600, perks: ['Free Elephant Ride Shuttle', 'Amber Sound & Light Pass', 'Late Check-out'] }
    ],
    guideProfiles: [
      { name: 'Maharaj Vikram Singh', title: 'Royal Rajput Historian & City Palace Escort', specialties: ['Rajput History', 'Astronomy at Jantar Mantar', 'Royal Jewels & Textiles'], languages: ['English', 'Hindi', 'Rajasthani'], fee: 1700 },
      { name: 'Priya Rathore', title: 'Jaipur Artisan Bazaars & Culinary Guide', specialties: ['Johari Bazaar Gems', 'Blue Pottery Immersion', 'Rajasthani Street Food'], languages: ['English', 'Hindi'], fee: 1400 }
    ],
    itineraryDays: [
      {
        title: 'Pink City Palaces & Royal Observatories',
        activities: [
          '08:30 AM: Morning photography at Hawa Mahal before the sun hits the eastern facade',
          '10:30 AM: Guided exploration of City Palace and the astronomical marvels of Jantar Mantar',
          '01:30 PM: Traditional Dal Baati Churma lunch at partner royal dining room',
          '04:30 PM: Guided walk through Johari and Bapu Bazaars with certified shopping escort'
        ],
        localTip: 'The Hawa Mahal facade glows brilliant crimson between 08:00 AM and 09:30 AM.'
      },
      {
        title: 'Amber Fort Bastions & Stepwell Architecture',
        activities: [
          '08:00 AM: Early excursion to Amber Fort to beat bus tour crowds',
          '11:30 AM: Visit Panna Meena Ka Kund stepwell and Anokhi Museum of Block Printing',
          '04:00 PM: Sunset overlook from Nahargarh Fort with bird-eye view of the Pink City'
        ],
        localTip: 'Bundle your local guide at checkout for VIP queue-free entry to the Amber inner courtyards.'
      }
    ]
  },
  'mumbai': {
    name: 'Gateway of India & Colaba',
    city: 'Mumbai',
    country: 'India',
    location: { lat: 18.9220, lng: 72.8347 },
    category: 'Colonial Maritime Heritage & Harbor',
    monthlyCheckins: 165000,
    highlight: 'Iconic basalt arch monument overlooking Mumbai Harbor and the Arabian Sea',
    languages: ['English', 'Hindi', 'Marathi', 'Gujarati'],
    hotelThemes: [
      { name: 'The Colaba Maritime Suites', tier: 'Heritage Luxury', basePrice: 5800, perks: ['Harbor Ocean View', 'High Tea Lounge Access', 'Heritage Art Walk'] },
      { name: 'Apollo Bunder Boutique Stay', tier: 'Boutique Stay', basePrice: 4200, perks: ['Gateway Walking Proximity', 'Early Check-in Pass', 'Artisan Bakery Voucher'] },
      { name: 'Marine Drive Bayview Inn', tier: 'Urban Comfort', basePrice: 3200, perks: ['Queens Necklace View', 'Free Harbor Ferry Map', 'Late Check-out'] }
    ],
    guideProfiles: [
      { name: 'Farhan Merchant', title: 'Bombay Architecture & Marine Historian', specialties: ['Victorian Gothic Architecture', 'Elephanta Caves', 'Old Bombay Stories'], languages: ['English', 'Hindi', 'Marathi', 'Urdu'], fee: 1800 },
      { name: 'Kavita Joshi', title: 'South Mumbai Cultural & Food Curator', specialties: ['Parsi Cafe Trail', 'Colaba Causeway Shopping', 'Marine Drive Sunset'], languages: ['English', 'Hindi', 'Gujarati'], fee: 1500 }
    ],
    itineraryDays: [
      {
        title: 'Maritime Gateway & Victorian Gothic Heritage',
        activities: [
          '08:30 AM: Morning walk around Gateway of India with harbor breezes before crowds',
          '10:30 AM: Architecture trail through Kala Ghoda and Victorian Gothic precinct',
          '01:00 PM: Iconic Parsi lunch with Berry Pulao at historic partner cafe',
          '05:30 PM: Sunset promenade along Marine Drive (Queen’s Necklace)'
        ],
        localTip: 'Visit Gateway of India at 08:00 AM for undisturbed harbor photography and 70% lower footfall.'
      },
      {
        title: 'Elephanta Island & Art Precinct Immersion',
        activities: [
          '09:00 AM: Speedboat ferry to Elephanta Caves UNESCO rock-cut sculpture temples',
          '01:30 PM: Return to Colaba for art gallery browsing in Kala Ghoda',
          '05:00 PM: Evening shopping and curio hunting along Colaba Causeway'
        ],
        localTip: 'Bundle a certified guide to secure priority boarding onto the Elephanta harbor ferries.'
      }
    ]
  },
  'varanasi': {
    name: 'Dashashwamedh Ghat & Kashi',
    city: 'Varanasi',
    country: 'India',
    location: { lat: 25.3076, lng: 83.0107 },
    category: 'Ancient Spiritual Capital & Sacred Riverfront',
    monthlyCheckins: 135000,
    highlight: 'Sacred riverfront ghats with continuous spiritual rituals and ancient winding alleys',
    languages: ['English', 'Hindi', 'Sanskrit', 'Bengali'],
    hotelThemes: [
      { name: 'Ganges View Heritage Haveli', tier: 'Heritage Luxury', basePrice: 3600, perks: ['Direct Riverfront Balcony', 'Sunrise Rowboat Included', 'Rooftop Yoga'] },
      { name: 'Kashi Vishwanath Courtyard Stay', tier: 'Boutique Stay', basePrice: 2800, perks: ['Walking Alley Escort', 'Temple VIP Darshan Pass', 'Satvik Breakfast'] },
      { name: 'Assi Ghat Riverside Retreat', tier: 'Cultural Retreat', basePrice: 2100, perks: ['Morning Aarti Proximity', 'Banarasi Silk Souvenir', 'Tea Lounge'] }
    ],
    guideProfiles: [
      { name: 'Acharya Devendra Shastri', title: 'Kashi Vedic & Riverfront Scholar', specialties: ['Ghat Rituals & Philosophy', 'Ancient Alley Navigation', 'Vedic Chanting'], languages: ['English', 'Hindi', 'Sanskrit'], fee: 1500 },
      { name: 'Rahul Pandey', title: 'Banaras Street Food & Silk Weaver Curator', specialties: ['Silk Handloom Weavers', 'Kachori & Chaat Trail', 'Evening Ganga Aarti'], languages: ['English', 'Hindi'], fee: 1300 }
    ],
    itineraryDays: [
      {
        title: 'Dawn Sunrise Boat & Sacred Ghats Walk',
        activities: [
          '05:30 AM: Silent rowboat along the Ganges from Assi to Manikarnika Ghat witnessing dawn rituals',
          '08:30 AM: Hot Kachori-Jalebi breakfast in the ancient Thatheri Bazaar alleys',
          '11:00 AM: Guided walk through Kashi Vishwanath temple precinct',
          '06:30 PM: VIP reserved boat seating for the grand Dashashwamedh Ganga Aarti ceremony'
        ],
        localTip: 'The sunrise boat ride offers the most serene, spiritually profound experience of the ghats.'
      },
      {
        title: 'Banarasi Silk Weavers & Sarnath Excursion',
        activities: [
          '08:30 AM: Visit traditional handloom silk weavers in the Muslim weaver colony',
          '11:30 AM: Excursion to Sarnath where Lord Buddha delivered his first sermon',
          '05:00 PM: Evening classical sitar and tabla performance at Assi Ghat'
        ],
        localTip: 'Bundle your local guide at checkout to navigate the maze of narrow lanes without getting lost.'
      }
    ]
  },
  'manali': {
    name: 'Solang Valley & Old Manali',
    city: 'Manali',
    country: 'India',
    location: { lat: 32.2432, lng: 77.1892 },
    category: 'Himalayan Alpine Retreat',
    monthlyCheckins: 95000,
    highlight: 'Snow-capped peaks, deodar cedar pine forests, and rushing Beas river waters',
    languages: ['English', 'Hindi', 'Pahari'],
    hotelThemes: [
      { name: 'Cedar Pine Alpine Lodge', tier: 'Cultural Retreat', basePrice: 3800, perks: ['Snow Peak Balcony', 'Woodfire Bonfire Nights', 'Apple Orchard Walk'] },
      { name: 'Old Manali Riverside Wooden Chalet', tier: 'Urban Comfort', basePrice: 2600, perks: ['Beas River Murmur', 'Cafe Strip Walking Proximity', 'Hot Herbal Tea'] },
      { name: 'Solang Valley Adventure Haven', tier: 'Boutique Stay', basePrice: 4500, perks: ['Paragliding Discount', 'Snow Gear Rental', 'Heated Rooms'] }
    ],
    guideProfiles: [
      { name: 'Tenzing Negi', title: 'Himalayan Trek Leader & Nature Escort', specialties: ['Alpine Trails', 'Solang Valley Gliders', 'Local Himachali Culture'], languages: ['English', 'Hindi', 'Pahari'], fee: 1600 }
    ],
    itineraryDays: [
      {
        title: 'Hadimba Temple Pines & Old Manali Cafes',
        activities: [
          '09:00 AM: Walk through giant cedar trees to the wooden Hadimba Devi Temple',
          '11:30 AM: Stroll along the vibrant Old Manali cafe street and artisan handicraft shops',
          '02:00 PM: Trout fish lunch by the riverside',
          '05:00 PM: Evening hot sulfur dip at Vashisht natural thermal springs'
        ],
        localTip: 'Old Manali is far quieter and more authentic than the crowded Mall Road.'
      },
      {
        title: 'Solang Valley Adventure & Atal Tunnel Excursion',
        activities: [
          '08:00 AM: Scenic drive to Solang Valley for ropeway and panoramic mountain views',
          '12:00 PM: Excursion through the engineering marvel Atal Tunnel into Lahaul Valley',
          '04:30 PM: Return for fireside mountain tea at your partner lodge'
        ],
        localTip: 'Bundle a licensed mountain guide for pre-arranged adventure activity safety checks.'
      }
    ]
  },
  'paris': {
    name: 'Eiffel Tower & Seine Riverfront',
    city: 'Paris',
    country: 'France',
    location: { lat: 48.8584, lng: 2.2945 },
    category: 'Iconic Global Architectural Wonder',
    monthlyCheckins: 290000,
    highlight: 'Wrought-iron lattice tower on the Champ de Mars with panoramic city vistas',
    languages: ['English', 'French', 'Spanish'],
    hotelThemes: [
      { name: 'Champ de Mars Boutique Hotel', tier: 'Boutique Stay', basePrice: 8500, perks: ['Direct Eiffel Balcony View', 'Fresh Croissant Breakfast', 'Late Check-out'] },
      { name: 'Seine Riverfront Suites', tier: 'Heritage Luxury', basePrice: 12000, perks: ['Private River Cruise Voucher', 'Champagne Welcome', 'Concierge Tour Pass'] },
      { name: 'Saint-Germain Bohemian Inn', tier: 'Urban Comfort', basePrice: 6200, perks: ['Latin Quarter Proximity', 'Art Gallery Map', 'Metro Day Pass'] }
    ],
    guideProfiles: [
      { name: 'Claire Dubois', title: 'Licensed Parisian Historian & Art Curator', specialties: ['Eiffel Tower History', 'Impressionist Art', 'Hidden Cafes'], languages: ['English', 'French'], fee: 3500 }
    ],
    itineraryDays: [
      {
        title: 'Eiffel Tower Vistas & Seine Cruise',
        activities: [
          '08:30 AM: Morning stroll across Pont d’Iena for unobstructed sunrise photos of Eiffel Tower',
          '10:30 AM: Ascend the Eiffel Tower summit via reserved partner elevator bypass',
          '01:00 PM: French bistro lunch in the 7th arrondissement',
          '06:00 PM: Evening Seine river illumination cruise watching the tower sparkle on the hour'
        ],
        localTip: 'The tower sparkles for 5 minutes every hour on the hour after sunset.'
      },
      {
        title: 'Louvre Masterpieces & Montmartre Artists',
        activities: [
          '09:00 AM: Guided walk through the Louvre highlighting Mona Lisa and Venus de Milo',
          '01:30 PM: Cafe lunch in Saint-Germain-des-Prés',
          '04:30 PM: Sunset walk through cobbled Montmartre alleys up to Sacré-Cœur Basilica'
        ],
        localTip: 'Bundle your licensed Parisian guide to skip standard multi-hour museum security lines.'
      }
    ]
  }
};

/**
 * Searches and resolves a destination query into a verified TouristSpot and matching partner inventory.
 */
export function resolveDestinationAndInventory(
  query: string,
  userBudget: number = 5000,
  vibe: string = 'cultural'
): {
  spot: TouristSpot;
  hotels: Hotel[];
  guides: Guide[];
  itinerary: { day: number; title: string; activities: string[]; localTip: string }[];
  isCustomResolved: boolean;
} {
  const lower = query.toLowerCase().trim();

  // 1. Check known destination registry
  for (const [key, data] of Object.entries(GLOBAL_DESTINATIONS)) {
    if (lower.includes(key) || lower.includes(data.city.toLowerCase()) || lower.includes(data.name.toLowerCase())) {
      const spot: TouristSpot = {
        id: `spot-${key.replace(/\s+/g, '-')}`,
        name: `${data.name}, ${data.city}`,
        city: data.city,
        location: data.location,
        description: data.highlight,
        tags: [data.category, data.city, 'Heritage'],
        openingHours: '06:00 AM - 08:00 PM',
        image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
        googlePlaceId: `ChIJ_${key.replace(/\s+/g, '_')}`,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${data.name} ${data.city}`)}`,
        monthlyCheckins: data.monthlyCheckins,
        checkinTrend: 'high',
        bestTimeToVisit: 'Best during early morning or sunset hours'
      };

      // Generate verified hotels within 5km radius with realistic bearings
      const hotels: Hotel[] = data.hotelThemes.map((ht, idx) => {
        const offsetLat = (Math.sin(idx * 1.6) * (0.005 + idx * 0.006));
        const offsetLng = (Math.cos(idx * 1.6) * (0.005 + idx * 0.006));

        const baseCheckins = Math.round(data.monthlyCheckins * (0.035 - idx * 0.005));
        const weekly = Math.round(baseCheckins * 0.08);

        const roomTypes: RoomType[] = [
          {
            id: 'standard',
            name: 'Deluxe Heritage Room',
            pricePerNight: ht.basePrice,
            capacity: 2,
            description: 'Comfortable air-conditioned room with local styling',
            perks: ht.perks.slice(0, 2)
          },
          {
            id: 'suite',
            name: 'Royal Landmark View Suite',
            pricePerNight: Math.round(ht.basePrice * 1.45),
            capacity: 3,
            description: 'Spacious premium suite overlooking destination vistas',
            perks: ht.perks
          }
        ];

        return {
          id: `hotel-${key.replace(/\s+/g, '-')}-${idx + 1}`,
          name: ht.name,
          city: data.city,
          address: `${data.name} Vicinity, ${data.city}`,
          location: {
            lat: Number((data.location.lat + offsetLat).toFixed(6)),
            lng: Number((data.location.lng + offsetLng).toFixed(6))
          },
          tier: ht.tier,
          pricePerNight: ht.basePrice,
          commissionRate: 0.15,
          status: 'verified',
          allowsIndependentGuides: true,
          perks: ht.perks,
          roomTypes,
          inHouseGuideIds: [`guide-${key.replace(/\s+/g, '-')}-1`],
          amenities: ['Wi-Fi', 'Room Service', 'Air Conditioning', 'Tour Concierge'],
          checkinCount: Math.max(1200, baseCheckins),
          weeklyCheckins: Math.max(120, weekly),
          googlePlaceId: `ChIJ_hotel_${key.replace(/\s+/g, '_')}_${idx + 1}`,
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${ht.name} ${data.city}`)}`,
          footfallRank: idx + 1,
          image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
          businessRegNumber: `GST36VERIFIED${idx + 1}K1Z`,
          partnershipModel: 'hybrid',
          guideReferralKickbackPercent: 0.06
        };
      });

      // Generate guides
      const guides: Guide[] = data.guideProfiles.map((gp, idx) => ({
        id: `guide-${key.replace(/\s+/g, '-')}-${idx + 1}`,
        name: gp.name,
        languages: gp.languages,
        hourlyRate: Math.round(gp.fee * 0.25),
        halfDayRate: Math.round(gp.fee * 0.65),
        fullDayRate: gp.fee,
        photoWalkRate: Math.round(gp.fee * 0.75),
        verificationId: `ASI-CERT-${data.city.toUpperCase()}-${700 + idx * 12}`,
        completedToursCount: 240 + idx * 80,
        bio: `${gp.title}. Certified local guide specializing in ${gp.specialties.join(', ')}.`,
        specialties: gp.specialties,
        affiliatedHotelId: null,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        badgeVerified: true,
        phone: '+91 98200 44100'
      }));

      const itinerary = data.itineraryDays.map((d, idx) => ({
        day: idx + 1,
        title: d.title,
        activities: d.activities,
        localTip: d.localTip
      }));

      return { spot, hotels, guides, itinerary, isCustomResolved: true };
    }
  }

  // 2. Generic Dynamic Synthesis for any arbitrary destination query
  const cleanedName = query
    .replace(/(?:find|hotel|hotels|stay|stays|resort|near|in|at|under|budget|guide|trip|tour|visit|for|with|and|\d+)/gi, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .join(' ') || 'Scenic Destination';

  const titleCased = cleanedName.charAt(0).toUpperCase() + cleanedName.slice(1);
  
  const defaultLat = 28.6139;
  const defaultLng = 77.2090;

  const genericSpot: TouristSpot = {
    id: `spot-custom-${Date.now()}`,
    name: `${titleCased} Attraction`,
    city: titleCased,
    location: { lat: defaultLat, lng: defaultLng },
    description: `Dynamic attraction hub for ${titleCased} evaluated via Google Maps check-in footprint`,
    tags: [titleCased, 'Featured Destination'],
    openingHours: '06:00 AM - 08:00 PM',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
    googlePlaceId: `ChIJ_gen_${Date.now()}`,
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(titleCased)}`,
    monthlyCheckins: 85000,
    checkinTrend: 'high',
    bestTimeToVisit: 'Morning hours for lower check-in density'
  };

  const genericHotels: Hotel[] = [
    {
      id: 'hotel-gen-1',
      name: `${titleCased} Landmark Grand Stay`,
      city: titleCased,
      address: `Monument Boulevard, ${titleCased}`,
      location: { lat: defaultLat + 0.004, lng: defaultLng + 0.003 },
      tier: 'Boutique Stay',
      pricePerNight: userBudget ? Math.min(userBudget, 4200) : 3800,
      commissionRate: 0.15,
      status: 'verified',
      allowsIndependentGuides: true,
      perks: ['Walk to Monument Gate', 'Complimentary Local Breakfast', 'Priority Guide Linkage'],
      roomTypes: [
        { id: 'std', name: 'Deluxe City View', pricePerNight: 3800, capacity: 2, description: 'Spacious room with modern amenities', perks: ['Breakfast', 'City View'] }
      ],
      inHouseGuideIds: ['guide-gen-1'],
      amenities: ['Wi-Fi', 'Air Conditioning', 'Breakfast', 'Tour Desk'],
      checkinCount: 4620,
      weeklyCheckins: 380,
      googlePlaceId: 'ChIJ_gen_hotel_1',
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${titleCased} Grand Stay`)}`,
      footfallRank: 1,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      businessRegNumber: 'GST36GEN1K1Z',
      partnershipModel: 'hybrid',
      guideReferralKickbackPercent: 0.05
    },
    {
      id: 'hotel-gen-2',
      name: `${titleCased} Heritage Courtyard Inn`,
      city: titleCased,
      address: `Old Town Arcade, ${titleCased}`,
      location: { lat: defaultLat - 0.006, lng: defaultLng + 0.005 },
      tier: 'Urban Comfort',
      pricePerNight: userBudget ? Math.min(userBudget * 0.8, 3200) : 2900,
      commissionRate: 0.14,
      status: 'verified',
      allowsIndependentGuides: true,
      perks: ['Historic Courtyard Tea', 'Guaranteed Late Check-out', 'Free Parking'],
      roomTypes: [
        { id: 'std', name: 'Heritage Classic Room', pricePerNight: 2900, capacity: 2, description: 'Classic wooden aesthetic with modern comforts', perks: ['Courtyard Tea'] }
      ],
      inHouseGuideIds: [],
      amenities: ['Wi-Fi', 'Courtyard Tea', 'Airport Shuttle'],
      checkinCount: 3840,
      weeklyCheckins: 295,
      googlePlaceId: 'ChIJ_gen_hotel_2',
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${titleCased} Heritage Inn`)}`,
      footfallRank: 2,
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      businessRegNumber: 'GST36GEN2K1Z',
      partnershipModel: 'community_pool',
      guideReferralKickbackPercent: 0.06
    },
    {
      id: 'hotel-gen-3',
      name: `${titleCased} Royal Residency Suites`,
      city: titleCased,
      address: `Promenade Rd, ${titleCased}`,
      location: { lat: defaultLat + 0.012, lng: defaultLng - 0.008 },
      tier: 'Heritage Luxury',
      pricePerNight: userBudget ? Math.min(userBudget * 1.2, 5500) : 4800,
      commissionRate: 0.15,
      status: 'verified',
      allowsIndependentGuides: true,
      perks: ['Rooftop Panoramic Lounge', 'Complimentary Spa Credit', 'Ride-Hail Fastpass'],
      roomTypes: [
        { id: 'std', name: 'Executive Suite', pricePerNight: 4800, capacity: 2, description: 'Premium suite with destination skyline views', perks: ['Spa Pass', 'Late Check-out'] }
      ],
      inHouseGuideIds: [],
      amenities: ['Wi-Fi', 'Infinity Pool', 'Panoramic Rooftop'],
      checkinCount: 3120,
      weeklyCheckins: 230,
      googlePlaceId: 'ChIJ_gen_hotel_3',
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${titleCased} Royal Suites`)}`,
      footfallRank: 3,
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      businessRegNumber: 'GST36GEN3K1Z',
      partnershipModel: 'in_house_guides',
      guideReferralKickbackPercent: 0.07
    }
  ];

  const genericGuides: Guide[] = [
    {
      id: 'guide-gen-1',
      name: 'Arun Verma',
      languages: ['English', 'Hindi'],
      hourlyRate: 350,
      halfDayRate: 1000,
      fullDayRate: 1600,
      photoWalkRate: 1200,
      verificationId: 'TOUR-CERT-VERIFIED',
      completedToursCount: 310,
      bio: `Certified regional cultural guide for ${titleCased} with over 8 years experience.`,
      specialties: ['Cultural History', 'Monument Architecture', 'Photography'],
      affiliatedHotelId: null,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      badgeVerified: true,
      phone: '+91 98110 55432'
    }
  ];

  const genericItinerary = [
    {
      day: 1,
      title: `Arrival & ${titleCased} Exploration`,
      activities: [
        `09:30 AM: Check-in at verified partner stay and receive welcome local refreshment`,
        `11:00 AM: Guided exploration of ${titleCased} before peak midday crowds arrive`,
        `02:00 PM: Traditional lunch at partner-recommended authentic dining spot`,
        `05:30 PM: Golden hour photography walk and evening local market discovery`
      ],
      localTip: 'Visit early in the morning when the site experiences 45% lower Google Maps check-in footfall.'
    },
    {
      day: 2,
      title: 'Hidden Corners & Cultural Discovery',
      activities: [
        `08:30 AM: Heritage tea and architectural walk with your certified local guide`,
        `11:30 AM: Local craft immersion and traditional workshop visit`,
        `02:30 PM: Relax at your partner stay with guaranteed late check-out privileges`
      ],
      localTip: 'Bundle your certified guide at checkout to receive the exclusive partner bundle discount.'
    }
  ];

  return {
    spot: genericSpot,
    hotels: genericHotels,
    guides: genericGuides,
    itinerary: genericItinerary,
    isCustomResolved: true
  };
}
