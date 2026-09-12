import React, { useState } from 'react';
import { Hotel, Guide, Booking, RoomType } from '../../types';
import { ShieldCheck, Plus, DollarSign, Users, CheckCircle2, Building, Sparkles, MapPin, TrendingUp, AlertCircle } from 'lucide-react';

interface HotelPartnerPortalProps {
  hotels: Hotel[];
  guides: Guide[];
  bookings: Booking[];
  onRegisterNewHotel: (newHotel: Hotel) => void;
}

export const HotelPartnerPortal: React.FC<HotelPartnerPortalProps> = ({
  hotels,
  guides,
  bookings,
  onRegisterNewHotel
}) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'onboarding'>('dashboard');
  const [selectedHotelId, setSelectedHotelId] = useState<string>(hotels[0]?.id || '');

  // Onboarding Form State
  const [step, setStep] = useState<number>(1);
  const [propName, setPropName] = useState<string>('');
  const [gstId, setGstId] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [tier, setTier] = useState<Hotel['tier']>('Boutique Stay');
  const [basePrice, setBasePrice] = useState<number>(3500);
  const [partnershipModel, setPartnershipModel] = useState<'in_house_guides' | 'community_pool'>('community_pool');
  const [inHouseGuideName, setInHouseGuideName] = useState<string>('');
  const [inHouseGuideLicense, setInHouseGuideLicense] = useState<string>('');
  const [referralRate, setReferralRate] = useState<number>(5);
  const [onboardSuccess, setOnboardSuccess] = useState<boolean>(false);

  const activeHotel = hotels.find(h => h.id === selectedHotelId) || hotels[0];

  // Hotel Financial Metrics from confirmed bookings
  const hotelBookings = bookings.filter(b => b.hotelId === activeHotel.id);
  const grossRoomSales = hotelBookings.reduce((sum, b) => sum + b.splitBreakdown.hotelGross, 0);
  const netHotelPayout = hotelBookings.reduce((sum, b) => sum + b.splitBreakdown.hotelNet, 0);
  const guideReferralEarned = hotelBookings.reduce((sum, b) => sum + b.splitBreakdown.hotelReferralKickback, 0);
  const totalReceived = netHotelPayout + guideReferralEarned;

  const handleCompleteOnboarding = (e: React.FormEvent) => {
    e.preventDefault();

    const newHotel: Hotel = {
      id: `hotel-custom-${Date.now()}`,
      name: propName || 'Heritage Nizam Haveli',
      city: 'Hyderabad',
      address: address || 'Mughalpura, Near Charminar',
      location: { lat: 17.3625, lng: 78.4720 },
      tier,
      pricePerNight: basePrice,
      commissionRate: 0.15,
      status: 'verified',
      allowsIndependentGuides: partnershipModel === 'community_pool',
      perks: ['Complimentary Heritage High-Tea', 'Early Check-in Priority', 'Free Monument Pass'],
      amenities: ['Free Wi-Fi', 'Air Conditioning', 'Traditional Courtyard', 'Valet'],
      checkinCount: 1450, // Simulated Google Maps initial check-ins
      weeklyCheckins: 110,
      googlePlaceId: `ChIJ_${propName.replace(/\s+/g, '_')}`,
      googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(propName || 'Hotel')}`,
      footfallRank: hotels.length + 1,
      image: 'https://images.unsplash.com/photo-1596436889106-be35e843f974?auto=format&fit=crop&w=1000&q=80',
      businessRegNumber: gstId || 'GST36AAACT8819Z1Z5',
      partnershipModel,
      inHouseGuideIds: partnershipModel === 'in_house_guides' ? ['guide-vikram'] : [],
      guideReferralKickbackPercent: referralRate / 100,
      roomTypes: [
        {
          id: `rt-${Date.now()}-1`,
          name: 'Classic Heritage Deluxe',
          pricePerNight: basePrice,
          capacity: 2,
          description: 'Restored vintage suite with hand-carved jharokhas and marble bathroom.',
          perks: ['Breakfast included', 'Free Wi-Fi']
        },
        {
          id: `rt-${Date.now()}-2`,
          name: 'Nawab Terrace Suite',
          pricePerNight: basePrice * 1.6,
          capacity: 3,
          description: 'Spacious balcony overlooking the historical skyline.',
          perks: ['Breakfast & High-tea', 'Monument pass']
        }
      ]
    };

    onRegisterNewHotel(newHotel);
    setSelectedHotelId(newHotel.id);
    setOnboardSuccess(true);
    setTimeout(() => {
      setOnboardSuccess(false);
      setActiveTab('dashboard');
      setStep(1);
    }, 1800);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Header & Sub-nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Hotel Partner Portal</h1>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
              Verified Properties
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage inventory, configure local guide collaboration models, and monitor multi-party payout settlements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Partner Dashboard
          </button>
          <button
            onClick={() => setActiveTab('onboarding')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'onboarding'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Self-Onboard Property</span>
          </button>
        </div>
      </div>

      {activeTab === 'onboarding' ? (
        /* Multi-step Onboarding Flow (Spec Requirement) */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-3xl mx-auto shadow-sm">
          
          <div className="mb-6">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Step {step} of 2</span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">
              {step === 1 ? 'Business Verification & Property Details' : 'Guide Collaboration & Commission Setup'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {step === 1 
                ? 'Provide your tourism tax ID and property details to pass the zero-hallucination verification.'
                : 'Select how travelers will bundle certified guides with their stay at your hotel.'}
            </p>
          </div>

          {onboardSuccess ? (
            <div className="py-12 text-center bg-emerald-50 rounded-2xl border border-emerald-200 animate-in zoom-in-95">
              <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-slate-900">Hotel Verified & Listed!</h3>
              <p className="text-xs text-slate-600 mt-1">
                Your property is now live in the spatial radar and AI recommendation engine.
              </p>
            </div>
          ) : (
            <form onSubmit={step === 1 ? (e) => { e.preventDefault(); setStep(2); } : handleCompleteOnboarding} className="space-y-5">
              
              {step === 1 ? (
                /* Step 1 Fields */
                <>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Property Name *</label>
                    <input
                      type="text"
                      required
                      value={propName}
                      onChange={(e) => setPropName(e.target.value)}
                      placeholder="e.g. Haveli Heritage Suites Old City"
                      className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">GST / Tourism Tax ID *</label>
                      <input
                        type="text"
                        required
                        value={gstId}
                        onChange={(e) => setGstId(e.target.value)}
                        placeholder="GST36AABCR1029K1Z4"
                        className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-600 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Property Tier</label>
                      <select
                        value={tier}
                        onChange={(e) => setTier(e.target.value as any)}
                        className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-600"
                      >
                        <option value="Boutique Stay">Boutique Stay</option>
                        <option value="Heritage Luxury">Heritage Luxury</option>
                        <option value="Urban Comfort">Urban Comfort</option>
                        <option value="Cultural Retreat">Cultural Retreat</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Location Address & Proximity to Attractions *</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="e.g. Near Mecca Masjid, Charminar Rd (400m from monument)"
                      className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Starting Room Price / Night (₹) *</label>
                    <input
                      type="number"
                      required
                      min={1000}
                      value={basePrice}
                      onChange={(e) => setBasePrice(parseInt(e.target.value, 10))}
                      className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-600 font-semibold"
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer"
                    >
                      Continue to Guide Collaboration Step →
                    </button>
                  </div>
                </>
              ) : (
                /* Step 2: Guide Collaboration Configuration (Spec Requirement) */
                <>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-800">
                      Select Guide Collaboration Option:
                    </label>

                    {/* Option A: In-House Guide Enrollment */}
                    <div
                      onClick={() => setPartnershipModel('in_house_guides')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        partnershipModel === 'in_house_guides'
                          ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="guide_opt"
                            checked={partnershipModel === 'in_house_guides'}
                            onChange={() => setPartnershipModel('in_house_guides')}
                            className="text-indigo-600"
                          />
                          <span className="font-extrabold text-xs text-slate-900">
                            Option A: In-House Guide Enrollment
                          </span>
                        </div>
                        <span className="text-[10px] bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded">
                          Concierge Exclusive
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-2 pl-6">
                        Register and verify your hotel's dedicated concierge guides. Only your in-house guides will be paired with bookings at your property.
                      </p>

                      {partnershipModel === 'in_house_guides' && (
                        <div className="mt-3 pl-6 pt-3 border-t border-indigo-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Lead Concierge / Guide Name"
                            value={inHouseGuideName}
                            onChange={(e) => setInHouseGuideName(e.target.value)}
                            className="text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
                          />
                          <input
                            type="text"
                            placeholder="Guide License ID (e.g. IND-TOUR-3109)"
                            value={inHouseGuideLicense}
                            onChange={(e) => setInHouseGuideLicense(e.target.value)}
                            className="text-xs p-2.5 rounded-lg border border-slate-300 bg-white font-mono"
                          />
                        </div>
                      )}
                    </div>

                    {/* Option B: Community Guide Matching */}
                    <div
                      onClick={() => setPartnershipModel('community_pool')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        partnershipModel === 'community_pool'
                          ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="guide_opt"
                            checked={partnershipModel === 'community_pool'}
                            onChange={() => setPartnershipModel('community_pool')}
                            className="text-emerald-600"
                          />
                          <span className="font-extrabold text-xs text-slate-900">
                            Option B: Community Guide Matching (Recommended)
                          </span>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded">
                          High Availability
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-2 pl-6">
                        Opt into TourMatch's verified local guide pool. Travelers bundling community guides with their stay earn your hotel an affiliate referral fee on every guide booked!
                      </p>
                    </div>
                  </div>

                  {/* Referral Rev-Share Slider */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex justify-between text-xs font-bold text-slate-900">
                      <span>Hotel Referral Kickback Rate on Guide Bundles:</span>
                      <span className="text-emerald-700 font-black">{referralRate}%</span>
                    </div>
                    <input
                      type="range"
                      min={3}
                      max={10}
                      step={1}
                      value={referralRate}
                      onChange={(e) => setReferralRate(parseInt(e.target.value, 10))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>3% Standard</span>
                      <span>5% Default (Optimal)</span>
                      <span>10% Max Partner Cap</span>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
                    >
                      ← Back to Details
                    </button>
                    <button
                      type="submit"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer"
                    >
                      Verify & Activate Listing
                    </button>
                  </div>
                </>
              )}

            </form>
          )}

        </div>
      ) : (
        /* Hotel Dashboard & Financial Ledger */
        <div className="space-y-6">
          
          {/* Property Selector */}
          <div className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-600">Managing Property:</span>
            <select
              value={selectedHotelId}
              onChange={(e) => setSelectedHotelId(e.target.value)}
              className="text-xs font-bold text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {hotels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.tier})
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-400 ml-auto hidden sm:inline">
              GST ID: <span className="font-mono text-slate-600">{activeHotel.businessRegNumber}</span>
            </span>
          </div>

          {/* Revenue & Referral Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Room Gross Sales</span>
                <Building className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-xl font-black text-slate-900 mt-2">
                ₹{grossRoomSales.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                From {hotelBookings.length} confirmed stay{hotelBookings.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Hotel Net Payout</span>
                <DollarSign className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-black text-emerald-700 mt-2">
                ₹{netHotelPayout.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                Net after 15% platform commission
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-200 shadow-xs">
              <div className="flex items-center justify-between text-emerald-800 text-xs font-bold">
                <span>Guide Referral Bonus</span>
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-xl font-black text-emerald-800 mt-2">
                ₹{guideReferralEarned.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-600 mt-1">
                {activeHotel.guideReferralKickbackPercent * 100}% kickback on bundled guides
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Google Maps Footfall</span>
                <TrendingUp className="w-4 h-4 text-red-600" />
              </div>
              <div className="text-xl font-black text-red-600 mt-2">
                {activeHotel.checkinCount.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                #{activeHotel.footfallRank} in check-in density ranking
              </div>
            </div>

          </div>

          {/* Guide Collaboration Status & Tied-in Guides */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Guide Partnership Configuration Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">Guide Collaboration Settings</h3>
                <span className="text-[10px] font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {activeHotel.partnershipModel === 'in_house_guides' ? 'In-House Concierge' : 'Community Pool'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Collaboration Mode:</span>
                  <span className="font-semibold text-slate-900">
                    {activeHotel.partnershipModel === 'in_house_guides' ? 'Concierge Guided' : 'Opted-In to Community Pool'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Referral Commission Rate:</span>
                  <span className="font-bold text-emerald-700">
                    {(activeHotel.guideReferralKickbackPercent * 100).toFixed(0)}% per guide booking
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Allows Independent Guides:</span>
                  <span className="font-semibold text-slate-900">
                    {activeHotel.allowsIndependentGuides ? 'Yes (Opted In)' : 'No (In-house only)'}
                  </span>
                </div>
              </div>

              <div className="text-xs text-slate-500">
                💡 <span className="font-medium">Pro-Tip:</span> Partner hotels with community guide matching enabled experience 32% higher bundle checkout rates.
              </div>
            </div>

            {/* Active Bookings & Split Settlements Table */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">Recent Bookings & Multi-Party Settlements</h3>
                <span className="text-xs text-slate-400 font-medium">{hotelBookings.length} total</span>
              </div>

              {hotelBookings.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-xs text-slate-500">
                  No confirmed bookings yet. Switch to the Traveler view to test a booking and watch the split settlement reflect here in real-time!
                </div>
              ) : (
                <div className="space-y-3">
                  {hotelBookings.map((b) => (
                    <div key={b.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-indigo-700">{b.id}</span>
                          <span className="text-slate-400">•</span>
                          <span className="font-semibold text-slate-900">{b.roomTypeName}</span>
                          <span className="text-slate-500">({b.dates.nights} Nights)</span>
                        </div>
                        {b.guideName && (
                          <div className="text-emerald-700 font-medium mt-0.5">
                            ✓ Bundled Guide: {b.guideName} (+₹{b.splitBreakdown.hotelReferralKickback} referral earned)
                          </div>
                        )}
                      </div>

                      <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4">
                        <div className="text-[11px] text-slate-500">Hotel Net Payout</div>
                        <div className="font-bold text-emerald-800 text-sm">
                          ₹{(b.splitBreakdown.hotelNet + b.splitBreakdown.hotelReferralKickback).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
