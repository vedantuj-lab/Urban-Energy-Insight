import React, { useState } from 'react';
import { UserRole } from '../types';
import {
  Zap,
  BarChart3,
  MapPin,
  UploadCloud,
  AlertTriangle,
  Building,
  Target,
  FileText,
  Download,
  ArrowRight,
  CheckCircle2,
  Shield,
  Layers,
  Calendar,
  Database,
  TrendingUp,
  Compass,
  Check,
  Activity,
  Scale,
  X,
  Globe2,
} from 'lucide-react';

interface LandingPageProps {
  onNavigateAuth: (role?: UserRole) => void;
  onExploreDashboard: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateAuth, onExploreDashboard }) => {
  const [isResearchModalOpen, setIsResearchModalOpen] = useState(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#101828] selection:bg-[#3B5BDB] selection:text-white">
      {/* 1. HERO SECTION (Midnight Navy & Deep Blue with Coral / Cobalt Accents) */}
      <section
        id="hero"
        className="relative overflow-hidden bg-gradient-to-b from-[#101828] via-[#172554] to-[#101828] text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8 border-b border-[#252B36]"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          {/* Left Text Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1E293B] border border-[#334155] text-[#D7F5E9] text-xs font-mono font-semibold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-[#0F9D91] animate-pulse"></span>
              URBAN ENERGY INTELLIGENCE
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              See the City. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E9E7FF] via-[#3B5BDB] to-[#FF7A70]">
                Understand Its Energy.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#E8ECF2]/90 max-w-xl leading-relaxed">
              Transform urban residential energy records into clear insights, geographic comparisons, and practical improvement plans without black-box complexity.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExploreDashboard}
                className="px-6 py-3.5 rounded-xl bg-[#3B5BDB] hover:bg-[#2F49B0] text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
              >
                <span>Explore the Platform</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollTo('how-it-works')}
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/20 transition-colors"
              >
                See How It Works
              </button>
            </div>

            {/* Understated Status Indicators */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-xs text-[#E8ECF2]/80">
              <div className="space-y-1">
                <span className="text-[#0F9D91] font-mono font-bold block text-sm">Deterministic</span>
                <span className="text-[11px] text-[#E8ECF2]/70 leading-snug block">Transparent median baseline rules</span>
              </div>
              <div className="space-y-1">
                <span className="text-[#3B5BDB] font-mono font-bold block text-sm">Quality Gate</span>
                <span className="text-[11px] text-[#E8ECF2]/70 leading-snug block">Row-level schema & duplicate checks</span>
              </div>
              <div className="space-y-1">
                <span className="text-[#FF7A70] font-mono font-bold block text-sm">Geospatial</span>
                <span className="text-[11px] text-[#E8ECF2]/70 leading-snug block">Verified city sector coordinates</span>
              </div>
            </div>
          </div>

          {/* Right Visual Composition: Layered SaaS Preview */}
          <div id="preview" className="lg:col-span-6 relative">
            <div className="relative rounded-2xl p-5 bg-[#172554]/80 backdrop-blur-xl border border-white/15 shadow-2xl space-y-4">
              {/* Header Bar */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#FF7A70]" />
                  <span className="w-3 h-3 rounded-full bg-[#F4B740]" />
                  <span className="w-3 h-3 rounded-full bg-[#0F9D91]" />
                  <span className="text-xs font-mono text-[#E8ECF2] ml-2">UrbanEnergy Intelligence Console</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-[#E9E7FF] border border-white/15">
                  Illustrative Preview
                </span>
              </div>

              {/* Layered Cards Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-[#101828]/90 p-3.5 rounded-xl border border-white/10 space-y-1">
                  <span className="text-[#667085] text-[10px] uppercase font-mono block">Metropolitan Baseline</span>
                  <div className="text-xl font-bold font-mono text-white">3,980 kWh</div>
                  <span className="text-[10px] text-[#0F9D91]">Sector median benchmark</span>
                </div>

                <div className="bg-[#101828]/90 p-3.5 rounded-xl border border-[#FF7A70]/30 space-y-1">
                  <span className="text-[#667085] text-[10px] uppercase font-mono block">Detected Anomaly</span>
                  <div className="text-xl font-bold font-mono text-[#FF7A70]">+34% Offset</div>
                  <span className="text-[10px] text-[#FF7A70]/90">Northwood Sector deviation</span>
                </div>
              </div>

              {/* Mini Interactive Map / Hotspot Layer */}
              <div className="relative h-48 rounded-xl overflow-hidden border border-white/10 bg-[#101828] p-4 flex flex-col justify-between">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-[#3B5BDB]" />
                    <span>Sector Spatial Intensity</span>
                  </span>
                  <span className="text-[#0F9D91] font-mono text-[11px]">Carto Tiles Verified</span>
                </div>

                {/* Illustrated Bar Spectrum */}
                <div className="space-y-2 my-auto">
                  <div className="flex justify-between text-xs text-[#E8ECF2]">
                    <span>Northwood Residential (NW-SEC4)</span>
                    <span className="font-mono text-[#FF7A70] font-bold">5,240 kWh</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#FF7A70] h-full w-[78%]" />
                  </div>

                  <div className="flex justify-between text-xs text-[#E8ECF2] pt-1">
                    <span>Riverdale Sustainable Housing (RD-ECO2)</span>
                    <span className="font-mono text-[#0F9D91] font-bold">2,790 kWh</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-[#0F9D91] h-full w-[42%]" />
                  </div>
                </div>

                <div className="text-[10px] text-[#667085] border-t border-white/10 pt-2 flex justify-between font-mono">
                  <span>Authoritative PostgreSQL persistence</span>
                  <span className="text-[#3B5BDB]">3 Primary Roles</span>
                </div>
              </div>

              {/* Quick Launch CTA */}
              <button
                onClick={() => onNavigateAuth('energy_analyst')}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#3B5BDB] to-[#7C3AED] hover:opacity-95 text-white font-bold text-xs transition-opacity flex items-center justify-center gap-2 shadow-md"
              >
                <span>Launch Interactive Demo</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Subtle Decorative Geometry */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#7C3AED]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-[#3B5BDB]/10 blur-3xl pointer-events-none" />
      </section>

      {/* 2. THE SIX ESSENTIAL FEATURES SECTION */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="text-xs font-mono font-bold text-[#3B5BDB] tracking-widest uppercase">
            CORE PLATFORM CAPABILITIES
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#101828] tracking-tight">
            Everything You Need to Understand Urban Energy.
          </h2>
          <p className="text-sm sm:text-base text-[#667085] leading-relaxed">
            Six essential, fully implemented features engineered for municipal sustainability teams, analysts, and city administrators.
          </p>
        </div>

        {/* Exactly 6 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1: Energy Analytics */}
          <div className="bg-white p-7 rounded-2xl border border-[#E8ECF2] shadow-xs hover:border-[#3B5BDB] transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#E9E7FF] text-[#3B5BDB] flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-[#101828]">Energy Analytics</h3>
              <p className="text-xs text-[#667085] leading-relaxed">
                Compute total load, monthly means, and median consumption across residential typologies with strict kilowatt-hour unit standards.
              </p>
            </div>
            <button
              onClick={() => onNavigateAuth('energy_analyst')}
              className="text-xs font-semibold text-[#3B5BDB] hover:text-[#2F49B0] flex items-center gap-1.5 pt-2"
            >
              <span>Explore Analytics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Worldwide Energy Map */}
          <div className="bg-white p-7 rounded-2xl border border-[#E8ECF2] shadow-xs hover:border-[#0F9D91] transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#D7F5E9] text-[#0F9D91] flex items-center justify-center">
                <Globe2 className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-[#101828]">Worldwide Energy Map</h3>
              <p className="text-xs text-[#667085] leading-relaxed">
                Interactive worldwide Leaflet map with Carto tiles displaying verified urban sectors across continents, multi-level zooming, and optional user-permissioned GPS location.
              </p>
            </div>
            <button
              onClick={() => onNavigateAuth('energy_analyst')}
              className="text-xs font-semibold text-[#0F9D91] hover:text-[#0b746c] flex items-center gap-1.5 pt-2"
            >
              <span>Explore Worldwide Map</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Dataset Upload and Validation */}
          <div className="bg-white p-7 rounded-2xl border border-[#E8ECF2] shadow-xs hover:border-[#3B5BDB] transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#3B5BDB] flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-[#101828]">Dataset Upload and Validation</h3>
              <p className="text-xs text-[#667085] leading-relaxed">
                Drag-and-drop CSV parser with automatic column schema mapping, duplicate rejection, and row-by-row quality gate alerts.
              </p>
            </div>
            <button
              onClick={() => onNavigateAuth('data_manager')}
              className="text-xs font-semibold text-[#3B5BDB] hover:text-[#2F49B0] flex items-center gap-1.5 pt-2"
            >
              <span>Open Data Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 4: High-Consumption Detection */}
          <div className="bg-white p-7 rounded-2xl border border-[#E8ECF2] shadow-xs hover:border-[#FF7A70] transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#FFE1D6] text-[#FF7A70] flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-[#101828]">High-Consumption Detection</h3>
              <p className="text-xs text-[#667085] leading-relaxed">
                Explainable statistical rules flagging observations that deviate more than 25% from category median baselines.
              </p>
            </div>
            <button
              onClick={() => onNavigateAuth('energy_analyst')}
              className="text-xs font-semibold text-[#FF7A70] hover:text-rose-600 flex items-center gap-1.5 pt-2"
            >
              <span>Inspect Anomaly Rules</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 5: Evidence-Based Planning */}
          <div className="bg-white p-7 rounded-2xl border border-[#E8ECF2] shadow-xs hover:border-[#F4B740] transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#F4B740] flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-[#101828]">Evidence-Based Planning</h3>
              <p className="text-xs text-[#667085] leading-relaxed">
                Formulate targeted municipal retrofit initiatives, assign sector priorities, set deadlines, and track interactive milestone checklists.
              </p>
            </div>
            <button
              onClick={() => onNavigateAuth('planner_admin')}
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1.5 pt-2"
            >
              <span>Manage Actions</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 6: Reports and Exports */}
          <div className="bg-white p-7 rounded-2xl border border-[#E8ECF2] shadow-xs hover:border-[#7C3AED] transition-all space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center">
                <Download className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-lg text-[#101828]">Reports and Exports</h3>
              <p className="text-xs text-[#667085] leading-relaxed">
                Direct RFC 4180 CSV report generation for sector audits and municipal planning timelines backed by live database records.
              </p>
            </div>
            <a
              href="/api/reports/analyst-csv"
              download="urbanenergy_analyst_report.csv"
              className="text-xs font-semibold text-[#7C3AED] hover:text-purple-800 flex items-center gap-1.5 pt-2"
            >
              <span>Download Sample Audit CSV</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS SECTION (Four Clear Steps) */}
      <section id="how-it-works" className="py-24 bg-white border-y border-[#E8ECF2] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="text-xs font-mono font-bold text-[#3B5BDB] tracking-widest uppercase">
              STRUCTURED METHODOLOGY
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-[#101828] tracking-tight">
              Four Clear Steps from Records to Remediation
            </h2>
            <p className="text-sm sm:text-base text-[#667085]">
              A deterministic pipeline that maintains data integrity and drives measurable efficiency gains.
            </p>
          </div>

          {/* Four Step Cards Grid (Horizontal on desktop, vertical on mobile) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#E8ECF2] space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-[#101828] text-white font-mono font-bold text-xs flex items-center justify-center">
                01
              </span>
              <h4 className="font-heading font-bold text-base text-[#101828]">Upload Energy Records</h4>
              <p className="text-xs text-[#667085] leading-relaxed">
                Ingest raw CSV utility surveys containing sector codes, observation dates, and consumption values.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#E8ECF2] space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-[#3B5BDB] text-white font-mono font-bold text-xs flex items-center justify-center">
                02
              </span>
              <h4 className="font-heading font-bold text-base text-[#101828]">Validate & Store Data</h4>
              <p className="text-xs text-[#667085] leading-relaxed">
                Quality gate verifies date formats, prevents negative readings, checks duplicates, and commits to PostgreSQL.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#E8ECF2] space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-[#0F9D91] text-white font-mono font-bold text-xs flex items-center justify-center">
                03
              </span>
              <h4 className="font-heading font-bold text-base text-[#101828]">Analyse & Compare Areas</h4>
              <p className="text-xs text-[#667085] leading-relaxed">
                Calculate sector medians, normalize intensities by floor area, and flag observations exceeding 1.25x baseline.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#E8ECF2] space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-[#FF7A70] text-white font-mono font-bold text-xs flex items-center justify-center">
                04
              </span>
              <h4 className="font-heading font-bold text-base text-[#101828]">Plan Improvements & Export</h4>
              <p className="text-xs text-[#667085] leading-relaxed">
                Formulate milestone-backed actions, track execution progress, and export comprehensive CSV audits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. RESEARCH AND PROJECT CONTEXT */}
      <section id="research" className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#FAF7F2] border border-[#E8ECF2] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-[#3B5BDB] tracking-widest uppercase">
                ACADEMIC CAPSTONE CONTRIBUTION
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#101828]">
                Addressing the Urban Energy Analysis Gap
              </h2>
            </div>
            <button
              onClick={() => setIsResearchModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#101828] hover:bg-[#1e293b] text-white font-semibold text-xs shadow-md transition-all self-start sm:self-auto shrink-0"
            >
              <Scale className="w-4 h-4 text-[#FF7A70]" />
              <span>Comparative Literature Analysis</span>
            </button>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#667085] leading-relaxed">
            <p>
              In contemporary municipal management, residential energy tracking is frequently disconnected: consumption records are trapped in disparate spreadsheets, geographic information systems operate in silos, and planning teams lack an auditable connection between observed anomalies and subsequent retrofit investments.
            </p>
            <p>
              <strong>UrbanEnergy Insight</strong> addresses specific limitations identified in the literature—such as single-location specificity in <em>Shamaei & Ghalehteimouri (City and Built Environment, 2026)</em> and the static audit structure of the <em>US DOE Home Energy Score (HES)</em>—by providing a software architecture that connects data ingestion, quality validation, multi-region hierarchy, explainable detection, what-if planning, and outcome tracking.
            </p>
            <p>
              Importantly, the system relies upon deterministic, explainable statistical baselines rather than unverified black-box predictive models, ensuring that every flagged anomaly provides clear, auditable evidence for municipal decision-makers.
            </p>
          </div>

          <div className="pt-4 border-t border-[#E8ECF2] flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6 text-xs text-[#667085] font-mono">
              <span className="flex items-center gap-1.5">
                <Database className="w-4 h-4 text-[#0F9D91]" />
                <span>Authoritative Relational DDL</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#3B5BDB]" />
                <span>Median Baseline Deviations</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-[#7C3AED]" />
                <span>Three Role Governance</span>
              </span>
            </div>

            <button
              onClick={() => setIsResearchModalOpen(true)}
              className="text-xs font-bold text-[#3B5BDB] hover:text-[#2F49B0] flex items-center gap-1"
            >
              <span>View 3-Way Comparative Evaluation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* RESEARCH & LITERATURE REVIEW MODAL */}
      {isResearchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-mono font-bold text-[#3B5BDB] uppercase tracking-wider block">
                  LITERATURE REVIEW & RESEARCH GAP ALIGNMENT
                </span>
                <h3 className="font-heading text-xl sm:text-2xl font-extrabold text-[#101828] mt-1">
                  Comparative Analysis: Research vs. Practice
                </h3>
              </div>
              <button
                onClick={() => setIsResearchModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Core Reference Paper Citation */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
              <span className="font-bold text-slate-900 block font-heading">
                Selected Research Foundation:
              </span>
              <p className="italic text-slate-600">
                "Machine learning-based analysis of urban regeneration and household energy consumption for sustainable energy optimization in deteriorated urban areas"
              </p>
              <div className="text-[11px] text-slate-500 font-mono">
                Authors: Shamaei & Ghalehteimouri · Published in: <em>City and Built Environment</em> (Springer Nature, 11 September 2026) · Study Location: District 10, Tehran, Iran
              </div>
            </div>

            {/* 3-Way Comparative Matrix */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                3-Way Platform Comparison
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Evaluation Dimension</th>
                      <th className="py-2.5 px-3">Tehran Study (2026)</th>
                      <th className="py-2.5 px-3">US DOE Home Energy Score</th>
                      <th className="py-2.5 px-3 bg-blue-50/60 text-[#3B5BDB]">UrbanEnergy Insight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px] text-slate-700">
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Geographic Scope</td>
                      <td className="py-2.5 px-3">Single district (Tehran D10)</td>
                      <td className="py-2.5 px-3">Fixed nationwide US buildings</td>
                      <td className="py-2.5 px-3 bg-blue-50/30 font-medium text-blue-900">Configurable Multi-Country Hierarchy (USA, India, UK)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Ingestion & Validation</td>
                      <td className="py-2.5 px-3">Offline research preprocessing</td>
                      <td className="py-2.5 px-3">Manual certified assessor entry</td>
                      <td className="py-2.5 px-3 bg-blue-50/30 font-medium text-blue-900">Live CSV Quality Gate (row-by-row schema verification)</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Benchmarking Fairly</td>
                      <td className="py-2.5 px-3">Normalized local district metrics</td>
                      <td className="py-2.5 px-3">1-to-10 asset rating score</td>
                      <td className="py-2.5 px-3 bg-blue-50/30 font-medium text-blue-900">kWh/m² & kWh/hh with Climate Comparability Warnings</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Anomaly Explainability</td>
                      <td className="py-2.5 px-3">Feature importance weights</td>
                      <td className="py-2.5 px-3">Checklist-based deficiencies</td>
                      <td className="py-2.5 px-3 bg-blue-50/30 font-medium text-blue-900">Transparent Median Deviation (+25%) & Contributing Factors</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Planning & Simulation</td>
                      <td className="py-2.5 px-3">Theoretical optimization finding</td>
                      <td className="py-2.5 px-3">Static recommended measures</td>
                      <td className="py-2.5 px-3 bg-blue-50/30 font-medium text-blue-900">Interactive What-If Simulator (kWh, $, CO2) + Milestones</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold text-slate-900">Outcome Measurement</td>
                      <td className="py-2.5 px-3">Not within study scope</td>
                      <td className="py-2.5 px-3">Optional utility bill upload</td>
                      <td className="py-2.5 px-3 bg-blue-50/30 font-medium text-blue-900">Before-and-after empirical outcome tracking table</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Five Key Contributions */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                The 5 Research Gap Solutions Delivered:
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <span className="font-bold text-slate-900">1. Multi-Region Adaptability</span>
                  <p className="text-slate-600 leading-snug">
                    Supports Country → State/Province/UT → District → City → Sector without hardcoding any single municipal boundary.
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <span className="font-bold text-slate-900">2. Contextual Benchmarking</span>
                  <p className="text-slate-600 leading-snug">
                    Normalizes by gross floor area (kWh/m²) and flags climate differences so warm semi-arid and coastal zones aren't compared unfairly.
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <span className="font-bold text-slate-900">3. Explainable Anomaly Signals</span>
                  <p className="text-slate-600 leading-snug">
                    High-consumption flags provide explicit baseline deviation offsets and contributing physical/environmental factors.
                  </p>
                </div>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                  <span className="font-bold text-slate-900">4. What-If Scenario Simulation</span>
                  <p className="text-slate-600 leading-snug">
                    Planners can project energy reductions, annual cost savings, and avoided CO2 before committing capital budgets.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsResearchModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-[#3B5BDB] hover:bg-[#2F49B0] text-white font-semibold text-xs shadow-md transition-colors"
              >
                Close Literature Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. ROLE SHOWCASE (EXACTLY THREE PRIMARY ROLES) */}
      <section id="roles" className="py-24 bg-[#101828] text-white px-4 sm:px-6 lg:px-8 border-t border-[#252B36]">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="text-xs font-mono font-bold text-[#E9E7FF] tracking-widest uppercase">
              THREE OPERATIONAL ROLES
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              One Shared Platform. Three Dedicated Environments.
            </h2>
            <p className="text-sm sm:text-base text-[#667085]">
              Every stakeholder logs in through the same secure authentication backend, receiving a dedicated dashboard and authorized feature set.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Role 1 Card: Energy Analyst */}
            <div className="bg-[#172554] p-8 rounded-3xl border border-teal-500/30 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-[#0F9D91] flex items-center justify-center">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase text-[#0F9D91] tracking-wider block">
                    Role 1 · Analyst
                  </span>
                  <h3 className="font-heading text-xl font-bold text-white mt-1">
                    Energy Intelligence Center
                  </h3>
                </div>
                <p className="text-xs text-[#E8ECF2]/80 leading-relaxed">
                  Understand consumption patterns, compare urban sectors, explore Leaflet map hotspots, and export analytical audit reports.
                </p>
                <div className="space-y-1.5 pt-2 text-xs text-[#E8ECF2]">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#0F9D91]" />
                    <span>Consumption Overview & Trends</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#0F9D91]" />
                    <span>Area Comparison & Leaflet Map</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#0F9D91]" />
                    <span>High-Consumption Detection</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigateAuth('energy_analyst')}
                className="w-full py-3 rounded-xl bg-[#0F9D91] hover:bg-[#0b746c] text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <span>Sign in as Analyst</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Role 2 Card: Data Manager */}
            <div className="bg-[#172554] p-8 rounded-3xl border border-cyan-500/30 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase text-cyan-400 tracking-wider block">
                    Role 2 · Data Manager
                  </span>
                  <h3 className="font-heading text-xl font-bold text-white mt-1">
                    Energy Data Workspace
                  </h3>
                </div>
                <p className="text-xs text-[#E8ECF2]/80 leading-relaxed">
                  Upload raw CSV consumption records, inspect schema errors, manage datasets, and ensure data freshness.
                </p>
                <div className="space-y-1.5 pt-2 text-xs text-[#E8ECF2]">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-400" />
                    <span>CSV Drag-and-Drop Ingestion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Row-Level Quality Gate Alerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Dataset Management & History</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigateAuth('data_manager')}
                className="w-full py-3 rounded-xl bg-[#3B5BDB] hover:bg-[#2F49B0] text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <span>Sign in as Data Manager</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Role 3 Card: Energy Planner & Administrator */}
            <div className="bg-[#172554] p-8 rounded-3xl border border-amber-500/30 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-[#F4B740] flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase text-[#F4B740] tracking-wider block">
                    Role 3 · Planner & Admin
                  </span>
                  <h3 className="font-heading text-xl font-bold text-white mt-1">
                    Urban Planning & Control Center
                  </h3>
                </div>
                <p className="text-xs text-[#E8ECF2]/80 leading-relaxed">
                  Prioritize urban areas, manage milestone plans, and administer user permissions and database engine health.
                </p>
                <div className="space-y-1.5 pt-2 text-xs text-[#E8ECF2]">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#F4B740]" />
                    <span>Empirical Priority Scoring</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#F4B740]" />
                    <span>Action Planning & Milestone Sliders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#F4B740]" />
                    <span>User RBAC & DB Diagnostics (Admin)</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigateAuth('planner_admin')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#F4B740] to-[#FF7A70] hover:opacity-95 text-[#101828] font-bold text-xs shadow-md transition-opacity flex items-center justify-center gap-2"
              >
                <span>Sign in as Planner & Admin</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FINAL CALL TO ACTION (Midnight Navy with Cobalt-to-Violet Gradient) */}
      <section className="py-24 bg-gradient-to-r from-[#101828] via-[#172554] to-[#1E1B4B] text-white text-center px-4 relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-mono text-[#E9E7FF] border border-white/15">
            READY FOR SUBMISSION
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight">
            Turn Energy Data Into Clearer Decisions.
          </h2>
          <p className="text-[#E8ECF2]/90 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
            Experience the three-role urban analytics platform with real PostgreSQL persistence, Leaflet mapping, and explainable anomaly rules.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigateAuth('energy_analyst')}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#3B5BDB] to-[#7C3AED] hover:opacity-95 text-white font-bold text-sm shadow-xl transition-transform active:scale-95 flex items-center gap-2"
            >
              <span>Explore UrbanEnergy Insight</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#3B5BDB_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-[#101828] text-[#667085] text-xs py-12 px-4 sm:px-6 lg:px-8 border-t border-[#252B36]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#3B5BDB] flex items-center justify-center text-white">
                <Zap className="w-4 h-4 text-[#FF7A70]" />
              </div>
              <span className="font-heading font-extrabold text-white text-base">
                UrbanEnergy Insight
              </span>
            </div>
            <p className="text-xs text-[#667085] max-w-sm leading-relaxed">
              Understand Your Energy. Find the Problem. Improve It. A software-based urban residential energy analytics platform for data-driven municipal planning.
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-white text-xs uppercase tracking-wider block font-heading">
              Platform
            </span>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => scrollTo('features')} className="hover:text-white transition-colors">
                  Energy Analytics
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('features')} className="hover:text-white transition-colors">
                  Geographic Leaflet Map
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('features')} className="hover:text-white transition-colors">
                  Quality Validation Gate
                </button>
              </li>
              <li>
                <button onClick={() => scrollTo('features')} className="hover:text-white transition-colors">
                  Action Remediation
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-white text-xs uppercase tracking-wider block font-heading">
              Operational Roles
            </span>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => onNavigateAuth('energy_analyst')} className="hover:text-white transition-colors">
                  Energy Analyst
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateAuth('data_manager')} className="hover:text-white transition-colors">
                  Data Manager
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateAuth('planner_admin')} className="hover:text-white transition-colors">
                  Planner & Administrator
                </button>
              </li>
              <li>
                <a href="/api/health" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                  System Health API
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-[#252B36] flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-[#667085]">
          <span>© 2026 UrbanEnergy Insight · Academic Capstone Demonstration</span>
          <div className="flex items-center gap-4">
            <span>Authoritative PostgreSQL Database Schema</span>
            <span>·</span>
            <span>CARTO Voyager & OpenStreetMap Attribution</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
