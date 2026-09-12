import React from 'react';
import { Compass, Hotel, Users, ShieldCheck, DollarSign, Sparkles, MapPin } from 'lucide-react';

export type PersonaType = 'traveler' | 'hotel' | 'guide' | 'split';

interface NavbarProps {
  currentPersona: PersonaType;
  onSelectPersona: (persona: PersonaType) => void;
  bookingCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPersona,
  onSelectPersona,
  bookingCount
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Ecosystem Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Compass className="w-6 h-6 animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  TourMatch<span className="text-emerald-600">.AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> Partner Ecosystem
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="flex items-center gap-1 text-red-600 font-semibold">
                  <MapPin className="w-3 h-3" /> Real Check-In Visits Ranked
                </span>
                <span>•</span>
                <span>Zero Fake Reviews</span>
              </div>
            </div>
          </div>

          {/* Persona Switcher Tabs */}
          <nav className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onSelectPersona('traveler')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentPersona === 'traveler'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              <span>Traveler View</span>
            </button>

            <button
              onClick={() => onSelectPersona('hotel')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentPersona === 'hotel'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Hotel className="w-4 h-4 text-indigo-600" />
              <span>Hotel Portal</span>
            </button>

            <button
              onClick={() => onSelectPersona('guide')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentPersona === 'guide'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Users className="w-4 h-4 text-amber-600" />
              <span>Guide Portal</span>
            </button>

            <button
              onClick={() => onSelectPersona('split')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentPersona === 'split'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Split Engine</span>
              {bookingCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                  {bookingCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action: Google Gemini AI Active Badge (API Keys removed) */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Gemini AI Active</span>
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
