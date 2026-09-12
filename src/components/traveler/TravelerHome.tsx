import React, { useState } from 'react';
import { Sparkles, MapPin, Search, Navigation, ShieldCheck, ExternalLink, Calendar, ArrowRight, TrendingUp } from 'lucide-react';
import { TouristSpot, Hotel, Guide, AIQueryFilters, AIRecommendationResponse } from '../../types';
import { SAMPLE_AI_PROMPTS } from '../../data/mockData';
import { parseNaturalLanguagePrompt, executeAIRecommendationEngine } from '../../services/aiEngine';
import { InteractiveMap } from '../common/InteractiveMap';
import { getGoogleMapsDirectionsUrl } from '../../services/spatialService';

interface TravelerHomeProps {
  spots: TouristSpot[];
  hotels: Hotel[];
  guides: Guide[];
  onSelectHotelForBooking: (hotel: Hotel, matchedGuide?: Guide) => void;
}

export const TravelerHome: React.FC<TravelerHomeProps> = ({
  spots,
  hotels,
  guides,
  onSelectHotelForBooking
}) => {
  const [selectedSpotId, setSelectedSpotId] = useState<string>(spots[0].id);
  const [searchPrompt, setSearchPrompt] = useState<string>('');
  const [maxBudget, setMaxBudget] = useState<number>(6000);
  const [needsGuide, setNeedsGuide] = useState<boolean>(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('English');
  const [stayStyle, setStayStyle] = useState<'heritage' | 'foodie' | 'family' | 'luxury' | 'budget' | 'all'>('all');
  const [activeHotelHover, setActiveHotelHover] = useState<string | null>(null);

  // Execute AI recommendation on every filter/search change
  const currentFilters: AIQueryFilters = {
    targetLandmarkId: selectedSpotId,
    maxBudgetPerNight: maxBudget,
    needsGuide,
    preferredLanguage: selectedLanguage,
    stayStyle,
    searchQuery: searchPrompt
  };

  const aiResult: AIRecommendationResponse = executeAIRecommendationEngine(
    currentFilters,
    spots,
    hotels,
    guides,
    5.0 // 5km spatial radius filter
  );

  const targetSpot = aiResult.targetSpot;

  // Combine spots with the dynamic AI result spot if it is a new destination
  const displaySpots = spots.some(s => s.id === targetSpot.id)
    ? spots
    : [targetSpot, ...spots];

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPrompt.trim()) return;

    // Parse natural language prompt into structured filters
    const parsed = parseNaturalLanguagePrompt(searchPrompt, spots);
    setSelectedSpotId(parsed.landmarkId);
    if (parsed.maxBudget < 50000) setMaxBudget(parsed.maxBudget);
    setNeedsGuide(parsed.needsGuide);
    setSelectedLanguage(parsed.preferredLanguage);
    if (['family', 'foodie', 'photography', 'budget', 'luxury'].includes(parsed.travelVibe)) {
      setStayStyle(parsed.travelVibe as any);
    }
  };

  const handleApplyPreset = (preset: typeof SAMPLE_AI_PROMPTS[0]) => {
    setSearchPrompt(preset.query);
    const parsed = parseNaturalLanguagePrompt(preset.query, spots);
    setSelectedSpotId(parsed.landmarkId);
    setMaxBudget(preset.budget);
    setNeedsGuide(preset.needGuide);
    if (parsed.preferredLanguage) setSelectedLanguage(parsed.preferredLanguage);
    if (parsed.travelVibe) setStayStyle(parsed.travelVibe as any);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Hero & AI Prompt Section */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            AI Stay & Certified Guide Recommendation Engine
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Discover Partner Stays Ranked by <span className="text-emerald-400">Google Maps Check-Ins</span>
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-300">
            Zero-hallucination inventory for any destination worldwide. Search any city or landmark — the AI queries verified partner stays strictly within a 5 km geo-radius, ranking stays by verified traveler check-in volume and pairing certified local guides.
          </p>

          {/* Natural Language Prompt Form */}
          <form onSubmit={handlePromptSubmit} className="mt-6">
            <div className="flex flex-col sm:flex-row gap-2 bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/15 focus-within:border-emerald-400 transition-all">
              <div className="flex-1 flex items-center gap-3 px-3 py-1">
                <Search className="w-5 h-5 text-emerald-400 shrink-0" />
                <input
                  type="text"
                  value={searchPrompt}
                  onChange={(e) => setSearchPrompt(e.target.value)}
                  placeholder="e.g. Taj Mahal heritage stay under 5000 with history guide, Goa beach resort..."
                  className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none text-sm"
                />
              </div>
              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Prompt AI</span>
              </button>
            </div>
          </form>

          {/* Sample Prompts */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400">Try nationwide & global prompts:</span>
            {SAMPLE_AI_PROMPTS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handleApplyPreset(preset)}
                className="text-xs bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white px-2.5 py-1 rounded-lg border border-white/10 transition-all cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Suggested Multi-Day Cultural Itinerary (Directly under AI Prompt Section) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                AI-Synthesized Schedule around {targetSpot.name}
              </h3>
              <p className="text-xs text-slate-500">
                Customized daily schedule synchronized with monument opening hours and low footfall traffic windows.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            AI Itinerary Plan
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {aiResult.customItinerary.map((item) => (
            <div key={item.day} className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                <span className="text-xs font-black uppercase tracking-wider text-indigo-700 bg-indigo-100/60 px-2 py-0.5 rounded-md">
                  Day {item.day}
                </span>
                <span className="text-xs font-bold text-slate-900">{item.title}</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700 mt-2">
                {item.activities.map((act, aIdx) => (
                  <li key={aIdx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold mt-0.5">•</span>
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 italic">
                💡 Local Tip: {item.localTip}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Target Landmark Tabs & Google Check-In Footfall Bar */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" />
              <span>Select Destination Attraction</span>
            </h2>
            <p className="text-xs text-slate-500">
              AI evaluates partner hotels strictly within a 5 km spatial radius of the chosen spot.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            Ranked by Google Maps Check-In Density
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {displaySpots.slice(0, 5).map((spot) => {
            const isSelected = spot.id === targetSpot.id;
            return (
              <button
                key={spot.id}
                onClick={() => {
                  setSelectedSpotId(spot.id);
                  setSearchPrompt('');
                }}
                className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="font-bold text-sm text-slate-900 line-clamp-1">{spot.name}</div>
                  <span className="text-xs">📍</span>
                </div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-red-600 font-bold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{(spot.monthlyCheckins / 1000).toFixed(0)}k check-ins/mo</span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500 line-clamp-1">
                  {spot.tags?.[0] || 'Featured Attraction'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Spatial Proximity Map View */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-800">
              Interactive Spatial Radar (<span className="text-indigo-600">5 km Geo-Radius</span> around {targetSpot.name})
            </h3>
          </div>
          <a
            href={targetSpot.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(targetSpot.name)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-slate-600 hover:text-indigo-600 flex items-center gap-1 font-medium"
          >
            <span>View {targetSpot.name} on Google Maps</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <InteractiveMap
          spot={targetSpot}
          hotels={aiResult.recommendedHotels.map(r => r.hotel)}
          selectedHotelId={activeHotelHover}
          onSelectHotel={(hotel) => onSelectHotelForBooking(hotel)}
        />
      </div>

      {/* AI Extraction & Guardrail Banner */}
      <div className="bg-slate-100 border border-slate-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
            AI
          </div>
          <div>
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <span>Destination Match: {targetSpot.name}</span>
              <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-semibold">
                Budget: ≤ ₹{aiResult.queryParsed.maxBudget.toLocaleString()}
              </span>
              <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-semibold">
                {targetSpot.city}
              </span>
            </div>
            <div className="text-slate-500 mt-0.5">
              Strict Non-Rating Algorithm: Verified partner stays ranked by Google Maps check-in volume, weekly velocity, and distance penalty.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-700">
          <span className="font-semibold text-emerald-700 bg-emerald-100/70 border border-emerald-300/60 px-2.5 py-1 rounded-lg">
            {aiResult.recommendedHotels.length} Partner Stays Found
          </span>
        </div>
      </div>

      {/* Hotel Recommendation Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-lg text-slate-900">
            Recommended Partner Hotels & Commute Stats near {targetSpot.name}
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            Sorted by Footfall & Check-in Volume
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5">
          {aiResult.recommendedHotels.map(({ hotel, distanceKm, commuteMinutes, rationale, matchedGuide }) => {
            const directionsUrl = getGoogleMapsDirectionsUrl(hotel.location, targetSpot.location, targetSpot.name);
            const hotelImg = hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';
            const guideAvatar = matchedGuide?.avatar || (matchedGuide as any)?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
            const guideLicense = matchedGuide?.verificationId || (matchedGuide as any)?.licenseNumber || 'ASI-CERT-VERIFIED';

            return (
              <div
                key={hotel.id}
                onMouseEnter={() => setActiveHotelHover(hotel.id)}
                onMouseLeave={() => setActiveHotelHover(null)}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-500/60 transition-all overflow-hidden flex flex-col lg:flex-row"
              >
                {/* Hotel Thumbnail & Badges */}
                <div className="lg:w-72 h-52 lg:h-auto relative shrink-0">
                  <img
                    src={hotelImg}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
                  
                  {/* Footfall Rank Badge */}
                  <div className="absolute top-3 left-3 bg-red-600 text-white font-extrabold text-xs px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>#{hotel.footfallRank} Most Checked-In</span>
                  </div>

                  {/* Partner Badge */}
                  <div className="absolute bottom-3 left-3 lg:bottom-3 lg:left-3 bg-white/95 backdrop-blur-xs text-slate-900 font-semibold text-[11px] px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Certified Partner</span>
                  </div>
                </div>

                {/* Hotel Main Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    {/* Title, Tier, and Google Maps Checkins */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                          {hotel.tier} • {hotel.city}
                        </div>
                        <h4 className="text-lg font-extrabold text-slate-900 mt-0.5">
                          {hotel.name}
                        </h4>
                      </div>

                      {/* Google Maps Check-In Stat Box */}
                      <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                        <MapPin className="w-4 h-4 text-red-600 shrink-0" />
                        <div className="text-left">
                          <div className="text-xs font-black text-red-700">
                            {hotel.checkinCount.toLocaleString()} Google Maps Check-ins
                          </div>
                          <div className="text-[10px] text-red-600/80">
                            🔥 {hotel.weeklyCheckins} active check-ins this week
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Commute and Distance Meter */}
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <div className="flex items-center gap-1.5 bg-indigo-50 text-indigo-800 font-semibold px-2.5 py-1 rounded-lg border border-indigo-100">
                        <Navigation className="w-3.5 h-3.5 text-indigo-600" />
                        <span>
                          {distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m away` : `${distanceKm} km`} from {targetSpot.name}
                        </span>
                      </div>
                      <div className="bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-lg">
                        ⏱️ Est. Commute: ~{commuteMinutes} mins
                      </div>
                      <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-indigo-600 font-medium flex items-center gap-1 underline underline-offset-2 ml-1"
                      >
                        <span>Google Route</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {/* AI Rationale Box */}
                    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900">AI Check-In Rationale: </span>
                        <span>{rationale}</span>
                      </div>
                    </div>

                    {/* Partner Perks */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {hotel.perks.map((perk, pIdx) => (
                        <span
                          key={pIdx}
                          className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2 py-0.5 rounded-md font-medium"
                        >
                          ✓ {perk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Matched Guide Sneak Peek & Action */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {matchedGuide ? (
                      <div className="flex items-center gap-2.5 text-xs text-slate-600">
                        <img
                          src={guideAvatar}
                          alt={matchedGuide.name}
                          className="w-8 h-8 rounded-full object-cover border border-emerald-400"
                        />
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1">
                            <span>Add-on Guide: {matchedGuide.name}</span>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-normal">
                              {guideLicense}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {matchedGuide.specialties[0]} • {matchedGuide.languages.join(', ')}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500">
                        Certified community guides available at checkout
                      </div>
                    )}

                    {/* Price and Book Button */}
                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div>
                        <div className="text-right">
                          <span className="text-xs text-slate-400">From </span>
                          <span className="text-xl font-extrabold text-slate-900">
                            ₹{hotel.pricePerNight.toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-500"> / night</span>
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectHotelForBooking(hotel, matchedGuide)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-2xs hover:shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Select Stay & Guide</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
