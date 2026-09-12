import React from 'react';
import { Compass, Hotel, Users, ShieldCheck, DollarSign, Sparkles, MapPin, Key } from 'lucide-react';
import { getStoredApiKeys } from '../services/placesService';

export type PersonaType = 'traveler' | 'hotel' | 'guide' | 'split';

interface NavbarProps {
  currentPersona: PersonaType;
  onSelectPersona: (persona: PersonaType) => void;
  bookingCount: number;
  onOpenApiSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPersona,
  onSelectPersona,
  bookingCount,
  onOpenApiSettings
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Ecosystem Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
              <Compass className="w-6 h-6 animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">
                  TourMatch<span className="text-emerald-400">.AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3" /> Partner Ecosystem
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-rose-400 font-medium">
                  <MapPin className="w-3 h-3" /> Google Maps Check-Ins Ranked
                </span>
                <span>•</span>
                <span>Zero-Hallucination Inventory</span>
              </div>
            </div>
          </div>

          {/* Persona Switcher Tabs */}
          <nav className="flex items-center bg-slate-800/90 p-1 rounded-xl border border-slate-700/80">
            <button
              onClick={() => onSelectPersona('traveler')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentPersona === 'traveler'
                  ? 'bg-slate-700 text-white shadow-xs border border-slate-600/70'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
              }`}
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Traveler View</span>
            </button>

            <button
              onClick={() => onSelectPersona('hotel')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentPersona === 'hotel'
                  ? 'bg-slate-700 text-white shadow-xs border border-slate-600/70'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
              }`}
            >
              <Hotel className="w-4 h-4 text-indigo-400" />
              <span>Hotel Portal</span>
            </button>

            <button
              onClick={() => onSelectPersona('guide')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentPersona === 'guide'
                  ? 'bg-slate-700 text-white shadow-xs border border-slate-600/70'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
              }`}
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>Guide Portal</span>
            </button>

            <button
              onClick={() => onSelectPersona('split')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentPersona === 'split'
                  ? 'bg-slate-700 text-white shadow-xs border border-slate-600/70'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/40'
              }`}
            >
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span>Split Engine</span>
              {bookingCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[10px] flex items-center justify-center font-bold">
                  {bookingCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Action: API Keys Configuration */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenApiSettings}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold shadow-xs transition-all cursor-pointer group"
              title="Configure Google Maps & OpenAI API Keys"
            >
              <Key className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-45 transition-transform" />
              <span className="hidden sm:inline">API Keys</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
