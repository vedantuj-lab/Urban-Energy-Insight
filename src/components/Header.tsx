import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import {
  Zap,
  LogOut,
  Database,
  ChevronDown,
  BarChart3,
  Layers,
  Calendar,
  Shield,
  ArrowRight,
  Home,
  Check,
  Menu,
  X,
} from 'lucide-react';

interface HeaderProps {
  currentTab?: string;
  onNavigateHome?: () => void;
  onNavigateAuth?: () => void;
  onScrollSection?: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onNavigateHome, onNavigateAuth, onScrollSection }) => {
  const { user, isAuthenticated, logout, switchDemoUser } = useAuth();
  const [dbMode, setDbMode] = useState<string>('Connecting...');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        if (data.database) {
          setDbMode(data.database.mode === 'postgresql' ? 'PostgreSQL Active' : 'Persistent Storage Active');
        }
      })
      .catch(() => setDbMode('Storage Ready'));
  }, []);

  const getRoleTheme = (role?: UserRole, permissions?: string[]) => {
    switch (role) {
      case 'energy_analyst':
        return {
          badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-teal-500',
          label: 'Energy Analyst',
        };
      case 'data_manager':
        return {
          badge: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-cyan-500',
          label: 'Data Manager',
        };
      case 'planner_admin':
        const isAdmin = permissions?.includes('admin');
        return {
          badge: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          label: isAdmin ? 'Planner & Admin' : 'Energy Planner',
        };
      default:
        return {
          badge: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          label: 'Visitor',
        };
    }
  };

  const theme = getRoleTheme(user?.role, user?.permissions);

  const handleNavClick = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    if (onScrollSection) {
      onScrollSection(sectionId);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E8ECF2] text-[#101828] shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-3 text-left focus:outline-none focus:ring-2 focus:ring-[#3B5BDB] rounded-lg p-1 transition-transform active:scale-95"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#101828] to-[#172554] flex items-center justify-center shadow-sm text-white">
              <Zap className="w-5 h-5 text-[#FF7A70]" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-lg tracking-tight text-[#101828] block leading-tight">
                UrbanEnergy <span className="text-[#3B5BDB]">Insight</span>
              </span>
              <span className="text-[10px] text-[#667085] tracking-wide font-medium block">
                Understand · Find · Improve
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#667085]">
            <button
              onClick={() => handleNavClick('hero')}
              className="hover:text-[#101828] transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('preview')}
              className="hover:text-[#101828] transition-colors"
            >
              Platform
            </button>
            <button
              onClick={() => handleNavClick('features')}
              className="hover:text-[#101828] transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => handleNavClick('how-it-works')}
              className="hover:text-[#101828] transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavClick('research')}
              className="hover:text-[#101828] transition-colors"
            >
              About
            </button>
          </nav>
        </div>

        {/* Database Status and Actions */}
        <div className="flex items-center gap-3">
          {/* DB Status Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FAF7F2] border border-[#E8ECF2] text-xs text-[#667085] font-mono">
            <Database className="w-3.5 h-3.5 text-[#0F9D91]" />
            <span>{dbMode}</span>
          </div>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              {/* Persona Switcher Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${theme.badge} hover:shadow-xs`}
                  title="Switch between the 3 authorized demo personas"
                >
                  <span className={`w-2 h-2 rounded-full ${theme.dot} animate-pulse`} />
                  <span className="hidden sm:inline">{theme.label}</span>
                  <span className="text-[#667085] font-mono text-[11px] sm:hidden">{user.role.slice(0, 7)}</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                </button>

                {isRoleDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-[#101828] border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-xs divide-y divide-slate-800 text-white">
                    <div className="px-3.5 py-2.5 text-slate-400">
                      <span className="font-bold text-slate-200 block text-[11px] uppercase tracking-wider font-heading">
                        Switch Persona (3 Roles)
                      </span>
                      <span className="text-[11px]">Explore role-specific dashboards & permissions</span>
                    </div>

                    <div className="py-1">
                      {/* Role 1: Energy Analyst */}
                      <button
                        onClick={() => {
                          switchDemoUser('energy_analyst');
                          setIsRoleDropdownOpen(false);
                        }}
                        className="w-full px-3.5 py-2.5 text-left flex items-center justify-between hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                            <BarChart3 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-white">Energy Analyst</div>
                            <div className="text-[10px] text-teal-300/80">Energy Intelligence Center</div>
                          </div>
                        </div>
                        {user.role === 'energy_analyst' && <Check className="w-4 h-4 text-teal-400" />}
                      </button>

                      {/* Role 2: Data Manager */}
                      <button
                        onClick={() => {
                          switchDemoUser('data_manager');
                          setIsRoleDropdownOpen(false);
                        }}
                        className="w-full px-3.5 py-2.5 text-left flex items-center justify-between hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-white">Data Manager</div>
                            <div className="text-[10px] text-cyan-300/80">Energy Data Workspace</div>
                          </div>
                        </div>
                        {user.role === 'data_manager' && <Check className="w-4 h-4 text-cyan-400" />}
                      </button>

                      {/* Role 3A: Planner & Administrator */}
                      <button
                        onClick={() => {
                          switchDemoUser('planner_admin', 'planneradmin@demo.local');
                          setIsRoleDropdownOpen(false);
                        }}
                        className="w-full px-3.5 py-2.5 text-left flex items-center justify-between hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                            <Shield className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-white">Planner & Admin <span className="text-[10px] text-amber-400 font-mono">[Full]</span></div>
                            <div className="text-[10px] text-amber-300/80">Planning Actions + Admin Controls</div>
                          </div>
                        </div>
                        {user.role === 'planner_admin' && user.permissions.includes('admin') && (
                          <Check className="w-4 h-4 text-amber-400" />
                        )}
                      </button>

                      {/* Role 3B: Planner Only (Restricted) */}
                      <button
                        onClick={() => {
                          switchDemoUser('planner_admin', 'planner@demo.local');
                          setIsRoleDropdownOpen(false);
                        }}
                        className="w-full px-3.5 py-2.5 text-left flex items-center justify-between hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-coral-500/20 text-[#FF7A70] flex items-center justify-center">
                            <Calendar className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-300">Planner Only <span className="text-[10px] text-slate-500 font-mono">[Restricted]</span></div>
                            <div className="text-[10px] text-slate-400">Planning Studio (Admin hidden)</div>
                          </div>
                        </div>
                        {user.role === 'planner_admin' && !user.permissions.includes('admin') && (
                          <Check className="w-4 h-4 text-[#FF7A70]" />
                        )}
                      </button>
                    </div>

                    <div className="px-3.5 py-2 text-[11px] text-slate-400 font-mono">
                      Logged in: <strong className="text-white">{user.email}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Home Link */}
              <button
                onClick={onNavigateHome}
                className="p-2 rounded-lg bg-[#FAF7F2] text-[#667085] hover:text-[#101828] hover:bg-[#E8ECF2] border border-[#E8ECF2] transition-colors"
                title="Public Landing Page"
              >
                <Home className="w-4 h-4" />
              </button>

              {/* Logout Button */}
              <button
                onClick={() => logout()}
                className="p-2 rounded-lg bg-[#FAF7F2] text-[#667085] hover:text-rose-600 hover:bg-rose-50 border border-[#E8ECF2] transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateAuth}
                className="px-3.5 py-2 rounded-lg text-[#101828] hover:bg-[#FAF7F2] font-semibold text-xs transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onNavigateAuth}
                className="px-4 py-2 rounded-lg bg-[#3B5BDB] hover:bg-[#2F49B0] text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-[#667085] hover:text-[#101828] hover:bg-[#FAF7F2]"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#E8ECF2] bg-white px-4 py-4 space-y-3 shadow-md text-sm">
          <div className="flex flex-col space-y-2 text-[#667085] font-medium">
            <button
              onClick={() => handleNavClick('hero')}
              className="text-left py-1.5 hover:text-[#101828]"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('preview')}
              className="text-left py-1.5 hover:text-[#101828]"
            >
              Platform
            </button>
            <button
              onClick={() => handleNavClick('features')}
              className="text-left py-1.5 hover:text-[#101828]"
            >
              Features
            </button>
            <button
              onClick={() => handleNavClick('how-it-works')}
              className="text-left py-1.5 hover:text-[#101828]"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNavClick('research')}
              className="text-left py-1.5 hover:text-[#101828]"
            >
              About
            </button>
          </div>

          {!isAuthenticated && (
            <div className="pt-3 border-t border-[#E8ECF2] flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onNavigateAuth) onNavigateAuth();
                }}
                className="w-full py-2 rounded-lg bg-[#3B5BDB] text-white text-xs font-semibold text-center"
              >
                Sign In to Platform
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
