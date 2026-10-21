import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { AnalystDashboard } from './pages/dashboards/AnalystDashboard';
import { ContributorDashboard } from './pages/dashboards/ContributorDashboard';
import { PlannerAdminDashboard } from './pages/dashboards/PlannerAdminDashboard';
import { UserRole } from './types';

const MainApp: React.FC = () => {
  const { user, isAuthenticated, isLoading, switchDemoUser } = useAuth();
  const [currentView, setCurrentView] = useState<'landing' | 'auth' | 'dashboard'>('landing');
  const [targetAuthRole, setTargetAuthRole] = useState<UserRole>('energy_analyst');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono tracking-wider text-emerald-300">
            Initializing UrbanEnergy Insight Session...
          </span>
        </div>
      </div>
    );
  }

  const handleOpenAuth = (role: UserRole = 'energy_analyst') => {
    setTargetAuthRole(role);
    setCurrentView('auth');
  };

  const handleLoginSuccess = (_role: UserRole) => {
    setCurrentView('dashboard');
  };

  const handleExploreDashboard = () => {
    if (isAuthenticated) {
      setCurrentView('dashboard');
    } else {
      switchDemoUser('energy_analyst').then(() => {
        setCurrentView('dashboard');
      });
    }
  };

  const handleScrollSection = (sectionId: string) => {
    if (currentView !== 'landing') {
      setCurrentView('landing');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F2] text-[#101828] font-sans">
      <Header
        onNavigateHome={() => setCurrentView('landing')}
        onNavigateAuth={() => handleOpenAuth('energy_analyst')}
        onScrollSection={handleScrollSection}
      />

      <main className="flex-1">
        {/* Public Landing Page */}
        {currentView === 'landing' && (
          <LandingPage
            onNavigateAuth={role => handleOpenAuth(role || 'energy_analyst')}
            onExploreDashboard={handleExploreDashboard}
          />
        )}

        {/* Canonical Auth Page for 3 Roles */}
        {currentView === 'auth' && (
          <AuthPage
            initialRole={targetAuthRole}
            onLoginSuccess={handleLoginSuccess}
          />
        )}

        {/* 3 Role-Specific Dashboards */}
        {currentView === 'dashboard' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            {(!isAuthenticated || !user) ? (
              <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
                <p className="text-sm text-slate-600 mb-4">Please sign in to access the operational dashboard.</p>
                <button
                  onClick={() => setCurrentView('auth')}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                >
                  Go to Sign In
                </button>
              </div>
            ) : user.role === 'energy_analyst' ? (
              <AnalystDashboard />
            ) : user.role === 'data_manager' ? (
              <ContributorDashboard />
            ) : user.role === 'planner_admin' ? (
              <PlannerAdminDashboard />
            ) : (
              <AnalystDashboard />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
