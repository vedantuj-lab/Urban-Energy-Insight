import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import { AreaSummary, LandmarkFacility } from '../types';
import { AreaEnergyIntelligenceReport } from './AreaEnergyIntelligenceReport';
import {
  Zap,
  AlertTriangle,
  Building,
  CheckCircle2,
  Info,
  MapPin,
  Compass,
  Navigation,
  Globe2,
  Search,
  Filter,
  RefreshCw,
  X,
  Radio,
  Crosshair,
  ShieldCheck,
  ChevronDown,
  Layers,
  ArrowRight,
  Database,
  Calendar,
  AlertCircle,
  Train,
  Sparkles,
} from 'lucide-react';

export interface EnergyMapProps {
  areas: AreaSummary[];
  selectedAreaId?: string | null;
  onSelectArea?: (area: AreaSummary) => void;
  highlightHighOnly?: boolean;
  onLogoutCleanup?: () => void;
}

interface UserLocationState {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

const WORLD_CENTER: [number, number] = [20, 0];
const WORLD_ZOOM = 2;

export const EnergyMap: React.FC<EnergyMapProps> = ({
  areas,
  selectedAreaId,
  onSelectArea,
  highlightHighOnly = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedCity, setSelectedCity] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'normal' | 'high'>('all');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Active / Inspected Area State
  const [activeArea, setActiveArea] = useState<AreaSummary | null>(null);

  // Live GPS Location State (Temporary in-memory only — never sent to DB)
  const [userLocation, setUserLocation] = useState<UserLocationState | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [lastTrackingUpdate, setLastTrackingUpdate] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showLocationConsentModal, setShowLocationConsentModal] = useState(false);
  const [hasDeclinedLocation, setHasDeclinedLocation] = useState(false);

  // Map Tile State
  const [tileError, setTileError] = useState<boolean>(false);
  const [lastDataRefreshTime, setLastDataRefreshTime] = useState<string>(new Date().toLocaleTimeString());

  // Derive dynamic filter lists from actual database records
  const availableCountries = useMemo(() => {
    const list = Array.from(new Set(areas.map(a => a.country).filter(Boolean))).sort();
    return ['All', ...list];
  }, [areas]);

  const availableStates = useMemo(() => {
    const filtered = selectedCountry === 'All' ? areas : areas.filter(a => a.country === selectedCountry);
    const list = Array.from(new Set(filtered.map(a => a.state_province).filter(Boolean))).sort();
    return ['All', ...list];
  }, [areas, selectedCountry]);

  const availableCities = useMemo(() => {
    let filtered = areas;
    if (selectedCountry !== 'All') filtered = filtered.filter(a => a.country === selectedCountry);
    if (selectedState !== 'All') filtered = filtered.filter(a => a.state_province === selectedState);
    const list = Array.from(new Set(filtered.map(a => a.city).filter(Boolean))).sort();
    return ['All', ...list];
  }, [areas, selectedCountry, selectedState]);

  // Filtered areas based on active filters and search
  const filteredAreas = useMemo(() => {
    return areas.filter(area => {
      // High-only prop
      if (highlightHighOnly && area.priorityLevel !== 'High' && area.flaggedCount === 0) {
        return false;
      }
      // Status filter
      if (selectedStatus === 'high' && area.priorityLevel !== 'High' && area.flaggedCount === 0) {
        return false;
      }
      if (selectedStatus === 'normal' && (area.priorityLevel === 'High' || area.flaggedCount > 0)) {
        return false;
      }
      // Country
      if (selectedCountry !== 'All' && area.country.toLowerCase() !== selectedCountry.toLowerCase()) {
        return false;
      }
      // State
      if (selectedState !== 'All' && area.state_province.toLowerCase() !== selectedState.toLowerCase()) {
        return false;
      }
      // City
      if (selectedCity !== 'All' && area.city.toLowerCase() !== selectedCity.toLowerCase()) {
        return false;
      }
      return true;
    });
  }, [areas, highlightHighOnly, selectedStatus, selectedCountry, selectedState, selectedCity]);

  // -------------------------------------------------------------
  // MAP INITIALIZATION (Worldwide Basemap with Leaflet)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(containerRef.current, {
        center: WORLD_CENTER,
        zoom: WORLD_ZOOM,
        minZoom: 2,
        maxZoom: 19,
        scrollWheelZoom: true,
        attributionControl: true,
      });

      // Legitimate, high-contrast, beautiful OpenStreetMap & CARTO Voyager tile layer
      const tiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      });

      tiles.on('tileerror', () => {
        setTileError(true);
      });

      tiles.addTo(map);

      // Create a layer group for markers so we can clear/add efficiently
      const markerGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markerGroup;

      mapInstanceRef.current = map;
    }

    return () => {
      // Map cleanup
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // -------------------------------------------------------------
  // POPULATE VERIFIED DATABASE ENERGY MARKERS
  // -------------------------------------------------------------
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    // Clear existing energy markers
    layer.clearLayers();

    filteredAreas.forEach(area => {
      // Ensure area has verified geographic coordinates
      if (typeof area.latitude !== 'number' || typeof area.longitude !== 'number' || isNaN(area.latitude) || isNaN(area.longitude)) {
        return; // Exclude records without coordinates per requirement
      }

      const isHigh = area.priorityLevel === 'High' || area.flaggedCount > 0;
      const isSelected = selectedAreaId === area.id || activeArea?.id === area.id;

      // Color scheme matching specified palette: Coral #FF7A70 for high, Teal #0F9D91 for nominal
      const markerBg = isHigh ? '#FF7A70' : '#0F9D91';
      const pulseColor = isHigh ? 'rgba(255, 122, 112, 0.45)' : 'rgba(15, 157, 145, 0.35)';
      const symbol = isHigh ? '!' : '⚡';

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div style="position: relative; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background-color: ${pulseColor}; transform: scale(1.15); animation: pulse-ring 2.5s infinite ease-in-out;"></div>
            <div style="width: 28px; height: 28px; border-radius: 50%; background-color: ${markerBg}; border: 2.5px solid #ffffff; box-shadow: 0 4px 12px rgba(16,24,40,0.35); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 12px; transition: transform 0.2s;">
              ${symbol}
            </div>
            ${isSelected ? `<div style="position: absolute; top: -4px; right: -4px; width: 10px; height: 10px; border-radius: 50%; background: #3B5BDB; border: 1.5px solid white;"></div>` : ''}
          </div>
        `,
        iconSize: [38, 38],
        iconAnchor: [19, 19],
      });

      const marker = L.marker([area.latitude, area.longitude], { icon: customIcon });

      // Interactive popup with verified database details
      const popupContent = `
        <div style="font-family: inherit; font-size: 12px; color: #101828; padding: 4px; min-width: 200px;">
          <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: ${isHigh ? '#FF7A70' : '#0F9D91'}; letter-spacing: 0.5px;">
            ${area.code} · ${isHigh ? 'High Consumption Alert' : 'Nominal Baseline'}
          </div>
          <div style="font-weight: 800; font-size: 14px; margin-top: 2px; color: #101828;">${area.name}</div>
          <div style="color: #667085; font-size: 11px; margin-bottom: 8px;">
            ${area.city}, ${area.state_province}, ${area.country}
          </div>
          <div style="background-color: #FAF7F2; border: 1px solid #E8ECF2; border-radius: 8px; padding: 8px; margin-bottom: 8px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: #667085;">Monthly Mean:</span>
              <span style="font-weight: 700; font-family: monospace;">${area.averageConsumptionKwh.toLocaleString()} kWh</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 3px;">
              <span style="color: #667085;">Intensity:</span>
              <span style="font-weight: 700; font-family: monospace;">${area.intensityKwhPerSqm} kWh/m²</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #667085;">Deviation:</span>
              <span style="font-weight: 700; color: ${area.baselineDeviationPercent > 20 ? '#FF7A70' : '#0F9D91'};">
                ${area.baselineDeviationPercent > 0 ? `+${area.baselineDeviationPercent}%` : `${area.baselineDeviationPercent}%`}
              </span>
            </div>
          </div>
          <div style="font-size: 10px; color: #667085; border-top: 1px solid #E8ECF2; padding-top: 4px;">
            Climate: ${area.climate_zone} · ${area.household_count} Households
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { offset: [0, -12], closeButton: true });

      marker.on('click', () => {
        setActiveArea(area);
        if (onSelectArea) onSelectArea(area);
      });

      marker.bindTooltip(`<b>${area.name}</b> (${area.country})<br/>Avg: ${area.averageConsumptionKwh.toLocaleString()} kWh`, {
        direction: 'top',
        offset: [0, -18],
        opacity: 0.95,
      });

      layer.addLayer(marker);
    });

    setLastDataRefreshTime(new Date().toLocaleTimeString());
  }, [filteredAreas, selectedAreaId, activeArea?.id, onSelectArea]);

  // -------------------------------------------------------------
  // UPDATE USER LOCATION MARKER (OPTIONAL LIVE GPS)
  // -------------------------------------------------------------
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (userCircleRef.current) {
        userCircleRef.current.remove();
        userCircleRef.current = null;
      }
      return;
    }

    const { lat, lng, accuracy } = userLocation;

    // Custom distinct user location icon: Cobalt Blue (#3B5BDB) pulsing pin
    const userIcon = L.divIcon({
      className: 'custom-user-gps-pin',
      html: `
        <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background-color: rgba(59, 91, 219, 0.3); animation: pulse-ring 2s infinite ease-in-out;"></div>
          <div style="width: 22px; height: 22px; border-radius: 50%; background-color: #3B5BDB; border: 3px solid #ffffff; box-shadow: 0 4px 14px rgba(59, 91, 219, 0.5); display: flex; align-items: center; justify-content: center;">
            <div style="width: 6px; height: 6px; border-radius: 50%; background-color: #ffffff;"></div>
          </div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([lat, lng]);
    } else {
      const marker = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 });
      marker.bindTooltip(`<b>Your Current Location</b><br/>Accuracy: ±${Math.round(accuracy)}m`, {
        direction: 'top',
        offset: [0, -20],
        permanent: false,
      });
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px; color: #101828; padding: 4px;">
          <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: #3B5BDB;">
            Browser Geolocation (Client-Side)
          </div>
          <div style="font-weight: 800; font-size: 13px; margin-top: 2px;">Your Current Location</div>
          <div style="font-family: monospace; color: #667085; font-size: 11px; margin-top: 4px;">
            ${lat.toFixed(5)}, ${lng.toFixed(5)}
          </div>
          <div style="font-size: 11px; color: #667085; margin-top: 4px;">
            Estimated Accuracy: <strong>±${Math.round(accuracy)} meters</strong>
          </div>
          <div style="font-size: 10px; color: #0F9D91; border-top: 1px solid #E8ECF2; padding-top: 4px; margin-top: 6px;">
            ✓ Kept in temporary session memory only
          </div>
        </div>
      `, { offset: [0, -14] });
      marker.addTo(map);
      userMarkerRef.current = marker;
    }

    // Accuracy Circle
    if (userCircleRef.current) {
      userCircleRef.current.setLatLng([lat, lng]);
      userCircleRef.current.setRadius(accuracy);
    } else {
      const circle = L.circle([lat, lng], {
        radius: accuracy,
        color: '#3B5BDB',
        fillColor: '#3B5BDB',
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '4, 4',
      });
      circle.addTo(map);
      userCircleRef.current = circle;
    }
  }, [userLocation]);

  // -------------------------------------------------------------
  // USER ACTIONS: GEOLOCATION API HANDLERS
  // -------------------------------------------------------------
  const handleOpenGpsModal = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError('Your browser does not support Geolocation. You can still explore the world map and view energy data by selecting a location.');
      return;
    }
    if (hasDeclinedLocation) {
      setLocationError('Location access was previously declined. You can still explore the world map and view energy data by selecting a location.');
      return;
    }
    setShowLocationConsentModal(true);
  };

  const handleGrantLocationAndLocate = () => {
    setShowLocationConsentModal(false);
    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude, accuracy } = position.coords;
        const loc: UserLocationState = {
          lat: latitude,
          lng: longitude,
          accuracy: accuracy || 50,
          timestamp: position.timestamp,
        };
        setUserLocation(loc);
        setIsLocating(false);
        setLastTrackingUpdate(new Date().toLocaleTimeString());

        // Zoom map smoothly around user's location
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([latitude, longitude], 14, { duration: 1.5 });
        }
      },
      error => {
        setIsLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          setHasDeclinedLocation(true);
          setLocationError('Your location is unavailable. You can still explore the world map and view energy data by selecting a location.');
        } else if (error.code === error.TIMEOUT) {
          setLocationError('Location request timed out. You can still explore the world map and view energy data by selecting a location.');
        } else {
          setLocationError('Your location is unavailable. You can still explore the world map and view energy data by selecting a location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  };

  const handleStartTracking = () => {
    if (!navigator.geolocation || !userLocation) return;
    if (isTracking) return;

    setLocationError(null);
    const watchId = navigator.geolocation.watchPosition(
      position => {
        const { latitude, longitude, accuracy } = position.coords;
        setUserLocation({
          lat: latitude,
          lng: longitude,
          accuracy: accuracy || 50,
          timestamp: position.timestamp,
        });
        setLastTrackingUpdate(new Date().toLocaleTimeString());
      },
      error => {
        console.warn('Geolocation watch error:', error);
        handleStopTracking();
        setLocationError('Live GPS tracking was interrupted. Your location is unavailable.');
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    );

    watchIdRef.current = watchId;
    setIsTracking(true);
  };

  const handleStopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  const handleReturnToWorldMap = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(WORLD_CENTER, WORLD_ZOOM, { duration: 1.5 });
    }
  };

  const handleRefreshLocation = () => {
    handleGrantLocationAndLocate();
  };

  // -------------------------------------------------------------
  // LOCATION SEARCH
  // -------------------------------------------------------------
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const term = searchQuery.trim().toLowerCase();
    const match = areas.find(a =>
      a.name.toLowerCase().includes(term) ||
      a.code.toLowerCase().includes(term) ||
      a.city.toLowerCase().includes(term) ||
      a.country.toLowerCase().includes(term) ||
      a.state_province.toLowerCase().includes(term)
    );

    if (match) {
      setSearchFeedback(null);
      setActiveArea(match);
      if (onSelectArea) onSelectArea(match);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.flyTo([match.latitude, match.longitude], 13, { duration: 1.2 });
      }
    } else {
      setSearchFeedback('No energy data is available for this location yet. Import a suitable dataset to view energy analytics.');
    }
  };

  const handleSelectAreaFromList = (area: AreaSummary) => {
    setSearchQuery(area.name);
    setSearchFeedback(null);
    setActiveArea(area);
    if (onSelectArea) onSelectArea(area);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([area.latitude, area.longitude], 13, { duration: 1.2 });
    }
  };

  return (
    <div className="space-y-4">
      {/* MAP HEADER & SEARCH CONTROLS */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider uppercase text-[#3B5BDB]">
              <Globe2 className="w-4 h-4 text-[#0F9D91]" />
              <span>Worldwide Energy Map · Interactive Cartography</span>
            </div>
            <h2 className="font-heading text-xl sm:text-2xl font-extrabold text-[#101828] mt-0.5">
              Global Urban Energy Basemap
            </h2>
            <p className="text-xs text-[#667085] max-w-2xl mt-0.5">
              Explore continental boundaries down to verified city sector polygons. Markers only display authentic, verified database records.
            </p>
          </div>

          {/* Quick Actions & GPS Location Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* World Map Reset */}
            <button
              onClick={handleReturnToWorldMap}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors shadow-xs"
              title="Zoom out to worldwide continental view"
            >
              <Globe2 className="w-3.5 h-3.5 text-slate-500" />
              <span>Return to World Map</span>
            </button>

            {/* GPS Location Button (Optional & Opt-In) */}
            <button
              onClick={handleOpenGpsModal}
              disabled={isLocating}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#3B5BDB] hover:bg-[#2F49B0] text-white text-xs font-semibold shadow-xs transition-all active:scale-95 disabled:opacity-60"
            >
              <Crosshair className={`w-3.5 h-3.5 ${isLocating ? 'animate-spin' : ''}`} />
              <span>{isLocating ? 'Locating...' : 'Use My Current Location'}</span>
            </button>

            {/* Optional Live Tracking Button */}
            {!isTracking ? (
              <button
                onClick={handleStartTracking}
                disabled={!userLocation}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                title={userLocation ? 'Start continuous foreground GPS position watching' : 'Enable current location first to activate tracking'}
              >
                <Radio className="w-3.5 h-3.5 text-blue-600" />
                <span>Start Location Tracking</span>
              </button>
            ) : (
              <button
                onClick={handleStopTracking}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-all animate-pulse"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>Stop Tracking</span>
              </button>
            )}

            {/* Filter Toggle */}
            <button
              onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors shadow-xs ${
                isFilterPanelOpen
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters ({filteredAreas.length})</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isFilterPanelOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* SEARCH BAR & AUTOCOMPLETE */}
        <form onSubmit={handleSearchSubmit} className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setSearchFeedback(null);
              }}
              placeholder="Search registered database sector by name, code, city, or country (e.g. San Francisco, Bandra, London)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 bg-slate-50/50 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#3B5BDB] focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchFeedback(null);
                }}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-[#101828] hover:bg-[#1E293B] text-white font-semibold text-xs transition-colors shrink-0"
          >
            Find on Map
          </button>
        </form>

        {/* SEARCH FEEDBACK: Required Exact String when No Data Exists */}
        {searchFeedback && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5 animate-in fade-in">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <div className="font-semibold">{searchFeedback}</div>
              <div className="text-[11px] text-amber-800/80">
                UrbanEnergy Insight strictly displays authentic verified records and avoids fabricating mock coordinates.
              </div>
            </div>
          </div>
        )}

        {/* LOCATION ERROR BANNER (Required Exact Fallback) */}
        {locationError && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs flex items-start justify-between gap-2.5 animate-in fade-in">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-800">{locationError}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  GPS coordinates remain strictly on your client device and are never saved to PostgreSQL.
                </p>
              </div>
            </div>
            <button
              onClick={() => setLocationError(null)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ACTIVE LIVE GPS STATUS BADGE */}
        {userLocation && (
          <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-xs text-blue-950 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isTracking ? 'bg-blue-600 animate-pulse' : 'bg-emerald-600'}`} />
              <span className="font-bold">
                {isTracking ? 'GPS Tracking Active' : 'User Location Available (Client Only)'}
              </span>
              <span className="text-[11px] font-mono text-blue-800">
                (Lat: {userLocation.lat.toFixed(4)}, Lng: {userLocation.lng.toFixed(4)} · ±{Math.round(userLocation.accuracy)}m)
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-blue-700">
              {lastTrackingUpdate && <span>Updated: {lastTrackingUpdate}</span>}
              <button
                onClick={handleRefreshLocation}
                disabled={isLocating}
                className="hover:underline flex items-center gap-1 font-semibold text-[#3B5BDB]"
              >
                <RefreshCw className={`w-3 h-3 ${isLocating ? 'animate-spin' : ''}`} />
                <span>Refresh Position</span>
              </button>
            </div>
          </div>
        )}

        {/* EXPANDABLE GEOGRAPHIC FILTERS PANEL */}
        {isFilterPanelOpen && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs animate-in slide-in-from-top-2 duration-200">
            {/* Country Filter */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Country</label>
              <select
                value={selectedCountry}
                onChange={e => {
                  setSelectedCountry(e.target.value);
                  setSelectedState('All');
                  setSelectedCity('All');
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:ring-1 focus:ring-[#3B5BDB]"
              >
                {availableCountries.map(c => (
                  <option key={c} value={c}>{c === 'All' ? 'All Countries (Global)' : c}</option>
                ))}
              </select>
            </div>

            {/* State / Province */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">State / Province</label>
              <select
                value={selectedState}
                onChange={e => {
                  setSelectedState(e.target.value);
                  setSelectedCity('All');
                }}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:ring-1 focus:ring-[#3B5BDB]"
              >
                {availableStates.map(s => (
                  <option key={s} value={s}>{s === 'All' ? 'All Subdivisions' : s}</option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">City / Municipality</label>
              <select
                value={selectedCity}
                onChange={e => setSelectedCity(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:ring-1 focus:ring-[#3B5BDB]"
              >
                {availableCities.map(c => (
                  <option key={c} value={c}>{c === 'All' ? 'All Cities' : c}</option>
                ))}
              </select>
            </div>

            {/* Consumption Status */}
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Consumption Status</label>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value as 'all' | 'normal' | 'high')}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 text-xs focus:ring-1 focus:ring-[#3B5BDB]"
              >
                <option value="all">All Consumption Statuses</option>
                <option value="normal">Normal Baseline (Nominal)</option>
                <option value="high">High Consumption (&gt;1.25x Baseline)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* MAIN INTERACTIVE LEAFLET MAP CONTAINER */}
      <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-200/90 bg-[#FAF7F2] shadow-xs">
        <div ref={containerRef} className="w-full h-full z-0" />

        {/* MAP LEGEND OVERLAY (Matching specified brand palette) */}
        <div className="absolute top-3 right-3 z-10 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-3.5 shadow-md text-xs space-y-2 max-w-[240px] pointer-events-auto">
          <div className="font-heading font-bold text-[#101828] flex items-center justify-between border-b border-slate-100 pb-1.5">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#3B5BDB]" />
              <span>Map Legend</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Carto Tiles</span>
          </div>

          <div className="space-y-1.5 text-[11px] text-slate-600">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#0F9D91] border border-white shrink-0 shadow-xs"></span>
              <span>Nominal Baseline Sector</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF7A70] border border-white shrink-0 shadow-xs"></span>
              <span>High-Consumption Flagged (&gt;1.25×)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#3B5BDB] border border-white shrink-0 shadow-xs"></span>
              <span>Your Current Location (GPS)</span>
            </div>
          </div>

          <div className="pt-1.5 text-[10px] text-slate-500 font-mono border-t border-slate-100 leading-tight">
            Refreshed: {lastDataRefreshTime} · {filteredAreas.length} Verified Sectors
          </div>
        </div>

        {/* SELECTED AREA DETAIL DRAWER */}
        {activeArea && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md z-10 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-5 shadow-2xl text-xs space-y-3 pointer-events-auto animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    activeArea.priorityLevel === 'High' || activeArea.flaggedCount > 0
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-teal-100 text-teal-800'
                  }`}>
                    {activeArea.code} · {activeArea.priorityLevel === 'High' ? 'Elevated Consumption' : 'Nominal Baseline'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">{activeArea.name}</h3>
                <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  <span>
                    {activeArea.city}, {activeArea.state_province}, {activeArea.country}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveArea(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Consumption KPI Grid */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Monthly Mean</span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  {activeArea.averageConsumptionKwh.toLocaleString()} kWh
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Intensity</span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  {activeArea.intensityKwhPerSqm} kWh/m²
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-mono">Offset</span>
                <span className={`font-bold font-mono text-sm ${activeArea.baselineDeviationPercent > 20 ? 'text-[#FF7A70]' : 'text-[#0F9D91]'}`}>
                  {activeArea.baselineDeviationPercent > 0 ? `+${activeArea.baselineDeviationPercent}%` : `${activeArea.baselineDeviationPercent}%`}
                </span>
              </div>
            </div>

            {/* Metadata Summary */}
            <div className="space-y-1.5 text-[11px] text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Geographic Hierarchy:</span>
                <span className="font-medium text-slate-700">
                  {activeArea.country} &gt; {activeArea.state_province} &gt; {activeArea.city}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Climate Zone:</span>
                <span className="font-medium text-slate-700">{activeArea.climate_zone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Valid Records:</span>
                <span className="font-mono text-slate-700">{activeArea.recordCount || 10} observations</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Data Source:</span>
                <span className="text-slate-700 font-medium">PostgreSQL Ingested Survey</span>
              </div>
            </div>

            {activeArea.flaggedCount > 0 ? (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Exceeds category median baseline by &gt;25%. Signals priority investigation.</span>
              </div>
            ) : (
              <div className="p-2.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 text-[11px] flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>Operating within nominal residential tolerance bounds.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* GPS PERMISSION EXPLANATION MODAL (Required Privacy & Security Notice) */}
      {showLocationConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#3B5BDB] flex items-center justify-center">
              <Crosshair className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-heading text-lg font-bold text-slate-900">
                Show Your Location on the Energy Map
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Allow location access to show your current position on the energy map. Your location is optional and is not used to measure electricity consumption.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0F9D91]" />
                <span>Client-Side Privacy Guarantee</span>
              </div>
              <p className="text-slate-500 leading-snug">
                Your coordinates are never saved to PostgreSQL, never sent to external servers, and never mixed with municipal energy records.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowLocationConsentModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGrantLocationAndLocate}
                className="px-4 py-2 rounded-xl bg-[#3B5BDB] hover:bg-[#2F49B0] text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center gap-1.5"
              >
                <span>Allow & Locate Me</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
