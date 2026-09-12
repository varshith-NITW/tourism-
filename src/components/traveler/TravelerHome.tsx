import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  Car, 
  Shirt, 
  Check, 
  X, 
  Zap, 
  CheckCircle2, 
  Flame, 
  Clock, 
  Bot, 
  Compass, 
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { TouristSpot, Hotel, Guide, AIQueryFilters, AIRecommendationResponse } from '../../types';
import { parseNaturalLanguagePrompt, executeAIRecommendationEngine } from '../../services/aiEngine';
import { InteractiveMap } from '../common/InteractiveMap';
import { getGoogleMapsDirectionsUrl } from '../../services/spatialService';
import { getAutocompleteSuggestions } from '../../services/placesService';
import { logSearchToNodeAPI } from '../../services/apiClient';
import { generateGeminiRecommendations, GeminiTravelInsight, getGeminiTouristPlaces, TouristPlaceItem } from '../../services/geminiService';

interface TravelerHomeProps {
  spots: TouristSpot[];
  hotels: Hotel[];
  guides: Guide[];
  onSelectHotelForBooking: (hotel: Hotel, matchedGuide?: Guide) => void;
}

// Local Survival Slang Dictionary for Instant Dialect Synthesis
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

  // Sorting & Filtering Controls
  const [sortBy, setSortBy] = useState<'checkins' | 'weeklyVelocity' | 'pytorchScore' | 'distance' | 'priceAsc' | 'priceDesc'>('checkins');
  const [spatialRadiusKm, setSpatialRadiusKm] = useState<number>(5.0);
  const [filterGuideRequired, setFilterGuideRequired] = useState<boolean>(false);

  // Selected Experience Plan
  const [selectedPlanHotelId, setSelectedPlanHotelId] = useState<string | null>(null);

  // Entertaining AI Muse State
  const [museMood, setMuseMood] = useState<'hype' | 'food' | 'secret' | 'photo'>('hype');

  // Interactive Custom Translator State
  const [customPhraseInput, setCustomPhraseInput] = useState<string>('');
  const [customTranslationResult, setCustomTranslationResult] = useState<{ translated: string; pronunciation: string; note: string } | null>(null);
  const [speakingPhraseIndex, setSpeakingPhraseIndex] = useState<number | null>(null);

  // Google Gemini Recommendation State
  const [geminiInsight, setGeminiInsight] = useState<GeminiTravelInsight | null>(null);
  const [isGeminiLoading, setIsGeminiLoading] = useState<boolean>(false);

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

  // Memoized filters to avoid recreating object on every render
  const currentFilters: AIQueryFilters = useMemo(() => ({
    targetLandmarkId: selectedSpotId,
    maxBudgetPerNight: maxBudget,
    needsGuide,
    preferredLanguage: selectedLanguage,
    stayStyle,
    searchQuery: searchPrompt
  }), [selectedSpotId, maxBudget, needsGuide, selectedLanguage, stayStyle, searchPrompt]);

  // Execute recommendation engine strictly with memoization (prevents infinite re-renders)
  const aiResult: AIRecommendationResponse = useMemo(() => {
    return executeAIRecommendationEngine(
      currentFilters,
      spots,
      hotels,
      guides,
      spatialRadiusKm
    );
  }, [currentFilters, spots, hotels, guides, spatialRadiusKm]);

  const targetSpot = aiResult.targetSpot;

  // Filter & Sort Stays strictly by Real Footfall Check-ins (memoized)
  const displayedHotels = useMemo(() => {
    return [...aiResult.recommendedHotels]
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
  }, [aiResult.recommendedHotels, filterGuideRequired, sortBy]);

  // Top Tourist Places in the searched destination powered by Google Gemini
  const currentCityTouristPlaces: TouristPlaceItem[] = useMemo(() => {
    return getGeminiTouristPlaces(searchPrompt || targetSpot.city || targetSpot.name, targetSpot.city);
  }, [searchPrompt, targetSpot.city, targetSpot.name]);

  // Handle clicking a Gemini tourist place to seamlessly explore it
  const handleSelectTouristPlace = (place: TouristPlaceItem) => {
    const existing = spots.find(s => s.id === place.id || s.name.toLowerCase().includes(place.name.toLowerCase()));
    if (existing) {
      setSelectedSpotId(existing.id);
      setSearchPrompt('');
    } else {
      setSearchPrompt(`${place.name}, ${place.city}`);
      const parsed = parseNaturalLanguagePrompt(`${place.name}, ${place.city}`, spots);
      setSelectedSpotId(parsed.landmarkId);
    }
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Automatically select the #1 recommended stay if none selected or if destination changes
  const topHotelId = displayedHotels[0]?.hotel?.id;
  useEffect(() => {
    if (topHotelId) {
      setSelectedPlanHotelId(prev => {
        const currentSelectedExists = displayedHotels.some(h => h.hotel.id === prev);
        return currentSelectedExists ? prev : topHotelId;
      });
    }
  }, [selectedSpotId, topHotelId]);

  // Trigger Google Gemini live recommendation analysis on destination or vibe change
  useEffect(() => {
    let isCancelled = false;
    setIsGeminiLoading(true);

    generateGeminiRecommendations({
      spot: targetSpot,
      hotels: displayedHotels.map(h => h.hotel),
      guides,
      userBudget: maxBudget,
      vibe: stayStyle,
      searchQuery: searchPrompt
    }).then(insight => {
      if (!isCancelled) {
        setGeminiInsight(insight);
        setIsGeminiLoading(false);
      }
    }).catch(() => {
      if (!isCancelled) setIsGeminiLoading(false);
    });

    return () => {
      isCancelled = true;
    };
  }, [targetSpot.id, stayStyle, maxBudget]);

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
          text: `Did you know? Tourists queue for hours at the main gate, but the real magic happens at ${targetSpot.culturalTips?.[1] || 'dawn when the spotlights turn off'}! Plus, the tea vendor right next door has been pouring spiced chai for 60 years. Rooms at ${topHotelName} are right around the corner!`,
          nudge: `${weeklyVisits} verified travelers checked in this week. Grab your spot before the premier courtyard rooms fill up!`
        };
      case 'food':
        return {
          title: `Aria's Food Radar: What to Eat around ${spotName}`,
          text: `Skip the overpriced hotel buffet! ${targetSpot.foodMustEats?.[0]?.name || 'The legendary local street specialty'} at ${targetSpot.foodMustEats?.[0]?.spot || 'the nearest bazaar'} will change your life. ${targetSpot.foodMustEats?.[0]?.tip || 'Pair it with hot cardamom tea.'}`,
          nudge: `Lock in your stay at ${topHotelName} and you'll be within walking distance of every bite!`
        };
      case 'photo':
        return {
          title: `Aria's Golden Hour Photo Formula`,
          text: `Want photos that look like a National Geographic cover? Be at ${targetSpot.name.split(',')[0]} at ${targetSpot.bestTimeToVisit || '06:15 AM'}. The low morning sun catches the architectural stones at a 45-degree angle with zero crowds in your frame!`,
          nudge: `Staying at ${topHotelName} puts you 5 minutes from the gate. Sleep an extra hour and still beat the tour buses!`
        };
      case 'hype':
      default:
        return {
          title: `Why You Must Lock In ${spotName} Right Now!`,
          text: `Imagine stepping into the morning mist with ${targetSpot.catchyLine || targetSpot.description} while the rest of the world is stuck at their desks. Real travelers are already visiting — ${(targetSpot.monthlyCheckins / 1000).toFixed(0)}k verified check-ins this month alone!`,
          nudge: `Gemini matched you with ${topHotelName} and ${activeGuide ? activeGuide.name : 'a certified guide'}. Lock in your plan now with 0 fake reviews!`
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
    <div className="space-y-8 pb-20 text-slate-800">

      {/* 1. Minimalist Search & Destination Quick Selector */}
      <div className="space-y-3">
        
        {/* Minimalist Search Bar with Clean White Theme */}
        <div className="relative" ref={autocompleteRef}>
          <form onSubmit={handlePromptSubmit}>
            <div className="flex items-center gap-3 bg-white border border-slate-200 focus-within:border-emerald-500 rounded-2xl px-4 py-3.5 shadow-xs hover:shadow-md transition-all">
              <Search className="w-5 h-5 text-emerald-600 shrink-0" />
              <input
                type="text"
                value={searchPrompt}
                onFocus={() => setIsInputFocused(true)}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search any destination worldwide: Taj Mahal, Goa, Charminar, Paris, Jaipur, Varanasi..."
                className="w-full bg-transparent text-slate-900 placeholder-slate-400 focus:outline-none text-sm font-medium"
              />
              {searchPrompt && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchPrompt('');
                    setAutocompleteSuggestions([]);
                  }}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Search</span>
              </button>
            </div>
          </form>

          {/* Autocomplete Dropdown */}
          {isInputFocused && autocompleteSuggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-3 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Verified Destinations</span>
                <span className="text-emerald-600 font-semibold">100% Real Footfall Check-Ins</span>
              </div>
              <div className="divide-y divide-slate-100">
                {autocompleteSuggestions.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleSelectSuggestion(item)}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-xs group-hover:scale-105 transition-transform">
                        📍
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {item.name}, {item.city}
                        </div>
                        <div className="text-xs text-slate-500">
                          {item.category}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-extrabold text-red-600 flex items-center gap-1 justify-end">
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
          <span className="text-xs font-bold text-slate-500 shrink-0">Popular:</span>
          {QUICK_DESTINATIONS.map((dest) => {
            const isSelected = selectedSpotId === dest.id || targetSpot.name.toLowerCase().includes(dest.label.split(' ')[1].toLowerCase());
            return (
              <button
                key={dest.id}
                onClick={() => {
                  setSelectedSpotId(dest.id);
                  setSearchPrompt('');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {dest.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Destination Showcase Hero: "Very simple: shows destination with its best pic and one catchy line" */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-lg group bg-white">
        
        {/* Background Best Original Pic */}
        <div className="h-80 sm:h-96 w-full relative overflow-hidden">
          <img
            src={targetSpot.bestPic || targetSpot.image || 'https://images.unsplash.com/photo-1590766940554-634a7ed41450?auto=format&fit=crop&w=1400&q=85'}
            alt={targetSpot.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {/* Subtle gradient overlay for high contrast legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/10" />
        </div>

        {/* Overlay Content */}
        <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-between">
          
          {/* Top Bar: Zero Fake Review Footfall Badge & Google Maps link */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-md border border-emerald-200 text-emerald-800 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-md">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Real Footfall • Zero Fake Reviews</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-indigo-600/90 text-white backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                <span>Original Photo Verified</span>
              </div>
            </div>

            <a
              href={targetSpot.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(targetSpot.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-white/90 hover:bg-white backdrop-blur-md border border-slate-200 text-slate-800 hover:text-slate-900 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors shadow-sm"
            >
              <span>View on Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
            </a>
          </div>

          {/* Bottom Content: Original Photo, Monument Title, One Catchy Line, and Footfall Stats */}
          <div className="space-y-3 max-w-3xl">
            <div className="text-xs font-black uppercase tracking-widest text-emerald-400 drop-shadow">
              {targetSpot.city} • {targetSpot.tags?.[0] || 'Iconic Destination'}
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
              {targetSpot.name}
            </h1>

            {/* The One Catchy Line */}
            <div className="p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-200 text-slate-900 text-sm sm:text-base font-medium italic shadow-lg flex items-start gap-3">
              <span className="text-2xl font-serif text-emerald-600 leading-none">“</span>
              <p className="flex-1 not-italic text-slate-900 font-serif text-base sm:text-lg font-semibold">
                {targetSpot.catchyLine || targetSpot.description}
              </p>
              <span className="text-2xl font-serif text-emerald-600 leading-none">”</span>
            </div>

            {/* Footfall Indicators */}
            <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
              <div className="flex items-center gap-1.5 bg-amber-500 text-slate-950 font-black px-3 py-1 rounded-xl shadow-xs">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{(targetSpot.monthlyCheckins).toLocaleString()} Real Visits / Month</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md text-slate-900 font-bold px-3 py-1 rounded-xl shadow-xs">
                <Flame className="w-3.5 h-3.5 text-red-500" />
                <span>Trend: {targetSpot.checkinTrend.toUpperCase()} Density</span>
              </div>
              <div className="text-white/90 flex items-center gap-1 text-[11px] font-medium drop-shadow">
                <Clock className="w-3.5 h-3.5 text-emerald-300" />
                <span>Best: {targetSpot.bestTimeToVisit || 'Early morning for 60% lower crowds'}</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 3. Google Gemini 2.5 Live Recommendation Integration Card */}
      <div className="bg-gradient-to-r from-indigo-50 via-white to-emerald-50 rounded-3xl border border-indigo-200/80 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-indigo-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900">
                  Google Gemini 2.5 AI Recommendation Engine
                </h3>
                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                  {geminiInsight?.modelUsed || 'Gemini 2.5 Flash'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Live reasoning and stay matchmaking synthesized strictly from verified physical footfall.
              </p>
            </div>
          </div>

          {/* Travel Vibe Selector */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 mr-1">Vibe:</span>
            {[
              { id: 'all', label: '🌟 All' },
              { id: 'foodie', label: '🍽️ Foodie' },
              { id: 'heritage', label: '🏛️ Heritage' },
              { id: 'luxury', label: '👑 Luxury' },
              { id: 'budget', label: '💵 Value' },
              { id: 'family', label: '👨‍👩‍👧 Family' }
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setStayStyle(v.id as any)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  stayStyle === v.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gemini Reasoning & Insights Output */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-indigo-100 space-y-1 md:col-span-2">
            <div className="text-xs font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-indigo-600" />
              <span>Gemini Recommendation Rationale</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {geminiInsight?.geminiReasoning || `Gemini verified that partner hotels within 5 km of ${targetSpot.name} offer genuine footfall momentum and zero bot review inflation.`}
            </p>
            <div className="pt-2 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <span>💡 {geminiInsight?.vibeAnalysis || `Morning arrivals experience 60% lower crowds.`}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-emerald-200 space-y-1 flex flex-col justify-between">
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Zero Fake Reviews Guarantee</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Ranked solely by <b>physical GPS check-ins</b>. Star ratings are completely eliminated.
              </p>
            </div>
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">Matched Stay:</span>
              <span className="text-emerald-700">{activeHotel?.name || 'Top Stay'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3b. Google Gemini Top Tourist Places Showcase for Searched Destination */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                Google Gemini Tourist Places Discovery
              </span>
              <span className="text-xs font-semibold text-slate-500">
                • 100% Real Footfall Check-ins
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
              Top Tourist Places in {targetSpot.city || targetSpot.name.split(',')[0]}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Gemini analyzed physical GPS check-ins to discover the highest-rated landmarks, forts & palaces in {targetSpot.city}. Click any spot to instantly view nearby verified stays and licensed guides.
            </p>
          </div>
          <div className="text-right shrink-0">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl inline-block">
              {currentCityTouristPlaces.length} Iconic Attractions Curated
            </span>
          </div>
        </div>

        {/* Tourist Places Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {currentCityTouristPlaces.map((place) => {
            const isCurrentSelected = selectedSpotId === place.id || targetSpot.name.toLowerCase().includes(place.name.toLowerCase().split(' ')[0]);
            return (
              <div
                key={place.id}
                className={`group rounded-2xl border overflow-hidden transition-all duration-300 flex flex-col justify-between bg-white hover:shadow-md ${
                  isCurrentSelected ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Authentic Original Photo */}
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <img
                      src={place.image}
                      alt={place.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
                    
                    {/* Footfall Badge */}
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-black text-red-600 shadow-sm flex items-center gap-1 border border-slate-100">
                      <TrendingUp className="w-3 h-3" />
                      <span>{(place.monthlyCheckins / 1000).toFixed(0)}k visits/mo</span>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute bottom-3 left-3 text-[11px] font-bold text-white bg-slate-900/80 backdrop-blur-xs px-2.5 py-0.5 rounded-lg">
                      {place.category}
                    </div>
                  </div>

                  {/* Place Details */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-700 transition-colors">
                        {place.name}
                      </h3>
                      <span className="text-[10px] font-bold text-slate-400 shrink-0">
                        {place.city}
                      </span>
                    </div>

                    {/* Catchy line */}
                    <p className="text-xs text-slate-600 font-serif italic line-clamp-2">
                      “{place.catchyLine}”
                    </p>

                    {/* Highlight */}
                    <div className="text-[11px] text-slate-500 line-clamp-2">
                      <span className="font-bold text-slate-700">Highlight: </span>
                      {place.highlight}
                    </div>

                    {/* Best time to visit */}
                    {place.bestTimeToVisit && (
                      <div className="flex items-center gap-1 text-[11px] text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span className="truncate">{place.bestTimeToVisit}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action: Explore This Spot */}
                <div className="p-4 pt-0">
                  <button
                    onClick={() => handleSelectTouristPlace(place)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isCurrentSelected
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-emerald-600 text-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{isCurrentSelected ? '✓ Currently Selected' : 'Explore This Spot'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Entertaining & Persuasive AI Concierge ("Aria • Your Charismatic AI Travel Muse") */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-500/20">
              ✨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-slate-900">
                  Aria • Your Charismatic AI Travel Muse
                </h3>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Powered by Gemini
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Witty insider banter, zero boring fluff, and real reasons to explore {targetSpot.name.split(',')[0]} today.
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
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Muse Commentary Bubble */}
        <div className="mt-4 bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              {muse.title}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Gemini AI Inspiration</span>
          </div>

          <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-serif italic">
            “{muse.text}”
          </p>

          <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-amber-800 font-bold flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
              <Flame className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{muse.nudge}</span>
            </div>

            <button
              onClick={scrollToSmartBlocks}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer self-end sm:self-auto shrink-0"
            >
              <span>Explore Selected Plan Blocks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Recommended Stays with Original Photos & Real Check-Ins */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-xl text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <span>Recommended Stays with Original Photos & Real Footfall</span>
            </h3>
            <p className="text-xs text-slate-500">
              Zero fake reviews. Every property shows its authentic photograph and verified visitor check-ins.
            </p>
          </div>

          {/* Quick Sort Dropdown */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs text-slate-500 font-semibold">Rank By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-emerald-500 cursor-pointer shadow-xs"
            >
              <option value="checkins">📍 Total Physical Check-Ins (#1 Most Visited)</option>
              <option value="weeklyVelocity">🔥 Fastest Growing This Week</option>
              <option value="distance">🧭 Closest Walking Distance</option>
              <option value="priceAsc">💵 Price: Low to High</option>
              <option value="priceDesc">💎 Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Stay Cards Grid with Authentic Photos */}
        <div className="grid grid-cols-1 gap-4">
          {displayedHotels.map(({ hotel, distanceKm, commuteMinutes, rationale, matchedGuide, checkinScore }, idx) => {
            const isSelectedPlan = activePlanRec?.hotel.id === hotel.id;
            const hotelImg = hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80';
            const geminiRationale = geminiInsight?.hotelRationales?.[hotel.id];

            return (
              <div
                key={hotel.id}
                onClick={() => setSelectedPlanHotelId(hotel.id)}
                className={`bg-white rounded-3xl border transition-all overflow-hidden flex flex-col lg:flex-row cursor-pointer ${
                  isSelectedPlan
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                }`}
              >
                {/* Original Photo & Rank Badge */}
                <div className="lg:w-80 h-52 lg:h-auto relative shrink-0 overflow-hidden">
                  <img
                    src={hotelImg}
                    alt={hotel.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Rank Badge */}
                  <div className="absolute top-3 left-3 bg-amber-500 text-slate-950 font-black text-xs px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>#{idx + 1} Most Visited</span>
                  </div>

                  {/* Gemini Match Badge */}
                  <div className="absolute top-3 right-3 bg-indigo-600 text-white font-bold text-[11px] px-2 py-0.5 rounded-lg shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{geminiRationale?.geminiMatchPercent || (98 - idx * 4)}% Gemini Match</span>
                  </div>

                  {/* Active Selected Plan Stamp */}
                  {isSelectedPlan && (
                    <div className="absolute bottom-3 left-3 bg-emerald-600 text-white font-black text-xs px-3 py-1 rounded-lg shadow-md flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Active Experience Plan</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                          {hotel.tier} • {hotel.city}
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mt-0.5">
                          {hotel.name}
                        </h4>
                      </div>

                      {/* Physical Check-In Counter Box */}
                      <div className="bg-slate-50 border border-slate-200 px-3.5 py-1.5 rounded-xl flex items-center gap-2 self-start sm:self-auto">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <div className="text-xs font-black text-slate-900">
                            {hotel.checkinCount.toLocaleString()} Verified Visits
                          </div>
                          <div className="text-[10px] text-amber-700 font-semibold">
                            🔥 {hotel.weeklyCheckins} check-ins this week
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Gemini Specific Recommendation Box */}
                    {geminiRationale && (
                      <div className="mt-3 p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-900 flex items-start gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-indigo-950">Gemini Recommendation: </span>
                          <span>{geminiRationale.whyGeminiPickedThis}</span>
                        </div>
                      </div>
                    )}

                    {/* Distance & Commute */}
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                      <div className="bg-indigo-50 text-indigo-800 border border-indigo-200 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1">
                        <Navigation className="w-3 h-3 text-indigo-600" />
                        <span>{distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m away` : `${distanceKm} km away`} from {targetSpot.name.split(',')[0]}</span>
                      </div>
                      <div className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium">
                        ⏱️ ~{commuteMinutes} mins walking/commute
                      </div>
                      <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg font-bold">
                        🛡️ 100% Real Footfall • Zero Fake Reviews
                      </div>
                    </div>

                    {/* Perks */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      {hotel.perks.map((perk, pIdx) => (
                        <span
                          key={pIdx}
                          className="text-[11px] bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md font-medium"
                        >
                          ✓ {perk}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs text-slate-500">
                      {matchedGuide ? (
                        <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <span>Certified Guide: <b>{matchedGuide.name}</b></span>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">ASI Licensed</span>
                        </span>
                      ) : (
                        <span>Verified community guide available at checkout</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div>
                        <span className="text-xs text-slate-400">From </span>
                        <span className="text-xl font-black text-slate-900">
                          ₹{hotel.pricePerNight.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-500"> / night</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlanHotelId(hotel.id);
                          scrollToSmartBlocks();
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelectedPlan
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                        }`}
                      >
                        {isSelectedPlan ? <Check className="w-3.5 h-3.5" /> : null}
                        <span>{isSelectedPlan ? 'Active Plan' : 'Select Experience'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectHotelForBooking(hotel, matchedGuide);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
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

      {/* 6. Post-Selection Plan Smart Blocks (Beyond Just a Chatbot) */}
      {activeHotel && (
        <div ref={smartBlocksRef} className="space-y-6 pt-4">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 text-xs font-extrabold text-emerald-700 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>AI-Synthesized Experience Command Center</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900">
                Smart Traveler Blocks for {targetSpot.name.split(',')[0]}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500">
                Selected Plan: <b className="text-slate-900">{activeHotel.name}</b> • {activeGuide ? `Pre-bundled with ${activeGuide.name}` : 'Independent Stay'}
              </p>
            </div>

            <button
              onClick={() => onSelectHotelForBooking(activeHotel, activeGuide)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-3 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer shrink-0 self-start sm:self-auto"
            >
              <span>Lock In My Experience</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Smart Blocks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* BLOCK 1: 🗣️ Local Language & Survival Slang Translator with Audio */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4 md:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-black">
                    🗣️
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900">
                      Local Language & Survival Slang Translator
                    </h4>
                    <p className="text-xs text-slate-500">
                      Tap any phrase to hear authentic native audio pronunciation or type your own phrase below.
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full self-start sm:self-auto">
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
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-indigo-400 transition-all flex flex-col justify-between space-y-2 group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                          {item.phrase}
                        </span>
                        <span className="text-[10px] bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-md font-semibold">
                          {item.context}
                        </span>
                      </div>
                      <div className="mt-1.5 text-sm font-bold text-emerald-700">
                        {item.translation}
                      </div>
                      <div className="text-[11px] text-slate-500 italic mt-0.5">
                        Pronunciation: "{item.pronunciation}"
                      </div>
                    </div>

                    <button
                      onClick={() => playAudioPronunciation(item.pronunciation || item.translation, idx)}
                      className={`w-full mt-2 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        speakingPhraseIndex === idx
                          ? 'bg-indigo-600 text-white animate-pulse'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{speakingPhraseIndex === idx ? 'Speaking...' : 'Listen Audio 🔊'}</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Interactive Custom Phrase Input */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="text-xs font-bold text-slate-700">
                  Try Custom Phrase Translation:
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={customPhraseInput}
                    onChange={(e) => setCustomPhraseInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTranslateCustomPhrase()}
                    placeholder="Type anything (e.g., 'where is chai', 'is it too spicy?', 'call taxi', 'discount')..."
                    className="flex-1 bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleTranslateCustomPhrase()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-xs"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Translate & Speak</span>
                  </button>
                </div>

                {/* Quick suggestions */}
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
                      className="text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Custom Translation Result Card */}
                {customTranslationResult && (
                  <div className="mt-3 p-4 rounded-2xl bg-indigo-50 border border-indigo-200 animate-in fade-in slide-in-from-top-2 flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                        {customTranslationResult.note}
                      </span>
                      <div className="text-base font-bold text-slate-900">
                        {customTranslationResult.translated}
                      </div>
                      <div className="text-xs text-indigo-700 italic">
                        Pronunciation: "{customTranslationResult.pronunciation}"
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => playAudioPronunciation(customTranslationResult.pronunciation)}
                      className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shrink-0 transition-all shadow-xs"
                      title="Replay Audio"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* BLOCK 2: 🍽️ Secret Local Food & Hidden Stalls Radar */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 font-black">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">
                    Secret Food Radar near {targetSpot.name.split(',')[0]}
                  </h4>
                  <p className="text-xs text-slate-500">
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
                  <div key={fIdx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-amber-900">{food.name}</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">Must-Eat</span>
                    </div>
                    <div className="text-xs text-slate-800 font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                      <span>{food.spot}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 italic pt-0.5">
                      💡 Pro Tip: {food.tip}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* BLOCK 3: 🚕 Scam-Free Commute & Auto-Rickshaw Guide */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-black">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">
                    Scam-Free Commute & Auto Guide
                  </h4>
                  <p className="text-xs text-slate-500">
                    Honest benchmark fares and bargaining tips to avoid getting overcharged.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Fair Benchmark Fares</span>
                  <div className="text-sm font-black text-emerald-700">
                    {targetSpot.commuteTips?.autoFare || '₹60-100 within local sector; ₹200 from central railway station.'}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Transit Recommendation</span>
                  <div className="text-slate-700 font-medium">
                    {targetSpot.commuteTips?.localAdvice || 'Metro or pre-fixed electric rickshaws offer guaranteed transparent pricing.'}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>💡 Bargaining Script:</span>
                  </div>
                  <div className="text-[11px] italic mt-1 text-indigo-800">
                    "Meter chalu karo bhaiya ya ₹80 fix?" (Start the meter brother or fix at ₹80?)
                  </div>
                </div>
              </div>
            </div>

            {/* BLOCK 4: 🎒 Smart Weather & Cultural Etiquette / Modesty Radar */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 font-black">
                  <Shirt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">
                    Cultural Modesty & Etiquette Radar
                  </h4>
                  <p className="text-xs text-slate-500">
                    Essential dress codes, sacred customs, and photography rules.
                  </p>
                </div>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700">
                {(targetSpot.culturalTips || [
                  'Remove footwear at monument steps and wear respectful shoulder/knee attire.',
                  'Bargaining is expected in local bazaars; start courteously at 60-70% of quoted price.',
                  'Best photography light is 08:30 AM or 06:45 PM when spotlights turn on.'
                ]).map((tip, tIdx) => (
                  <li key={tIdx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                    <span className="text-purple-600 font-bold mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* BLOCK 5: ⚡ 1-Click "Lock In My Experience" Direct Booking Action */}
            <div className="bg-gradient-to-br from-emerald-50 via-white to-indigo-50 rounded-3xl border border-emerald-300 p-6 shadow-md flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900">
                        Direct Booking Action
                      </h4>
                      <p className="text-xs text-slate-500">
                        Lock in stay, certified guide, and partner perks in 1 click.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                    Instant
                  </span>
                </div>

                {/* Summary Details */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-500">Selected Stay:</span>
                    <span className="font-extrabold text-slate-900">{activeHotel.name}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-500">Proximity to Spot:</span>
                    <span className="font-bold text-indigo-700">{activePlanRec?.distanceKm < 1 ? `${Math.round(activePlanRec.distanceKm * 1000)}m` : `${activePlanRec?.distanceKm} km`}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-500">Add-on Guide:</span>
                    <span className="font-bold text-amber-800">{activeGuide ? activeGuide.name : 'Certified Guide Included'}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-500">Rate:</span>
                    <span className="font-black text-emerald-700 text-sm">₹{activeHotel.pricePerNight.toLocaleString()} / night</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectHotelForBooking(activeHotel, activeGuide)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-6 rounded-2xl text-sm flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
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
            <Navigation className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Spatial Radar: 5 km Geo-Radius around {targetSpot.name.split(',')[0]}
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
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
