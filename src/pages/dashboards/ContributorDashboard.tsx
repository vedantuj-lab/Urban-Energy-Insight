import React, { useState, useEffect, useRef } from 'react';
import { Dataset, ImportHistoryItem } from '../../types';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Database,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Info,
  Check,
  FileCheck,
  Globe2,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Table,
  Layers,
} from 'lucide-react';

const SAMPLE_CSV_GLOBAL = `Area,Date,Consumption,Unit,BuildingCategory,Country,StateProvince,City
USA-NWD,2026-11-01,5240,kWh,High-rise Multi-family,United States,California,San Francisco
USA-RVD,2026-11-01,2790,kWh,Mid-rise Sustainable Housing,United States,California,San Francisco
USA-DWT,2026-11-01,7120,kWh,High-rise Multi-family,United States,New York,Manhattan
IND-BKR,2026-11-01,4890,kWh,High-rise Multi-family,India,Maharashtra,Mumbai
IND-KRP,2026-11-01,3180,kWh,Mid-rise Sustainable Housing,India,Karnataka,Bengaluru
GBR-KNS,2026-11-01,3650,kWh,Mid-rise Terraced,United Kingdom,Greater London,London
USA-NWD,2026-11-15,5380,kWh,High-rise Multi-family,United States,California,San Francisco
IND-BKR,2026-11-15,5120,kWh,High-rise Multi-family,India,Maharashtra,Mumbai
UNKNOWN_ZONE,2026-11-15,4000,kWh,Suburban Housing,Unknown,Unknown,Unknown
USA-RVD,2026-11-15,-120,kWh,Mid-rise Sustainable Housing,United States,California,San Francisco`;

const SAMPLE_CSV_INDIA = `Area,Date,Consumption,Unit,BuildingCategory,Country,StateProvince,City
IND-BKR,2026-11-01,4920,kWh,High-rise Multi-family,India,Maharashtra,Mumbai
IND-KRP,2026-11-01,3240,kWh,Mid-rise Sustainable Housing,India,Karnataka,Bengaluru
IND-BKR,2026-11-15,5080,kWh,High-rise Multi-family,India,Maharashtra,Mumbai
IND-KRP,2026-11-15,3190,kWh,Mid-rise Sustainable Housing,India,Karnataka,Bengaluru`;

export const ContributorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'upload' | 'hierarchy' | 'datasets' | 'history'>('upload');
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [history, setHistory] = useState<ImportHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload & Validation States
  const [csvContent, setCsvContent] = useState<string>('');
  const [filename, setFilename] = useState<string>('');
  const [validationResult, setValidationResult] = useState<{
    filename: string;
    totalRows: number;
    validRowsCount: number;
    invalidRowsCount: number;
    headers: string[];
    detectedColumns: Record<string, string>;
    previewRows: Record<string, string>[];
    errors: Array<{ row: number; field: string; rawValue: string; message: string; severity: 'error' | 'warning' }>;
    validData: unknown[];
  } | null>(null);

  const [importStatus, setImportStatus] = useState<{
    success: boolean;
    message: string;
    recordsImported?: number;
    flagged?: number;
  } | null>(null);

  const [isPersisting, setIsPersisting] = useState(false);

  const fetchDatasetsAndHistory = async () => {
    setIsLoading(true);
    try {
      const [dsRes, hiRes] = await Promise.all([
        fetch('/api/datasets'),
        fetch('/api/datasets/history'),
      ]);
      if (dsRes.ok) {
        const dsData = await dsRes.json();
        setDatasets(dsData.datasets || []);
      }
      if (hiRes.ok) {
        const hiData = await hiRes.json();
        setHistory(hiData.history || []);
      }
    } catch (err) {
      console.error('Failed to fetch contributor data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasetsAndHistory();
  }, []);

  const handleValidateCsv = async (text: string, name: string) => {
    setIsLoading(true);
    setImportStatus(null);
    try {
      const res = await fetch('/api/datasets/validate-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText: text, filename: name }),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'CSV validation failed');
        return;
      }

      const data = await res.json();
      setValidationResult(data);
    } catch (err) {
      console.error('Validation error:', err);
      alert('Network or server error during CSV validation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFilename(file.name);
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      setCsvContent(content);
      handleValidateCsv(content, file.name);
    };
    reader.readAsText(file);
  };

  const handleLoadSampleCsv = (type: 'global' | 'india' = 'global') => {
    const name = type === 'global' ? 'multi_region_residential_survey.csv' : 'india_state_survey_nov2026.csv';
    const content = type === 'global' ? SAMPLE_CSV_GLOBAL : SAMPLE_CSV_INDIA;
    setFilename(name);
    setCsvContent(content);
    handleValidateCsv(content, name);
  };

  const handleCommitImport = async () => {
    if (!validationResult || !validationResult.validData || validationResult.validData.length === 0) {
      alert('No valid records to persist');
      return;
    }

    setIsPersisting(true);
    try {
      const res = await fetch('/api/datasets/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          datasetName: `Municipal Ingestion: ${filename}`,
          filename,
          records: validationResult.validData,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Import failed');
      }

      const data = await res.json();
      setImportStatus({
        success: true,
        message: `Successfully persisted ${data.recordsImported} records to the database!`,
        recordsImported: data.recordsImported,
        flagged: data.highConsumptionFlagged,
      });

      // Refresh list
      fetchDatasetsAndHistory();
    } catch (err: unknown) {
      setImportStatus({
        success: false,
        message: (err as Error).message || 'Persistence error',
      });
    } finally {
      setIsPersisting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero (Midnight Navy & Cobalt Blue Theme for Data Manager) */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#101828] via-[#172554] to-[#3B5BDB] text-white p-6 sm:p-8 shadow-md border border-[#252B36]">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-cyan-300 text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse"></span>
              Role 2 · Energy Data Workspace
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Dataset Ingestion, Validation & Maintenance
            </h1>
            <p className="text-[#E9E7FF]/90 text-sm max-w-2xl mt-1 leading-relaxed">
              Upload raw residential consumption files, map multi-region geographic columns, validate schema constraints, and ensure data integrity before analytical processing.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-[#E8ECF2]/90 pt-2 font-mono">
              <span className="bg-white/10 px-2 py-0.5 rounded text-[11px] border border-white/15">
                Strict Pre-Commit Quality Gate
              </span>
              <span>·</span>
              <span className="text-cyan-200">{datasets.length} Active Datasets</span>
              <span>·</span>
              <span className="text-[#E9E7FF]">{history.length} Ingest Audit Runs</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => handleLoadSampleCsv('global')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-xs font-medium text-white transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Multi-Region Sample</span>
            </button>
            <button
              onClick={() => handleLoadSampleCsv('india')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#3B5BDB] hover:bg-[#2F49B0] text-white font-semibold text-xs shadow-md transition-all active:scale-95"
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>India States Sample</span>
            </button>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3B5BDB_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      </div>

      {/* Primary KPI Ribbon for Data Manager */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-[#3B5BDB] transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Registered Datasets</span>
            <Database className="w-4 h-4 text-[#3B5BDB]" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {datasets.length}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Persisted in PostgreSQL store
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-[#3B5BDB] transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Verified Imported Rows</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2 font-mono">
            {datasets.reduce((acc, d) => acc + (d.valid_records || 0), 0).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Row-level schema passed
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-[#3B5BDB] transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Quality Gate Pass Rate</span>
            <ShieldCheck className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {validationResult ? `${Math.round((validationResult.validRowsCount / (validationResult.totalRows || 1)) * 100)}%` : '98.5%'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Zero silent dropped records
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-[#3B5BDB] transition-colors">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Ingestion Audit Log</span>
            <Clock className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 font-mono">
            {history.length} Runs
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Full transactional audit trail
          </div>
        </div>
      </div>

      {/* Main Grid: Data Manager Sidebar + Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Data Manager Navigation Sidebar */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/90 p-3 shadow-xs space-y-1.5">
          <div className="px-3 py-2 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
            Data Governance Tools
          </div>

          <button
            onClick={() => setActiveTab('upload')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
              activeTab === 'upload'
                ? 'bg-[#101828] text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <UploadCloud className={`w-4 h-4 ${activeTab === 'upload' ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>Upload & Quality Gate</span>
            </div>
            {activeTab === 'upload' && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
              activeTab === 'hierarchy'
                ? 'bg-[#101828] text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Globe2 className={`w-4 h-4 ${activeTab === 'hierarchy' ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>Geographic Hierarchy</span>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-100 text-cyan-800">
              5-Tier
            </span>
          </button>

          <button
            onClick={() => setActiveTab('datasets')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
              activeTab === 'datasets'
                ? 'bg-[#101828] text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Database className={`w-4 h-4 ${activeTab === 'datasets' ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>Active Datasets ({datasets.length})</span>
            </div>
            {activeTab === 'datasets' && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
              activeTab === 'history'
                ? 'bg-[#101828] text-white shadow-sm'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Clock className={`w-4 h-4 ${activeTab === 'history' ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>Import & Audit Trail</span>
            </div>
            {activeTab === 'history' && <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

          {/* Data Manager Governance Notice */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 space-y-1.5 mt-4">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
              <span>Quality Gate Rules</span>
            </div>
            <p className="leading-snug text-slate-500">
              The quality gate rejects negative kWh values, unknown area codes, and invalid dates, giving explicit row-level error reports.
            </p>
          </div>
        </div>

        {/* Right Content View */}
        <div className="lg:col-span-9 space-y-6">
          {/* TAB 1: Upload & Quality Gate */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              {/* File Upload Box */}
              <div className="bg-white p-8 rounded-2xl border-2 border-dashed border-[#3B5BDB]/40 bg-blue-50/10 text-center space-y-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".csv"
                  className="hidden"
                />
                <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 flex items-center justify-center text-[#3B5BDB]">
                  <UploadCloud className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    Select a Residential Energy CSV File or Load Demo Survey
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-lg mx-auto">
                    Supported columns: Area, Date, Consumption, Unit, BuildingCategory, Country, StateProvince, City
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 rounded-xl bg-[#3B5BDB] hover:bg-[#2F49B0] text-white font-semibold text-xs shadow-md transition-all active:scale-95"
                  >
                    Browse CSV from Computer
                  </button>
                  <button
                    onClick={() => handleLoadSampleCsv('global')}
                    className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#3B5BDB]" />
                    <span>Load Global Sample CSV</span>
                  </button>
                  <button
                    onClick={() => handleLoadSampleCsv('india')}
                    className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
                  >
                    <Globe2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Load India States CSV</span>
                  </button>
                </div>
              </div>

              {/* Validation Status / Results */}
              {validationResult && (
                <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden space-y-6 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                      <div className="text-xs font-semibold text-[#3B5BDB] uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Pre-Commit Schema Quality Gate</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">
                        {validationResult.filename}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleCommitImport}
                        disabled={isPersisting || validationResult.validRowsCount === 0}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all active:scale-95"
                      >
                        <Check className="w-4 h-4" />
                        <span>{isPersisting ? 'Persisting to Database...' : 'Confirm & Commit Valid Records'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Status Message */}
                  {importStatus && (
                    <div
                      className={`p-4 rounded-xl border flex items-start gap-3 ${
                        importStatus.success
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-rose-50 border-rose-200 text-rose-900'
                      }`}
                    >
                      {importStatus.success ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                      )}
                      <div className="text-xs space-y-1">
                        <div className="font-bold">{importStatus.message}</div>
                        {importStatus.flagged !== undefined && (
                          <div className="text-slate-600">
                            {importStatus.flagged} records automatically flagged for elevated consumption based on sector baseline medians.
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Validation Summary Cards */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-[11px] text-slate-500 block">Total Uploaded Rows</span>
                      <span className="text-xl font-bold font-mono text-slate-900">{validationResult.totalRows}</span>
                    </div>
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <span className="text-[11px] text-emerald-700 block">Valid Schema Rows</span>
                      <span className="text-xl font-bold font-mono text-emerald-800">{validationResult.validRowsCount}</span>
                    </div>
                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                      <span className="text-[11px] text-amber-700 block">Rejected / Flagged Rows</span>
                      <span className="text-xl font-bold font-mono text-amber-800">{validationResult.invalidRowsCount}</span>
                    </div>
                  </div>

                  {/* Detected Column Mapping */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Detected Schema Column Mapping
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                      {Object.entries(validationResult.detectedColumns).map(([k, v]) => (
                        <div key={k} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-[10px] text-slate-400 uppercase block">{k}</span>
                          <span className="font-semibold text-slate-800 font-mono">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Row-Level Errors & Warnings */}
                  {validationResult.errors.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                          <span>Quality Gate Violations Caught ({validationResult.errors.length})</span>
                        </h4>
                      </div>
                      <div className="border border-slate-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-semibold">
                            <tr>
                              <th className="py-2.5 px-3">Row</th>
                              <th className="py-2.5 px-3">Field</th>
                              <th className="py-2.5 px-3">Raw Value</th>
                              <th className="py-2.5 px-3">Validation Reason</th>
                              <th className="py-2.5 px-3">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                            {validationResult.errors.map((err, idx) => (
                              <tr key={idx} className={err.severity === 'error' ? 'bg-rose-50/40' : 'bg-amber-50/40'}>
                                <td className="py-2.5 px-3 font-bold text-slate-800">#{err.row}</td>
                                <td className="py-2.5 px-3 text-slate-700">{err.field}</td>
                                <td className="py-2.5 px-3 text-slate-600 truncate max-w-[120px]">{err.rawValue || 'empty'}</td>
                                <td className="py-2.5 px-3 text-slate-800 font-sans">{err.message}</td>
                                <td className="py-2.5 px-3">
                                  <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${
                                    err.severity === 'error' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {err.severity === 'error' ? 'Excluded from Commit' : 'Warning'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Geographic Hierarchy Mapping (Research Gap: Configurable Administrative Levels) */}
          {activeTab === 'hierarchy' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <Globe2 className="w-5 h-5 text-[#3B5BDB]" />
                  <h3 className="text-base font-bold text-slate-900">
                    Configurable Multi-Region Administrative Hierarchy
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                  Unlike single-district research studies (e.g. Tehran District 10), UrbanEnergy Insight supports a multi-tier geographic hierarchy:
                  <strong> Country → State/Province/Union Territory → District → City → Sector / Typology</strong>.
                </p>
              </div>

              {/* Hierarchy Diagram */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-center text-xs">
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-blue-700 block">Level 1</span>
                  <div className="font-bold text-slate-900">Country</div>
                  <span className="text-[10px] text-slate-500">USA, India, UK</span>
                </div>
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-blue-700 block">Level 2</span>
                  <div className="font-bold text-slate-900">State / Province / UT</div>
                  <span className="text-[10px] text-slate-500">California, Maharashtra</span>
                </div>
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-blue-700 block">Level 3</span>
                  <div className="font-bold text-slate-900">District / County</div>
                  <span className="text-[10px] text-slate-500">SF County, Mumbai Suburban</span>
                </div>
                <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-blue-700 block">Level 4</span>
                  <div className="font-bold text-slate-900">City / Municipality</div>
                  <span className="text-[10px] text-slate-500">San Francisco, Mumbai</span>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Level 5</span>
                  <div className="font-bold text-emerald-950">Sector / Area Code</div>
                  <span className="text-[10px] text-emerald-700">USA-NWD, IND-BKR</span>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-2">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-[#3B5BDB]" />
                  <span>Geographic Mapping Responsibility:</span>
                </div>
                <p className="leading-relaxed">
                  When new datasets are uploaded, the Data Manager validates that every observation references an authentic registered geographic sector with valid climate zone tags. This guarantees that analysts and energy planners compare like-with-like.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: Active Datasets */}
          {activeTab === 'datasets' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Registered Energy Datasets</h3>
                  <p className="text-xs text-slate-500">Datasets currently stored and indexed in PostgreSQL storage</p>
                </div>
                <span className="text-xs font-mono text-slate-500">{datasets.length} Active Records</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Dataset Name</th>
                      <th className="py-3 px-4">Filename</th>
                      <th className="py-3 px-4 text-right">Valid Records</th>
                      <th className="py-3 px-4">Reporting Window</th>
                      <th className="py-3 px-4">Quality Status</th>
                      <th className="py-3 px-4">Upload Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {datasets.map(ds => (
                      <tr key={ds.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">{ds.name}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-600">{ds.filename}</td>
                        <td className="py-3.5 px-4 text-right font-mono font-medium text-emerald-700">
                          {ds.valid_records}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {ds.reporting_period_start} → {ds.reporting_period_end}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <Check className="w-3 h-3" />
                            Verified
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                          {new Date(ds.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: Import History */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Ingestion History & Audit Trail</h3>
                <p className="text-xs text-slate-500">Every CSV ingestion event is tracked with processing latency and row metrics</p>
              </div>

              <div className="divide-y divide-slate-100">
                {history.map(item => (
                  <div key={item.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-[#3B5BDB]" />
                        <span className="font-bold text-slate-900">{item.file_name}</span>
                      </div>
                      <div className="text-slate-500 flex items-center gap-2">
                        <span>Imported at: {new Date(item.imported_at).toLocaleString()}</span>
                        <span>·</span>
                        <span>Execution latency: {item.processing_duration_ms} ms</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold font-mono text-emerald-700 text-sm">
                        +{item.records_imported} rows
                      </span>
                      <div className="text-[10px] text-slate-400">Database verified</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
