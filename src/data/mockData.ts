import { TouristSpot, Hotel, Guide } from '../types';

export const INITIAL_TOURIST_SPOTS: TouristSpot[] = [
  {
    id: 'spot-charminar',
    name: 'Charminar & Old City Bazaars',
    city: 'Hyderabad',
    location: { lat: 17.3616, lng: 78.4747 },
    description: 'Iconic 16th-century grand mosque monument surrounded by bustling Laad Bazaar pearl and spice lanes.',
    tags: ['Heritage', 'Architecture', 'Shopping', 'Street Food'],
    openingHours: '09:00 AM - 08:00 PM',
    image: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=1000&q=80',
    googlePlaceId: 'ChIJj70E4eWbyzsR3eI19u3P3x4',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Charminar+Hyderabad',
    monthlyCheckins: 245000,
    checkinTrend: 'surging',
    bestTimeToVisit: 'Early morning (08:30 AM) or sunset illuminated (06:30 PM)',
    catchyLine: '400 years of royal pearls & steaming Irani chai whisper through timeless bazaars.',
    bestPic: 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=1400&q=85',
    survivalPhrases: [
      { phrase: 'Hello / Greetings', translation: 'Namaskaram (నమస్కారం) / Adab (آداب)', pronunciation: 'Nah-mas-kahr-am', context: 'Universal polite greeting' },
      { phrase: 'How much is this?', translation: 'Idhi entha? (ఇది ఎంత?) / Yeh kitne ka hai?', pronunciation: 'Ee-dhee en-thah?', context: 'Essential for bazaar bargaining' },
      { phrase: 'Can you reduce the price?', translation: 'Koncham thagginchandi (కొంచెం తగ్గించండి)', pronunciation: 'Kone-chum thug-gin-chun-dee', context: 'Polite bargaining phrase' },
      { phrase: 'Where is authentic Biryani?', translation: 'Manchi Biryani ekkada? (మంచి బిర్యానీ ఎక్కడ?)', pronunciation: 'Mun-chee bir-yah-nee ek-kuh-dah?', context: 'Food navigation' },
      { phrase: 'Thank you very much!', translation: 'Chala Dhanyavadhalu (చాలా ధన్యవాదాలు)', pronunciation: 'Chah-lah dhun-yah-vah-dha-loo', context: 'Expressing warm gratitude' }
    ],
    foodMustEats: [
      { name: 'Irani Chai & Osmania Biscuits', spot: 'Nimrah Cafe & Bakery (Opposite Charminar)', tip: 'Dip the warm salted biscuit into the rich cardamom milk tea.' },
      { name: 'Kacche Gosht ki Hyderabadi Dum Biryani', spot: 'Hotel Shadab (Ghansi Bazaar)', tip: 'Served with fiery Mirchi ka Salan and Dahi Chutney.' },
      { name: 'Pista House Mutton Haleem & Zafrani Chai', spot: 'Pista House Charminar Outpost', tip: 'Slow-cooked with pure ghee and broken wheat.' }
    ],
    culturalTips: [
      'Remove footwear at monument mosque steps and wear respectful shoulder/knee attire.',
      'Bargaining is expected in Laad Bazaar; politely start at 60-70% of quoted price for glass bangles.',
      'Best photography light is 08:30 AM or 06:45 PM when monument spotlights activate.'
    ],
    commuteTips: {
      autoFare: '₹60-100 within Old City; ₹200 from Railway Station; ₹750 from Airport.',
      metroAvailable: true,
      localAdvice: 'Take the Metro to MGBS station, then hop on an electric rickshaw for ₹30.'
    }
  },
  {
    id: 'spot-golconda',
    name: 'Golconda Fort & Acoustic Vaults',
    city: 'Hyderabad',
    location: { lat: 17.3833, lng: 78.4011 },
    description: 'A colossal fortified citadel famous for its acoustic clapping portico, diamond vaults, and sunset panoramas.',
    tags: ['Heritage', 'Fortress', 'Acoustics', 'Sunset View'],
    openingHours: '09:00 AM - 05:30 PM',
    image: 'https://images.unsplash.com/photo-1606298855672-3efb620b7537?auto=format&fit=crop&w=1000&q=80',
    googlePlaceId: 'ChIJ49K4vT6XyzsR3d001q_abc',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Golconda+Fort+Hyderabad',
    monthlyCheckins: 168000,
    checkinTrend: 'high',
    bestTimeToVisit: '03:30 PM to catch the hilltop golden hour and sound & light show',
    catchyLine: 'A single clap at the grand iron gate echoes 1 kilometer up to the hilltop royal pavilion.',
    bestPic: 'https://images.unsplash.com/photo-1606298855672-3efb620b7537?auto=format&fit=crop&w=1400&q=85',
    survivalPhrases: [
      { phrase: 'How far is the top?', translation: 'Paiki entha dhooram? (పైకి ఎంత దూరం?)', pronunciation: 'Pie-kee en-thah dhoo-rum?', context: 'Asking about the 360-step climb' },
      { phrase: 'Do you have drinking water?', translation: 'Manchi neellu unnaaya? (మంచి నీళ్లు ఉన్నాయా?)', pronunciation: 'Mun-chee neel-loo oon-nah-yah?', context: 'Hydration during fort hike' },
      { phrase: 'Wait here for 1 hour', translation: 'Oka ganta ikkade undandi (ఒక గంట ఇక్కడే ఉండండి)', pronunciation: 'Oh-kah gun-tah ik-kuh-day oon-dun-dee', context: 'Telling auto driver to wait' }
    ],
    foodMustEats: [
      { name: 'Khubani ka Meetha (Apricot dessert)', spot: 'Heritage Fort Terrace Cafe', tip: 'Topped with thick malai clotted cream.' }
    ],
    culturalTips: [
      'Wear sturdy sneakers for the 360 ancient stone stairs to the Baradari pavilion.',
      'The acoustic clapping portico at Fateh Darwaza was used as an early warning telegraph system.'
    ],
    commuteTips: {
      autoFare: '₹120-150 from Banjara Hills; ₹180 from Hitech City.',
      metroAvailable: false,
      localAdvice: 'Book an app cab or hire a pre-arranged return auto as return taxis can be scarce after sunset.'
    }
  },
  {
    id: 'spot-chowmahalla',
    name: 'Chowmahalla Palace',
    city: 'Hyderabad',
    location: { lat: 17.3578, lng: 78.4717 },
    description: 'The opulent seat of the Asaf Jahi dynasty, featuring Belgian crystal chandeliers and vintage car collections.',
    tags: ['Palace', 'Royalty', 'Museum', 'Photography'],
    openingHours: '10:00 AM - 05:00 PM (Closed Fridays)',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1000&q=80',
    googlePlaceId: 'ChIJF0M6ZOmbyzsR88b02z_xyz',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Chowmahalla+Palace+Hyderabad',
    monthlyCheckins: 94000,
    checkinTrend: 'steady',
    bestTimeToVisit: '10:30 AM for natural sunlight inside the grand Khilwat Mubarak hall',
    catchyLine: 'Walk the mirrored royal corridors of the Nizams, once the wealthiest rulers on earth.',
    bestPic: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1400&q=85',
    survivalPhrases: [
      { phrase: 'Where is the Vintage Car Gallery?', translation: 'Vintage car exhibition ekkada? (వింటేజ్ కార్ ఎగ్జిబిషన్ ఎక్కడ?)', pronunciation: 'Vin-tij kahr ek-zee-bi-shun ek-kuh-dah?', context: 'Navigating palace courtyards' },
      { phrase: 'Is photography allowed inside?', translation: 'Lopala photos theeyocha? (లోపల ఫోటోలు తీయొచ్చా?)', pronunciation: 'Loh-puh-lah foh-tohs thee-yoh-chah?', context: 'Camera permissions' }
    ],
    foodMustEats: [
      { name: 'Double Ka Meetha (Royal Bread Pudding)', spot: 'Subhan Bakery & Sweets nearby', tip: 'Infused with pure saffron and toasted cashew nuts.' }
    ],
    culturalTips: [
      'Flash photography is strictly prohibited inside the Belgian chandelier durbar hall.',
      'Allow at least 90 minutes to stroll through the four royal courtyards and gardens.'
    ],
    commuteTips: {
      autoFare: '₹50-70 from Charminar; ₹120 from Nampally Station.',
      metroAvailable: true,
      localAdvice: 'Located just 1.2 km west of Charminar, easily walkable through Laad Bazaar.'
    }
  },
  {
    id: 'spot-salarjung',
    name: 'Salar Jung Museum',
    city: 'Hyderabad',
    location: { lat: 17.3713, lng: 78.4804 },
    description: 'One of the largest individual art collections in the world, featuring the Veiled Rebecca and 19th-century Musical Clock.',
    tags: ['Art', 'Museum', 'Antiques', 'Family'],
    openingHours: '10:00 AM - 05:00 PM (Closed Fridays)',
    image: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=1000&q=80',
    googlePlaceId: 'ChIJW3P1t16byzsR44f23b_def',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Salar+Jung+Museum+Hyderabad',
    monthlyCheckins: 115000,
    checkinTrend: 'high',
    bestTimeToVisit: '11:45 AM to gather around the famous mechanical clock show at 12:00 PM',
    catchyLine: '38 galleries of priceless global treasures, sculpted marble veils, and mechanical clocks.',
    bestPic: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=1400&q=85',
    survivalPhrases: [
      { phrase: 'Where is the Veiled Rebecca statue?', translation: 'Veiled Rebecca vigraham ekkada? (వీల్డ్ రెబెక్కా విగ్రహం ఎక్కడ?)', pronunciation: 'Veeld Reh-bek-kah vig-ruh-hum ek-kuh-dah?', context: 'Finding the museum masterpiece' },
      { phrase: 'When does the clock strike?', translation: 'Gadiyaram enni gantulaki kottudhi? (గడియారం ఎన్ని గంటలకి కొట్టుద్ది?)', pronunciation: 'Guh-dee-yah-rum en-nee gun-tuh-luh-kee kot-tuh-dhee?', context: 'Timing the mechanical show' }
    ],
    foodMustEats: [
      { name: 'Badam Milk & Lassi', spot: 'Famous Ice Cream (Mozamjahi Market - 10 min away)', tip: 'Hand-churned seasonal fruit ice creams since 1951.' }
    ],
    culturalTips: [
      'Cloakroom is mandatory for backpacks and large bags before entry.',
      'Arrive at the central courtyard at 11:50 AM to get front-row view of the 12:00 PM clock miniature soldier emergence.'
    ],
    commuteTips: {
      autoFare: '₹60-90 from Koti; ₹150 from Secunderabad Station.',
      metroAvailable: true,
      localAdvice: 'Salar Jung Museum Metro Station on Green Line is only 400m away.'
    }
  }
];

export const INITIAL_HOTELS: Hotel[] = [
  {
    id: 'hotel-royal-charminar',
    name: 'Hotel Royal Charminar Heritage',
    city: 'Hyderabad',
    address: 'Near Mecca Masjid, Charminar Rd, Old City',
    location: { lat: 17.3645, lng: 78.4735 },
    tier: 'Boutique Stay',
    pricePerNight: 3200,
    commissionRate: 0.15, // 15% platform commission
    status: 'verified',
    allowsIndependentGuides: true,
    perks: ['Walk to Charminar (5 min)', 'Rooftop Irani Chai Lounge', 'Free Monument Passes'],
    amenities: ['Free High-Speed Wi-Fi', 'Heritage Dining Room', 'Concierge Tour Desk', 'Airport Shuttle', '24/7 Security'],
    // Strict Google Maps Check-In Driven Metrics:
    checkinCount: 4820,
    weeklyCheckins: 385,
    googlePlaceId: 'ChIJg5H23_RoyalCharminar',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Hotel+Royal+Charminar+Hyderabad',
    footfallRank: 1, // #1 Most Checked-In Stay in Old City
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
    businessRegNumber: 'GST36AABCR1029K1Z4',
    partnershipModel: 'in_house_guides',
    inHouseGuideIds: ['guide-vikram'],
    guideReferralKickbackPercent: 0.06, // 6% hotel referral kickback on guide bundle
    roomTypes: [
      {
        id: 'rc-deluxe',
        name: 'Heritage Deluxe Room',
        pricePerNight: 3200,
        capacity: 2,
        description: 'Classic Nizam-styled teak furnishings with street bazaar views and marble bath.',
        perks: ['Complimentary breakfast', 'Free cancellation up to 24h']
      },
      {
        id: 'rc-suite',
        name: 'Royal Minar Suite',
        pricePerNight: 5400,
        capacity: 3,
        description: 'Panoramic view of Charminar minarets from your private balcony with antique swing.',
        perks: ['Priority check-in', 'Evening high-tea included', 'Free monument tickets']
      }
    ]
  },
  {
    id: 'hotel-nizam-courtyard',
    name: 'The Nizam Courtyard Boutique',
    city: 'Hyderabad',
    address: 'Chowmahalla Gate 2, Khilwat',
    location: { lat: 17.3592, lng: 78.4755 },
    tier: 'Heritage Luxury',
    pricePerNight: 4600,
    commissionRate: 0.15,
    status: 'verified',
    allowsIndependentGuides: true,
    perks: ['Direct access to Chowmahalla', 'Authentic Hyderabadi Dastarkhwan Dinner', 'Quiet Courtyard Garden'],
    amenities: ['Courtyard Fountain Cafe', 'Luggage Valet', 'Free Wi-Fi', 'Spa Ayurveda', 'Currency Exchange'],
    checkinCount: 3450,
    weeklyCheckins: 290,
    googlePlaceId: 'ChIJz8N34_NizamCourtyard',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Nizam+Courtyard+Hyderabad',
    footfallRank: 2,
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1000&q=80',
    businessRegNumber: 'GST36AABTN5820P1Z8',
    partnershipModel: 'community_pool',
    inHouseGuideIds: [],
    guideReferralKickbackPercent: 0.05,
    roomTypes: [
      {
        id: 'nc-courtyard',
        name: 'Haveli Courtyard Room',
        pricePerNight: 4600,
        capacity: 2,
        description: 'Overlooks the century-old fragrant frangipani courtyard with handwoven rugs.',
        perks: ['Artisanal breakfast', 'Welcome saffron sherbet']
      },
      {
        id: 'nc-nawab-suite',
        name: 'Nawab Royal Pavilion',
        pricePerNight: 7200,
        capacity: 4,
        description: 'Spacious royal family suite with handcrafted brass lamps and personal butler service.',
        perks: ['Complimentary palace dinner', 'Airport transfer', 'Private guide concierge']
      }
    ]
  },
  {
    id: 'hotel-deccan-grand',
    name: 'Deccan Grand Residency',
    city: 'Hyderabad',
    address: 'Afzal Gunj, Salar Jung Bridge Rd',
    location: { lat: 17.3718, lng: 78.4778 },
    tier: 'Urban Comfort',
    pricePerNight: 2300,
    commissionRate: 0.12,
    status: 'verified',
    allowsIndependentGuides: true,
    perks: ['Next to Salar Jung Museum', '24/7 Multi-cuisine Cafe', 'Budget Traveler Favorite'],
    amenities: ['Fast Wi-Fi', 'AC Rooms', 'Tour Booking Kiosk', 'Elevator', 'Doctor on Call'],
    checkinCount: 2890,
    weeklyCheckins: 215,
    googlePlaceId: 'ChIJt9M12_DeccanGrand',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Deccan+Grand+Residency+Hyderabad',
    footfallRank: 3,
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80',
    businessRegNumber: 'GST36AACCD4431R1Z2',
    partnershipModel: 'community_pool',
    inHouseGuideIds: [],
    guideReferralKickbackPercent: 0.05,
    roomTypes: [
      {
        id: 'dg-standard',
        name: 'Executive Queen Room',
        pricePerNight: 2300,
        capacity: 2,
        description: 'Clean, modern sound-insulated room right next to the historic Musi riverfront.',
        perks: ['Free buffet breakfast', 'Express check-in']
      }
    ]
  },
  {
    id: 'hotel-fort-view',
    name: 'Fort View Palace & Suites',
    city: 'Hyderabad',
    address: 'Bada Bazaar Rd, Golconda Enclave',
    location: { lat: 17.3875, lng: 78.4050 },
    tier: 'Boutique Stay',
    pricePerNight: 3800,
    commissionRate: 0.15,
    status: 'verified',
    allowsIndependentGuides: true,
    perks: ['Direct Panorama of Golconda Fort', 'Sunset Rooftop Grill', 'Golconda Audio Tour Device Included'],
    amenities: ['Rooftop Terrace', 'Free Wi-Fi', 'Complimentary Bicycle Rentals', 'Traditional Hookah Lounge'],
    checkinCount: 3980,
    weeklyCheckins: 340,
    googlePlaceId: 'ChIJv1F55_FortViewPalace',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Fort+View+Palace+Hyderabad',
    footfallRank: 1, // #1 Most Checked-in Stay near Golconda Fort
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1000&q=80',
    businessRegNumber: 'GST36AABFV7719M1ZX',
    partnershipModel: 'hybrid',
    inHouseGuideIds: ['guide-rajesh'],
    guideReferralKickbackPercent: 0.07,
    roomTypes: [
      {
        id: 'fv-bastion',
        name: 'Bastion View Deluxe',
        pricePerNight: 3800,
        capacity: 2,
        description: 'Wake up to the sheer granite stone walls of Golconda Citadel with morning tea.',
        perks: ['Buffet breakfast', 'Binoculars provided for fort birdwatching']
      },
      {
        id: 'fv-heritage-suite',
        name: 'Sultan Qutb Shahi Suite',
        pricePerNight: 5900,
        capacity: 3,
        description: 'Luxury suite with private terrace facing the evening sound & light spectacle.',
        perks: ['Free dinner under the stars', 'VIP Fort entry pass']
      }
    ]
  },
  {
    id: 'hotel-taj-falaknuma',
    name: 'Taj Falaknuma Grand Heritage Palace',
    city: 'Hyderabad',
    address: 'Engine Bowli, Fatima Nagar, Falaknuma',
    location: { lat: 17.3314, lng: 78.4675 },
    tier: 'Heritage Luxury',
    pricePerNight: 16500,
    commissionRate: 0.18,
    status: 'verified',
    allowsIndependentGuides: true,
    perks: ['Horse Carriage Arrival', 'Royal Historian Guided Walk', '101-Seater Dining Hall Access'],
    amenities: ['Jiva Grand Spa', 'Heritage Library', 'Billiards Room', 'Fine Dining Adaa', 'Infinity Pool'],
    checkinCount: 5410,
    weeklyCheckins: 460,
    googlePlaceId: 'ChIJzX4P8_TajFalaknuma',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Taj+Falaknuma+Palace+Hyderabad',
    footfallRank: 1,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80',
    businessRegNumber: 'GST36AABTT9910Q1ZL',
    partnershipModel: 'in_house_guides',
    inHouseGuideIds: ['guide-vikram'],
    guideReferralKickbackPercent: 0.08,
    roomTypes: [
      {
        id: 'tf-palace-room',
        name: 'Palace Historical Room',
        pricePerNight: 16500,
        capacity: 2,
        description: 'Restored royal guest room with high ceilings, colonial tapestries, and city panoramas.',
        perks: ['Royal breakfast', 'High-tea at Jade Room', 'Heritage Champagne walk']
      }
    ]
  }
];

export const INITIAL_GUIDES: Guide[] = [
  {
    id: 'guide-rahul',
    name: 'Rahul Varma',
    languages: ['English', 'Hindi', 'Urdu'],
    hourlyRate: 500,
    halfDayRate: 1800,
    fullDayRate: 3200,
    photoWalkRate: 2200,
    verificationId: 'IND-TOUR-GOV-8841',
    completedToursCount: 382,
    bio: 'Post-graduate in Medieval Deccan Architecture with 8+ years guiding travelers through secret bazaars, acoustic arches, and hidden Nizam libraries.',
    specialties: ['Architectural Heritage', 'Monument Acoustics', 'Hidden Passageways', 'Historical Photography'],
    affiliatedHotelId: null, // Verified Independent Community Pool Guide
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    badgeVerified: true,
    phone: '+91 98490 12384'
  },
  {
    id: 'guide-ayesha',
    name: 'Ayesha Sultana',
    languages: ['English', 'Hindi', 'Telugu', 'Urdu'],
    hourlyRate: 600,
    halfDayRate: 2000,
    fullDayRate: 3600,
    photoWalkRate: 2400,
    verificationId: 'IND-TOUR-GOV-5512',
    completedToursCount: 445,
    bio: 'Culinary anthropologist and lifelong Old City resident. Leading award-winning food trails through Charminar night markets, artisanal lac bangle workshops, and royal recipe kitchens.',
    specialties: ['Royal Hyderabadi Cuisine', 'Old City Street Food', 'Laad Bazaar Pearls & Crafts', 'Family-Friendly Storytelling'],
    affiliatedHotelId: null, // Verified Community Pool Guide
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    badgeVerified: true,
    phone: '+91 98711 88421'
  },
  {
    id: 'guide-vikram',
    name: 'Vikram Rao (In-House Concierge Guide)',
    languages: ['English', 'Hindi', 'Telugu'],
    hourlyRate: 550,
    halfDayRate: 1900,
    fullDayRate: 3400,
    photoWalkRate: 2300,
    verificationId: 'IND-TOUR-GOV-3109',
    completedToursCount: 298,
    bio: 'Dedicated in-house heritage curator for Hotel Royal Charminar & Taj Falaknuma. Specializes in Nizami royal protocols, VIP monument bypasses, and vintage photography.',
    specialties: ['Nizami Royal Etiquette', 'Chowmahalla Dynasty Lore', 'VIP Monument Access', 'Curated Antiques'],
    affiliatedHotelId: 'hotel-royal-charminar', // Affiliated In-House Guide
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    badgeVerified: true,
    phone: '+91 99120 44920'
  },
  {
    id: 'guide-rajesh',
    name: 'Rajesh Kumar',
    languages: ['English', 'Hindi', 'French'],
    hourlyRate: 650,
    halfDayRate: 2200,
    fullDayRate: 3900,
    photoWalkRate: 2600,
    verificationId: 'IND-TOUR-GOV-9021',
    completedToursCount: 512,
    bio: 'Professional travel photographer and certified trekking guide. Master of Golconda citadel sunset frames, Golden Hour lighting, and acoustic clapping demonstrations.',
    specialties: ['Sunset & Golden Hour Photography', 'Golconda Citadel Climbs', 'Instagram Aesthetics', 'Acoustic Demonstrations'],
    affiliatedHotelId: 'hotel-fort-view', // Affiliated with Fort View Palace
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    badgeVerified: true,
    phone: '+91 94400 87319'
  }
];

export const SAMPLE_AI_PROMPTS = [
  {
    label: '🕌 Taj Mahal Heritage Stay',
    query: 'Find a verified heritage stay near Taj Mahal under 5000 with a Mughal architecture guide',
    landmarkId: 'spot-taj-mahal',
    budget: 5000,
    needGuide: true
  },
  {
    label: '🏖️ Goa Beachfront & Seafood',
    query: 'Show me top checked-in beach resort in Goa under 4500 with a coastal food guide',
    landmarkId: 'spot-goa',
    budget: 4500,
    needGuide: true
  },
  {
    label: '🏰 Jaipur Royal Haveli',
    query: 'Looking for a royal boutique stay near Hawa Mahal Jaipur with bazaar escort under 4000',
    landmarkId: 'spot-jaipur',
    budget: 4000,
    needGuide: true
  },
  {
    label: '🌊 Mumbai Gateway Harbor',
    query: 'Boutique stay near Gateway of India Mumbai with heritage architecture escort under 5500',
    landmarkId: 'spot-mumbai',
    budget: 5500,
    needGuide: true
  },
  {
    label: '🪔 Varanasi Sacred Ghats',
    query: 'Sacred riverfront stay near Dashashwamedh Ghat Varanasi with morning boat escort under 3500',
    landmarkId: 'spot-varanasi',
    budget: 3500,
    needGuide: true
  },
  {
    label: '🔥 Charminar Heritage Walk',
    query: 'Show me top checked-in stay near Charminar with heritage guide for a couple trip under 4000',
    landmarkId: 'spot-charminar',
    budget: 4000,
    needGuide: true
  }
];
