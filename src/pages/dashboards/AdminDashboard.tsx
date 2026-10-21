import React, { useState, useEffect } from 'react';
import { DatabaseHealth, User, AuditLogItem } from '../../types';
import {
  Shield,
  Users,
  Activity,
  Server,
  Database,
  Lock,
  FileText,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Clock,
  Terminal,
  Settings,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [health, setHealth] = useState<DatabaseHealth | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [activeTab, setActiveTab] = useState<'health' | 'users' | 'audit' | 'settings'>('health');
  const [isLoading, setIsLoading] = useState(true);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [hlRes, usRes, auRes] = await Promise.all([
        fetch('/api/health'),
        fetch('/api/admin/users'),
        fetch('/api/admin/audit-logs'),
      ]);

      if (hlRes.ok) setHealth(await hlRes.json());
      if (usRes.ok) {
        const uData = await usRes.json();
        setUsers(uData.users || []);
      }
      if (auRes.ok) {
        const aData = await auRes.json();
        setAuditLogs(aData.auditLogs || []);
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero (Midnight Navy / Violet / Indigo Theme) */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#0f172a] via-[#1e1b4b] to-[#31104b] text-white p-6 sm:p-8 shadow-lg border border-violet-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-violet-300 text-xs font-bold tracking-widest uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
              System Control Center · Administrator View
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Infrastructure Health & Access Control
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl mt-1 leading-relaxed">
              Monitor authoritative database engine connectivity, audit system write events, inspect role-based access controls, and configure platform parameters.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={fetchAdminData}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-violet-800/60 hover:bg-violet-700/60 border border-violet-600/40 text-xs font-semibold text-violet-100 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#8B5CF6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-medium">
        <button
          onClick={() => setActiveTab('health')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'health'
              ? 'bg-white text-slate-900 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-violet-600" />
          <span>Database & Backend Health</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'users'
              ? 'bg-white text-slate-900 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-violet-600" />
          <span>User Accounts & RBAC ({users.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'audit'
              ? 'bg-white text-slate-900 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-violet-600" />
          <span>System Audit Logs ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'settings'
              ? 'bg-white text-slate-900 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Settings className="w-3.5 h-3.5 text-violet-600" />
          <span>Platform Settings</span>
        </button>
      </div>

      {/* TAB CONTENT: Database & Health */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Database Engine</span>
                <Database className="w-4 h-4 text-violet-600" />
              </div>
              <div className="text-base font-bold text-slate-900 font-mono">
                {health?.database.engine || 'Loading...'}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Operational ({health?.database.mode})</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>External PostgreSQL Status</span>
                <Server className="w-4 h-4 text-slate-500" />
              </div>
              <div className="text-sm font-bold text-slate-900">
                {health?.database.mode === 'postgresql' ? 'Connected (Live Pool)' : 'Ready for DATABASE_URL'}
              </div>
              <p className="text-[11px] text-slate-500">
                {health?.database.mode === 'postgresql'
                  ? 'Queries executing on PostgreSQL cluster'
                  : 'Operating seamlessly with local persistent store. Add DATABASE_URL in .env to connect live PG.'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>Server Uptime & Runtime</span>
                <Clock className="w-4 h-4 text-violet-600" />
              </div>
              <div className="text-base font-bold text-slate-900 font-mono">
                {health ? `${health.serverUptime}s` : '...'} · Node.js / Express
              </div>
              <div className="text-[11px] text-slate-500">
                Port 3000 · Environment: {health?.environment || 'development'}
              </div>
            </div>
          </div>

          {/* Table Counts Matrix */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Authoritative Relational Tables</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[10px]">users</span>
                <span className="text-lg font-bold font-mono text-slate-800">
                  {health?.database.counts.users || 0}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[10px]">urban_areas</span>
                <span className="text-lg font-bold font-mono text-slate-800">
                  {health?.database.counts.urban_areas || 0}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[10px]">datasets</span>
                <span className="text-lg font-bold font-mono text-slate-800">
                  {health?.database.counts.datasets || 0}
                </span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                <span className="text-emerald-700 block text-[10px]">energy_records</span>
                <span className="text-lg font-bold font-mono text-emerald-900">
                  {health?.database.counts.energy_records || 0}
                </span>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                <span className="text-amber-700 block text-[10px]">planning_actions</span>
                <span className="text-lg font-bold font-mono text-amber-900">
                  {health?.database.counts.planning_actions || 0}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[10px]">audit_logs</span>
                <span className="text-lg font-bold font-mono text-slate-800">
                  {health?.database.counts.audit_logs || 0}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[10px]">import_history</span>
                <span className="text-lg font-bold font-mono text-slate-800">
                  {health?.database.counts.import_history || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: User Accounts & RBAC */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Registered Platform Personas</h3>
              <p className="text-xs text-slate-500">Four authenticated user roles with distinct authorization scopes</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role Identifier</th>
                    <th className="py-3 px-4">Assigned Organization</th>
                    <th className="py-3 px-4">Access Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{u.full_name}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{u.organization}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Authorized
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Role Permission Matrix */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Role-Based Access Control (RBAC) Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Capability / Route</th>
                    <th className="py-2.5 px-3 text-center">Energy Analyst</th>
                    <th className="py-2.5 px-3 text-center">Data Contributor</th>
                    <th className="py-2.5 px-3 text-center">Energy Planner</th>
                    <th className="py-2.5 px-3 text-center">Administrator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-2.5 px-3 font-medium">View Consumption Analytics & Charts</td>
                    <td className="text-center font-bold text-emerald-600">✓</td>
                    <td className="text-center font-bold text-emerald-600">✓</td>
                    <td className="text-center font-bold text-emerald-600">✓</td>
                    <td className="text-center font-bold text-emerald-600">✓</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium">Export Analytical Audit Reports (CSV)</td>
                    <td className="text-center font-bold text-emerald-600">✓</td>
                    <td className="text-center text-slate-300">—</td>
                    <td className="text-center font-bold text-emerald-600">✓</td>
                    <td className="text-center font-bold text-emerald-600">✓</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium">Upload & Validate CSV Datasets</td>
                    <td className="text-center text-slate-300">—</td>
                    <td className="text-center font-bold text-emerald-600">✓</td>
                    <td className="text-center text-slate-300">—</td>
                    <td className="text-center font-bold text-emerald-600">✓</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium">Create Planning Actions & Milestones</td>
                    <td className="text-center text-slate-300">—</td>
                    <td className="text-center text-slate-300">—</td>
                    <td className="text-center font-bold text-emerald-600">✓</td>
                    <td className="text-center font-bold text-emerald-600">✓</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium">Manage System Health & Audit Logs</td>
                    <td className="text-center text-slate-300">—</td>
                    <td className="text-center text-slate-300">—</td>
                    <td className="text-center text-slate-300">—</td>
                    <td className="text-center font-bold text-violet-600">✓</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">System Audit Trail</h3>
              <p className="text-xs text-slate-500">Immutable trace of authentication, dataset uploads, and planning updates</p>
            </div>
            <span className="text-xs font-mono text-slate-500">Live Recording</span>
          </div>

          <div className="divide-y divide-slate-100">
            {auditLogs.map(log => (
              <div key={log.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 transition-colors text-xs font-mono">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-slate-100 font-sans">
                      {log.action}
                    </span>
                    <span className="text-slate-700 font-bold font-sans">{log.resource}</span>
                    <span className="text-slate-400">by</span>
                    <span className="text-violet-700 font-semibold">{log.user_email || 'System'}</span>
                  </div>
                  {log.details && (
                    <div className="text-[11px] text-slate-500 font-sans">
                      {JSON.stringify(log.details)}
                    </div>
                  )}
                </div>

                <div className="text-right text-[11px] text-slate-400 shrink-0">
                  <div>{new Date(log.timestamp).toLocaleString()}</div>
                  <div>IP: {log.ip_address}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-5">
          <h3 className="text-base font-bold text-slate-900">Platform Configuration</h3>

          <div className="space-y-4 max-w-xl text-xs">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800 block">Default Energy Measurement Unit</span>
              <span className="text-slate-500 block">Standardized unit for all residential intake calculations</span>
              <span className="inline-block mt-1 font-mono font-bold text-slate-900 bg-white px-2 py-1 rounded border">
                Kilowatt-hours (kWh)
              </span>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800 block">Statistical High-Consumption Threshold</span>
              <span className="text-slate-500 block">Multiplier applied to sector median to trigger automated anomaly review</span>
              <span className="inline-block mt-1 font-mono font-bold text-amber-700 bg-white px-2 py-1 rounded border">
                1.25× (+25% above median baseline)
              </span>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800 block">PostgreSQL Connection Setup</span>
              <span className="text-slate-500 block">
                To connect to external PostgreSQL, set <code className="bg-slate-200 px-1 rounded">DATABASE_URL</code> in <code className="bg-slate-200 px-1 rounded">.env</code>. The application automatically runs migrations from <code className="bg-slate-200 px-1 rounded">migrations/001_init.sql</code>.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
