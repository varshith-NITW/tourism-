import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  DollarSign, 
  Sparkles, 
  ArrowRight, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet, 
  Lock, 
  Tag, 
  TrendingDown,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
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

type RazorpayMethod = 'upi' | 'card' | 'netbanking' | 'wallet';

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
  const [guestEmail, setGuestEmail] = useState<string>('varshith@example.com');
  
  // Razorpay states
  const [paymentMethod, setPaymentMethod] = useState<RazorpayMethod>('upi');
  const [upiId, setUpiId] = useState<string>('varshith@okhdfcbank');
  const [cardNumber, setCardNumber] = useState<string>('4315 2890 1234 5678');
  const [cardExpiry, setCardExpiry] = useState<string>('08/28');
  const [cardCvv, setCardCvv] = useState<string>('821');
  const [selectedBank, setSelectedBank] = useState<string>('HDFC Bank');
  
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [showSplitDetails, setShowSplitDetails] = useState<boolean>(false);

  // Generate deterministic/stable Razorpay order ID
  const [razorpayOrderId] = useState<string>(() => `order_RPZ_${Math.floor(10000000 + Math.random() * 90000000)}`);

  // Calculate live multi-party split breakdown with exclusive website discount
  const split: SplitBreakdown = calculateSplitBreakdown({
    hotel,
    nights,
    selectedRoomPrice: selectedRoom.pricePerNight,
    guide: includeGuide ? selectedGuide : null,
    guidePackageType: includeGuide ? selectedPackage : null,
    applyWebsiteDiscount: true
  });

  const getPackageTitle = (type: GuidePackageType) => {
    switch (type) {
      case 'half_day': return 'Half-Day Heritage & Bazaar Walk (4 Hours)';
      case 'full_day': return 'Full-Day Cultural Deep Dive (8 Hours)';
      case 'photography_walk': return 'Sunset Photography Tour (3.5 Hours)';
      default: return 'Certified Guide Tour';
    }
  };

  const handleRazorpayPayment = () => {
    setIsProcessing(true);
    setProcessingStep('Connecting to Razorpay 256-bit Secure Gateway...');

    setTimeout(() => {
      setProcessingStep('Validating payment authentication with bank...');
    }, 600);

    setTimeout(() => {
      setProcessingStep('Applying direct website discount & settling automated payouts...');
    }, 1200);

    setTimeout(() => {
      setIsProcessing(false);
      const paymentId = `pay_RPZ_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

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
        originalAmount: split.originalTotal,
        websiteDiscountAmount: split.websiteDiscountAmount,
        razorpayPaymentId: paymentId,
        razorpayOrderId: razorpayOrderId,
        paymentMethod,
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
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Razorpay Branded Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 relative">
          {!confirmedBooking && (
            <button
              onClick={onClose}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-black bg-blue-500/30 text-blue-200 border border-blue-400/40 px-3 py-1 rounded-full">
              <Lock className="w-3.5 h-3.5 text-blue-300" />
              <span>Razorpay Trusted Business Gateway</span>
            </div>
            <div className="text-[11px] font-mono text-blue-200/80">
              {razorpayOrderId}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-1">
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                {confirmedBooking ? '🎉 Payment Successful via Razorpay!' : 'Razorpay Secure Checkout'}
              </h2>
              <p className="text-xs text-blue-200 mt-0.5">
                {hotel.name} • {nights} Nights • Verified Google Maps Footfall
              </p>
            </div>

            {!confirmedBooking && (
              <div className="text-left sm:text-right">
                <span className="text-[11px] text-blue-200 block">Payable via Razorpay:</span>
                <span className="text-2xl sm:text-3xl font-black text-white">
                  ₹{split.totalCharged.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {confirmedBooking ? (
          /* Razorpay Success Receipt Screen */
          <div className="p-6 space-y-6">
            <div className="text-center py-5 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
              <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30 animate-bounce">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Payment Authorized via Razorpay</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Your reservation is instantly verified. Zero fake reviews, 100% genuine Google Maps check-in guaranteed.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <span className="font-mono text-xs bg-white px-3 py-1 rounded-lg border border-emerald-300 font-bold text-emerald-800">
                  ID: {confirmedBooking.razorpayPaymentId}
                </span>
                <span className="text-xs bg-emerald-100 text-emerald-900 px-3 py-1 rounded-lg font-bold">
                  Order: {confirmedBooking.razorpayOrderId}
                </span>
              </div>
            </div>

            {/* Exclusive Discount Highlight Callout */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-2xl shadow-md flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-lg">
                  🏷️
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-emerald-100">
                    Direct Website Booking Discount Applied
                  </div>
                  <div className="text-sm font-extrabold">
                    You saved ₹{(confirmedBooking.websiteDiscountAmount || 0).toLocaleString()} ({confirmedBooking.splitBreakdown.websiteDiscountPercent}% OFF)!
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-white text-emerald-800 px-3 py-1 rounded-lg shrink-0">
                PROMO: DIRECT2026
              </span>
            </div>

            {/* Detailed Receipt Summary */}
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Stay Property:</span>
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
              <div className="flex justify-between pb-2 border-b border-slate-200">
                <span className="text-slate-500">Original Subtotal:</span>
                <span className="line-through text-slate-400">₹{(confirmedBooking.originalAmount || split.totalCharged).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-slate-200 text-emerald-700 font-bold">
                <span>Exclusive Website Discount ({confirmedBooking.splitBreakdown.websiteDiscountPercent}%):</span>
                <span>-₹{(confirmedBooking.websiteDiscountAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-1 text-sm font-black">
                <span className="text-slate-900">Total Charged via Razorpay:</span>
                <span className="text-emerald-700 font-extrabold">₹{confirmedBooking.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Multi-Party Split Settlement Ledger */}
            <div className="border border-indigo-200 bg-indigo-50/50 rounded-2xl p-4 text-xs space-y-2">
              <div className="font-bold text-indigo-950 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-indigo-600" />
                  <span>Automated Multi-Party Split Settlement Ledger</span>
                </div>
                <span className="text-[10px] text-indigo-600 font-bold bg-indigo-100 px-2 py-0.5 rounded">
                  Instant Razorpay Route
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pt-2">
                <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
                  <div className="text-[10px] text-slate-500">Hotel Payout (Net)</div>
                  <div className="font-bold text-slate-900 text-sm">₹{confirmedBooking.splitBreakdown.hotelNet.toLocaleString()}</div>
                  <div className="text-[9px] text-slate-400">After platform fee</div>
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
                      <div className="text-[9px] text-slate-400">5% Bundle Bonus</div>
                    </div>
                  </>
                ) : null}
                <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
                  <div className="text-[10px] text-slate-500">Platform Net Cut</div>
                  <div className="font-bold text-slate-700 text-sm">₹{confirmedBooking.splitBreakdown.platformNetRevenue.toLocaleString()}</div>
                  <div className="text-[9px] text-slate-400">Platform revenue</div>
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
          /* Live Razorpay Checkout Flow */
          <div className="p-6 space-y-5">

            {/* Direct Booking Discount Banner */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-2xl shadow-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-black text-lg">
                  🏷️
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-emerald-100">
                    Direct Website Booking Discount
                  </div>
                  <div className="text-sm font-extrabold">
                    {includeGuide ? '20% OFF Hotel + Guide Bundle Applied!' : '15% OFF Hotel Booking Applied!'}
                  </div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-bold block text-emerald-100">You Save:</span>
                <span className="text-lg font-black bg-white text-emerald-800 px-2.5 py-0.5 rounded-lg">
                  ₹{(split.websiteDiscountAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Stay & Room Summary */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-slate-500">Selected Stay</div>
                <div className="font-bold text-sm text-slate-900">{hotel.name}</div>
                <div className="text-xs text-slate-600 mt-0.5">
                  {selectedRoom.name} • {nights} Nights (₹{selectedRoom.pricePerNight.toLocaleString()}/night)
                </div>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-xs text-slate-400">Room Subtotal</div>
                <div className="font-extrabold text-sm text-slate-900">
                  ₹{(selectedRoom.pricePerNight * nights).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Real-time Guide Toggle with Bundle Discount Incentive */}
            {selectedGuide && (
              <div className="p-4 rounded-2xl border border-emerald-300 bg-emerald-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">
                        Bundle Certified Local Guide
                      </span>
                      <span className="text-[11px] text-emerald-700 font-semibold">
                        Unlock 20% Bundle Discount on Total Bill!
                      </span>
                    </div>
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
                      {includeGuide ? 'Bundled' : 'Excluded'}
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
                      +₹{selectedGuide.halfDayRate.toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-slate-500 italic">
                    Guide excluded. Toggle on to unlock an additional 5% discount on the entire reservation!
                  </div>
                )}
              </div>
            )}

            {/* Razorpay Payment Method Selector */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                <span>Select Razorpay Payment Method</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'upi', label: 'UPI / QR', icon: Smartphone, desc: 'GPay, PhonePe, Paytm' },
                  { id: 'card', label: 'Cards', icon: CreditCard, desc: 'Visa, RuPay, MC' },
                  { id: 'netbanking', label: 'NetBanking', icon: Building2, desc: 'All Indian Banks' },
                  { id: 'wallet', label: 'Wallets', icon: Wallet, desc: 'Paytm, Amazon' }
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isSelected = paymentMethod === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPaymentMethod(tab.id as RazorpayMethod)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-600' 
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`} />
                      <div className="text-xs font-bold text-slate-900 mt-1">{tab.label}</div>
                      <div className="text-[10px] text-slate-400">{tab.desc}</div>
                    </button>
                  );
                })}
              </div>

              {/* Method Specific Details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                {paymentMethod === 'upi' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Instant UPI Payment</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Zero Gateway Surcharge</span>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">Enter UPI ID / VPA</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="e.g. yourname@upi"
                          className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-blue-600"
                        />
                        <button
                          type="button"
                          className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl shrink-0 cursor-pointer"
                        >
                          Verify VPA
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] font-semibold text-slate-400">Supported:</span>
                      <span className="text-xs">🟢 Google Pay</span>
                      <span className="text-xs">🟣 PhonePe</span>
                      <span className="text-xs">🔵 Paytm UPI</span>
                      <span className="text-xs">🇮🇳 BHIM</span>
                    </div>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[11px] text-slate-500 block mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 bg-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-slate-500 block mb-1">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-500 block mb-1">CVV</label>
                        <input
                          type="password"
                          value={cardCvv}
                          maxLength={4}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-500 block">Select Your Bank</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Bank', 'Other Banks'].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setSelectedBank(b)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                            selectedBank === b 
                              ? 'border-blue-600 bg-blue-100/50 text-blue-900' 
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {paymentMethod === 'wallet' && (
                  <div className="space-y-2">
                    <label className="text-[11px] text-slate-500 block">Select Digital Wallet</label>
                    <div className="flex gap-2">
                      {['Paytm Wallet', 'Amazon Pay', 'PhonePe Wallet'].map((w) => (
                        <button
                          key={w}
                          type="button"
                          className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white hover:border-blue-500 transition-colors cursor-pointer"
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Price Itemization Breakdown with Direct Discount */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Room Subtotal ({nights} Nights):</span>
                <span>₹{(selectedRoom.pricePerNight * nights).toLocaleString()}</span>
              </div>
              {includeGuide && (
                <div className="flex justify-between text-slate-600">
                  <span>Certified Local Guide Fee:</span>
                  <span>₹{selectedGuide?.halfDayRate.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400">
                <span>Original Gross:</span>
                <span className="line-through">₹{(split.originalTotal || split.totalCharged).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-bold pt-1 border-t border-slate-200">
                <span>🏷️ Direct Website Booking Discount ({split.websiteDiscountPercent}% OFF):</span>
                <span>-₹{(split.websiteDiscountAmount || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-slate-200">
                <span className="text-sm font-black text-slate-900">Total Payable via Razorpay:</span>
                <span className="text-2xl font-black text-blue-950">
                  ₹{split.totalCharged.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Security Guarantee Footer & Submit Button */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 font-semibold text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>256-Bit SSL Encrypted • PCI DSS Level 1 Compliant</span>
                </span>
                <span className="font-bold text-blue-700">Powered by Razorpay</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRazorpayPayment}
                  disabled={isProcessing}
                  className="flex-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:to-indigo-800 text-white text-sm font-black py-3.5 px-6 rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs">{processingStep}</span>
                    </>
                  ) : (
                    <>
                      <span>Pay ₹{split.totalCharged.toLocaleString()} via Razorpay</span>
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
