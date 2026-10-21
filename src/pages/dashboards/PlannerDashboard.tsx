import React, { useState, useEffect } from 'react';
import { PlanningAction, PlanningMilestone, AreaSummary } from '../../types';
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
} from 'lucide-react';

export const PlannerDashboard: React.FC = () => {
  const [actions, setActions] = useState<PlanningAction[]>([]);
  const [areas, setAreas] = useState<AreaSummary[]>([]);
  const [activeTab, setActiveTab] = useState<'actions' | 'priorities' | 'recommendations' | 'timeline' | 'export'>('actions');
  const [isLoading, setIsLoading] = useState(true);

  // New Action Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAreaId, setNewAreaId] = useState('');
  const [newPriority, setNewPriority] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('High');
  const [newTargetDate, setNewTargetDate] = useState('2026-12-31');
  const [newReduction, setNewReduction] = useState('35000');

  // New Milestone Form State
  const [activeActionForMilestone, setActiveActionForMilestone] = useState<string | null>(null);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDate, setNewMilestoneDate] = useState('2026-11-30');

  const fetchPlannerData = async () => {
    setIsLoading(true);
    try {
      const [actRes, arRes] = await Promise.all([
        fetch('/api/planning/actions'),
        fetch('/api/analytics/areas'),
      ]);

      if (actRes.ok) {
        const actData = await actRes.json();
        setActions(actData.actions || []);
      }
      if (arRes.ok) {
        const arData = await arRes.json();
        setAreas(arData.areas || []);
        if (arData.areas?.length > 0 && !newAreaId) {
          setNewAreaId(arData.areas[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load planner data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannerData();
  }, []);

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
        fetchPlannerData();
      } else {
        alert('Failed to create planning action');
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
      if (res.ok) {
        fetchPlannerData();
      }
    } catch (err) {
      console.error('Milestone toggle error:', err);
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
        fetchPlannerData();
      }
    } catch (err) {
      console.error('Failed to add milestone:', err);
    }
  };

  const handleStatusChange = async (actionId: string, status: string) => {
    try {
      const res = await fetch(`/api/planning/actions/${actionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) fetchPlannerData();
    } catch (err) {
      console.error(err);
    }
  };

  // High Priority Areas for the Priority Assessment View
  const prioritizedAreas = [...areas].sort(
    (a, b) => b.baselineDeviationPercent - a.baselineDeviationPercent
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero (Amber / Orange / Gold Theme) */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#7c2d12] via-[#9a3412] to-[#c2410c] text-white p-6 sm:p-8 shadow-lg border border-amber-700/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-amber-300 text-xs font-bold tracking-widest uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              Urban Planning Studio · Planner View
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Evidence-Based Efficiency & Action Planning
            </h1>
            <p className="text-amber-100/90 text-sm max-w-2xl mt-1 leading-relaxed">
              Translate energy anomalies into targeted municipal retrofit initiatives, track milestone progress, and document estimated kilowatt-hour reductions.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>New Planning Action</span>
            </button>
            <a
              href="/api/reports/planning-csv"
              download="urbanenergy_planning_report.csv"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-950/60 hover:bg-amber-900 border border-amber-600/50 text-white font-medium text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </a>
          </div>
        </div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F97316_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-medium">
        <button
          onClick={() => setActiveTab('actions')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'actions'
              ? 'bg-white text-amber-950 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ListTodo className="w-3.5 h-3.5 text-amber-600" />
          <span>Active Actions & Milestones ({actions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('priorities')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'priorities'
              ? 'bg-white text-amber-950 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Target className="w-3.5 h-3.5 text-amber-600" />
          <span>Priority Assessment</span>
        </button>

        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'recommendations'
              ? 'bg-white text-amber-950 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>Remediation Playbook</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'timeline'
              ? 'bg-white text-amber-950 font-bold shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-amber-600" />
          <span>Implementation Timeline</span>
        </button>
      </div>

      {/* TAB CONTENT: Actions & Milestones */}
      {activeTab === 'actions' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actions.map(act => (
              <div
                key={act.id}
                className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 space-y-4 hover:border-amber-400 transition-colors"
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
                      <span className="text-xs text-slate-500 font-medium">
                        {act.areaName} ({act.areaCode})
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-1.5 leading-snug">
                      {act.title}
                    </h3>
                  </div>

                  <select
                    value={act.status}
                    onChange={e => handleStatusChange(act.id, e.target.value)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-md border border-slate-300 bg-slate-50 text-slate-800"
                  >
                    <option value="Proposed">Proposed</option>
                    <option value="Planned">Planned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {act.description}
                </p>

                {/* Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Execution Progress</span>
                    <span className="font-bold font-mono text-slate-900">{act.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        act.progress === 100 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${act.progress}%` }}
                    />
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-500">
                  <div className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Target: {act.target_date}</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-emerald-700 font-semibold">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>~{act.estimated_reduction_kwh.toLocaleString()} kWh saved</span>
                  </div>
                </div>

                {/* Milestones Checklist */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Milestones ({act.milestones?.filter(m => m.is_completed).length || 0}/{act.milestones?.length || 0})
                    </span>
                    <button
                      onClick={() => setActiveActionForMilestone(activeActionForMilestone === act.id ? null : act.id)}
                      className="text-[11px] text-amber-700 hover:text-amber-800 font-medium"
                    >
                      + Add Step
                    </button>
                  </div>

                  {/* Add Milestone Inline */}
                  {activeActionForMilestone === act.id && (
                    <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/60 space-y-2 text-xs">
                      <input
                        type="text"
                        placeholder="Milestone title..."
                        value={newMilestoneTitle}
                        onChange={e => setNewMilestoneTitle(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300 text-xs bg-white"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={newMilestoneDate}
                          onChange={e => setNewMilestoneDate(e.target.value)}
                          className="px-2.5 py-1 rounded border border-slate-300 text-xs bg-white"
                        />
                        <button
                          onClick={() => handleAddMilestone(act.id)}
                          className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs"
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
                        className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer p-1.5 rounded hover:bg-slate-50 transition-colors"
                      >
                        {m.is_completed ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                        <span className={m.is_completed ? 'line-through text-slate-400' : 'text-slate-800'}>
                          {m.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono ml-auto">
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

      {/* TAB CONTENT: Priority Assessment */}
      {activeTab === 'priorities' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Empirical Priority Matrix</h3>
            <p className="text-xs text-slate-500">
              Ranked automatically based on observed baseline deviations, outlier occurrences, and building density.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {prioritizedAreas.map((area, idx) => (
              <div key={area.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs shrink-0 font-mono">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                      <span>{area.name}</span>
                      <span className="font-mono text-xs text-slate-400">({area.code})</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {area.category} · {area.household_count.toLocaleString()} Residential units · {area.gross_floor_area_sqm.toLocaleString()} m²
                    </div>
                    <div className="text-xs text-slate-600 mt-2 font-mono">
                      Mean: <strong className="text-slate-900">{area.averageConsumptionKwh.toLocaleString()} kWh</strong> · Offset vs Metro Median:{' '}
                      <strong className={area.baselineDeviationPercent > 20 ? 'text-orange-600' : 'text-emerald-700'}>
                        {area.baselineDeviationPercent > 0 ? `+${area.baselineDeviationPercent}%` : `${area.baselineDeviationPercent}%`}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${
                    area.priorityLevel === 'High'
                      ? 'bg-orange-100 text-orange-800 border border-orange-200'
                      : area.priorityLevel === 'Medium'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {area.priorityLevel} Action Priority
                  </span>
                  <div className="text-[11px] text-slate-400 mt-1">
                    {area.flaggedCount} High-Load Anomalies
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Remediation Recommendations */}
      {activeTab === 'recommendations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
              1
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Building Envelope & Thermal Diagnostic</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              When consumption rises above 30% in high-rise multi-family complexes during winter months, initiate thermographic surveys to verify insulation continuity and eliminate infiltration leaks around glazing mullions.
            </p>
            <div className="text-[11px] text-amber-800 font-semibold">Recommended target: Northwood Sector</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 font-bold">
              2
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Nighttime HVAC Setback Automation</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              In dense residential buildings with centralized air handling, install automated setback schedules reducing baseline conditioning during off-peak hours (11:00 PM to 5:30 AM).
            </p>
            <div className="text-[11px] text-amber-800 font-semibold">Recommended target: Downtown Central Towers</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600 font-bold">
              3
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Tenant Smart Thermostat Subsidies</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Deploy municipal co-funding for Wi-Fi connected smart thermostats across mixed-use residential units to achieve up to 8-12% average heating and cooling reduction.
            </p>
            <div className="text-[11px] text-teal-800 font-semibold">Recommended target: Oakridge Terraces</div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
              4
            </div>
            <h4 className="font-bold text-slate-900 text-sm">Rooftop Solar & Microgrid Buffers</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Encourage sustainable housing districts to install distributed rooftop solar with localized battery storage to reduce mid-day grid demand and build neighborhood resilience.
            </p>
            <div className="text-[11px] text-emerald-800 font-semibold">Recommended target: Riverdale Eco-District</div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Implementation Timeline */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Municipal Action Timeline</h3>
            <p className="text-xs text-slate-500">Scheduled remediation milestones and execution horizons</p>
          </div>

          <div className="relative border-l-2 border-amber-300 ml-4 space-y-6 pl-6">
            {actions.map(act => (
              <div key={act.id} className="relative">
                <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white" />
                <div className="text-xs font-mono text-amber-700 font-semibold">
                  Due: {act.target_date} · {act.status}
                </div>
                <h4 className="font-bold text-slate-900 text-sm mt-0.5">{act.title}</h4>
                <p className="text-xs text-slate-600 mt-1">{act.description}</p>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="font-medium text-slate-700">Completion: {act.progress}%</span>
                  <div className="w-32 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: `${act.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Action Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900">Create Planning Action</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAction} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Urban Sector</label>
                <select
                  value={newAreaId}
                  onChange={e => setNewAreaId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs"
                >
                  {areas.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.code}) — {a.category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Action Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sub-metering load audit for high-rise towers"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Technical Description</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Detail the audit steps, engineering parameters, or subsidy program..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as 'Low' | 'Medium' | 'High' | 'Critical')}
                    className="w-full px-2 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Date</label>
                  <input
                    type="date"
                    required
                    value={newTargetDate}
                    onChange={e => setNewTargetDate(e.target.value)}
                    className="w-full px-2 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Est. kWh Saved</label>
                  <input
                    type="number"
                    value={newReduction}
                    onChange={e => setNewReduction(e.target.value)}
                    className="w-full px-2 py-2 rounded-lg border border-slate-300 text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-xs"
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
