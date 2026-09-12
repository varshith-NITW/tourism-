import React, { useState } from 'react';
import { DollarSign, ArrowRight, Building, Users, ShieldCheck, Sparkles, PieChart } from 'lucide-react';

export const SplitPaymentSimulator: React.FC = () => {
  const [roomPrice, setRoomPrice] = useState<number>(3500);
  const [nights, setNights] = useState<number>(2);
  const [hotelCommissionRate, setHotelCommissionRate] = useState<number>(15);
  const [guideFee, setGuideFee] = useState<number>(2000);
  const [includeGuide, setIncludeGuide] = useState<boolean>(true);
  const [guidePlatformFeeRate, setGuidePlatformFeeRate] = useState<number>(10);
  const [hotelReferralRate, setHotelReferralRate] = useState<number>(5);

  // Math
  const roomGross = roomPrice * nights;
  const hotelPlatformCut = Math.round(roomGross * (hotelCommissionRate / 100));
  const hotelNet = roomGross - hotelPlatformCut;

  const actualGuideFee = includeGuide ? guideFee : 0;
  const guidePlatformCut = includeGuide ? Math.round(actualGuideFee * (guidePlatformFeeRate / 100)) : 0;
  const hotelReferralKickback = includeGuide ? Math.round(actualGuideFee * (hotelReferralRate / 100)) : 0;
  const guideNet = includeGuide ? (actualGuideFee - guidePlatformCut - hotelReferralKickback) : 0;

  const totalChargedToTraveler = roomGross + actualGuideFee;
  const totalReceivedByHotel = hotelNet + hotelReferralKickback;
  const totalPlatformCut = hotelPlatformCut + guidePlatformCut;

  return (
    <div className="space-y-6 pb-16">
      
      {/* Title */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Multi-Party Automated Split Payment Simulator
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulate real-time fund routing between Platform, Partner Hotel, and Certified Local Guide.
            </p>
          </div>
        </div>
      </div>

      {/* Simulator Inputs & Visual Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Controls Column */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>⚙️ Transaction Parameters</span>
          </h2>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Hotel Room Rate / Night (₹)</label>
            <input
              type="number"
              value={roomPrice}
              onChange={(e) => setRoomPrice(Math.max(500, parseInt(e.target.value || '0', 10)))}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Nights Stayed: {nights}</label>
            <input
              type="range"
              min={1}
              max={10}
              value={nights}
              onChange={(e) => setNights(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">
              Platform Hotel Commission: {hotelCommissionRate}%
            </label>
            <input
              type="range"
              min={5}
              max={25}
              value={hotelCommissionRate}
              onChange={(e) => setHotelCommissionRate(parseInt(e.target.value, 10))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900">Include Certified Guide Bundle</label>
              <input
                type="checkbox"
                checked={includeGuide}
                onChange={(e) => setIncludeGuide(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 cursor-pointer"
              />
            </div>

            {includeGuide && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Guide Package Fee (₹)</label>
                  <input
                    type="number"
                    value={guideFee}
                    onChange={(e) => setGuideFee(Math.max(500, parseInt(e.target.value || '0', 10)))}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    Hotel Referral Kickback on Guide: {hotelReferralRate}%
                  </label>
                  <input
                    type="range"
                    min={3}
                    max={10}
                    value={hotelReferralRate}
                    onChange={(e) => setHotelReferralRate(parseInt(e.target.value, 10))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="text-[10px] text-slate-400">
                    Earned by the hotel for bundling the guide at checkout
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Visual Split Payout Flow */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Traveler Total Box */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-md flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-300 uppercase tracking-wider font-semibold">
                Unified Traveler Checkout Payment
              </div>
              <div className="text-3xl font-black mt-1 text-emerald-400">
                ₹{totalChargedToTraveler.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-1">
                Room (₹{roomGross.toLocaleString()}) {includeGuide ? `+ Guide (₹${actualGuideFee.toLocaleString()})` : ''}
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full font-bold">
                100% Automated Split Routing
              </span>
            </div>
          </div>

          {/* Parties Settlement Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Hotel Payout */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-indigo-700 font-bold text-xs">
                <span>🏨 Hotel Partner</span>
                <Building className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                ₹{totalReceivedByHotel.toLocaleString()}
              </div>
              <div className="text-xs space-y-1 pt-2 border-t border-slate-100 text-slate-600">
                <div className="flex justify-between">
                  <span>Room Net Payout:</span>
                  <span className="font-semibold">₹{hotelNet.toLocaleString()}</span>
                </div>
                {includeGuide && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Guide Referral Fee:</span>
                    <span>+₹{hotelReferralKickback.toLocaleString()}</span>
                  </div>
                )}
                <div className="text-[10px] text-slate-400 pt-1">
                  Commission Paid: ₹{hotelPlatformCut.toLocaleString()} ({hotelCommissionRate}%)
                </div>
              </div>
            </div>

            {/* Guide Payout */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-amber-700 font-bold text-xs">
                <span>🎒 Certified Guide</span>
                <Users className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                ₹{guideNet.toLocaleString()}
              </div>
              <div className="text-xs space-y-1 pt-2 border-t border-slate-100 text-slate-600">
                <div className="flex justify-between">
                  <span>Tour Gross Fee:</span>
                  <span className="font-semibold">₹{actualGuideFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-red-500">
                  <span>Platform Fee (10%):</span>
                  <span>-₹{guidePlatformCut.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-indigo-600">
                  <span>Hotel Kickback (5%):</span>
                  <span>-₹{hotelReferralKickback.toLocaleString()}</span>
                </div>
                <div className="text-[10px] text-emerald-700 font-bold pt-1">
                  Net Deposited to Guide
                </div>
              </div>
            </div>

            {/* Platform Revenue */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-emerald-700 font-bold text-xs">
                <span>⚡ Platform Cut</span>
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-emerald-700">
                ₹{totalPlatformCut.toLocaleString()}
              </div>
              <div className="text-xs space-y-1 pt-2 border-t border-slate-100 text-slate-600">
                <div className="flex justify-between">
                  <span>Hotel Take ({hotelCommissionRate}%):</span>
                  <span className="font-semibold">₹{hotelPlatformCut.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Guide Take ({guidePlatformFeeRate}%):</span>
                  <span className="font-semibold">₹{guidePlatformCut.toLocaleString()}</span>
                </div>
                <div className="text-[10px] text-slate-400 pt-1">
                  Platform infrastructure & AI compute
                </div>
              </div>
            </div>

          </div>

          {/* Mathematical Proof Verification Box */}
          <div className="p-4 bg-slate-100/90 rounded-2xl border border-slate-200 text-xs flex items-center justify-between text-slate-700">
            <span className="font-semibold">
              Split Balance Check: Hotel Total (₹{totalReceivedByHotel.toLocaleString()}) + Guide Net (₹{guideNet.toLocaleString()}) + Platform Cut (₹{totalPlatformCut.toLocaleString()})
            </span>
            <span className="font-mono font-black text-emerald-700 text-sm">
              = ₹{(totalReceivedByHotel + guideNet + totalPlatformCut).toLocaleString()} (100% Balanced)
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
