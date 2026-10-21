import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Zap,
  ArrowRight,
  Shield,
  Layers,
  Calendar,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Building,
  Check,
} from 'lucide-react';

interface AuthPageProps {
  onLoginSuccess?: (role: UserRole) => void;
  initialRole?: UserRole;
}

interface RoleConfig {
  id: UserRole;
  label: string;
  demoEmail: string;
  tagline: string;
  heading: string;
  description: string;
  features: string[];
  themeClasses: {
    bgGradient: string;
    cardBorder: string;
    accentText: string;
    buttonBg: string;
    buttonHover: string;
    tabActive: string;
    badgeBg: string;
  };
}

const ROLES: Record<UserRole, RoleConfig> = {
  energy_analyst: {
    id: 'energy_analyst',
    label: 'Energy Analyst',
    demoEmail: 'analyst@demo.local',
    tagline: 'Intelligence & Pattern Discovery',
    heading: 'See Beyond the Numbers.',
    description: 'Analyse consumption distributions, benchmark across climate zones, and discover high-consumption anomaly triggers.',
    features: [
      'Consumption Overview & Multi-Region Filters',
      'Contextual Benchmarks (kWh/m² & kWh/hh)',
      'Sector-by-Sector Area Comparison',
      'Interactive Leaflet Energy Map',
      'Explainable High-Consumption Anomaly Detection',
      'Climate Comparability Warnings',
      'Analytical Reports & Direct CSV Export',
    ],
    themeClasses: {
      bgGradient: 'from-[#101828] via-[#172554] to-[#0F9D91]',
      cardBorder: 'border-teal-500/30',
      accentText: 'text-[#0F9D91]',
      buttonBg: 'bg-[#0F9D91]',
      buttonHover: 'hover:bg-[#0c8278]',
      tabActive: 'bg-[#0F9D91] text-white shadow-lg',
      badgeBg: 'bg-teal-950/80 text-teal-300 border-teal-800',
    },
  },
  data_manager: {
    id: 'data_manager',
    label: 'Data Manager',
    demoEmail: 'datamanager@demo.local',
    tagline: 'Ingestion, Validation & Governance',
    heading: 'Make Every Record Count.',
    description: 'Upload, validate, correct, and map multi-tier geographic energy datasets without silent errors.',
    features: [
      'CSV Upload & Drag-and-Drop Ingestion',
      '5-Tier Geographic Hierarchy Mapping',
      'Live Row-by-Row Schema Quality Gate',
      'Missing-Value & Negative kWh Rejection',
      'Multi-Region Sample Survey Loaders',
      'Processing Error Review & Ingestion Logs',
      'Durable Database Freshness & Sync Status',
    ],
    themeClasses: {
      bgGradient: 'from-[#101828] via-[#172554] to-[#3B5BDB]',
      cardBorder: 'border-blue-500/30',
      accentText: 'text-[#3B5BDB]',
      buttonBg: 'bg-[#3B5BDB]',
      buttonHover: 'hover:bg-[#2F49B0]',
      tabActive: 'bg-[#3B5BDB] text-white shadow-lg',
      badgeBg: 'bg-blue-950/80 text-blue-300 border-blue-800',
    },
  },
  planner_admin: {
    id: 'planner_admin',
    label: 'Planner & Administrator',
    demoEmail: 'planneradmin@demo.local',
    tagline: 'Evidence-Based Action & System Governance',
    heading: 'Turn Insight Into Action.',
    description: 'Prioritize urban sectors, simulate what-if reduction scenarios, track outcomes, and manage platform governance.',
    features: [
      'Empirical Sector Priority Assessment',
      'Interactive What-If Scenario Simulator (kWh, $, CO2)',
      'Before-and-After Outcome Tracking Table',
      'Planning Action Lifecycle & Target Dates',
      'Milestone Progress Checklists',
      'User Management & Role Assignment (Admin)',
      'Database Engine Diagnostics & System Health (Admin)',
    ],
    themeClasses: {
      bgGradient: 'from-[#101828] via-[#1E1B4B] to-[#7C3AED]',
      cardBorder: 'border-amber-500/30',
      accentText: 'text-[#FF7A70]',
      buttonBg: 'bg-gradient-to-r from-[#FF7A70] to-[#F4B740] text-[#101828]',
      buttonHover: 'hover:opacity-95',
      tabActive: 'bg-gradient-to-r from-[#FF7A70] to-[#F4B740] text-[#101828] shadow-lg font-bold',
      badgeBg: 'bg-purple-950/80 text-amber-300 border-purple-800',
    },
  },
};

export const AuthPage: React.FC<AuthPageProps> = ({ onLoginSuccess, initialRole = 'energy_analyst' }) => {
  const { login } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState<string>(ROLES[initialRole].demoEmail);
  const [password, setPassword] = useState<string>('demo123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const currentRoleConfig = ROLES[selectedRole];

  const handleRoleTabChange = (role: UserRole, customEmail?: string) => {
    setSelectedRole(role);
    setEmail(customEmail || ROLES[role].demoEmail);
    setPassword('demo123');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const user = await login(email, password);
      if (onLoginSuccess) {
        onLoginSuccess(user.role);
      }
    } catch (err: unknown) {
      setErrorMessage((err as Error).message || 'Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-[calc(100vh-4rem)] bg-gradient-to-br ${currentRoleConfig.themeClasses.bgGradient} transition-colors duration-700 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center relative overflow-hidden`}>
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Column: Role Narrative & Feature Highlights */}
        <div className="lg:col-span-7 text-white space-y-6">
          {/* 3 Role Selector Tabs */}
          <div className="flex flex-wrap gap-2 p-1.5 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 w-fit">
            {(Object.keys(ROLES) as UserRole[]).map(roleKey => {
              const r = ROLES[roleKey];
              const isSelected = selectedRole === roleKey;
              return (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => handleRoleTabChange(roleKey)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? r.themeClasses.tabActive
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>

          <div className="space-y-2">
            <span className={`text-xs font-mono font-bold tracking-widest uppercase ${currentRoleConfig.themeClasses.accentText}`}>
              Role Experience: {currentRoleConfig.label}
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
              {currentRoleConfig.heading}
            </h1>
            <p className="text-base text-slate-200/90 max-w-xl leading-relaxed">
              {currentRoleConfig.description}
            </p>
          </div>

          {/* Role Feature Checklist */}
          <div className="space-y-2.5 pt-2">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Authorized Capabilities:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {currentRoleConfig.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-slate-200">
                  <CheckCircle2 className={`w-4 h-4 ${currentRoleConfig.themeClasses.accentText} shrink-0`} />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-black/30 backdrop-blur-sm border border-white/10 text-xs text-slate-300 max-w-lg space-y-1">
            <div className="font-semibold text-white flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Unified Backend Authorization</span>
            </div>
            <p className="text-[11px] text-slate-300/80">
              One shared authentication backend securely hashes passwords with bcrypt and returns authoritative roles and granular permissions.
            </p>
          </div>
        </div>

        {/* Right Column: Shared Secure Sign-In Card */}
        <div className="lg:col-span-5">
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl border border-white/40 text-slate-900 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Secure Sign In
                </span>
                <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${currentRoleConfig.themeClasses.badgeBg}`}>
                  {selectedRole}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                Enter your credentials
              </h2>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="name@organization.gov"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-500 hover:text-slate-700 flex items-center gap-1 text-[11px]"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-2.5 px-4 rounded-lg text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${currentRoleConfig.themeClasses.buttonBg} ${currentRoleConfig.themeClasses.buttonHover} active:scale-98`}
              >
                <span>{isLoading ? 'Authenticating with Backend...' : `Sign in as ${currentRoleConfig.label}`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Pre-fill Helper Box */}
            <div className="pt-4 border-t border-slate-200/80 space-y-2">
              <span className="text-[11px] font-semibold text-slate-500 block uppercase tracking-wider">
                Development Seed Accounts (Password: demo123)
              </span>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleRoleTabChange('energy_analyst', 'analyst@demo.local')}
                  className={`w-full text-[11px] text-left p-2.5 rounded-lg border transition-colors flex items-center justify-between ${
                    email === 'analyst@demo.local'
                      ? 'border-[#0F9D91] bg-teal-50/80 text-teal-950 font-semibold'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <span className="font-bold text-slate-900">Energy Analyst</span>
                    <span className="text-slate-500 font-mono text-[10px] ml-2">analyst@demo.local</span>
                  </div>
                  {email === 'analyst@demo.local' && <Check className="w-3.5 h-3.5 text-[#0F9D91]" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleTabChange('data_manager', 'datamanager@demo.local')}
                  className={`w-full text-[11px] text-left p-2.5 rounded-lg border transition-colors flex items-center justify-between ${
                    email === 'datamanager@demo.local'
                      ? 'border-[#3B5BDB] bg-blue-50/80 text-blue-950 font-semibold'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <span className="font-bold text-slate-900">Data Manager</span>
                    <span className="text-slate-500 font-mono text-[10px] ml-2">datamanager@demo.local</span>
                  </div>
                  {email === 'datamanager@demo.local' && <Check className="w-3.5 h-3.5 text-[#3B5BDB]" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleTabChange('planner_admin', 'planneradmin@demo.local')}
                  className={`w-full text-[11px] text-left p-2.5 rounded-lg border transition-colors flex items-center justify-between ${
                    email === 'planneradmin@demo.local'
                      ? 'border-[#7C3AED] bg-purple-50/80 text-purple-950 font-semibold'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <span className="font-bold text-slate-900">Planner & Admin (Full)</span>
                    <span className="text-slate-500 font-mono text-[10px] ml-2">planneradmin@demo.local</span>
                  </div>
                  {email === 'planneradmin@demo.local' && <Check className="w-3.5 h-3.5 text-[#7C3AED]" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleTabChange('planner_admin', 'planner@demo.local')}
                  className={`w-full text-[11px] text-left p-2.5 rounded-lg border transition-colors flex items-center justify-between ${
                    email === 'planner@demo.local'
                      ? 'border-[#FF7A70] bg-orange-50/80 text-orange-950 font-semibold'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <span className="font-bold text-slate-900">Planner (Restricted)</span>
                    <span className="text-slate-500 font-mono text-[10px] ml-2">planner@demo.local</span>
                  </div>
                  {email === 'planner@demo.local' && <Check className="w-3.5 h-3.5 text-[#FF7A70]" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
