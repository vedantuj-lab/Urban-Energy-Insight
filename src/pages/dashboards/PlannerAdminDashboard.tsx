import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  PlanningAction,
  PlanningMilestone,
  AreaSummary,
  DatabaseHealth,
  User,
  AuditLogItem,
  WhatIfScenario,
  OutcomeRecord
} from '../../types';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  TrendingDown,
  AlertTriangle,
  Building,
  Target,
  Download,
  ListTodo,
  CheckSquare,
  Square,
  Sparkles,
  Shield,
  Users,
  Activity,
  Server,
  Database,
  Calculator,
  Compass,
  FileCheck,
  FileText,
  RefreshCw,
  Info,
} from 'lucide-react';

export const PlannerAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.permissions?.includes('admin') ?? false;

  const [activeTab, setActiveTab] = useState<'actions' | 'priorities' | 'recommendations' | 'scenarios' | 'outcomes' | 'timeline' | 'health' | 'users' | 'audit'>('actions');
  const [actions, setActions] = useState<PlanningAction[]>([]);
  const [areas, setAreas] = useState<AreaSummary[]>([]);
  const [scenarios, setScenarios] = useState<WhatIfScenario[]>([]);
  const [outcomes, setOutcomes] = useState<OutcomeRecord[]>([]);
  const [health, setHealth] = useState<DatabaseHealth | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Action Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAreaId, setNewAreaId] = useState('');
  const [newPriority, setNewPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [newTargetDate, setNewTargetDate] = useState('2026-12-31');
  const [newReduction, setNewReduction] = useState('35000');

  // Milestone Form State
  const [activeActionForMilestone, setActiveActionForMilestone] = useState<string | null>(null);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('2026-11-30');

  // Scenario Calculator Form State
  const [calcAreaId, setCalcAreaId] = useState('');
  const [calcBaseKwh, setCalcBaseKwh] = useState(65000);
  const [calcReductionPct, setCalcReductionPct] = useState(10);
  const [calcNotes, setCalcNotes] = useState('Energy efficiency lighting and smart thermostat rollout assumption.');
  const [isSavingScenario, setIsSavingScenario] = useState(false);

  const fetchPlannerAdminData = async () => {
    setIsLoading(true);
    try {
      const calls: Promise<Response>[] = [
        fetch('/api/planning/actions'),
        fetch('/api/analytics/areas'),
        fetch('/api/planning/scenarios'),
        fetch('/api/planning/outcomes'),
        fetch('/api/health'),
      ];

      if (isAdmin) {
        calls.push(fetch('/api/admin/users'));
        calls.push(fetch('/api/admin/audit-logs'));
      }

      const results = await Promise.all(calls);
      const actRes = results[0];
      const arRes = results[1];
      const scRes = results[2];
      const ocRes = results[3];
      const hlRes = results[4];

      if (actRes.ok) {
        const actData = await actRes.json();
        setActions(actData.actions || []);
      }
      if (arRes.ok) {
        const arData = await arRes.json();
        setAreas(arData.areas || []);
        if (arData.areas?.length > 0 && !newAreaId) {
          setNewAreaId(arData.areas[0].id);
          setCalcAreaId(arData.areas[0].id);
        }
      }
      if (scRes.ok) {
        const scData = await scRes.json();
        setScenarios(scData.scenarios || []);
      }
      if (ocRes.ok) {
        const ocData = await ocRes.json();
        setOutcomes(ocData.outcomes || []);
      }
      if (hlRes.ok) {
        setHealth(await hlRes.json());
      }

      if (isAdmin && results.length >= 7) {
        const usRes = results[5];
        const auRes = results[6];
        if (usRes?.ok) {
          const uData = await usRes.json();
          setUsersList(uData.users || []);
        }
        if (auRes?.ok) {
          const aData = await auRes.json();
          setAuditLogs(aData.auditLogs || []);
        }
      }
    } catch (err) {
      console.error('Failed to load planner-admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannerAdminData();
  }, [isAdmin]);

  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc || !newAreaId || !newTargetDate) return;

    try {
      const res = await fetch('/api/planning/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          area_id: newAreaId,
          priority: newPriority,
          target_date: newTargetDate,
          estimated_reduction_kwh: Number(newReduction) || 0,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewTitle('');
        setNewDesc('');
        fetchPlannerAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleMilestone = async (milestoneId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/planning/milestones/${milestoneId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_completed: !currentStatus }),
      });
      if (res.ok) fetchPlannerAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMilestone = async (actionId: string) => {
    if (!newMilestoneTitle || !newMilestoneDate) return;

    try {
      const res = await fetch(`/api/planning/actions/${actionId}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newMilestoneTitle,
          due_date: newMilestoneDate,
        }),
      });

      if (res.ok) {
        setNewMilestoneTitle('');
        setActiveActionForMilestone(null);
        fetchPlannerAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveScenario = async () => {
    if (!calcAreaId) return;
    setIsSavingScenario(true);
    try {
      const res = await fetch('/api/planning/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area_id: calcAreaId,
          baseline_period: '2026 Baseline Survey',
          baseline_kwh: calcBaseKwh,
          reduction_percent: calcReductionPct,
          notes: calcNotes,
        }),
      });

      if (res.ok) {
        fetchPlannerAdminData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingScenario(false);
    }
  };

  const handleStatusChange = async (actionId: string, status: string) => {
    try {
      const res = await fetch(`/api/planning/actions/${actionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchPlannerAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  // Live Scenario Calculations
  const calcSavedKwh = Math.round(calcBaseKwh * (calcReductionPct / 100));
  const calcProjectedKwh = calcBaseKwh - calcSavedKwh;
  const calcCostSavings = Math.round(calcSavedKwh * 0.17);
  const calcCo2Avoided = Math.round(calcSavedKwh * 0.42);

  const prioritizedAreas = [...areas].sort(
    (a, b) => b.baselineDeviationPercent - a.baselineDeviationPercent
  );

  return (
    <div className="space-y-6">
      {/* Top Banner (Midnight Navy, Violet & Coral Theme) */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#101828] via-[#172554] to-[#7C3AED] text-white p-6 sm:p-8 shadow-md border border-[#252B36]">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[#FF7A70] text-xs font-mono font-bold tracking-widest uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF7A70] animate-pulse"></span>
              Urban Planning & Control Center · {isAdmin ? 'Planner & Administrator' : 'Planner View'}
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              {isAdmin ? 'Remediation Planning, Scenarios & System Operations' : 'Evidence-Based Remediation & Scenarios'}
            </h1>
            <p className="text-[#E8ECF2]/90 text-sm max-w-2xl mt-1 leading-relaxed">
              Prioritize urban sectors, calculate what-if efficiency scenarios, manage milestone-backed retrofit actions, and {isAdmin ? 'administer database health and platform governance.' : 'track implementation progress.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#FF7A70] hover:bg-[#fa6a5f] text-[#101828] font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Planning Action</span>
            </button>
            <a
              href="/api/reports/planning-csv"
              download="urbanenergy_planning_report.csv"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#FF7A70_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      </div>

      {/* Navigation Tabs (Split into Planning Studio, Scenarios & Administrator Controls) */}
      <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-[#E8ECF2] text-xs font-medium overflow-x-auto shadow-xs">
        <button
          onClick={() => setActiveTab('actions')}
          className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'actions'
              ? 'bg-[#101828] text-white font-bold shadow-xs'
              : 'text-[#667085] hover:text-[#101828]'
          }`}
        >
          <ListTodo className="w-3.5 h-3.5 text-[#FF7A70]" />
          <span>Active Actions & Milestones ({actions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('scenarios')}
          className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'scenarios'
              ? 'bg-[#101828] text-white font-bold shadow-xs'
              : 'text-[#667085] hover:text-[#101828]'
          }`}
        >
          <Calculator className="w-3.5 h-3.5 text-[#3B5BDB]" />
          <span>What-If Scenario Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('priorities')}
          className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'priorities'
              ? 'bg-[#101828] text-white font-bold shadow-xs'
              : 'text-[#667085] hover:text-[#101828]'
          }`}
        >
          <Target className="w-3.5 h-3.5 text-[#F4B740]" />
          <span>Priority Assessment</span>
        </button>

        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'recommendations'
              ? 'bg-[#101828] text-white font-bold shadow-xs'
              : 'text-[#667085] hover:text-[#101828]'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
          <span>Remediation Playbook</span>
        </button>

        <button
          onClick={() => setActiveTab('outcomes')}
          className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'outcomes'
              ? 'bg-[#101828] text-white font-bold shadow-xs'
              : 'text-[#667085] hover:text-[#101828]'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5 text-[#0F9D91]" />
          <span>Outcome Tracking ({outcomes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'timeline'
              ? 'bg-[#101828] text-white font-bold shadow-xs'
              : 'text-[#667085] hover:text-[#101828]'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-[#3B5BDB]" />
          <span>Timeline</span>
        </button>

        {/* Administrator Sections (Permission-Gated) */}
        {isAdmin ? (
          <>
            <div className="h-4 w-px bg-slate-300 mx-1 shrink-0" />
            <button
              onClick={() => setActiveTab('health')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'health'
                  ? 'bg-[#101828] text-white font-bold shadow-xs'
                  : 'text-[#667085] hover:text-[#101828]'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>DB Health & Engine</span>
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'users'
                  ? 'bg-[#101828] text-white font-bold shadow-xs'
                  : 'text-[#667085] hover:text-[#101828]'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Users & RBAC ({usersList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3.5 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
                activeTab === 'audit'
                  ? 'bg-[#101828] text-white font-bold shadow-xs'
                  : 'text-[#667085] hover:text-[#101828]'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-purple-400" />
              <span>Audit Logs ({auditLogs.length})</span>
            </button>
          </>
        ) : (
          <>
            <div className="h-4 w-px bg-slate-300 mx-1 shrink-0" />
            <button
              onClick={() => setActiveTab('admin_locked' as unknown as typeof activeTab)}
              className={`px-3 py-1.5 rounded-lg border text-[11px] font-semibold flex items-center gap-1.5 shrink-0 transition-colors ${
                (activeTab as string) === 'admin_locked'
                  ? 'bg-amber-100 border-amber-400 text-amber-900 font-bold'
                  : 'border-amber-200 bg-amber-50/70 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              <span>Admin Operations (Restricted)</span>
            </button>
          </>
        )}
      </div>

      {/* RBAC Restricted Info Banner when non-admin clicks locked tab */}
      {(activeTab as string) === 'admin_locked' && !isAdmin && (
        <div className="bg-white rounded-2xl border border-amber-200 p-8 shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-slate-900">
              Administrator Privileges Required (Role-Based Access Control)
            </h3>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              You are authenticated as <strong>{user?.full_name}</strong> (<span className="font-mono">{user?.email}</span>) with the authorized role <strong>Planner</strong> (Permissions: <span className="font-mono font-semibold text-amber-800">[{user?.permissions.join(', ')}]</span>).
              Administrative operations—including User Role Reassignments, Database Engine Health Diagnostics, and System-Wide Audit Logs—require explicit <span className="font-mono text-purple-700 font-bold">'admin'</span> authorization.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <div className="font-bold text-slate-800">Academic Evaluation Notice:</div>
            <p>
              To inspect the administrator-only controls, switch to the full <strong>Planner & Admin</strong> demo user (<span className="font-mono text-purple-700">planneradmin@demo.local</span>) using the persona selector in the top navigation bar.
            </p>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Actions & Milestones */}
      {activeTab === 'actions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actions.map(act => (
              <div
                key={act.id}
                className="bg-white rounded-2xl border border-[#E8ECF2] shadow-xs p-6 space-y-4 hover:border-[#3B5BDB] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        act.priority === 'Critical'
                          ? 'bg-rose-100 text-rose-800'
                          : act.priority === 'High'
                          ? 'bg-orange-100 text-orange-800'
                          : act.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {act.priority} Priority
                      </span>
                      <span className="text-xs text-[#667085] font-medium">
                        {act.areaName} ({act.areaCode})
                      </span>
                    </div>
                    <h3 className="font-heading text-base font-bold text-[#101828] mt-1.5 leading-snug">
                      {act.title}
                    </h3>
                  </div>

                  <select
                    value={act.status}
                    onChange={e => handleStatusChange(act.id, e.target.value)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-[#E8ECF2] bg-[#FAF7F2] text-[#101828]"
                  >
                    <option value="Proposed">Proposed</option>
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>

                <p className="text-xs text-[#667085] leading-relaxed">
                  {act.description}
                </p>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#667085]">Execution Progress</span>
                    <span className="font-bold font-mono text-[#101828]">{act.progress}%</span>
                  </div>
                  <div className="w-full bg-[#E8ECF2] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        act.progress === 100 ? 'bg-[#0F9D91]' : 'bg-[#3B5BDB]'
                      }`}
                      style={{ width: `${act.progress}%` }}
                    />
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#E8ECF2] text-[#667085]">
                  <div className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-[#667085]" />
                    <span>Target: {act.target_date}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[#0F9D91] font-semibold">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>~{act.estimated_reduction_kwh.toLocaleString()} kWh saved</span>
                  </div>
                </div>

                {/* Milestones Checklist */}
                <div className="pt-2 border-t border-[#E8ECF2] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#101828] uppercase tracking-wider font-heading">
                      Milestones ({act.milestones?.filter(m => m.is_completed).length || 0}/{act.milestones?.length || 0})
                    </span>
                    <button
                      onClick={() => setActiveActionForMilestone(activeActionForMilestone === act.id ? null : act.id)}
                      className="text-[11px] text-[#3B5BDB] hover:text-[#2F49B0] font-semibold"
                    >
                      + Add Step
                    </button>
                  </div>

                  {activeActionForMilestone === act.id && (
                    <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#E8ECF2] space-y-2 text-xs">
                      <input
                        type="text"
                        placeholder="Milestone title..."
                        value={newMilestoneTitle}
                        onChange={e => setNewMilestoneTitle(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-[#E8ECF2] text-xs bg-white"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={newMilestoneDate}
                          onChange={e => setNewMilestoneDate(e.target.value)}
                          className="px-2.5 py-1 rounded-lg border border-[#E8ECF2] text-xs bg-white"
                        />
                        <button
                          onClick={() => handleAddMilestone(act.id)}
                          className="px-3 py-1 rounded-lg bg-[#3B5BDB] hover:bg-[#2F49B0] text-white font-bold text-xs"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    {act.milestones?.map(m => (
                      <div
                        key={m.id}
                        onClick={() => handleToggleMilestone(m.id, m.is_completed)}
                        className="flex items-center gap-2 text-xs text-[#101828] cursor-pointer p-1.5 rounded-lg hover:bg-[#FAF7F2] transition-colors"
                      >
                        {m.is_completed ? (
                          <CheckSquare className="w-4 h-4 text-[#0F9D91] shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-[#667085] shrink-0" />
                        )}
                        <span className={m.is_completed ? 'line-through text-[#667085]' : 'text-[#101828]'}>
                          {m.title}
                        </span>
                        <span className="text-[10px] text-[#667085] font-mono ml-auto">
                          Due {m.due_date}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: WHAT-IF SCENARIO CALCULATOR */}
      {activeTab === 'scenarios' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Interactive Calculator Input Box */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E8ECF2] shadow-xs space-y-5">
              <div>
                <span className="text-xs font-mono font-bold text-[#3B5BDB] uppercase tracking-wider block">
                  Interactive Simulator
                </span>
                <h3 className="font-heading font-bold text-lg text-[#101828] mt-0.5">
                  What-If Efficiency Scenario
                </h3>
                <p className="text-xs text-[#667085] mt-1 leading-relaxed">
                  Enter baseline consumption and hypothetical percentage reductions to simulate potential energy, financial, and emissions impacts.
                </p>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="font-semibold text-[#101828] block mb-1">Target Urban Sector</label>
                  <select
                    value={calcAreaId}
                    onChange={e => setCalcAreaId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8ECF2] bg-[#FAF7F2] text-[#101828] text-xs"
                  >
                    {areas.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.country}) — {a.category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-[#101828]">Baseline Consumption (kWh)</label>
                    <span className="font-mono text-[#667085] text-[11px]">{calcBaseKwh.toLocaleString()} kWh</span>
                  </div>
                  <input
                    type="range"
                    min="10000"
                    max="200000"
                    step="5000"
                    value={calcBaseKwh}
                    onChange={e => setCalcBaseKwh(Number(e.target.value))}
                    className="w-full accent-[#3B5BDB]"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="font-semibold text-[#101828]">Hypothetical Reduction (%)</label>
                    <span className="font-mono font-bold text-[#FF7A70] text-sm">{calcReductionPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="35"
                    step="1"
                    value={calcReductionPct}
                    onChange={e => setCalcReductionPct(Number(e.target.value))}
                    className="w-full accent-[#FF7A70]"
                  />
                  <div className="flex justify-between text-[10px] text-[#667085] pt-1">
                    <span>2% Minor Setback</span>
                    <span>15% Major Retrofit</span>
                    <span>35% Comprehensive Deep Audit</span>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-[#101828] block mb-1">Assumptions & Engineering Notes</label>
                  <textarea
                    rows={2}
                    value={calcNotes}
                    onChange={e => setCalcNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E8ECF2] bg-[#FAF7F2] text-xs text-[#101828]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveScenario}
                  disabled={isSavingScenario}
                  className="w-full py-2.5 rounded-xl bg-[#3B5BDB] hover:bg-[#2F49B0] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Calculator className="w-4 h-4" />
                  <span>{isSavingScenario ? 'Saving...' : 'Save Scenario to Database'}</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-semibold flex items-center gap-1.5 text-amber-800">
                  <Info className="w-3.5 h-3.5" />
                  <span>Scientific Disclaimer</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-800/90">
                  These outputs represent hypothetical mathematical calculations based on entered assumptions, not proof of guaranteed future energy savings.
                </p>
              </div>
            </div>

            {/* Live Scenario Projected Impact Ribbon */}
            <div className="lg:col-span-7 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#E8ECF2] shadow-xs space-y-1">
                  <span className="text-[11px] text-[#667085] font-mono uppercase block">Projected Consumption</span>
                  <div className="text-2xl font-bold font-mono text-[#101828]">
                    {calcProjectedKwh.toLocaleString()} kWh
                  </div>
                  <span className="text-[11px] text-[#0F9D91] font-semibold">
                    -{calcReductionPct}% reduction from {calcBaseKwh.toLocaleString()} kWh
                  </span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#E8ECF2] shadow-xs space-y-1">
                  <span className="text-[11px] text-[#667085] font-mono uppercase block">Illustrative Energy Saved</span>
                  <div className="text-2xl font-bold font-mono text-[#0F9D91]">
                    {calcSavedKwh.toLocaleString()} kWh
                  </div>
                  <span className="text-[11px] text-[#667085]">
                    ~${calcCostSavings.toLocaleString()} USD · ~{calcCo2Avoided.toLocaleString()} kg CO₂ avoided
                  </span>
                </div>
              </div>

              {/* Saved Scenarios Table */}
              <div className="bg-white rounded-2xl border border-[#E8ECF2] shadow-xs overflow-hidden">
                <div className="p-5 border-b border-[#E8ECF2] flex justify-between items-center">
                  <div>
                    <h4 className="font-heading font-bold text-sm text-[#101828]">Saved Municipal Scenarios ({scenarios.length})</h4>
                    <p className="text-xs text-[#667085]">Stored scenario assumptions for evidence-based council review</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF7F2] text-[#667085] text-[10px] uppercase font-mono font-semibold border-b border-[#E8ECF2]">
                      <tr>
                        <th className="py-2.5 px-3">Target Sector</th>
                        <th className="py-2.5 px-3 text-right">Baseline</th>
                        <th className="py-2.5 px-3 text-center">Reduction</th>
                        <th className="py-2.5 px-3 text-right">Projected</th>
                        <th className="py-2.5 px-3 text-right">Saved Energy</th>
                        <th className="py-2.5 px-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E8ECF2] font-mono text-[11px]">
                      {scenarios.map(sc => (
                        <tr key={sc.id} className="hover:bg-slate-50">
                          <td className="py-3 px-3 font-bold font-sans text-[#101828]">{sc.area_name}</td>
                          <td className="py-3 px-3 text-right text-[#667085]">{sc.baseline_kwh.toLocaleString()} kWh</td>
                          <td className="py-3 px-3 text-center font-bold text-[#FF7A70]">-{sc.reduction_percent}%</td>
                          <td className="py-3 px-3 text-right text-[#101828] font-bold">{sc.projected_kwh.toLocaleString()} kWh</td>
                          <td className="py-3 px-3 text-right text-[#0F9D91] font-bold">+{sc.saved_kwh.toLocaleString()} kWh</td>
                          <td className="py-3 px-3 font-sans text-xs text-[#667085] max-w-[150px] truncate">{sc.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: OUTCOME TRACKING */}
      {activeTab === 'outcomes' && (
        <div className="bg-white rounded-2xl border border-[#E8ECF2] shadow-xs p-6 space-y-6">
          <div>
            <span className="text-xs font-mono font-bold text-[#0F9D91] uppercase tracking-wider block">
              Empirical Verification
            </span>
            <h3 className="font-heading font-bold text-lg text-[#101828] mt-0.5">
              Before-and-After Outcome Tracking
            </h3>
            <p className="text-xs text-[#667085] mt-1 leading-relaxed">
              Track actual measured residential consumption changes following executed municipal retrofit interventions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {outcomes.map(out => (
              <div key={out.id} className="p-5 rounded-2xl border border-[#E8ECF2] bg-[#FAF7F2] space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-[#3B5BDB] font-bold block">
                      {out.area_name}
                    </span>
                    <h4 className="font-heading font-bold text-sm text-[#101828] mt-0.5">{out.action_title}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {out.verification_status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-[#E8ECF2] text-xs">
                  <div>
                    <span className="text-[10px] text-[#667085] block">Pre-Intervention</span>
                    <span className="font-mono font-semibold text-[#101828]">{out.pre_intervention_kwh.toLocaleString()} kWh</span>
                    <span className="text-[10px] text-[#667085] block">{out.pre_intervention_period}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#667085] block">Post-Intervention</span>
                    <span className="font-mono font-semibold text-[#101828]">{out.post_intervention_kwh.toLocaleString()} kWh</span>
                    <span className="text-[10px] text-[#667085] block">{out.post_intervention_period}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#667085] block">Observed Delta</span>
                    <span className="font-mono font-bold text-[#0F9D91]">-{out.observed_reduction_percent}%</span>
                    <span className="text-[10px] text-[#0F9D91] block">-{out.observed_reduction_kwh.toLocaleString()} kWh</span>
                  </div>
                </div>

                <p className="text-xs text-[#667085] leading-relaxed">
                  {out.notes}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Priorities */}
      {activeTab === 'priorities' && (
        <div className="bg-white rounded-2xl border border-[#E8ECF2] shadow-xs overflow-hidden">
          <div className="p-6 border-b border-[#E8ECF2]">
            <h3 className="font-heading font-bold text-base text-[#101828]">Empirical Priority Matrix</h3>
            <p className="text-xs text-[#667085]">
              Ranked automatically based on observed baseline deviations, outlier occurrences, and building density across all registered regions.
            </p>
          </div>

          <div className="divide-y divide-[#E8ECF2]">
            {prioritizedAreas.map((area, idx) => (
              <div key={area.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF7F2] transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] text-[#101828] font-bold flex items-center justify-center text-xs shrink-0 font-mono border border-[#E8ECF2]">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="font-heading font-bold text-[#101828] text-sm flex items-center gap-2">
                      <span>{area.name}</span>
                      <span className="font-mono text-xs text-[#667085]">({area.code})</span>
                      <span className="text-xs text-[#3B5BDB] font-mono">· {area.country}</span>
                    </div>
                    <div className="text-xs text-[#667085] mt-0.5">
                      {area.category} · {area.climate_zone} · {area.household_count.toLocaleString()} units
                    </div>
                    <div className="text-xs text-[#667085] mt-2 font-mono">
                      Mean: <strong className="text-[#101828]">{area.averageConsumptionKwh.toLocaleString()} kWh</strong> · Offset vs Metro Median:{' '}
                      <strong className={area.baselineDeviationPercent > 20 ? 'text-[#FF7A70]' : 'text-[#0F9D91]'}>
                        {area.baselineDeviationPercent > 0 ? `+${area.baselineDeviationPercent}%` : `${area.baselineDeviationPercent}%`}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${
                    area.priorityLevel === 'High'
                      ? 'bg-rose-50 text-rose-800 border border-rose-200'
                      : area.priorityLevel === 'Medium'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  }`}>
                    {area.priorityLevel} Action Priority
                  </span>
                  <div className="text-[11px] text-[#667085] mt-1 font-mono">
                    {area.flaggedCount} High-Load Anomalies
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Recommendations */}
      {activeTab === 'recommendations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-[#E8ECF2] shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold font-mono">
              1
            </div>
            <h4 className="font-heading font-bold text-[#101828] text-sm">Building Envelope & Thermal Diagnostic</h4>
            <p className="text-xs text-[#667085] leading-relaxed">
              When consumption rises above 30% in high-rise multi-family complexes during winter months, initiate thermographic surveys to verify insulation continuity and eliminate infiltration leaks around glazing mullions.
            </p>
            <div className="text-[11px] text-amber-800 font-semibold">Recommended target: Northwood Sector (USA)</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E8ECF2] shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 font-bold font-mono">
              2
            </div>
            <h4 className="font-heading font-bold text-[#101828] text-sm">Monsoon Dehumidification & Chiller Staging</h4>
            <p className="text-xs text-[#667085] leading-relaxed">
              In high-density tropical complexes (Aw climate zone), optimize chiller staging and VFD speed control to reduce high latent cooling loads without subcooling common residential lobbies.
            </p>
            <div className="text-[11px] text-amber-800 font-semibold">Recommended target: Bandra-Kurla Residential (India)</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E8ECF2] shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600 font-bold font-mono">
              3
            </div>
            <h4 className="font-heading font-bold text-[#101828] text-sm">Tenant Smart Thermostat Subsidies</h4>
            <p className="text-xs text-[#667085] leading-relaxed">
              Deploy municipal co-funding for Wi-Fi connected smart thermostats across mixed-use residential units to achieve up to 8-12% average heating and cooling reduction.
            </p>
            <div className="text-[11px] text-[#0F9D91] font-semibold">Recommended target: Hauz Khas Residential (India)</div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E8ECF2] shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold font-mono">
              4
            </div>
            <h4 className="font-heading font-bold text-[#101828] text-sm">Rooftop Solar & Microgrid Buffers</h4>
            <p className="text-xs text-[#667085] leading-relaxed">
              Encourage sustainable housing districts to install distributed rooftop solar with localized battery storage to reduce mid-day grid demand and build neighborhood resilience.
            </p>
            <div className="text-[11px] text-emerald-800 font-semibold">Recommended target: Greenwich Millennium Village (UK)</div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Timeline */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-2xl border border-[#E8ECF2] shadow-xs p-6 space-y-6">
          <div>
            <h3 className="font-heading font-bold text-base text-[#101828]">Municipal Action Timeline</h3>
            <p className="text-xs text-[#667085]">Scheduled remediation milestones and execution horizons</p>
          </div>

          <div className="relative border-l-2 border-[#3B5BDB] ml-4 space-y-6 pl-6">
            {actions.map(act => (
              <div key={act.id} className="relative">
                <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#3B5BDB] border-2 border-white" />
                <div className="text-xs font-mono text-[#3B5BDB] font-semibold">
                  Due: {act.target_date} · {act.status}
                </div>
                <h4 className="font-heading font-bold text-[#101828] text-sm mt-0.5">{act.title}</h4>
                <p className="text-xs text-[#667085] mt-1">{act.description}</p>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="font-medium text-[#101828]">Completion: {act.progress}%</span>
                  <div className="w-32 bg-[#E8ECF2] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-[#3B5BDB] h-full" style={{ width: `${act.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Admin Database & Health */}
      {activeTab === 'health' && isAdmin && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E8ECF2] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#667085] text-xs">
                <span>Database Engine</span>
                <Database className="w-4 h-4 text-[#3B5BDB]" />
              </div>
              <div className="text-base font-bold text-[#101828] font-mono">
                {health?.database.engine || 'Loading...'}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#0F9D91] font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Operational ({health?.database.mode})</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8ECF2] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#667085] text-xs">
                <span>PostgreSQL Cluster</span>
                <Server className="w-4 h-4 text-[#667085]" />
              </div>
              <div className="text-sm font-bold text-[#101828]">
                {health?.database.mode === 'postgresql' ? 'Connected (Live Pool)' : 'Ready for DATABASE_URL'}
              </div>
              <p className="text-[11px] text-[#667085]">
                {health?.database.mode === 'postgresql'
                  ? 'Queries executing on live PostgreSQL pool'
                  : 'Operating seamlessly with local persistent store. Add DATABASE_URL to connect external PostgreSQL.'}
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8ECF2] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[#667085] text-xs">
                <span>Server Uptime</span>
                <Clock className="w-4 h-4 text-[#7C3AED]" />
              </div>
              <div className="text-base font-bold text-[#101828] font-mono">
                {health ? `${health.serverUptime}s` : '...'} · Node.js / Express
              </div>
              <div className="text-[11px] text-[#667085]">
                Port 3000 · Environment: {health?.environment || 'development'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Admin Users & RBAC */}
      {activeTab === 'users' && isAdmin && (
        <div className="bg-white rounded-2xl border border-[#E8ECF2] shadow-xs overflow-hidden">
          <div className="p-6 border-b border-[#E8ECF2]">
            <h3 className="font-heading font-bold text-base text-[#101828]">Registered Platform Personas</h3>
            <p className="text-xs text-[#667085]">Three primary roles with explicit permissions</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF7F2] text-[#667085] text-[10px] uppercase font-mono font-semibold border-b border-[#E8ECF2]">
                <tr>
                  <th className="py-3 px-4">Full Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Primary Role</th>
                  <th className="py-3 px-4">Explicit Permissions</th>
                  <th className="py-3 px-4">Organization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8ECF2] text-[#101828]">
                {usersList.map(u => (
                  <tr key={u.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3.5 px-4 font-bold">{u.full_name}</td>
                    <td className="py-3.5 px-4 font-mono text-[#667085]">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[11px] font-semibold bg-[#FAF7F2] border border-[#E8ECF2]">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex gap-1">
                        {u.permissions?.map(p => (
                          <span key={p} className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-purple-50 text-[#7C3AED] border border-purple-200">
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#667085]">{u.organization}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Admin Audit Logs */}
      {activeTab === 'audit' && isAdmin && (
        <div className="bg-white rounded-2xl border border-[#E8ECF2] shadow-xs overflow-hidden">
          <div className="p-6 border-b border-[#E8ECF2] flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-base text-[#101828]">System Audit Trail</h3>
              <p className="text-xs text-[#667085]">Immutable trace of authentication, dataset uploads, and planning updates</p>
            </div>
            <span className="text-xs font-mono text-[#667085]">Live Recording</span>
          </div>

          <div className="divide-y divide-[#E8ECF2]">
            {auditLogs.map(log => (
              <div key={log.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#FAF7F2] transition-colors text-xs font-mono">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#101828] text-white font-sans">
                      {log.action}
                    </span>
                    <span className="text-[#101828] font-bold font-sans">{log.resource}</span>
                    <span className="text-[#667085]">by</span>
                    <span className="text-[#3B5BDB] font-semibold">{log.user_email || 'System'}</span>
                  </div>
                  {log.details && (
                    <div className="text-[11px] text-[#667085] font-sans">
                      {JSON.stringify(log.details)}
                    </div>
                  )}
                </div>

                <div className="text-right text-[11px] text-[#667085] shrink-0">
                  <div>{new Date(log.timestamp).toLocaleString()}</div>
                  <div>IP: {log.ip_address}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Action Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E8ECF2] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8ECF2] pb-3">
              <h3 className="font-heading font-bold text-base text-[#101828]">Create Planning Action</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#667085] hover:text-[#101828] text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAction} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-[#101828] block mb-1">Target Urban Sector</label>
                <select
                  value={newAreaId}
                  onChange={e => setNewAreaId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8ECF2] bg-white text-[#101828] text-xs"
                >
                  {areas.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.country}) — {a.category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-[#101828] block mb-1">Action Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sub-metering load audit for high-rise towers"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8ECF2] text-[#101828] text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-[#101828] block mb-1">Technical Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail the audit steps, engineering parameters, or subsidy program..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E8ECF2] text-[#101828] text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-[#101828] block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as 'Low' | 'Medium' | 'High' | 'Critical')}
                    className="w-full px-2 py-2 rounded-xl border border-[#E8ECF2] bg-white text-[#101828] text-xs"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#101828] block mb-1">Target Date</label>
                  <input
                    type="date"
                    required
                    value={newTargetDate}
                    onChange={e => setNewTargetDate(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-[#E8ECF2] text-[#101828] text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#101828] block mb-1">Est. kWh Saved</label>
                  <input
                    type="number"
                    value={newReduction}
                    onChange={e => setNewReduction(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-[#E8ECF2] text-[#101828] text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8ECF2]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-[#667085] hover:bg-[#FAF7F2] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#3B5BDB] hover:bg-[#2F49B0] text-white font-bold shadow-xs"
                >
                  Save Action
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
