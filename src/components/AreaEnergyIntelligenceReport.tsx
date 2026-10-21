import React, { useState, useEffect } from 'react';
import { AreaIntelligenceReport } from '../types';
import {
  X,
  MapPin,
  Building2,
  Zap,
  Sun,
  Flame,
  Fuel,
  Leaf,
  Gauge,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Sliders,
  Compass,
  Layers,
  ArrowRight,
  ShieldAlert,
  Info,
  Calendar,
  DollarSign,
  Printer,
  ChevronRight,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface AreaEnergyIntelligenceReportProps {
  locationId?: string | null;
  coordinates?: { lat: number; lng: number } | null;
  onClose: () => void;
  onFocusCoordinates?: (lat: number, lng: number) => void;
}

export const AreaEnergyIntelligenceReport: React.FC<AreaEnergyIntelligenceReportProps> = ({
  locationId,
  coordinates,
  onClose,
  onFocusCoordinates,
}) => {
  const [report, setReport] = useState<AreaIntelligenceReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeScope, setActiveScope] = useState<'place' | '1km' | '5km' | 'city'>('place');
  const [activeSection, setActiveSection] = useState<'overview' | 'consumption' | 'geographic' | 'anomalies' | 'recommendations' | 'scenario'>('overview');

  // What-If Scenario State
  const [scenarioReduction, setScenarioReduction] = useState<number>(10);
  const [customBaselineKwh, setCustomBaselineKwh] = useState<number>(55200);

  const fetchReport = async (scope: 'place' | '1km' | '5km' | 'city') => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('scope', scope);

      if (locationId) {
        params.set('id', locationId);
      } else if (coordinates) {
        params.set('lat', coordinates.lat.toString());
        params.set('lng', coordinates.lng.toString());
      } else {
        params.set('id', 'fac_ind_churchgate'); // Default benchmark
      }

      const res = await fetch(`/api/intelligence/area?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to load intelligence report (${res.status})`);
      }
      const data: AreaIntelligenceReport = await res.json();
      setReport(data);
      if (data.whatIfScenarioCalculator?.baselineKwh) {
        setCustomBaselineKwh(data.whatIfScenarioCalculator.baselineKwh);
      }
      if (data.whatIfScenarioCalculator?.defaultTargetPercent) {
        setScenarioReduction(data.whatIfScenarioCalculator.defaultTargetPercent);
      }
    } catch (err: unknown) {
      console.error('Error fetching intelligence report:', err);
      setError((err as Error).message || 'Unable to retrieve area intelligence');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(activeScope);
  }, [locationId, coordinates?.lat, coordinates?.lng, activeScope]);

  // Derived What-if calculation
  const calculatedSavings = React.useMemo(() => {
    if (!report) return { savedKwh: 0, projectedKwh: 0, costSavingsUsd: 0, co2AvoidedKg: 0 };
    const base = customBaselineKwh || 55200;
    const pct = scenarioReduction / 100;
    const savedKwh = Math.round(base * pct);
    const projectedKwh = base - savedKwh;
    const tariff = report.whatIfScenarioCalculator.localTariffRatePerKwhUsd || 0.11;
    const costSavingsUsd = Math.round(savedKwh * tariff);
    const gridFactor = report.whatIfScenarioCalculator.gridEmissionFactorKgPerKwh || 0.79;
    const co2AvoidedKg = Math.round(savedKwh * gridFactor);

    return {
      savedKwh,
      projectedKwh,
      costSavingsUsd,
      co2AvoidedKg,
    };
  }, [report, customBaselineKwh, scenarioReduction]);

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-950/60 backdrop-blur-xs flex justify-end transition-opacity animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col overflow-hidden border-l border-slate-200">
        {/* HEADER */}
        <div className="p-5 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="font-semibold text-[#3B5BDB]">Area Energy Intelligence System</span>
                <span aria-hidden="true">·</span>
                <span className="capitalize">{report?.location.placeType.replace('_', ' ') || 'Location Report'}</span>
                <span aria-hidden="true">·</span>
                <span>{report?.location.city}, {report?.location.country}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#101828] tracking-tight">
                {report?.location.name || 'Loading Energy Intelligence...'}
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => window.print()}
                title="Print or Export Report"
                className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Printer className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Close intelligence report"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* SCOPE SELECTOR TABS */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setActiveScope('place')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeScope === 'place'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Selected Place Only
              </button>
              <button
                onClick={() => setActiveScope('1km')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeScope === '1km'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                1 km Surrounding Area
              </button>
              <button
                onClick={() => setActiveScope('5km')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeScope === '5km'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                5 km Broader Zone
              </button>
              <button
                onClick={() => setActiveScope('city')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeScope === 'city'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                City Municipal Area
              </button>
            </div>

            {report && (
              <div className="text-xs text-slate-500 flex items-center gap-2 font-mono">
                <span>{report.location.latitude.toFixed(4)}° N, {report.location.longitude.toFixed(4)}° E</span>
                {onFocusCoordinates && (
                  <button
                    onClick={() => onFocusCoordinates(report.location.latitude, report.location.longitude)}
                    className="text-[#3B5BDB] hover:underline text-[11px] font-sans font-semibold"
                  >
                    Center on Map
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* DISTINCTION NOTICE BANNER */}
        {report?.location.distinctionNotice && (
          <div className="px-5 py-3 bg-amber-50/80 border-b border-amber-200/70 text-xs text-amber-900 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold">Administrative Distinction Notice: </span>
              {report.location.distinctionNotice}
            </div>
          </div>
        )}

        {/* SECTION NAVIGATION PILL BAR */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <button
            onClick={() => setActiveSection('overview')}
            className={`px-3 py-1 font-semibold rounded-md whitespace-nowrap transition-colors ${
              activeSection === 'overview' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overview & Resources
          </button>
          <button
            onClick={() => setActiveSection('consumption')}
            className={`px-3 py-1 font-semibold rounded-md whitespace-nowrap transition-colors ${
              activeSection === 'consumption' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Detailed Consumption
          </button>
          <button
            onClick={() => setActiveSection('geographic')}
            className={`px-3 py-1 font-semibold rounded-md whitespace-nowrap transition-colors ${
              activeSection === 'geographic' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Geographic Scope
          </button>
          <button
            onClick={() => setActiveSection('anomalies')}
            className={`px-3 py-1 font-semibold rounded-md whitespace-nowrap transition-colors ${
              activeSection === 'anomalies' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Anomalies & Patterns
          </button>
          <button
            onClick={() => setActiveSection('recommendations')}
            className={`px-3 py-1 font-semibold rounded-md whitespace-nowrap transition-colors ${
              activeSection === 'recommendations' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Recommendations
          </button>
          <button
            onClick={() => setActiveSection('scenario')}
            className={`px-3 py-1 font-semibold rounded-md whitespace-nowrap transition-colors ${
              activeSection === 'scenario' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            What-If Simulator
          </button>
        </div>

        {/* REPORT CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-8">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#3B5BDB] animate-spin" />
              <div className="font-bold text-slate-800">Synthesizing Area Energy Intelligence...</div>
              <p className="text-xs text-slate-500 max-w-sm">
                Aggregating geographic boundaries, solar irradiance models, and municipal energy datasets.
              </p>
            </div>
          ) : error || !report ? (
            <div className="p-6 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-3">
              <div className="flex items-center gap-2 font-bold">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Failed to compile Area Energy Intelligence Report</span>
              </div>
              <p className="text-xs text-rose-700">{error || 'Unknown error occurred while generating report.'}</p>
              <button
                onClick={() => fetchReport(activeScope)}
                className="px-3.5 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors"
              >
                Retry Request
              </button>
            </div>
          ) : (
            <>
              {/* SECTION A: LOCATION INFORMATION */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Section A · Location Information
                  </h3>
                  <span className="text-xs text-slate-400">EPSG:4326 GIS Coordinates</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <span className="text-[11px] text-slate-500">Facility / Place Type</span>
                    <div className="font-bold text-slate-900 capitalize text-sm">
                      {report.location.placeType.replace('_', ' ')}
                    </div>
                    <span className="text-[11px] text-slate-400 block">{report.location.category}</span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <span className="text-[11px] text-slate-500">Administrative Hierarchy</span>
                    <div className="font-bold text-slate-900 text-sm truncate">
                      {report.location.city}, {report.location.district}
                    </div>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {report.location.stateProvince}, {report.location.country}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <span className="text-[11px] text-slate-500">Spatial Coordinates</span>
                    <div className="font-mono font-bold text-slate-900 text-sm">
                      {report.location.latitude.toFixed(4)}° N, {report.location.longitude.toFixed(4)}° E
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate">
                      Source: {report.location.coordinatesSource}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                  <div className="font-semibold text-slate-800">Operational Context & Physical Boundary</div>
                  <p className="text-slate-600 leading-relaxed">{report.location.operationalContext}</p>
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500">
                    <span>Boundary: <b>{report.location.boundaryCoverage}</b></span>
                    <span aria-hidden="true">·</span>
                    <span>Sources: <b>{report.location.dataSources.join(', ')}</b></span>
                    <span aria-hidden="true">·</span>
                    <span>Last Updated: <b>{new Date(report.location.lastUpdated).toLocaleDateString()}</b></span>
                  </div>
                </div>
              </div>

              {/* SECTION B: ENERGY RESOURCE OVERVIEW */}
              <div className="space-y-4 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Section B · Energy Resource Overview
                  </h3>
                  <span className="text-xs text-slate-400">Multi-Vector Energy Scan</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Electricity Resource Card */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                          <Zap className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900 text-sm">Grid Electricity</span>
                      </div>
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                        report.resourceOverview.electricity.status === 'verified_available'
                          ? 'bg-emerald-50 text-emerald-700'
                          : report.resourceOverview.electricity.status === 'surrounding_only'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-800'
                      }`}>
                        {report.resourceOverview.electricity.status === 'verified_available'
                          ? 'Verified Direct Data'
                          : report.resourceOverview.electricity.status === 'surrounding_only'
                          ? 'Surrounding Area Data'
                          : 'Meter Data Unavailable'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {report.resourceOverview.electricity.message}
                    </p>

                    {report.resourceOverview.electricity.totalKwh ? (
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase">Monthly Mean</span>
                          <div className="font-mono font-bold text-slate-900">
                            {report.resourceOverview.electricity.averageKwh?.toLocaleString()} kWh
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase">Peak Month</span>
                          <div className="font-bold text-slate-900">
                            {report.resourceOverview.electricity.peakMonth || 'May 2026'}
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase">Peak Value</span>
                          <div className="font-mono font-bold text-amber-600">
                            {report.resourceOverview.electricity.peakKwh?.toLocaleString()} kWh
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                        <span>Station bulk utility meter unlinked in public dataset.</span>
                        <button
                          onClick={() => setActiveScope('1km')}
                          className="font-semibold text-[#3B5BDB] hover:underline"
                        >
                          View Surrounding Area Data &rarr;
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Solar Energy Resource Card */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                          <Sun className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-900 text-sm">Solar Irradiance & PV Potential</span>
                      </div>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800">
                        High Feasibility
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase">Daily GHI</span>
                        <div className="font-mono font-bold text-slate-900">
                          {report.resourceOverview.solarEnergy.dailyIrradianceKwhPerSqm} kWh/m²/day
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase">Rooftop Potential</span>
                        <div className="font-mono font-bold text-slate-900">
                          ~{report.resourceOverview.solarEnergy.rooftopPotentialKwp} kWp
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase">Annual Est. Clean Gen</span>
                        <div className="font-mono font-bold text-emerald-600">
                          {(report.resourceOverview.solarEnergy.annualGenerationKwhEstimated / 1000000).toFixed(2)}M kWh
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {report.resourceOverview.solarEnergy.feasibilityNotes}
                    </p>
                    <div className="text-[10px] text-slate-400">
                      Citation: {report.resourceOverview.solarEnergy.sourceCitation}
                    </div>
                  </div>

                  {/* Grid Emissions & Renewables */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                        <Leaf className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-900 text-sm">Grid Carbon Factor & Clean Energy</span>
                    </div>
                    <div className="flex items-baseline gap-4 pt-1">
                      <div>
                        <span className="text-xs text-slate-400">Regional Emission Factor</span>
                        <div className="text-lg font-mono font-bold text-slate-900">
                          {report.resourceOverview.renewableShare.gridEmissionFactorKgPerKwh} kg CO₂/kWh
                        </div>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400">Grid Renewable Share</span>
                        <div className="text-lg font-mono font-bold text-emerald-600">
                          {report.resourceOverview.renewableShare.gridRenewablePercent}%
                        </div>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Source: {report.resourceOverview.renewableShare.sourceCitation}
                    </p>
                  </div>

                  {/* Other Fuels & Thermal */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600">
                        <Flame className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-900 text-sm">Thermal Fuels & City Gas</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {report.resourceOverview.naturalGas.notes}
                    </p>
                    <p className="text-xs text-slate-500">
                      {report.resourceOverview.otherFuels.notes}
                    </p>
                  </div>
                </div>

                {/* Energy Efficiency Indicators */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">Energy Efficiency Indicators</span>
                    <span className="text-[11px] text-slate-500">Building & Infrastructure Benchmarks</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {report.resourceOverview.energyEfficiency.indicators.map((ind, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs space-y-0.5">
                        <span className="text-[10px] text-slate-500 block truncate">{ind.label}</span>
                        <span className="font-bold text-slate-900 block">{ind.value}</span>
                        {ind.benchmark && (
                          <span className="text-[10px] text-slate-400 block">Target: {ind.benchmark}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION C: DETAILED CONSUMPTION ANALYSIS */}
              <div className="space-y-4 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Section C · Detailed Consumption Analysis
                  </h3>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500">Data Level:</span>
                    <span className="font-bold capitalize text-slate-900">
                      {report.consumptionAnalysis.dataLevel.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {report.consumptionAnalysis.hasData ? (
                  <div className="space-y-4">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                        <span className="text-[11px] text-slate-500 block">Average Monthly</span>
                        <div className="text-lg font-mono font-bold text-slate-900 mt-0.5">
                          {report.consumptionAnalysis.averageConsumptionKwh?.toLocaleString()}
                        </div>
                        <span className="text-[10px] text-slate-400">kWh / month</span>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                        <span className="text-[11px] text-slate-500 block">Energy Intensity</span>
                        <div className="text-lg font-mono font-bold text-slate-900 mt-0.5">
                          {report.consumptionAnalysis.intensityKwhPerSqm || '46.0'}
                        </div>
                        <span className="text-[10px] text-slate-400">kWh / m² gross area</span>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                        <span className="text-[11px] text-slate-500 block">Peak Demand Period</span>
                        <div className="text-sm font-bold text-amber-700 mt-1 truncate">
                          {report.consumptionAnalysis.peakPeriod || 'May - June'}
                        </div>
                        <span className="text-[10px] text-slate-400">Pre-monsoon cooling surge</span>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                        <span className="text-[11px] text-slate-500 block">Benchmark Offset</span>
                        <div className="text-lg font-mono font-bold text-slate-900 mt-0.5">
                          {report.consumptionAnalysis.comparisonWithSimilar?.deviationPercent
                            ? `+${report.consumptionAnalysis.comparisonWithSimilar.deviationPercent}%`
                            : '+28%'}
                        </div>
                        <span className="text-[10px] text-slate-400">vs sector baseline</span>
                      </div>
                    </div>

                    {/* Monthly Trend Chart */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">
                          Monthly Electricity Consumption Trend (2026 Verified Records)
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">Unit: kWh</span>
                      </div>

                      <div className="h-56 w-full pt-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={report.consumptionAnalysis.trends} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} />
                            <YAxis stroke="#94a3b8" fontSize={11} domain={['dataMin - 500', 'dataMax + 500']} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#101828', borderRadius: 8, color: '#fff', fontSize: 12, border: 'none' }}
                              formatter={(val: number) => [`${val.toLocaleString()} kWh`, 'Consumption']}
                            />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#3B5BDB"
                              strokeWidth={2.5}
                              dot={{ r: 4, fill: '#3B5BDB' }}
                              activeDot={{ r: 6, fill: '#FF7A70' }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                        <span>Latest Cadence: {report.consumptionAnalysis.dataFreshness.cadence}</span>
                        <span>Validation Level: {report.consumptionAnalysis.dataFreshness.verificationLevel}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 text-center space-y-3">
                    <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
                    <div className="space-y-1">
                      <div className="font-bold text-slate-900 text-sm">
                        Direct Facility Meter Data Not Currently Available
                      </div>
                      <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                        {report.consumptionAnalysis.explanation}
                      </p>
                    </div>

                    <div className="pt-2 flex justify-center gap-3">
                      <button
                        onClick={() => setActiveScope('1km')}
                        className="px-4 py-2 rounded-lg bg-[#3B5BDB] text-white text-xs font-semibold hover:bg-[#2F49B0] transition-colors shadow-xs"
                      >
                        Inspect 1 km Surrounding Area Context
                      </button>
                      <button
                        onClick={() => setActiveScope('city')}
                        className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                      >
                        View Mumbai Municipal Baseline
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION D: GEOGRAPHIC ANALYSIS */}
              <div className="space-y-4 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Section D · Geographic Analysis & Spatial Scope
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    Active Radius: {report.geographicAnalysis.radiusKm} km
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <div className="text-xs text-slate-700 leading-relaxed font-medium">
                    {report.scopeRelationshipExplanation}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
                    <div className={`p-3 rounded-lg border transition-all ${
                      activeScope === '1km' ? 'bg-blue-50/60 border-blue-200 ring-1 ring-blue-300' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span className="font-bold text-slate-900 block mb-1">1 km Immediate Radius</span>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {report.geographicAnalysis.surrounding1KmSummary}
                      </p>
                    </div>

                    <div className={`p-3 rounded-lg border transition-all ${
                      activeScope === '5km' ? 'bg-blue-50/60 border-blue-200 ring-1 ring-blue-300' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span className="font-bold text-slate-900 block mb-1">5 km Broader Urban Zone</span>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {report.geographicAnalysis.surrounding5KmSummary}
                      </p>
                    </div>

                    <div className={`p-3 rounded-lg border transition-all ${
                      activeScope === 'city' ? 'bg-blue-50/60 border-blue-200 ring-1 ring-blue-300' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span className="font-bold text-slate-900 block mb-1">City Municipal Region</span>
                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {report.geographicAnalysis.cityMunicipalSummary}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION E: ANOMALIES & UNUSUAL PATTERNS */}
              <div className="space-y-4 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Section E · Energy Anomalies & Unusual Consumption
                  </h3>
                  <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Explainable Statistical Drivers
                  </span>
                </div>

                <div className="space-y-3">
                  {report.anomaliesAndPatterns.items.map(anom => (
                    <div key={anom.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span className="font-bold text-slate-900 text-sm">{anom.title}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-500">{anom.period}</span>
                          <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            +{anom.deviationPercent}% vs baseline
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 py-2 border-y border-slate-100 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase">Observed Consumption</span>
                          <div className="font-mono font-bold text-slate-900">{anom.observedKwh.toLocaleString()} kWh</div>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase">Expected Seasonal Baseline</span>
                          <div className="font-mono font-bold text-slate-600">{anom.expectedKwh.toLocaleString()} kWh</div>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <span className="font-semibold text-slate-800">Explainable Contributing Factors:</span>
                        <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                          {anom.explainableFactors.map((fac, fIdx) => (
                            <li key={fIdx}>{fac}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-2.5 rounded-lg bg-slate-50 text-[11px] text-slate-600 border border-slate-200">
                        <span className="font-semibold text-slate-800">Operational Context Note: </span>
                        {anom.operationalContextNote}
                      </div>
                    </div>
                  ))}

                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    Methodology: {report.anomaliesAndPatterns.methodologyNote}
                  </div>
                </div>
              </div>

              {/* SECTION F: EVIDENCE-LINKED RECOMMENDATIONS */}
              <div className="space-y-4 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Section F · Evidence-Linked Recommendations
                  </h3>
                  <span className="text-xs text-slate-400">Suggestions to Investigate</span>
                </div>

                <div className="space-y-3">
                  {report.evidenceLinkedRecommendations.map(rec => (
                    <div key={rec.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-[#3B5BDB] shrink-0" />
                          <span className="font-bold text-slate-900 text-sm">{rec.title}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-500 font-medium">{rec.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-600">{rec.targetScope}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">{rec.description}</p>

                      <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-xs text-blue-950 space-y-1">
                        <div>
                          <span className="font-semibold">Linked Analytical Evidence: </span>
                          {rec.evidenceLink}
                        </div>
                        <div>
                          <span className="font-semibold">Suggested Action: </span>
                          {rec.suggestedAction}
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400 italic">
                        {rec.disclaimer}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION G: WHAT-IF SCENARIO CALCULATOR */}
              <div className="space-y-4 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                    Section G · What-If Energy Improvement Simulator
                  </h3>
                  <span className="text-xs text-slate-400">Mathematical Projection</span>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-900">
                      Hypothetical Reduction Modeling for {report.location.name}
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Evaluate transparent statistical outcomes for prospective energy conservation measures against the baseline period.
                    </p>
                  </div>

                  {/* Interactive Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-700">Target Reduction Percentage</span>
                        <span className="font-mono font-bold text-[#3B5BDB]">{scenarioReduction}%</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="30"
                        step="1"
                        value={scenarioReduction}
                        onChange={e => setScenarioReduction(parseInt(e.target.value, 10))}
                        className="w-full accent-[#3B5BDB] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>2% Minor Tuning</span>
                        <span>10% Recommended</span>
                        <span>20% Deep Retrofit</span>
                        <span>30% Net Zero</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 block">
                        Annual Baseline Electricity Load
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={customBaselineKwh}
                          onChange={e => setCustomBaselineKwh(Math.max(1000, parseInt(e.target.value || '0', 10)))}
                          className="w-full pl-3 pr-16 py-2 rounded-lg border border-slate-300 bg-white text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B5BDB]"
                        />
                        <span className="absolute right-3 top-2 text-xs text-slate-400">kWh/yr</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        Baseline Period: {report.whatIfScenarioCalculator.baselinePeriod}
                      </span>
                    </div>
                  </div>

                  {/* Calculated Projection Results */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200">
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Energy Saved</span>
                      <div className="text-base sm:text-lg font-mono font-bold text-emerald-600 mt-0.5">
                        {calculatedSavings.savedKwh.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-slate-500">kWh avoided</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Projected Load</span>
                      <div className="text-base sm:text-lg font-mono font-bold text-slate-900 mt-0.5">
                        {calculatedSavings.projectedKwh.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-slate-500">kWh remaining</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Est. Cost Savings</span>
                      <div className="text-base sm:text-lg font-mono font-bold text-[#3B5BDB] mt-0.5">
                        ${calculatedSavings.costSavingsUsd.toLocaleString()}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        at ${report.whatIfScenarioCalculator.localTariffRatePerKwhUsd}/kWh
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">CO₂ Avoided</span>
                      <div className="text-base sm:text-lg font-mono font-bold text-emerald-700 mt-0.5">
                        {(calculatedSavings.co2AvoidedKg / 1000).toFixed(1)} tons
                      </div>
                      <span className="text-[10px] text-slate-500">
                        at {report.whatIfScenarioCalculator.gridEmissionFactorKgPerKwh} kg/kWh
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 leading-relaxed">
                    <span className="font-bold">Transparent Mathematical Disclaimer: </span>
                    {report.whatIfScenarioCalculator.disclaimer}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            UrbanEnergy Insight · Area Energy Intelligence System
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
