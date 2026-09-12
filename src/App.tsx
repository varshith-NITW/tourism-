import React, { useState } from 'react';
import { PersonaType, Navbar } from './components/Navbar';
import { TouristSpot, Hotel, Guide, Booking, RoomType, GuidePackageType } from './types';
import { INITIAL_TOURIST_SPOTS, INITIAL_HOTELS, INITIAL_GUIDES } from './data/mockData';
import { TravelerHome } from './components/traveler/TravelerHome';
import { GuideAddonModal } from './components/traveler/GuideAddonModal';
import { CheckoutModal } from './components/traveler/CheckoutModal';
import { HotelPartnerPortal } from './components/hotel/HotelPartnerPortal';
import { LocalGuidePortal } from './components/guide/LocalGuidePortal';
import { SplitPaymentSimulator } from './components/split/SplitPaymentSimulator';
import { calculateSplitBreakdown } from './services/paymentSplitService';
import { ApiSettingsModal } from './components/common/ApiSettingsModal';
import { createBookingViaNodeAPI } from './services/apiClient';

export function App() {
  const [currentPersona, setCurrentPersona] = useState<PersonaType>('traveler');
  const [isApiSettingsOpen, setIsApiSettingsOpen] = useState<boolean>(false);
  const [spots] = useState<TouristSpot[]>(INITIAL_TOURIST_SPOTS);
  const [hotels, setHotels] = useState<Hotel[]>(INITIAL_HOTELS);
  const [guides, setGuides] = useState<Guide[]>(INITIAL_GUIDES);

  // Initial seed booking to populate hotel and guide portals immediately
  const initialBookingSplit = calculateSplitBreakdown({
    hotel: INITIAL_HOTELS[0],
    nights: 2,
    selectedRoomPrice: INITIAL_HOTELS[0].pricePerNight,
    guide: INITIAL_GUIDES[2],
    guidePackageType: 'half_day'
  });

  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: 'BK-781920',
      userId: 'user-demo-1',
      hotelId: INITIAL_HOTELS[0].id,
      hotelName: INITIAL_HOTELS[0].name,
      roomTypeId: 'rc-deluxe',
      roomTypeName: 'Heritage Deluxe Room',
      dates: {
        checkIn: '2026-09-15',
        checkOut: '2026-09-17',
        nights: 2
      },
      guests: 2,
      guideId: INITIAL_GUIDES[2].id,
      guideName: INITIAL_GUIDES[2].name,
      guidePackageType: 'half_day',
      guidePackageTitle: 'Half-Day Heritage & Bazaar Walk (4 Hours)',
      totalAmount: initialBookingSplit.totalCharged,
      splitBreakdown: initialBookingSplit,
      status: 'confirmed',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      meetingPointInfo: 'Hotel Concierge Desk at 09:30 AM'
    }
  ]);

  // Modal flow states
  const [activeGuideAddonHotel, setActiveGuideAddonHotel] = useState<Hotel | null>(null);
  const [activePreselectedGuide, setActivePreselectedGuide] = useState<Guide | undefined>(undefined);
  const [checkoutModalData, setCheckoutModalData] = useState<{
    hotel: Hotel;
    selectedRoom: RoomType;
    nights: number;
    includeGuide: boolean;
    selectedGuide: Guide | null;
    selectedPackage: GuidePackageType;
  } | null>(null);

  // Handlers
  const handleSelectHotelForBooking = (hotel: Hotel, matchedGuide?: Guide) => {
    setActiveGuideAddonHotel(hotel);
    setActivePreselectedGuide(matchedGuide);
  };

  const handleProceedToCheckoutFromAddon = (params: {
    hotel: Hotel;
    selectedRoom: RoomType;
    nights: number;
    includeGuide: boolean;
    selectedGuide: Guide | null;
    selectedPackage: GuidePackageType;
  }) => {
    setActiveGuideAddonHotel(null);
    setCheckoutModalData(params);
  };

  const handleBookingConfirmed = (newBooking: Booking) => {
    setBookings((prev) => [newBooking, ...prev]);
    // Asynchronously synchronize booking record with backend Node.js API Gateway
    createBookingViaNodeAPI({
      hotelId: newBooking.hotelId,
      hotelName: newBooking.hotelName,
      roomName: newBooking.roomTypeName,
      nights: newBooking.dates.nights,
      roomPrice: newBooking.totalAmount,
      guideId: newBooking.guideId,
      guideName: newBooking.guideName,
      guidePackageTitle: newBooking.guidePackageTitle
    }).catch((err) => console.info('Booking API background sync:', err.message));
  };

  const handleRegisterNewHotel = (newHotel: Hotel) => {
    setHotels((prev) => [newHotel, ...prev]);
  };

  const handleRegisterNewGuide = (newGuide: Guide) => {
    setGuides((prev) => [newGuide, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* Top Global Navbar with Persona Switcher */}
      <Navbar
        currentPersona={currentPersona}
        onSelectPersona={(persona) => setCurrentPersona(persona)}
        bookingCount={bookings.length}
        onOpenApiSettings={() => setIsApiSettingsOpen(true)}
      />

      {/* Main Persona View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {currentPersona === 'traveler' && (
          <TravelerHome
            spots={spots}
            hotels={hotels}
            guides={guides}
            onSelectHotelForBooking={handleSelectHotelForBooking}
          />
        )}

        {currentPersona === 'hotel' && (
          <HotelPartnerPortal
            hotels={hotels}
            guides={guides}
            bookings={bookings}
            onRegisterNewHotel={handleRegisterNewHotel}
          />
        )}

        {currentPersona === 'guide' && (
          <LocalGuidePortal
            guides={guides}
            hotels={hotels}
            bookings={bookings}
            onUpdateGuidePackages={() => {}}
            onRegisterNewGuide={handleRegisterNewGuide}
          />
        )}

        {currentPersona === 'split' && (
          <SplitPaymentSimulator />
        )}

      </main>

      {/* Step 1: Customize Stay & Pair with Local Guide Modal */}
      {activeGuideAddonHotel && (
        <GuideAddonModal
          hotel={activeGuideAddonHotel}
          availableGuides={guides}
          preselectedGuide={activePreselectedGuide}
          onClose={() => setActiveGuideAddonHotel(null)}
          onProceedToCheckout={handleProceedToCheckoutFromAddon}
        />
      )}

      {/* Step 2: Unified Checkout Modal with Real-time Split Breakdown */}
      {checkoutModalData && (
        <CheckoutModal
          hotel={checkoutModalData.hotel}
          selectedRoom={checkoutModalData.selectedRoom}
          nights={checkoutModalData.nights}
          initialIncludeGuide={checkoutModalData.includeGuide}
          selectedGuide={checkoutModalData.selectedGuide}
          selectedPackage={checkoutModalData.selectedPackage}
          onClose={() => setCheckoutModalData(null)}
          onBookingConfirmed={handleBookingConfirmed}
        />
      )}

      {/* In-App Safe API Key & Engine Settings Modal */}
      <ApiSettingsModal
        isOpen={isApiSettingsOpen}
        onClose={() => setIsApiSettingsOpen(false)}
      />

      {/* Persistent Dark Footer */}
      <footer className="mt-auto border-t border-slate-800/90 bg-slate-900/95 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">TourMatch AI Ecosystem Prototype</span>
            <span>•</span>
            <span>Spatial Geo-Radius (PostGIS ST_DWithin)</span>
            <span>•</span>
            <span className="text-rose-400 font-semibold">Google Maps Check-in Ranked</span>
          </div>
          <div>
            Powered by Automated Multi-Party Payout Routing (Platform • Hotel • Guide)
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
