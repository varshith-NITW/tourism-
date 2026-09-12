import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, DollarSign, Calendar, MapPin, Sparkles, UserCheck, ArrowRight, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Hotel, Guide, RoomType, GuidePackageType, Booking, SplitBreakdown } from '../../types';
import { calculateSplitBreakdown } from '../../services/paymentSplitService';

interface CheckoutModalProps {
  hotel: Hotel;
  selectedRoom: RoomType;
  nights: number;
  initialIncludeGuide: boolean;
  selectedGuide: Guide | null;
  selectedPackage: GuidePackageType;
  onClose: () => void;
  onBookingConfirmed: (booking: Booking) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  hotel,
  selectedRoom,
  nights,
  initialIncludeGuide,
  selectedGuide,
  selectedPackage,
  onClose,
  onBookingConfirmed
}) => {
  const [includeGuide, setIncludeGuide] = useState<boolean>(initialIncludeGuide && !!selectedGuide);
  const [guestName, setGuestName] = useState<string>('Varshith Sharma');
  const [guestPhone, setGuestPhone] = useState<string>('+91 98490 00000');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [showSplitDetails, setShowSplitDetails] = useState<boolean>(true);

  // Calculate live multi-party split breakdown based on toggle state
  const split: SplitBreakdown = calculateSplitBreakdown({
    hotel,
    nights,
    selectedRoomPrice: selectedRoom.pricePerNight,
    guide: includeGuide ? selectedGuide : null,
    guidePackageType: includeGuide ? selectedPackage : null
  });

  const getPackageTitle = (type: GuidePackageType) => {
    switch (type) {
      case 'half_day': return 'Half-Day Heritage & Bazaar Walk (4 Hours)';
      case 'full_day': return 'Full-Day Cultural Deep Dive (8 Hours)';
      case 'photography_walk': return 'Sunset Photography Tour (3.5 Hours)';
      default: return 'Certified Guide Tour';
    }
  };

  const handlePayNow = () => {
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);

      const booking: Booking = {
        id: `BK-${Date.now().toString().slice(-6)}`,
        userId: 'user-varshith-1',
        hotelId: hotel.id,
        hotelName: hotel.name,
        roomTypeId: selectedRoom.id,
        roomTypeName: selectedRoom.name,
        dates: {
          checkIn: '2026-09-14',
          checkOut: '2026-09-16',
          nights
        },
        guests: 2,
        guideId: includeGuide && selectedGuide ? selectedGuide.id : null,
        guideName: includeGuide && selectedGuide ? selectedGuide.name : null,
        guidePackageType: includeGuide ? selectedPackage : null,
        guidePackageTitle: includeGuide ? getPackageTitle(selectedPackage) : null,
        totalAmount: split.totalCharged,
        splitBreakdown: split,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        meetingPointInfo: includeGuide && selectedGuide 
          ? `Hotel Lobby Concierge Desk at ${hotel.name} (09:30 AM)`
          : undefined
      };

      setConfirmedBooking(booking);
      onBookingConfirmed(booking);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
          {!confirmedBooking && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Unified Checkout & Automated Split Settlement
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">
            {confirmedBooking ? '🎉 Booking Confirmed & Split Settled!' : 'Confirm Reservation & Payment'}
          </h2>
        </div>

        {confirmedBooking ? (
          /* Booking Confirmation & Receipt Screen */
          <div className="p-6 space-y-6">
            <div className="text-center py-4 bg-emerald-50 rounded-2xl border border-emerald-200">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
              <h3 className="text-lg font-bold text-slate-900">Payment Processed Successfully</h3>
              <p className="text-xs text-slate-600 mt-1">
                Booking ID: <span className="font-mono font-bold text-emerald-800">{confirmedBooking.id}</span>
              </p>
            </div>

            {/* Receipt Summary */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Hotel Property:</span>
                <span className="font-bold text-slate-900">{hotel.name}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Room & Duration:</span>
                <span className="font-semibold text-slate-800">{selectedRoom.name} ({nights} Nights)</span>
              </div>
              {confirmedBooking.guideName && (
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Bundled Certified Guide:</span>
                  <span className="font-bold text-emerald-700">
                    {confirmedBooking.guideName} ({confirmedBooking.guidePackageTitle})
                  </span>
                </div>
              )}
              {confirmedBooking.meetingPointInfo && (
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Guide Meeting Point:</span>
                  <span className="font-medium text-slate-800">{confirmedBooking.meetingPointInfo}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 text-sm font-black">
                <span className="text-slate-900">Total Paid (Unified Checkout):</span>
                <span className="text-emerald-700">₹{confirmedBooking.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Split Settlement Record */}
            <div className="border border-indigo-200 bg-indigo-50/50 rounded-2xl p-4 text-xs space-y-2">
              <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-indigo-600" />
                <span>Automated Multi-Party Split Settlement Ledger</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-2">
                <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
                  <div className="text-[10px] text-slate-500">Hotel Payout (Net)</div>
                  <div className="font-bold text-slate-900 text-sm">₹{confirmedBooking.splitBreakdown.hotelNet.toLocaleString()}</div>
                  <div className="text-[9px] text-slate-400">After 15% platform cut</div>
                </div>
                {confirmedBooking.splitBreakdown.guideGross > 0 ? (
                  <>
                    <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
                      <div className="text-[10px] text-slate-500">Guide Net Payout</div>
                      <div className="font-bold text-emerald-700 text-sm">₹{confirmedBooking.splitBreakdown.guideNet.toLocaleString()}</div>
                      <div className="text-[9px] text-slate-400">Direct to Guide</div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
                      <div className="text-[10px] text-slate-500">Hotel Referral Bonus</div>
                      <div className="font-bold text-indigo-700 text-sm">₹{confirmedBooking.splitBreakdown.hotelReferralKickback.toLocaleString()}</div>
                      <div className="text-[9px] text-slate-400">5% Guide Bundle Kickback</div>
                    </div>
                  </>
                ) : null}
                <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
                  <div className="text-[10px] text-slate-500">Platform Net Cut</div>
                  <div className="font-bold text-slate-700 text-sm">₹{confirmedBooking.splitBreakdown.platformNetRevenue.toLocaleString()}</div>
                  <div className="text-[9px] text-slate-400">Platform commission</div>
                </div>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={onClose}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-8 py-3 rounded-xl transition-colors cursor-pointer shadow-md"
              >
                Close & Return to App
              </button>
            </div>
          </div>
        ) : (
          /* Live Checkout Form & Toggle Flow */
          <div className="p-6 space-y-5">
            
            {/* Stay Summary Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Selected Hotel</div>
                <div className="font-bold text-sm text-slate-900">{hotel.name}</div>
                <div className="text-xs text-slate-600 mt-0.5">
                  {selectedRoom.name} • {nights} Nights (₹{selectedRoom.pricePerNight.toLocaleString()}/night)
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-400">Room Total</div>
                <div className="font-extrabold text-sm text-slate-900">
                  ₹{split.hotelGross.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Real-time Guide Toggle Flow (Validating Prototype Requirement) */}
            {selectedGuide && (
              <div className="p-4 rounded-2xl border border-emerald-300 bg-emerald-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-xs text-slate-900">
                      Local Guide Add-On (Live Real-Time Toggle)
                    </span>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={includeGuide}
                      onChange={(e) => setIncludeGuide(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                    <span className="ml-2 text-xs font-bold text-emerald-800">
                      {includeGuide ? 'Included' : 'Removed'}
                    </span>
                  </label>
                </div>

                {includeGuide ? (
                  <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60 text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{selectedGuide.name}</span>
                      <span className="text-slate-500 ml-1">({getPackageTitle(selectedPackage)})</span>
                    </div>
                    <div className="font-black text-emerald-700">
                      +₹{split.guideGross.toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 italic">
                    Guide excluded. Price updated in real-time.
                  </div>
                )}
              </div>
            )}

            {/* Real-Time Multi-Party Split Visualizer */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowSplitDetails(!showSplitDetails)}
                className="w-full bg-slate-100/80 hover:bg-slate-100 px-4 py-2.5 flex items-center justify-between text-xs font-bold text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Real-Time Commission & Settlement Breakdown</span>
                </div>
                {showSplitDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showSplitDetails && (
                <div className="p-4 bg-white space-y-2.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Hotel Gross Charge:</span>
                    <span>₹{split.hotelGross.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 pl-3">
                    <span>↳ Platform Hotel Commission (15%):</span>
                    <span className="text-red-500">-₹{split.hotelPlatformCut.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-indigo-900 pl-3">
                    <span>↳ Hotel Net Payout:</span>
                    <span>₹{split.hotelNet.toLocaleString()}</span>
                  </div>

                  {includeGuide && split.guideGross > 0 && (
                    <>
                      <div className="pt-2 border-t border-slate-100 flex justify-between text-slate-600">
                        <span>Guide Gross Fee:</span>
                        <span>₹{split.guideGross.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 pl-3">
                        <span>↳ Platform Guide Fee (10%):</span>
                        <span className="text-red-500">-₹{split.guidePlatformCut.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 pl-3">
                        <span>↳ Hotel Referral Commission (5%):</span>
                        <span className="text-indigo-600">+₹{split.hotelReferralKickback.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-emerald-800 pl-3">
                        <span>↳ Guide Net Take-Home:</span>
                        <span>₹{split.guideNet.toLocaleString()}</span>
                      </div>
                    </>
                  )}

                  <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-700">
                    <span>Total Platform Net Take:</span>
                    <span>₹{split.platformNetRevenue.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Total Due & Pay CTA */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-xs text-slate-500">Unified Total Payable</div>
                <div className="text-2xl font-black text-slate-900">
                  ₹{split.totalCharged.toLocaleString()}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePayNow}
                  disabled={isProcessing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Settling Split Payouts...</span>
                    </>
                  ) : (
                    <>
                      <span>Pay ₹{split.totalCharged.toLocaleString()} & Confirm</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
