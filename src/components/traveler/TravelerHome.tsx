import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Search, 
  Navigation, 
  ShieldCheck, 
  ExternalLink, 
  ArrowRight, 
  TrendingUp, 
  Volume2, 
  Utensils, 
  Compass, 
  Car, 
  Shirt, 
  Check, 
  X, 
  Zap, 
  CheckCircle2, 
  MessageSquare,
  Flame,
  Clock,
  Layers,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { TouristSpot, Hotel, Guide, AIQueryFilters, AIRecommendationResponse } from '../../types';
import { SAMPLE_AI_PROMPTS } from '../../data/mockData';
import { parseNaturalLanguagePrompt, executeAIRecommendationEngine } from '../../services/aiEngine';
import { InteractiveMap } from '../common/InteractiveMap';
import { getGoogleMapsDirectionsUrl } from '../../services/spatialService';
import { getAutocompleteSuggestions } from '../../services/placesService';
import { logSearchToNodeAPI } from '../../services/apiClient';

interface TravelerHomeProps {
  spots: TouristSpot[];
  hotels: Hotel[];
  guides: Guide[];
  onSelectHotelForBooking: (hotel: Hotel, matchedGuide?: Guide) => void;
}

// Interactive Translator Dictionary for common travel requests
const DICTIONARY_MAP: Record<string, { hi: string; hiPron: string; te: string; tePron: string; fr: string; frPron: string }> = {
  'food': { hi: 'स्वादिष्ट खाना कहाँ मिलेगा?', hiPron: 'Swaadisht khaana kahan milega?', te: 'మంచి భోజనం ఎక్కడ దొరుకుతుంది?', tePron: 'Manchi bhojanam ekkada dorukuthundi?', fr: 'Où est le bon restaurant?', frPron: 'Oo ay luh bohn res-toh-rahn?' },
  'tea': { hi: 'एक गरम कड़क चाय देना', hiPron: 'Ek garam kadak chai dena', te: 'ఒక వేడి టీ ఇవ్వండి', tePron: 'Oka vey-dee tea ivvandi', fr: 'Un thé chaud, s’il vous plaît', frPron: 'Uhn tay shoh, seel voo play' },
  'chai': { hi: 'एक गरम कड़क चाय देना', hiPron: 'Ek garam kadak chai dena', te: 'ఒక వేడి టీ ఇవ్వండి', tePron: 'Oka vey-dee tea ivvandi', fr: 'Un thé chaud, s’il vous plaît', frPron: 'Uhn tay shoh, seel voo play' },
  'price': { hi: 'यह कितने का है? थोड़ा कम कीजिए', hiPron: 'Yeh kitne ka hai? Thoda kam kijiye', te: 'ఇది ఎంత? కొంచెం తగ్గించండి', tePron: 'Idhi entha? Koncham thagginchandi', fr: 'Combien ça coûte? Réduisez un peu', frPron: 'Kohm-byen sah koot? Ray-dwee-zay uhn puh' },
  'discount': { hi: 'भाई थोड़ा डिस्काउंट मिलेगा क्या?', hiPron: 'Bhai thoda discount milega kya?', te: 'కొంచెం తగ్గిస్తారా అండీ?', tePron: 'Koncham thaggisthaara andee?', fr: 'Pouvez-vous faire une remise?', frPron: 'Poo-vay voo fair oon reh-meez?' },
  'water': { hi: 'पीने का साफ़ पानी मिलेगा क्या?', hiPron: 'Peene ka saaf paani milega kya?', te: 'మంచి నీళ్లు ఉన్నాయా?', tePron: 'Manchi neellu unnaaya?', fr: 'De l’eau potable, s’il vous plaît', frPron: 'Duh loh poh-tahbl, seel voo play' },
  'taxi': { hi: 'रिक्शा / टैक्सी मीटर से चलेगी क्या?', hiPron: 'Rickshaw meter se chalegi kya?', te: 'ఆటో మీటర్ మీద వెళ్తుందా?', tePron: 'Auto meter meeda velthundha?', fr: 'Mettez le compteur de taxi s’il vous plaît', frPron: 'Meh-tay luh kohmp-tur duh tahk-see' },
  'auto': { hi: 'रिक्शा / टैक्सी मीटर से चलेगी क्या?', hiPron: 'Rickshaw meter se chalegi kya?', te: 'ఆటో మీటర్ మీద వెళ్తుందా?', tePron: 'Auto meter meeda velthundha?', fr: 'Mettez le compteur de taxi s’il vous plaît', frPron: 'Meh-tay luh kohmp-tur duh tahk-see' },
  'washroom': { hi: 'शौचालय / वॉशरूम किधर है?', hiPron: 'Shauchalay / Washroom kidhar hai?', te: 'వాష్‌రూమ్ ఎక్కడ ఉంది?', tePron: 'Washroom ekkada undhi?', fr: 'Où sont les toilettes?', frPron: 'Oo sohn lay twah-let?' },
  'toilet': { hi: 'शौचालय / वॉशरूम किधर है?', hiPron: 'Shauchalay / Washroom kidhar hai?', te: 'వాష్‌రూమ్ ఎక్కడ ఉంది?', tePron: 'Washroom ekkada undhi?', fr: 'Où sont les toilettes?', frPron: 'Oo sohn lay twah-let?' },
  'thank you': { hi: 'आपका बहुत-बहुत धन्यवाद!', hiPron: 'Aapka bahut-bahut dhanyawad!', te: 'చాలా ధన్యవాదాలు అండీ!', tePron: 'Chala dhanyavadhalu andee!', fr: 'Merci beaucoup!', frPron: 'Mair-see boh-koo!' }
};

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

  // Dynamic Search Engine: Sorting & Filtering Controls
  const [sortBy, setSortBy] = useState<'checkins' | 'weeklyVelocity' | 'pytorchScore' | 'distance' | 'priceAsc' | 'priceDesc'>('checkins');
  const [spatialRadiusKm, setSpatialRadiusKm] = useState<number>(5.0);
  const [filterGuideRequired, setFilterGuideRequired] = useState<boolean>(false);

  // Selected Experience Plan (Default to first recommended hotel for immediate smart block display)
  const [selectedPlanHotelId, setSelectedPlanHotelId] = useState<string | null>(null);

  // Entertaining AI Muse State
  const [museMood, setMuseMood] = useState<'secret' | 'food' | 'photo' | 'hype'>('hype');
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Interactive Custom Translator State
  const [customPhraseInput, setCustomPhraseInput] = useState<string>('');
  const [customTranslationResult, setCustomTranslationResult] = useState<{ translated: string; pronunciation: string; note: string } | null>(null);
  const [speakingPhraseIndex, setSpeakingPhraseIndex] = useState<number | null>(null);

  // Autocomplete state
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<ReturnType<typeof getAutocompleteSuggestions>>([]);
  const [isInputFocused, setIsInputFocused] = useState<boolean>(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const smartBlocksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setIsInputFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    spatialRadiusKm
  );

  const targetSpot = aiResult.targetSpot;

  // Filter & Sort Stays strictly by Footfall / Check-ins
  const displayedHotels = [...aiResult.recommendedHotels]
    .filter(rec => {
      if (filterGuideRequired && !rec.matchedGuide) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'checkins') return b.hotel.checkinCount - a.hotel.checkinCount;
      if (sortBy === 'weeklyVelocity') return b.hotel.weeklyCheckins - a.hotel.weeklyCheckins;
      if (sortBy === 'pytorchScore') return b.checkinScore - a.checkinScore;
      if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
      if (sortBy === 'priceAsc') return a.hotel.pricePerNight - b.hotel.pricePerNight;
      if (sortBy === 'priceDesc') return b.hotel.pricePerNight - a.hotel.pricePerNight;
      return 0;
    });

  // Automatically select the #1 recommended stay if none selected or if destination changes
  useEffect(() => {
    if (displayedHotels.length > 0) {
      const currentSelectedExists = displayedHotels.some(h => h.hotel.id === selectedPlanHotelId);
      if (!currentSelectedExists) {
        setSelectedPlanHotelId(displayedHotels[0].hotel.id);
      }
    }
  }, [selectedSpotId, displayedHotels]);

  // The active selected hotel & matched guide for smart blocks
  const activePlanRec = displayedHotels.find(h => h.hotel.id === selectedPlanHotelId) || displayedHotels[0];
  const activeHotel = activePlanRec?.hotel;
  const activeGuide = activePlanRec?.matchedGuide;

  const handleSearchChange = (val: string) => {
    setSearchPrompt(val);
    const suggestions = getAutocompleteSuggestions(val);
    setAutocompleteSuggestions(suggestions);
  };

  const handleSelectSuggestion = (suggestion: ReturnType<typeof getAutocompleteSuggestions>[0]) => {
    const queryText = `${suggestion.name}, ${suggestion.city}`;
    setSearchPrompt(queryText);
    setIsInputFocused(false);
    setAutocompleteSuggestions([]);

    const parsed = parseNaturalLanguagePrompt(queryText, spots);
    setSelectedSpotId(parsed.landmarkId);
    if (parsed.preferredLanguage) setSelectedLanguage(parsed.preferredLanguage);
    if (parsed.travelVibe) setStayStyle(parsed.travelVibe as any);
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchPrompt.trim()) return;

    const parsed = parseNaturalLanguagePrompt(searchPrompt, spots);
    setSelectedSpotId(parsed.landmarkId);
    if (parsed.maxBudget < 50000) setMaxBudget(parsed.maxBudget);
    setNeedsGuide(parsed.needsGuide);
    setSelectedLanguage(parsed.preferredLanguage);
    if (['family', 'foodie', 'photography', 'budget', 'luxury'].includes(parsed.travelVibe)) {
      setStayStyle(parsed.travelVibe as any);
    }

    logSearchToNodeAPI({
      query: searchPrompt,
      landmark: targetSpot.name,
      city: targetSpot.city,
      maxBudget: parsed.maxBudget,
      vibe: parsed.travelVibe
    }).catch(() => {});
  };

  // Text-to-Speech audio synthesizer using standard Web Speech API
  const playAudioPronunciation = (text: string, index?: number) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/\([^)]*\)/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.85;
      utterance.pitch = 1.0;
      if (index !== undefined) setSpeakingPhraseIndex(index);
      utterance.onend = () => setSpeakingPhraseIndex(null);
      utterance.onerror = () => setSpeakingPhraseIndex(null);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Custom phrase translator engine
  const handleTranslateCustomPhrase = (inputOverride?: string) => {
    const query = (inputOverride !== undefined ? inputOverride : customPhraseInput).trim().toLowerCase();
    if (!query) return;

    // Detect target language based on spot
    const isTelugu = targetSpot.city.toLowerCase().includes('hyderabad');
    const isFrench = targetSpot.name.toLowerCase().includes('paris') || targetSpot.city.toLowerCase().includes('paris');

    let matchedKey: string | null = null;
    for (const key of Object.keys(DICTIONARY_MAP)) {
      if (query.includes(key)) {
        matchedKey = key;
        break;
      }
    }

    if (matchedKey) {
      const item = DICTIONARY_MAP[matchedKey];
      if (isFrench) {
        setCustomTranslationResult({
          translated: item.fr,
          pronunciation: item.frPron,
          note: 'French courtesy phrasing'
        });
        playAudioPronunciation(item.fr);
      } else if (isTelugu) {
        setCustomTranslationResult({
          translated: item.te,
          pronunciation: item.tePron,
          note: 'Local Telugu dialect'
        });
        playAudioPronunciation(item.tePron);
      } else {
        setCustomTranslationResult({
          translated: item.hi,
          pronunciation: item.hiPron,
          note: 'Colloquial Hindi / Urdu dialect'
        });
        playAudioPronunciation(item.hiPron);
      }
    } else {
      // Heuristic dialect synthesizer
      if (isFrench) {
        setCustomTranslationResult({
          translated: `Pardon, pouvez-vous m'aider avec cela?`,
          pronunciation: 'Pahr-dohn, poo-vay voo may-day ah-vek suh?',
          note: 'Polite traveler assistance in French'
        });
        playAudioPronunciation(`Pardon, pouvez-vous m'aider avec cela?`);
      } else if (isTelugu) {
        setCustomTranslationResult({
          translated: `దయచేసి నాకు కొంచెం సహాయం చేస్తారా? (Dayachesi sahayamu chesthara?)`,
          pronunciation: 'Duh-yah-chay-see sah-hah-yuh-moo chay-sthah-rah?',
          note: 'Courteous request in Telugu'
        });
        playAudioPronunciation('Dayachesi sahayamu chesthara?');
      } else {
        setCustomTranslationResult({
          translated: `कृपया मेरी मदद कर सकते हैं? (Kripya meri madad kar sakte hain?)`,
          pronunciation: 'Krip-yah may-ree muh-dud kur suk-tay hain?',
          note: 'Polite traveler assistance in Hindi'
        });
        playAudioPronunciation('Kripya meri madad kar sakte hain?');
      }
    }
  };

  // Scroll smoothly to Smart Blocks
  const scrollToSmartBlocks = () => {
    smartBlocksRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Entertaining AI Muse Dialogues
  const getMuseCommentary = () => {
    const spotName = targetSpot.name.split(',')[0];
    const topHotelName = activeHotel?.name || 'our verified partner stay';
    const weeklyVisits = activeHotel?.weeklyCheckins || 385;

    switch (museMood) {
      case 'secret':
        return {
          title: `Aria's Insider Secret for ${spotName}`,
          text: `Did you know? Tourists queue for hours at the front gate, but the real magic happens at ${targetSpot.culturalTips?.[1] || 'dawn when the spotlights turn off'}! Plus, the tea vendor right next door has been pouring spiced chai for 60 years. Rooms at ${topHotelName} are right around the corner!`,
          nudge: `${weeklyVisits} verified travelers checked in this week. Grab your spot before the premier courtyard rooms fill up!`
        };
      case 'food':
        return {
          title: `Aria's Cravings: What to Eat around ${spotName}`,
          text: `Skip the overpriced hotel buffet! ${targetSpot.foodMustEats?.[0]?.name || 'The legendary local street specialty'} at ${targetSpot.foodMustEats?.[0]?.spot || 'the nearest bazaar'} will change your life. ${targetSpot.foodMustEats?.[0]?.tip || 'Pair it with hot cardamom tea.'}`,
          nudge: `Lock in your stay at ${topHotelName} and you'll be within walking distance of every bite!`
        };
      case 'photo':
        return {
          title: `Aria's Golden Hour Photo Formula`,
          text: `Want photos that look like a National Geographic cover? Be at ${targetSpot.name.split(',')[0]} at ${targetSpot.bestTimeToVisit || '06:15 AM'}. The low sun catches the architectural stones at a 45-degree angle with zero crowds in your frame!`,
          nudge: `Staying at ${topHotelName} puts you 5 minutes from the gate. Sleep an extra hour and still beat the tour buses!`
        };
      case 'hype':
      default:
        return {
          title: `Why You Must Lock In ${spotName} Right Now!`,
          text: `Imagine stepping into the morning mist with ${targetSpot.catchyLine || targetSpot.description} while the rest of the world is stuck at their desks. Real travelers are already visiting — ${(targetSpot.monthlyCheckins / 1000).toFixed(0)}k verified check-ins this month alone!`,
          nudge: `We matched you with ${topHotelName} and ${activeGuide ? activeGuide.name : 'a certified guide'}. Lock in your plan now with 0 fake reviews!`
        };
    }
  };

  const muse = getMuseCommentary();

  // Quick destination pills for instant switching
  const QUICK_DESTINATIONS = [
    { label: '🕌 Charminar, Hyderabad', id: 'spot-charminar' },
    { label: '👑 Golconda Fort', id: 'spot-golconda' },
    { label: '🤍 Taj Mahal, Agra', id: 'spot-taj-mahal' },
    { label: '🏖️ Goa Coast', id: 'spot-goa' },
    { label: '🌸 Hawa Mahal, Jaipur', id: 'spot-jaipur' },
    { label: '🌊 Ganges Ghats, Varanasi', id: 'spot-varanasi' },
    { label: '🗼 Eiffel Tower, Paris', id: 'spot-paris' }
  ];

  return (
    <div className="space-y-8 pb-20 text-slate-100">

      {/* 1. Minimalist Search & Destination Quick Selector */}
      <div className="space-y-3">
        
        {/* Minimalist Search Bar */}
        <div className="relative" ref={autocompleteRef}>
          <form onSubmit={handlePromptSubmit}>
            <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 focus-within:border-emerald-500 rounded-2xl px-4 py-3 shadow-xl backdrop-blur-md transition-all">
              <Search className="w-5 h-5 text-emerald-400 shrink-0" />
              <input
                type="text"
                value={searchPrompt}
                onFocus={() => setIsInputFocused(true)}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search any destination worldwide: Taj Mahal, Goa, Charminar, Paris, Jaipur..."
                className="w-full bg-transparent text-white placeholder-slate-400 focus:outline-none text-sm font-medium"
              />
              {searchPrompt && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchPrompt('');
                    setAutocompleteSuggestions([]);
                  }}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-5 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-lg shadow-emerald-500/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>
          </form>

          {/* Autocomplete Dropdown */}
          {isInputFocused && autocompleteSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-2.5 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Verified Destinations</span>
                <span className="text-emerald-400 font-normal">Physical Check-In Indexed</span>
              </div>
              <div className="divide-y divide-slate-800">
                {autocompleteSuggestions.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full px-4 py-3 text-left hover:bg-slate-800/80 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-bold text-xs group-hover:scale-105 transition-transform">
                        📍
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {item.name}, {item.city}
                        </div>
                        <div className="text-xs text-slate-400">
                          {item.category}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-amber-400 flex items-center gap-1 justify-end">
                        <TrendingUp className="w-3 h-3" />
                        <span>{(item.monthlyCheckins / 1000).toFixed(0)}k visits/mo</span>
                      </div>
                      <div className="text-[10px] text-slate-400">zero fake reviews</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Destination Switcher Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs font-semibold text-slate-400 shrink-0">Popular:</span>
          {QUICK_DESTINATIONS.map((dest) => {
            const isSelected = selectedSpotId === dest.id || targetSpot.name.toLowerCase().includes(dest.label.split(' ')[1].toLowerCase());
            return (
              <button
                key={dest.id}
                onClick={() => {
                  setSelectedSpotId(dest.id);
                  setSearchPrompt('');
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                }`}
              >
                {dest.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Destination Showcase Hero: "Very simple: shows destination with its best pic and one catchy line" */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl group">
        
        {/* Background Best Pic */}
        <div className="h-80 sm:h-96 w-full relative overflow-hidden">
          <img
            src={targetSpot.bestPic || targetSpot.image || 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=1400&q=85'}
            alt={targetSpot.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {/* Gradient Overlay for high contrast legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/20" />
        </div>

        {/* Overlay Content */}
        <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between">
          
          {/* Top Bar: Zero Fake Review Footfall Badge & Google Maps link */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 bg-slate-950/85 backdrop-blur-md border border-emerald-500/40 text-emerald-400 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Real Footfall • Zero Fake Reviews</span>
            </div>

            <a
              href={targetSpot.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(targetSpot.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-900 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
            >
              <span>View on Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
            </a>
          </div>

          {/* Bottom Content: Best Pic, Monument Name, One Catchy Line, and Footfall Stats */}
          <div className="space-y-3 max-w-3xl">
            <div className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
              {targetSpot.city} • {targetSpot.tags?.[0] || 'Iconic Destination'}
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
              {targetSpot.name}
            </h1>

            {/* The One Catchy Line */}
            <div className="p-4 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-emerald-500/30 text-emerald-200 text-sm sm:text-base font-medium italic shadow-lg flex items-start gap-3">
              <span className="text-2xl font-serif text-emerald-400 leading-none">“</span>
              <p className="flex-1 not-italic text-slate-100 font-serif text-base sm:text-lg">
                {targetSpot.catchyLine || targetSpot.description}
              </p>
              <span className="text-2xl font-serif text-emerald-400 leading-none">”</span>
            </div>

            {/* Check-In Footfall Indicators */}
            <div className="flex flex-wrap items-center gap-3 text-xs pt-1">
              <div className="flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold px-3 py-1 rounded-xl">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{(targetSpot.monthlyCheckins).toLocaleString()} Verified Physical Visits / Month</span>
              </div>
              <div className="flex items-center gap-1.5 bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 font-semibold px-3 py-1 rounded-xl">
                <Flame className="w-3.5 h-3.5 text-indigo-400" />
                <span>Trend: {targetSpot.checkinTrend.toUpperCase()} Footfall Density</span>
              </div>
              <div className="text-slate-400 flex items-center gap-1 text-[11px]">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Best: {targetSpot.bestTimeToVisit || 'Early morning for 60% lower traffic'}</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 3. "Zero Fake Reviews: Verified Physical Check-In Engine" Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 rounded-2xl border border-slate-800 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                🛡️
              </div>
              <h3 className="text-base font-extrabold text-white">
                Eliminating Fake Reviews: 100% Physical Footfall & Check-In Model
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Traditional platforms are flooded with purchased 5-star bot reviews. TourMatch has completely eliminated star ratings and written reviews. We rank partner stays solely by <b>verified physical GPS check-ins</b> and actual footfall momentum around {targetSpot.name}. Real footsteps cannot be bought or faked.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 shrink-0 w-full md:w-auto">
            <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl text-center">
              <div className="text-xs font-black text-red-400">0</div>
              <div className="text-[10px] text-slate-400">Fake Stars</div>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl text-center">
              <div className="text-xs font-black text-emerald-400">100%</div>
              <div className="text-[10px] text-slate-400">GPS Check-Ins</div>
            </div>
            <div className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl text-center">
              <div className="text-xs font-black text-amber-400">&le; 5 km</div>
              <div className="text-[10px] text-slate-400">Strict Radius</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Entertaining & Persuasive AI Concierge ("Aria - Your Charismatic AI Travel Muse") */}
      <div className="bg-slate-900 rounded-3xl border border-emerald-500/30 p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-emerald-500/20">
                ✨
              </div>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-900 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-white">
                  Aria • Your Charismatic AI Travel Muse
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Lively & Ready to Guide
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Witty insider banter, zero boring fluff, and real reasons to explore {targetSpot.name} today.
              </p>
            </div>
          </div>

          {/* Interactive Entertainment Mood Chips */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'hype', label: '⚡ Hype Me Up!' },
              { id: 'food', label: '🍽️ Food Radar' },
              { id: 'secret', label: '🎭 Spicy Secret' },
              { id: 'photo', label: '📸 Killer Photo' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMuseMood(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  museMood === tab.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Muse Commentary Bubble */}
        <div className="mt-4 bg-slate-950/80 rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              {muse.title}
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Real-time Inspiration</span>
          </div>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
            “{muse.text}”
          </p>

          <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-amber-300 font-bold flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{muse.nudge}</span>
            </div>

            <button
              onClick={scrollToSmartBlocks}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer self-end sm:self-auto shrink-0"
            >
              <span>Explore Selected Plan Blocks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Partner Stays Ranked Strictly by Verified Footfall & Check-Ins */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-xl text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>Partner Stays Ranked by Physical Check-In Visits</span>
            </h3>
            <p className="text-xs text-slate-400">
              Zero fake stars. Evaluated solely by verified traveler check-in volume and walking distance to {targetSpot.name}.
            </p>
          </div>

          {/* Quick Sort Dropdown */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-slate-400 font-semibold">Rank By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="checkins">📍 Total Physical Check-Ins (#1 Most Visited)</option>
              <option value="weeklyVelocity">🔥 Fastest Growing This Week</option>
              <option value="distance">🧭 Closest Walking Distance</option>
              <option value="priceAsc">💵 Price: Low to High</option>
              <option value="priceDesc">💎 Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Stay Cards Grid */}
        <div className="grid grid-cols-1 gap-4">
          {displayedHotels.map(({ hotel, distanceKm, commuteMinutes, rationale, matchedGuide, checkinScore }, idx) => {
            const isSelectedPlan = activePlanRec?.hotel.id === hotel.id;
            const hotelImg = hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

            return (
              <div
                key={hotel.id}
                onClick={() => setSelectedPlanHotelId(hotel.id)}
                className={`bg-slate-900 rounded-3xl border transition-all overflow-hidden flex flex-col lg:flex-row cursor-pointer ${
                  isSelectedPlan
                    ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-xl shadow-emerald-500/10'
                    : 'border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                {/* Image & Rank Badge */}
                <div className="lg:w-72 h-48 lg:h-auto relative shrink-0">
                  <img
                    src={hotelImg}
                    alt={hotel.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent lg:hidden" />
                  
                  {/* Rank Badge */}
                  <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-lg shadow-lg flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>#{idx + 1} Most Visited</span>
                  </div>

                  {/* Active Selected Plan Badge */}
                  {isSelectedPlan && (
                    <div className="absolute bottom-3 left-3 bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1 rounded-lg shadow-lg flex items-center gap-1.5 animate-in fade-in duration-200">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Active Experience Plan</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                          {hotel.tier} • {hotel.city}
                        </div>
                        <h4 className="text-lg font-black text-white mt-0.5">
                          {hotel.name}
                        </h4>
                      </div>

                      {/* Physical Check-In Counter Pill */}
                      <div className="bg-slate-950 border border-slate-800 px-3.5 py-1.5 rounded-xl flex items-center gap-2 self-start sm:self-auto">
                        <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <div className="text-xs font-black text-white">
                            {hotel.checkinCount.toLocaleString()} Verified Visits
                          </div>
                          <div className="text-[10px] text-amber-400 font-semibold">
                            🔥 {hotel.weeklyCheckins} check-ins this week
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Distance & Commute */}
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <div className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-indigo-400" />
                        <span>{distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m away` : `${distanceKm} km away`} from {targetSpot.name.split(',')[0]}</span>
                      </div>
                      <div className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg font-medium">
                        ⏱️ ~{commuteMinutes} mins walking/commute
                      </div>
                      <div className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-lg font-bold">
                        🛡️ 100% Real Footfall • Zero Fake Reviews
                      </div>
                    </div>

                    {/* Perks */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {hotel.perks.map((perk, pIdx) => (
                        <span
                          key={pIdx}
                          className="text-[11px] bg-slate-800/80 text-slate-200 border border-slate-700 px-2 py-0.5 rounded-md font-medium"
                        >
                          ✓ {perk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-slate-400">
                      {matchedGuide ? (
                        <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                          <span>Certified Guide: <b>{matchedGuide.name}</b></span>
                          <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-emerald-400">ASI Licensed</span>
                        </span>
                      ) : (
                        <span>Verified community guide available at checkout</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div>
                        <span className="text-xs text-slate-400">From </span>
                        <span className="text-xl font-black text-white">
                          ₹{hotel.pricePerNight.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400"> / night</span>
                      </div>

                      {/* Select Plan Action Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlanHotelId(hotel.id);
                          scrollToSmartBlocks();
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1 ${
                          isSelectedPlan
                            ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                            : 'bg-slate-800 hover:bg-slate-750 text-white border border-slate-700'
                        }`}
                      >
                        {isSelectedPlan ? <Check className="w-3.5 h-3.5" /> : null}
                        <span>{isSelectedPlan ? 'Active Plan' : 'Select Experience'}</span>
                      </button>

                      {/* Direct 1-Click Book Now Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectHotelForBooking(hotel, matchedGuide);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <span>Book ⚡</span>
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Post-Selection Plan Smart Blocks: "AI shouldn't be just a chatbot it should display few blocks after selecting plan such as translation, and so on" */}
      {activeHotel && (
        <div ref={smartBlocksRef} className="space-y-6 pt-4">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 p-6 rounded-3xl border border-emerald-500/40 shadow-2xl">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold text-emerald-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>AI-Synthesized Experience Command Center</span>
              </div>
              <h3 className="text-2xl font-black text-white">
                Smart Traveler Blocks for {targetSpot.name.split(',')[0]}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                Active Plan: <b className="text-white">{activeHotel.name}</b> • {activeGuide ? `Pre-bundled with ${activeGuide.name}` : 'Independent Stay'}
              </p>
            </div>

            <button
              onClick={() => onSelectHotelForBooking(activeHotel, activeGuide)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/25 cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <span>Lock In My Experience</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Smart Blocks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* BLOCK 1: 🗣️ Local Language & Survival Slang Translator with Audio */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4 md:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-black">
                    🗣️
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-white">
                      Local Language & Survival Slang Translator
                    </h4>
                    <p className="text-xs text-slate-400">
                      Tap any phrase to hear authentic native audio pronunciation or type your own phrase below.
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full self-start sm:self-auto">
                  🔊 Web Speech Audio Active
                </span>
              </div>

              {/* Survival Phrases with Audio Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {(targetSpot.survivalPhrases || [
                  { phrase: 'Hello / Greetings', translation: 'Namaskaram (నమస్కారం) / Namaste', pronunciation: 'Nah-mas-kahr-am', context: 'Universal polite greeting' },
                  { phrase: 'How much is this?', translation: 'Idhi entha? (ఇది ఎంత?)', pronunciation: 'Ee-dhee en-thah?', context: 'Essential for bazaar bargaining' },
                  { phrase: 'Can you reduce the price?', translation: 'Koncham thagginchandi', pronunciation: 'Kone-chum thug-gin-chun-dee', context: 'Polite bargaining phrase' },
                  { phrase: 'Where is authentic Biryani / Food?', translation: 'Manchi Biryani ekkada?', pronunciation: 'Mun-chee bir-yah-nee ek-kuh-dah?', context: 'Food navigation' },
                  { phrase: 'Thank you very much!', translation: 'Chala Dhanyavadhalu', pronunciation: 'Chah-lah dhun-yah-vah-dha-loo', context: 'Expressing warm gratitude' }
                ]).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-2 group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {item.phrase}
                        </span>
                        <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded-md">
                          {item.context}
                        </span>
                      </div>
                      <div className="mt-1 text-sm font-semibold text-emerald-400">
                        {item.translation}
                      </div>
                      <div className="text-[11px] text-slate-400 italic">
                        Pronunciation: "{item.pronunciation}"
                      </div>
                    </div>

                    <button
                      onClick={() => playAudioPronunciation(item.pronunciation || item.translation, idx)}
                      className={`w-full mt-2 py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        speakingPhraseIndex === idx
                          ? 'bg-indigo-600 text-white animate-pulse'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{speakingPhraseIndex === idx ? 'Speaking...' : 'Listen Audio 🔊'}</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Interactive Custom Phrase Input */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <div className="text-xs font-bold text-slate-300">
                  Try Custom Phrase Translation:
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={customPhraseInput}
                    onChange={(e) => setCustomPhraseInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTranslateCustomPhrase()}
                    placeholder="Type anything (e.g., 'where is chai', 'is it too spicy?', 'call taxi', 'discount')..."
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleTranslateCustomPhrase()}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Translate & Speak</span>
                  </button>
                </div>

                {/* Quick chip pills for custom translator */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-500">Suggestions:</span>
                  {['Where is good tea?', 'How much is this?', 'Can you give discount?', 'Where is washroom?', 'Is this vegetarian?'].map((chip, cIdx) => (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => {
                        setCustomPhraseInput(chip);
                        handleTranslateCustomPhrase(chip);
                      }}
                      className="text-[11px] bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Custom Translation Result Card */}
                {customTranslationResult && (
                  <div className="mt-3 p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 animate-in fade-in slide-in-from-top-2 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                        {customTranslationResult.note}
                      </span>
                      <div className="text-base font-bold text-white">
                        {customTranslationResult.translated}
                      </div>
                      <div className="text-xs text-indigo-200 italic">
                        Pronunciation: "{customTranslationResult.pronunciation}"
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => playAudioPronunciation(customTranslationResult.pronunciation)}
                      className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer shrink-0 transition-all shadow-md"
                      title="Replay Audio"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* BLOCK 2: 🍽️ Secret Local Food & Hidden Stalls Radar */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-white">
                    Secret Food Radar near {targetSpot.name.split(',')[0]}
                  </h4>
                  <p className="text-xs text-slate-400">
                    Handpicked authentic delicacies & specific stalls (zero tourist traps).
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {(targetSpot.foodMustEats || [
                  { name: 'Irani Chai & Fresh Osmania Biscuits', spot: 'Nimrah Cafe (Directly Opposite Monument)', tip: 'Dip the salted biscuit into the warm cardamom tea.' },
                  { name: 'Kacche Gosht ki Dum Biryani', spot: 'Hotel Shadab (Old City)', tip: 'Served piping hot with fiery Mirchi ka Salan.' },
                  { name: 'Zafrani Malai Kulfi', spot: 'Old City Bazaar Stalls', tip: 'Slow-simmered saffron milk churned in earthen pots.' }
                ]).map((food, fIdx) => (
                  <div key={fIdx} className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-300">{food.name}</span>
                      <span className="text-[10px] text-slate-400">Must-Eat</span>
                    </div>
                    <div className="text-xs text-white font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                      <span>{food.spot}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 italic pt-0.5">
                      💡 Pro Tip: {food.tip}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BLOCK 3: 🚕 Scam-Free Commute & Auto-Rickshaw Guide */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-black">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-white">
                    Scam-Free Commute & Auto Guide
                  </h4>
                  <p className="text-xs text-slate-400">
                    Honest benchmark fares and bargaining tips to avoid getting overcharged.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Fair Benchmark Fares</span>
                  <div className="text-sm font-black text-emerald-400">
                    {targetSpot.commuteTips?.autoFare || '₹60-100 within local sector; ₹200 from central railway station.'}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Transit Recommendation</span>
                  <div className="text-slate-300 font-medium">
                    {targetSpot.commuteTips?.localAdvice || 'Metro or pre-fixed electric rickshaws offer guaranteed transparent pricing.'}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 text-indigo-200">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>💡 Bargaining Script:</span>
                  </div>
                  <div className="text-[11px] italic mt-1 text-slate-300">
                    "Meter chalu karo bhaiya ya ₹80 fix?" (Start the meter brother or fix at ₹80?)
                  </div>
                </div>
              </div>
            </div>

            {/* BLOCK 4: 🎒 Smart Weather & Cultural Etiquette / Modesty Radar */}
            <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-black">
                  <Shirt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-white">
                    Cultural Modesty & Etiquette Radar
                  </h4>
                  <p className="text-xs text-slate-400">
                    Essential dress codes, sacred customs, and photography rules.
                  </p>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-300">
                {(targetSpot.culturalTips || [
                  'Remove footwear at monument steps and wear respectful shoulder/knee attire.',
                  'Bargaining is expected in local bazaars; start courteously at 60-70% of quoted price.',
                  'Best photography light is 08:30 AM or 06:45 PM when spotlights turn on.'
                ]).map((tip, tIdx) => (
                  <li key={tIdx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
                    <span className="text-purple-400 font-bold mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* BLOCK 5: ⚡ 1-Click "Lock In My Experience" Direct Booking Action */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/60 rounded-3xl border border-emerald-500/50 p-6 shadow-2xl flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-white">
                        Direct Booking Action
                      </h4>
                      <p className="text-xs text-slate-400">
                        Lock in stay, certified guide, and partner perks in 1 click.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30">
                    Instant
                  </span>
                </div>

                {/* Summary Details */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400">Selected Stay:</span>
                    <span className="font-extrabold text-white">{activeHotel.name}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400">Proximity to Spot:</span>
                    <span className="font-bold text-indigo-300">{activePlanRec?.distanceKm < 1 ? `${Math.round(activePlanRec.distanceKm * 1000)}m` : `${activePlanRec?.distanceKm} km`}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400">Add-on Guide:</span>
                    <span className="font-bold text-amber-300">{activeGuide ? activeGuide.name : 'Certified Guide Included'}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-slate-400">Rate:</span>
                    <span className="font-black text-emerald-400 text-sm">₹{activeHotel.pricePerNight.toLocaleString()} / night</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectHotelForBooking(activeHotel, activeGuide)}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 px-6 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-500/25 cursor-pointer"
              >
                <span>Proceed to Direct Checkout (Lock In Plan)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      )}

      {/* 7. Interactive Spatial Radar Map (5 km Geo-Radius) */}
      <div className="space-y-2 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">
              Spatial Radar: 5 km Geo-Radius around {targetSpot.name.split(',')[0]}
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            {displayedHotels.length} Partner Stays Plotted
          </span>
        </div>

        <InteractiveMap
          spot={targetSpot}
          hotels={displayedHotels.map(r => r.hotel)}
          selectedHotelId={activeHotelHover || selectedPlanHotelId}
          onSelectHotel={(hotel) => {
            setSelectedPlanHotelId(hotel.id);
            scrollToSmartBlocks();
          }}
          radiusKm={spatialRadiusKm}
        />
      </div>

    </div>
  );
};
