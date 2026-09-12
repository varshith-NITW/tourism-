import React, { useState } from 'react';
import { X, ShieldCheck, Check, Star, Sparkles, MapPin, Camera, Clock, UserCheck, ArrowRight } from 'lucide-react';
import { Hotel, Guide, GuidePackageType, GuidePackageOption, RoomType } from '../../types';

interface GuideAddonModalProps {
  hotel: Hotel;
  availableGuides: Guide[];
  preselectedGuide?: Guide;
  onClose: () => void;
  onProceedToCheckout: (params: {
    hotel: Hotel;
    selectedRoom: RoomType;
    nights: number;
    includeGuide: boolean;
    selectedGuide: Guide | null;
    selectedPackage: GuidePackageType;
  }) => void;
}

export const GuideAddonModal: React.FC<GuideAddonModalProps> = ({
  hotel,
  availableGuides,
  preselectedGuide,
  onClose,
  onProceedToCheckout
}) => {
  // Room state
  const [selectedRoomId, setSelectedRoomId] = useState<string>(hotel.roomTypes[0].id);
  const [nights, setNights] = useState<number>(2);

  // Guide state
  const [includeGuide, setIncludeGuide] = useState<boolean>(true);
  const [selectedGuideId, setSelectedGuideId] = useState<string>(
    preselectedGuide ? preselectedGuide.id : availableGuides[0].id
  );
  const [selectedPackage, setSelectedPackage] = useState<GuidePackageType>('half_day');

  const selectedRoom = hotel.roomTypes.find(r => r.id === selectedRoomId) || hotel.roomTypes[0];
  const selectedGuide = availableGuides.find(g => g.id === selectedGuideId) || availableGuides[0];

  // Guide packages
  const packages: GuidePackageOption[] = [
    {
      type: 'half_day',
      title: 'Half-Day Heritage & Bazaar Walk',
      duration: '4 Hours (Morning or Afternoon)',
      price: selectedGuide.halfDayRate,
      description: 'Curated historic walk through hidden monument arches, spice markets, and local tea stops.'
    },
    {
      type: 'full_day',
      title: 'Full-Day Cultural Deep Dive',
      duration: '8 Hours (Comprehensive)',
      price: selectedGuide.fullDayRate,
      description: 'Monument architecture, palace interiors, artisan workshops, and secret royal culinary spots.'
    },
    {
      type: 'photography_walk',
      title: 'Sunset Photography & Golden Hour Tour',
      duration: '3.5 Hours (Late Afternoon to Twilight)',
      price: selectedGuide.photoWalkRate,
      description: 'Specialist guide framing the best Instagram angles, secret rooftop terraces, and sunset lighting.'
    }
  ];

  const currentPackagePrice = packages.find(p => p.type === selectedPackage)?.price || selectedGuide.halfDayRate;
  const hotelTotal = selectedRoom.pricePerNight * nights;
  const grandTotal = hotelTotal + (includeGuide ? currentPackagePrice : 0);

  const handleContinue = () => {
    onProceedToCheckout({
      hotel,
      selectedRoom,
      nights,
      includeGuide,
      selectedGuide: includeGuide ? selectedGuide : null,
      selectedPackage
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Partner Stay
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">{hotel.name}</h2>
          <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
            <span className="flex items-center gap-1 text-red-400 font-bold">
              <MapPin className="w-3.5 h-3.5" />
              {hotel.checkinCount.toLocaleString()} Google Maps Check-ins
            </span>
            <span>•</span>
            <span>{hotel.address}</span>
          </div>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Step 1: Select Room & Nights */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900">
                1. Select Room Category & Stay Duration
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">Nights:</span>
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50">
                  <button
                    onClick={() => setNights(Math.max(1, nights - 1))}
                    className="px-2 py-0.5 font-bold hover:bg-slate-200 text-slate-700"
                  >
                    -
                  </button>
                  <span className="px-3 py-0.5 font-semibold text-slate-900">{nights}</span>
                  <button
                    onClick={() => setNights(nights + 1)}
                    className="px-2 py-0.5 font-bold hover:bg-slate-200 text-slate-700"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {hotel.roomTypes.map((room) => {
                const isSelected = room.id === selectedRoomId;
                return (
                  <button
                    key={room.id}
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="font-bold text-sm text-slate-900">{room.name}</div>
                      <div className="text-right font-black text-sm text-slate-900">
                        ₹{room.pricePerNight.toLocaleString()}
                        <span className="text-[10px] text-slate-400 font-normal"> / night</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{room.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {room.perks.map((p, pIdx) => (
                        <span key={pIdx} className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                          {p}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: "Pair with a Local Guide" Module */}
          <div className="border border-emerald-200 rounded-3xl p-5 bg-gradient-to-b from-emerald-50/60 to-white relative overflow-hidden">
            
            {/* Guide Toggle Switch Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900">Pair with a Certified Local Guide</h3>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      Exclusive Add-On
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Surfacing hotel concierge guides & verified community experts with real-time checkout bundling.
                  </p>
                </div>
              </div>

              {/* Master Guide Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer select-none self-end sm:self-center">
                <input
                  type="checkbox"
                  checked={includeGuide}
                  onChange={(e) => setIncludeGuide(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-2 text-xs font-bold text-slate-900">
                  {includeGuide ? 'Guide Added' : 'No Guide'}
                </span>
              </label>
            </div>

            {includeGuide ? (
              <div className="mt-4 space-y-4">
                
                {/* Guide Selection Carousel / List */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Select Guide (Affiliated Concierge & Verified Community Pool):
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableGuides.map((guide) => {
                      const isSelected = guide.id === selectedGuideId;
                      const isInHouse = hotel.inHouseGuideIds?.includes(guide.id);

                      return (
                        <button
                          key={guide.id}
                          onClick={() => setSelectedGuideId(guide.id)}
                          className={`text-left p-3 rounded-2xl border transition-all cursor-pointer relative ${
                            isSelected
                              ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 shadow-xs'
                              : 'border-slate-200/80 bg-white/70 hover:bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={guide.avatar}
                              alt={guide.name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-slate-900 truncate">
                                  {guide.name}
                                </span>
                                {isInHouse && (
                                  <span className="text-[9px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.2 rounded">
                                    Hotel Concierge
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {guide.specialties[0]}
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-600">
                                <span className="font-semibold text-emerald-700">
                                  ✓ {guide.completedToursCount}+ tours
                                </span>
                                <span>•</span>
                                <span className="truncate">{guide.languages.slice(0, 2).join(', ')}</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Package Options */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Choose Tour Package & Duration:
                  </label>
                  <div className="space-y-2">
                    {packages.map((pkg) => {
                      const isSelected = pkg.type === selectedPackage;
                      return (
                        <button
                          key={pkg.type}
                          onClick={() => setSelectedPackage(pkg.type)}
                          className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'border-emerald-600 bg-white shadow-xs'
                              : 'border-slate-200 bg-slate-50/60 hover:bg-white'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">{pkg.title}</span>
                              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.2 rounded-md">
                                {pkg.duration}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500">{pkg.description}</p>
                          </div>
                          <div className="text-right pl-4 shrink-0">
                            <div className="font-black text-sm text-emerald-700">
                              +₹{pkg.price.toLocaleString()}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            ) : (
              <div className="mt-4 p-4 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-xs text-slate-500">
                Guide add-on disabled. You can still add a guide later directly from your booking summary.
              </div>
            )}

          </div>

        </div>

        {/* Modal Footer with Live Price, Direct Discount & Razorpay Checkout CTA */}
        <div className="bg-slate-50 border-t border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-500">
              Total Package ({nights} night{nights > 1 ? 's' : ''} {includeGuide ? '+ Local Guide Bundle' : 'stay'})
            </div>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="line-through text-slate-400 text-sm font-semibold">
                ₹{grandTotal.toLocaleString()}
              </span>
              <span className="text-2xl font-black text-emerald-700">
                ₹{Math.round(grandTotal * (includeGuide ? 0.80 : 0.85)).toLocaleString()}
              </span>
              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                {includeGuide ? '20% Bundle Discount' : '15% Direct Discount'}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              You save ₹{Math.round(grandTotal * (includeGuide ? 0.20 : 0.15)).toLocaleString()} by booking on our website!
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleContinue}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Proceed to Razorpay Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
