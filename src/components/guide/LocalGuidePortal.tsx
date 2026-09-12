import React, { useState } from 'react';
import { Guide, Booking, Hotel } from '../../types';
import { ShieldCheck, Award, Calendar, DollarSign, Clock, MapPin, CheckCircle2, UserCheck, Plus } from 'lucide-react';

interface LocalGuidePortalProps {
  guides: Guide[];
  hotels: Hotel[];
  bookings: Booking[];
  onUpdateGuidePackages: (updatedGuide: Guide) => void;
  onRegisterNewGuide: (newGuide: Guide) => void;
}

export const LocalGuidePortal: React.FC<LocalGuidePortalProps> = ({
  guides,
  hotels,
  bookings,
  onUpdateGuidePackages,
  onRegisterNewGuide
}) => {
  const [selectedGuideId, setSelectedGuideId] = useState<string>(guides[0]?.id || '');
  const [showRegisterModal, setShowRegisterModal] = useState<boolean>(false);

  // New Guide Registration Form State
  const [newName, setNewName] = useState<string>('');
  const [newLanguages, setNewLanguages] = useState<string>('English, Telugu, Hindi');
  const [newSpecialty, setNewSpecialty] = useState<string>('Heritage Monuments & Secret Courtyards');
  const [newLicense, setNewLicense] = useState<string>('IND-TOUR-GOV-9921');
  const [newHalfDay, setNewHalfDay] = useState<number>(1800);
  const [newFullDay, setNewFullDay] = useState<number>(3200);
  const [newPhoto, setNewPhoto] = useState<number>(2200);

  const activeGuide = guides.find(g => g.id === selectedGuideId) || guides[0];

  // Guide Bookings & Earnings
  const guideBookings = bookings.filter(b => b.guideId === activeGuide.id);
  const grossEarned = guideBookings.reduce((sum, b) => sum + b.splitBreakdown.guideGross, 0);
  const netTakeHome = guideBookings.reduce((sum, b) => sum + b.splitBreakdown.guideNet, 0);
  const platformFeesPaid = guideBookings.reduce((sum, b) => sum + b.splitBreakdown.guidePlatformCut, 0);
  const hotelReferralShared = guideBookings.reduce((sum, b) => sum + b.splitBreakdown.hotelReferralKickback, 0);

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newGuide: Guide = {
      id: `guide-${Date.now()}`,
      name: newName || 'Pooja Reddy',
      languages: newLanguages.split(',').map(s => s.trim()),
      hourlyRate: 500,
      halfDayRate: newHalfDay,
      fullDayRate: newFullDay,
      photoWalkRate: newPhoto,
      verificationId: newLicense || 'IND-TOUR-GOV-7712',
      completedToursCount: 142,
      bio: `Certified Telangana Tourism Ambassador specializing in ${newSpecialty}.`,
      specialties: [newSpecialty, 'Historic Storytelling', 'Street Market Navigation'],
      affiliatedHotelId: null, // Community pool
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      badgeVerified: true,
      phone: '+91 98491 22910'
    };

    onRegisterNewGuide(newGuide);
    setSelectedGuideId(newGuide.id);
    setShowRegisterModal(false);
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Certified Local Guide Portal</h1>
            <span className="text-xs bg-amber-50 text-amber-800 font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
              Verified Tourism Guild
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage your package pricing, accept direct or hotel-bundled bookings, and review automated payout routing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Guide Selector */}
          <select
            value={selectedGuideId}
            onChange={(e) => setSelectedGuideId(e.target.value)}
            className="text-xs font-bold text-slate-900 bg-slate-100 px-3 py-2 rounded-xl border-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            {guides.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.affiliatedHotelId ? 'Hotel Concierge' : 'Community Pool'})
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowRegisterModal(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Join Guide Guild</span>
          </button>
        </div>
      </div>

      {/* Guide Profile Snapshot Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col sm:flex-row items-center gap-6">
        <img
          src={activeGuide.avatar}
          alt={activeGuide.name}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
        />
        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h2 className="text-xl sm:text-2xl font-extrabold">{activeGuide.name}</h2>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified ID: {activeGuide.verificationId}
            </span>
            {activeGuide.affiliatedHotelId ? (
              <span className="text-[11px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-400/30">
                Exclusive Hotel Concierge
              </span>
            ) : (
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                TourMatch Verified Community Pool
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            {activeGuide.bio}
          </p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs">
            <span className="bg-white/10 px-2.5 py-1 rounded-lg text-slate-200">
              🗣️ Languages: <span className="font-semibold text-white">{activeGuide.languages.join(', ')}</span>
            </span>
            <span className="bg-white/10 px-2.5 py-1 rounded-lg text-slate-200">
              🏛️ Focus: <span className="font-semibold text-white">{activeGuide.specialties[0]}</span>
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg font-bold border border-emerald-500/30">
              ✓ {activeGuide.completedToursCount}+ Completed Tours
            </span>
          </div>
        </div>
      </div>

      {/* Guide Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">Gross Tour Billings</div>
          <div className="text-xl font-black text-slate-900 mt-2">
            ₹{grossEarned.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Across {guideBookings.length} routed booking{guideBookings.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">Net Guide Take-Home</div>
          <div className="text-xl font-black text-emerald-700 mt-2">
            ₹{netTakeHome.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Deposited directly to your bank account
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">Hotel Referral Shared</div>
          <div className="text-xl font-black text-indigo-700 mt-2">
            ₹{hotelReferralShared.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            5% fee for hotel partner lead generation
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500">Platform Maintenance Fee</div>
          <div className="text-xl font-black text-slate-700 mt-2">
            ₹{platformFeesPaid.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            10% booking processing & insurance cut
          </div>
        </div>
      </div>

      {/* Tour Packages Configurator & Live Routed Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Package Rates Manager */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">Configured Tour Packages</h3>
            <span className="text-xs text-emerald-700 font-bold">Active in Catalog</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
              <div>
                <div className="font-bold text-slate-900">Half-Day Heritage Walk</div>
                <div className="text-slate-500 text-[11px]">4 hours • Monument focus</div>
              </div>
              <div className="font-black text-slate-900 text-sm">
                ₹{activeGuide.halfDayRate.toLocaleString()}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
              <div>
                <div className="font-bold text-slate-900">Full-Day Cultural Deep Dive</div>
                <div className="text-slate-500 text-[11px]">8 hours • Palace + food trail</div>
              </div>
              <div className="font-black text-slate-900 text-sm">
                ₹{activeGuide.fullDayRate.toLocaleString()}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
              <div>
                <div className="font-bold text-slate-900">Sunset Photo Tour</div>
                <div className="text-slate-500 text-[11px]">3.5 hours • Golden hour angles</div>
              </div>
              <div className="font-black text-slate-900 text-sm">
                ₹{activeGuide.photoWalkRate.toLocaleString()}
              </div>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900">
            🛡️ Certified guides maintain a 98% satisfaction rating across the TourMatch verified partner network.
          </div>
        </div>

        {/* Incoming & Routed Bookings Feed */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-900">
              Routed Tour Requests (Direct & Hotel Partner Bundles)
            </h3>
            <span className="text-xs text-slate-400 font-medium">{guideBookings.length} total</span>
          </div>

          {guideBookings.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300 text-xs text-slate-500">
              No tour requests assigned to {activeGuide.name} yet. Complete a checkout in Traveler view to trigger a live routed tour request!
            </div>
          ) : (
            <div className="space-y-3">
              {guideBookings.map((b) => (
                <div key={b.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{b.guidePackageTitle}</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.2 rounded-full">
                        Routed via Partner Hotel
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400">Net Take-Home: </span>
                      <span className="font-extrabold text-emerald-800 text-sm">
                        ₹{b.splitBreakdown.guideNet.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-slate-600 text-[11px] pt-1 border-t border-slate-200">
                    <span>🏨 Partner Hotel: <strong className="text-slate-800">{b.hotelName}</strong></span>
                    <span>•</span>
                    <span>📍 Meeting Point: <strong className="text-slate-800">{b.meetingPointInfo || 'Hotel Concierge'}</strong></span>
                    <span>•</span>
                    <span>Booking Ref: <strong className="font-mono text-indigo-700">{b.id}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Guide Registration Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <h3 className="font-bold text-lg text-slate-900">Register as a Certified Guide</h3>
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Pooja Reddy"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tourism Dept License / Verification ID</label>
                <input
                  type="text"
                  required
                  value={newLicense}
                  onChange={(e) => setNewLicense(e.target.value)}
                  placeholder="IND-TOUR-GOV-9921"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-600 font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Languages (comma separated)</label>
                <input
                  type="text"
                  value={newLanguages}
                  onChange={(e) => setNewLanguages(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Primary Specialty</label>
                <input
                  type="text"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  placeholder="e.g. Architecture, Food, Sunset Photography"
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Half-Day (₹)</label>
                  <input
                    type="number"
                    value={newHalfDay}
                    onChange={(e) => setNewHalfDay(parseInt(e.target.value, 10))}
                    className="w-full p-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Full-Day (₹)</label>
                  <input
                    type="number"
                    value={newFullDay}
                    onChange={(e) => setNewFullDay(parseInt(e.target.value, 10))}
                    className="w-full p-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Photo Tour (₹)</label>
                  <input
                    type="number"
                    value={newPhoto}
                    onChange={(e) => setNewPhoto(parseInt(e.target.value, 10))}
                    className="w-full p-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md shadow-amber-600/20"
                >
                  Verify & Join
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
