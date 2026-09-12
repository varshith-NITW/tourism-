import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { TouristSpot, Hotel } from '../../types';

interface InteractiveMapProps {
  spot: TouristSpot;
  hotels: Hotel[];
  selectedHotelId?: string | null;
  onSelectHotel?: (hotel: Hotel) => void;
  radiusKm?: number;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  spot,
  hotels,
  selectedHotelId,
  onSelectHotel,
  radiusKm = 5.0
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite' | 'osm'>('street');

  // Tile layer URLs - 100% Free & Zero Watermark (No API keys required)
  const getTileUrl = (style: 'street' | 'satellite' | 'osm') => {
    switch (style) {
      case 'satellite':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'osm':
        return 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
      case 'street':
      default:
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map instance once
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [spot.location.lat, spot.location.lng],
        zoom: 14,
        zoomControl: true,
        attributionControl: false
      });

      // Default high-resolution street tiles with zero watermark
      tileLayerRef.current = L.tileLayer(getTileUrl('street'), {
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;
      layerGroupRef.current = L.layerGroup().addTo(map);
    }

    return () => {
      // Map cleanup on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Switch tile layer when user toggles mapStyle
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    tileLayerRef.current = L.tileLayer(getTileUrl(mapStyle), {
      maxZoom: 19
    }).addTo(mapInstanceRef.current);
    // Bring layerGroup to front
    if (layerGroupRef.current) {
      layerGroupRef.current.eachLayer((layer) => {
        if ('bringToFront' in layer) (layer as any).bringToFront();
      });
    }
  }, [mapStyle]);

  // Update markers and circle when spot, hotels, or selectedHotelId changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Draw 5km Spatial Retrieval Radius Circle around the tourist attraction
    const radiusCircle = L.circle([spot.location.lat, spot.location.lng], {
      radius: radiusKm * 1000,
      color: '#4f46e5',
      fillColor: '#818cf8',
      fillOpacity: 0.12,
      weight: 2,
      dashArray: '6, 6'
    }).addTo(layerGroup);

    radiusCircle.bindTooltip(
      `<b>${radiusKm}km Geo-Radius</b><br/>PostGIS ST_DWithin Retrieval Zone`,
      { permanent: false, direction: 'top' }
    );

    // 2. Add Landmark Pin
    const landmarkIcon = L.divIcon({
      className: 'custom-landmark-pin',
      html: `
        <div style="background-color: #dc2626; color: white; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4); border: 3px solid white; font-weight: bold; font-size: 16px;">
          📍
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 19]
    });

    const landmarkMarker = L.marker([spot.location.lat, spot.location.lng], { icon: landmarkIcon })
      .addTo(layerGroup)
      .bindPopup(`
        <div style="font-family: sans-serif; min-width: 180px;">
          <b style="font-size: 14px; color: #1e293b;">${spot.name}</b>
          <div style="color: #64748b; font-size: 12px; margin-top: 4px;">🎯 Tourist Destination</div>
          <div style="color: #dc2626; font-weight: 600; font-size: 12px; margin-top: 4px;">
            📍 ${spot.monthlyCheckins.toLocaleString()} Google Check-ins/mo
          </div>
        </div>
      `);

    // 3. Add Partnered Hotel Pins with Check-in Badges
    const hotelBounds: L.LatLngExpression[] = [[spot.location.lat, spot.location.lng]];

    hotels.forEach((hotel) => {
      const isSelected = selectedHotelId === hotel.id;
      hotelBounds.push([hotel.location.lat, hotel.location.lng]);

      const hotelIcon = L.divIcon({
        className: 'custom-hotel-pin',
        html: `
          <div style="
            background-color: ${isSelected ? '#059669' : '#1e293b'};
            color: white;
            padding: 4px 8px;
            border-radius: 9999px;
            display: flex;
            align-items: center;
            gap: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            border: 2px solid white;
            font-size: 11px;
            font-weight: bold;
            white-space: nowrap;
            transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
            transition: all 0.2s ease;
          ">
            <span>🏨</span>
            <span>₹${hotel.pricePerNight}</span>
            <span style="background: rgba(255,255,255,0.25); padding: 1px 4px; border-radius: 4px; font-size: 10px;">
              📍${(hotel.checkinCount / 1000).toFixed(1)}k
            </span>
          </div>
        `,
        iconSize: [80, 28],
        iconAnchor: [40, 14]
      });

      const marker = L.marker([hotel.location.lat, hotel.location.lng], { icon: hotelIcon })
        .addTo(layerGroup)
        .bindPopup(`
          <div style="font-family: sans-serif; min-width: 200px;">
            <div style="font-size: 10px; text-transform: uppercase; color: #16a34a; font-weight: bold;">
              ✨ Verified Partner Stay
            </div>
            <b style="font-size: 14px; color: #0f172a;">${hotel.name}</b>
            <div style="color: #475569; font-size: 12px; margin-top: 2px;">
              ₹${hotel.pricePerNight.toLocaleString()}/night
            </div>
            <div style="margin-top: 6px; background: #f0fdf4; padding: 4px 8px; border-radius: 4px; border: 1px solid #bbf7d0; font-size: 11px; color: #166534; font-weight: 600;">
              📍 Google Maps: ${hotel.checkinCount.toLocaleString()} check-ins (#${hotel.footfallRank} buzz)
            </div>
            <div style="margin-top: 4px; font-size: 11px; color: #64748b;">
              Perks: ${hotel.perks[0] || 'Exclusive Partner Rates'}
            </div>
          </div>
        `);

      marker.on('click', () => {
        if (onSelectHotel) onSelectHotel(hotel);
      });

      if (isSelected) {
        marker.openPopup();
      }
    });

    // Fit map bounds smoothly
    if (hotelBounds.length > 1) {
      map.fitBounds(L.latLngBounds(hotelBounds), { padding: [40, 40], maxZoom: 15 });
    } else {
      map.setView([spot.location.lat, spot.location.lng], 14);
    }
  }, [spot, hotels, selectedHotelId, radiusKm, onSelectHotel]);

  return (
    <div className="relative w-full h-[380px] rounded-2xl overflow-hidden shadow-inner border border-slate-200 bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Style Switcher (Street / Satellite / OSM) - 100% Free & Zero Watermarks */}
      <div className="absolute top-3 left-14 z-[1000] flex items-center bg-white/95 backdrop-blur-sm p-1 rounded-xl shadow-md border border-slate-200 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setMapStyle('street')}
          className={`px-2.5 py-1 rounded-lg transition-all ${
            mapStyle === 'street'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          🗺️ Street
        </button>
        <button
          type="button"
          onClick={() => setMapStyle('satellite')}
          className={`px-2.5 py-1 rounded-lg transition-all ${
            mapStyle === 'satellite'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          🛰️ Satellite
        </button>
        <button
          type="button"
          onClick={() => setMapStyle('osm')}
          className={`px-2.5 py-1 rounded-lg transition-all ${
            mapStyle === 'osm'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          🌍 OpenStreetMap
        </button>
      </div>
      
      {/* Map Legend Overlay */}
      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-3 shadow-md z-[1000] text-xs space-y-1.5 pointer-events-none">
        <div className="font-semibold text-slate-800 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
          Live Spatial Engine
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <span className="text-red-500 font-bold">📍</span>
          <span>Target Tourist Attraction</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <div className="w-4 h-4 rounded bg-slate-900 flex items-center justify-center text-[10px] text-white font-bold">H</div>
          <span>Partner Hotel (Ranked by Google Check-Ins)</span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 text-[11px] pt-1 border-t border-slate-100">
          <div className="w-3 h-3 rounded-full border-2 border-dashed border-indigo-500"></div>
          <span>{radiusKm} km Spatial Boundary</span>
        </div>
      </div>
    </div>
  );
};
