import React, { useState, useEffect, useMemo } from 'react';
import { AnalyticsOverview, TrendPoint, AreaSummary, FlaggedObservation } from '../../types';
import { EnergyMap } from '../../components/EnergyMap';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import {
  Zap,
  TrendingUp,
  AlertTriangle,
  Download,
  Building,
  Calendar,
  Layers,
  MapPin,
  RefreshCw,
  Info,
  CheckCircle2,
  Globe2,
  Scale,
  ThermometerSnowflake,
  Filter,
  BarChart3,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export const AnalystDashboard: React.FC = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [areas, setAreas] = useState<AreaSummary[]>([]);
  const [metroMedian, setMetroMedian] = useState<number>(0);
  const [flagged, setFlagged] = useState<FlaggedObservation[]>([]);
  const [flagRule, setFlagRule] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'comparison' | 'benchmarks' | 'map' | 'anomalies' | 'reports'>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArea, setSelectedArea] = useState<AreaSummary | null>(null);

  // Geographic Hierarchy Filters
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [selectedState, setSelectedState] = useState<string>('All');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const countryParam = selectedCountry !== 'All' ? `country=${encodeURIComponent(selectedCountry)}` : '';
      const stateParam = selectedState !== 'All' ? `state=${encodeURIComponent(selectedState)}` : '';
      const queryStr = [countryParam, stateParam].filter(Boolean).join('&');
      const suffix = queryStr ? `?${queryStr}` : '';

      const [ovRes, trRes, arRes, flRes] = await Promise.all([
        fetch(`/api/analytics/overview${suffix}`),
        fetch(`/api/analytics/trends${suffix}`),
        fetch(`/api/analytics/areas${suffix}`),
        fetch('/api/analytics/high-consumption'),
      ]);

      if (ovRes.ok) setOverview(await ovRes.json());
      if (trRes.ok) {
        const trData = await trRes.json();
        setTrends(trData.trends || []);
      }
      if (arRes.ok) {
        const arData = await arRes.json();
        setAreas(arData.areas || []);
        setMetroMedian(arData.metroMedianKwh || 0);
      }
      if (flRes.ok) {
        const flData = await flRes.json();
        const obs: FlaggedObservation[] = flData.observations || [];
        // Filter anomalies according to selected country/state if applied
        if (selectedCountry !== 'All') {
          // find matching area ids
          setFlagged(obs.filter(o => {
            return !selectedCountry || o.area_code.startsWith(selectedCountry === 'United States' ? 'USA' : selectedCountry === 'India' ? 'IND' : 'GBR');
          }));
        } else {
          setFlagged(obs);
        }
        setFlagRule(flData.rule || '');
      }
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCountry, selectedState]);

  // Extract available countries and states from areas data
  const availableCountries = useMemo(() => {
    return ['All', 'United States', 'India', 'United Kingdom'];
  }, []);

  const availableStates = useMemo(() => {
    if (selectedCountry === 'United States') return ['All', 'California', 'New York'];
    if (selectedCountry === 'India') return ['All', 'Maharashtra', 'Karnataka'];
    if (selectedCountry === 'United Kingdom') return ['All', 'Greater London'];
    return ['All', 'California', 'New York', 'Maharashtra', 'Karnataka', 'Greater London'];
  }, [selectedCountry]);

  // Handle country filter change
  const handleCountryChange = (c: string) => {
    setSelectedCountry(c);
    setSelectedState('All');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero (Midnight Navy & Teal Theme for Energy Analyst) */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#101828] via-[#172554] to-[#0F9D91] text-white p-6 sm:p-8 shadow-md border border-[#252B36]">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-[#0F9D91] text-xs font-bold tracking-widest uppercase flex items-center gap-2 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0F9D91] animate-pulse"></span>
              Role 1 · Energy Intelligence Center
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Urban Energy Analytics & Spatial Patterns
            </h1>
            <p className="text-[#E8ECF2]/80 text-sm max-w-2xl mt-1 leading-relaxed">
              Examine residential consumption distributions, cross-sector baselines, and explainable high-consumption triggers across metropolitan zones.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#E8ECF2]/90 pt-2 font-mono">
              <span className="bg-white/10 px-2 py-0.5 rounded text-[11px] border border-white/15">
                Multi-Region Hierarchy Enabled
              </span>
              <span>·</span>
              <span className="text-[#D7F5E9]">
                Last Ingest: {overview?.lastDataIngestion ? new Date(overview.lastDataIngestion).toLocaleTimeString() : 'Verified'}
              </span>
              <span>·</span>
              <span className="text-[#E9E7FF]">{areas.length} Monitored Sectors</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-medium text-white transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Metrics</span>
            </button>
            <a
              href="/api/reports/analyst-csv"
              download="urbanenergy_analyst_report.csv"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0F9D91] hover:bg-[#0c8278] text-white font-semibold text-xs shadow-md transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV Audit</span>
            </a>
          </div>
        </div>

        {/* Decorative Grid Mesh */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3B5BDB_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      </div>

      {/* GEOGRAPHIC HIERARCHY FILTER BAR (Research Gap: Configurable multi-region scope) */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-bold">
            <Globe2 className="w-4 h-4 text-[#0F9D91]" />
            <span>Geographic Filter:</span>
          </div>

          {/* Country Filter */}
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-[11px] font-medium">Country:</span>
            <select
              value={selectedCountry}
              onChange={e => handleCountryChange(e.target.value)}
              className="bg-transparent font-semibold text-slate-900 focus:outline-none cursor-pointer text-xs"
            >
              {availableCountries.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Countries (Global View)' : c}</option>
              ))}
            </select>
          </div>

          {/* State / Region / UT Filter */}
          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-500 text-[11px] font-medium">State / Region / UT:</span>
            <select
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
              className="bg-transparent font-semibold text-slate-900 focus:outline-none cursor-pointer text-xs"
            >
              {availableStates.map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All Subdivisions' : s}</option>
              ))}
            </select>
          </div>

          {(selectedCountry !== 'All' || selectedState !== 'All') && (
            <button
              onClick={() => { setSelectedCountry('All'); setSelectedState('All'); }}
              className="text-[11px] font-mono text-[#0F9D91] hover:underline px-2"
            >
              Reset to All Regions
            </button>
          )}
        </div>

        <div className="text-[11px] font-mono text-slate-500 flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Scope: {selectedCountry === 'All' ? 'Global Multi-Region' : `${selectedCountry}${selectedState !== 'All' ? ` > ${selectedState}` : ''}`}</span>
        </div>
      </div>

      {/* Primary KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-[#0F9D91] transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Aggregate Consumption</span>
            <Zap className="w-4 h-4 text-[#0F9D91]" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {overview ? `${overview.totalConsumptionKwh.toLocaleString()} kWh` : '...'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across {overview?.totalRecordsCount || 0} registered readings
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-[#0F9D91] transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Average Monthly Load</span>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {overview ? `${overview.averageConsumptionKwh.toLocaleString()} kWh` : '...'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Median Baseline: {overview ? `${overview.medianConsumptionKwh.toLocaleString()} kWh` : '...'}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-[#0F9D91] transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Monitored Sectors</span>
            <Building className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {areas.length} Sectors
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Across {selectedCountry === 'All' ? '3 Countries' : selectedCountry}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-amber-400 transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>High-Consumption Alerts</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2 font-mono">
            {flagged.length} Alerts
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Exceeding 1.25x sector baseline median
          </div>
        </div>
      </div>

      {/* Dedicated Role Sidebar / Sub-Navigation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Analyst Navigation Sidebar */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/90 p-3 shadow-xs space-y-1.5">
          <div className="px-3 py-2 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
            Analyst Intelligence Tools
          </div>

          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
              activeTab === 'overview'
                ? 'bg-[#101828] text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Zap className={`w-4 h-4 ${activeTab === 'overview' ? 'text-[#0F9D91]' : 'text-slate-400'}`} />
              <span>Overview & Trends</span>
            </div>
            {activeTab === 'overview' && <ChevronRight className="w-3.5 h-3.5 text-[#0F9D91]" />}
          </button>

          <button
            onClick={() => setActiveTab('benchmarks')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
              activeTab === 'benchmarks'
                ? 'bg-[#101828] text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Scale className={`w-4 h-4 ${activeTab === 'benchmarks' ? 'text-[#0F9D91]' : 'text-slate-400'}`} />
              <span>Contextual Benchmarks</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0F9D91]/20 text-[#0F9D91]">
              kWh/m²
            </span>
          </button>

          <button
            onClick={() => setActiveTab('comparison')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
              activeTab === 'comparison'
                ? 'bg-[#101828] text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Building className={`w-4 h-4 ${activeTab === 'comparison' ? 'text-[#0F9D91]' : 'text-slate-400'}`} />
              <span>Area Comparison</span>
            </div>
            {activeTab === 'comparison' && <ChevronRight className="w-3.5 h-3.5 text-[#0F9D91]" />}
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
              activeTab === 'map'
                ? 'bg-[#101828] text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Globe2 className={`w-4 h-4 ${activeTab === 'map' ? 'text-[#0F9D91]' : 'text-slate-400'}`} />
              <span>Worldwide Energy Map</span>
            </div>
            {activeTab === 'map' && <ChevronRight className="w-3.5 h-3.5 text-[#0F9D91]" />}
          </button>

          <button
            onClick={() => setActiveTab('anomalies')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
              activeTab === 'anomalies'
                ? 'bg-[#101828] text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <AlertTriangle className={`w-4 h-4 ${activeTab === 'anomalies' ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>High-Consumption ({flagged.length})</span>
            </div>
            {flagged.length > 0 && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                {flagged.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
              activeTab === 'reports'
                ? 'bg-[#101828] text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Download className={`w-4 h-4 ${activeTab === 'reports' ? 'text-[#0F9D91]' : 'text-slate-400'}`} />
              <span>Analytical Reports</span>
            </div>
            {activeTab === 'reports' && <ChevronRight className="w-3.5 h-3.5 text-[#0F9D91]" />}
          </button>

          {/* Quick Context Card in Sidebar */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1.5 mt-4">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0F9D91]" />
              <span>Explainable Rule Base</span>
            </div>
            <p className="leading-snug text-slate-500">
              Flagged anomalies are based strictly on statistical median deviations (&gt;25%), never opaque neural predictions.
            </p>
          </div>
        </div>

        {/* Right Tab Content View */}
        <div className="lg:col-span-9 space-y-6">
          {/* TAB 1: Overview & Trends */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Aggregate Monthly Energy Consumption Profile
                    </h3>
                    <p className="text-xs text-slate-500">
                      Tracking residential consumption records across {selectedCountry === 'All' ? 'all registered regions' : selectedCountry}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#0F9D91] bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100 self-start sm:self-auto">
                    Unit: Total kWh / Observation
                  </span>
                </div>

                <div className="h-72 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickFormatter={d => d.slice(5)} />
                      <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `${Math.round(v / 1000)}k`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#101828', color: '#fff', borderRadius: '8px', border: 'none', fontSize: '12px' }}
                        formatter={(val: unknown) => [`${Number(val).toLocaleString()} kWh`, 'Total Consumption']}
                      />
                      <Bar dataKey="totalKwh" fill="#0F9D91" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 gap-2">
                  <span>Period Coverage: {overview?.reportingPeriodStart || '2026-01-01'} to {overview?.reportingPeriodEnd || '2026-10-31'}</span>
                  <span className="text-teal-700 font-medium font-mono">Summer cooling peak observed July–August across warm zones</span>
                </div>
              </div>

              {/* Statistical Baseline Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-1">
                  <span className="text-xs text-slate-500">Metropolitan Median</span>
                  <div className="text-xl font-bold font-mono text-slate-900">{metroMedian.toLocaleString()} kWh</div>
                  <span className="text-[11px] text-slate-400">Baseline for category normal</span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-1">
                  <span className="text-xs text-slate-500">High-Alert Threshold (1.25×)</span>
                  <div className="text-xl font-bold font-mono text-amber-600">{Math.round(metroMedian * 1.25).toLocaleString()} kWh</div>
                  <span className="text-[11px] text-amber-700">Triggers explainable investigation</span>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-xs space-y-1">
                  <span className="text-xs text-slate-500">Maximum Observed Peak</span>
                  <div className="text-xl font-bold font-mono text-slate-900">{overview?.maxConsumptionKwh.toLocaleString()} kWh</div>
                  <span className="text-[11px] text-slate-400">Highest recorded cluster reading</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Contextual Benchmarks (kWh/m² and kWh/household with Climate Context) */}
          {activeTab === 'benchmarks' && (
            <div className="space-y-6">
              {/* Climate Zone Comparability Notice */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <ThermometerSnowflake className="w-4 h-4 text-amber-600" />
                  <span>Research Gap Alignment: Climate & Built Form Comparability Notice</span>
                </div>
                <p className="leading-relaxed text-amber-900/90">
                  Per Shamaei & Ghalehteimouri (2026), direct comparisons of raw kWh across distinct climate zones (e.g., Mediterranean coastal vs hot semi-arid vs oceanic) are misleading without accounting for heating and cooling degree-days. UrbanEnergy Insight normalizes metrics by <strong>gross floor area (kWh/m²)</strong> and <strong>household count (kWh/household)</strong> to enable fair cross-regional benchmarking.
                </p>
              </div>

              {/* Benchmarking Comparison Grid */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Contextual Energy Intensity Benchmarking
                    </h3>
                    <p className="text-xs text-slate-500">
                      Evaluating sector performance normalized by floor area (m²) and residential population
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    {areas.length} verified sectors evaluated
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4 font-semibold">Sector & Region</th>
                        <th className="py-3 px-4 font-semibold">Climate Zone</th>
                        <th className="py-3 px-4 font-semibold text-right">Floor Area</th>
                        <th className="py-3 px-4 font-semibold text-right">Actual Intensity</th>
                        <th className="py-3 px-4 font-semibold text-right">Target Intensity</th>
                        <th className="py-3 px-4 font-semibold text-right">Per-Household Load</th>
                        <th className="py-3 px-4 font-semibold text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {areas.map(area => {
                        const intensityDelta = area.intensityKwhPerSqm - area.target_intensity_kwh_sqm;
                        const isOverTarget = intensityDelta > 0;
                        return (
                          <tr key={area.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-slate-900">{area.name}</div>
                              <div className="text-[10px] font-mono text-slate-400">
                                {area.code} · {area.city}, {area.country}
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[11px] font-medium border border-blue-100">
                                {area.climate_zone}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono">
                              {area.gross_floor_area_sqm.toLocaleString()} m²
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                              {area.intensityKwhPerSqm} kWh/m²
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono text-slate-500">
                              {area.target_intensity_kwh_sqm} kWh/m²
                            </td>
                            <td className="py-3.5 px-4 text-right font-mono">
                              {area.intensityKwhPerHousehold.toLocaleString()} kWh/hh
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                                isOverTarget
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}>
                                {isOverTarget ? `+${intensityDelta.toFixed(1)} kWh/m²` : 'Nominal'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Area Comparison */}
          {activeTab === 'comparison' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Sector-by-Sector Consumption & Priority Ranking
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comparing consumption against the metropolitan median baseline ({metroMedian.toLocaleString()} kWh)
                  </p>
                </div>
                <div className="text-xs font-mono text-slate-500">
                  {areas.length} verified sectors
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Area / Sector</th>
                      <th className="py-3 px-4 font-semibold">Typology</th>
                      <th className="py-3 px-4 font-semibold text-right">Households</th>
                      <th className="py-3 px-4 font-semibold text-right">Avg Monthly</th>
                      <th className="py-3 px-4 font-semibold text-right">Baseline Offset</th>
                      <th className="py-3 px-4 font-semibold text-center">Intervention Priority</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {areas.map(area => (
                      <tr key={area.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{area.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">
                            {area.code} · {area.city}, {area.country}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{area.category}</td>
                        <td className="py-3.5 px-4 text-right font-mono">{area.household_count.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-900">
                          {area.averageConsumptionKwh.toLocaleString()} kWh
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono">
                          <span className={area.baselineDeviationPercent > 20 ? 'text-orange-600 font-semibold' : 'text-emerald-700 font-semibold'}>
                            {area.baselineDeviationPercent > 0 ? `+${area.baselineDeviationPercent}%` : `${area.baselineDeviationPercent}%`}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-semibold ${
                            area.priorityLevel === 'High'
                              ? 'bg-orange-100 text-orange-800 border border-orange-200'
                              : area.priorityLevel === 'Medium'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}>
                            {area.priorityLevel} Priority
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Worldwide Leaflet Energy Map */}
          {activeTab === 'map' && (
            <div className="space-y-4">
              <EnergyMap
                areas={areas}
                selectedAreaId={selectedArea?.id}
                onSelectArea={area => setSelectedArea(area)}
              />
            </div>
          )}

          {/* TAB 5: High-Consumption Anomalies with Explainable Factors */}
          {activeTab === 'anomalies' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    <h3 className="text-base font-bold text-slate-900">
                      Explainable High-Consumption Observations
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                    {flagRule || 'Areas flagged with high consumption exceed 125% of the sector median. Every flag provides clear baseline deviation metrics and possible contributing factors.'}
                  </p>
                </div>
                <div className="text-xs font-mono text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                  {flagged.length} Outlier Events Flagged
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {flagged.map((obs) => (
                  <div key={obs.id} className="p-5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{obs.areaName}</span>
                        <span className="text-xs font-mono text-slate-400">({obs.area_code})</span>
                        <span className="text-xs text-slate-500">· {obs.areaCategory}</span>
                        {obs.climate_zone && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                            {obs.climate_zone}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-slate-600 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Observation Date: {obs.observation_date}</span>
                      </div>

                      {obs.flag_reason && (
                        <div className="text-xs text-amber-800 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200/60 mt-1">
                          <strong>Detection Trigger:</strong> {obs.flag_reason}
                        </div>
                      )}

                      {/* Contributing Factors Breakdown (Research Gap Requirement) */}
                      {obs.possible_contributing_factors && obs.possible_contributing_factors.length > 0 && (
                        <div className="pt-1">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                            Possible Contributing Factors (Explainable Evidence):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {obs.possible_contributing_factors.map((factor, fIdx) => (
                              <span key={fIdx} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                                {factor}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="md:text-right shrink-0">
                      <div className="text-xl font-bold font-mono text-slate-900">
                        {obs.consumption_value.toLocaleString()} {obs.consumption_unit}
                      </div>
                      <span className="text-[11px] font-semibold text-orange-600 uppercase tracking-wide block mt-0.5">
                        Exceeds Sector Median
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: Analytical Reports & Direct CSV Export */}
          {activeTab === 'reports' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Standardized Energy Audit Reports</h3>
                <p className="text-xs text-slate-500">
                  Generate verified data extracts for municipal sustainability auditors, engineering departments, and academic capstone review.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl border border-teal-200 bg-teal-50/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-teal-950">Full Sector Energy Audit (CSV)</h4>
                    <Download className="w-4 h-4 text-[#0F9D91]" />
                  </div>
                  <p className="text-xs text-teal-900/80 leading-relaxed">
                    Complete export of all observations across all registered urban sectors, including area codes, observation dates, baseline deviations, and anomaly reasons.
                  </p>
                  <a
                    href="/api/reports/analyst-csv"
                    download="urbanenergy_full_audit.csv"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0F9D91] hover:bg-[#0c8278] text-white font-semibold text-xs shadow-xs transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Sector Audit CSV</span>
                  </a>
                </div>

                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-900">Data Limitations & Verification Notice</h4>
                    <Info className="w-4 h-4 text-slate-500" />
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    All records reflect verified residential survey and billing records imported through the Data Workspace. Live electricity readings require utility grid authorization and smart-meter telemetry.
                  </p>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Authoritative persistence: PostgreSQL / Transactional Storage
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
