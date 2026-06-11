/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Shield, Building2, Users, Clipboard, Clock, Heart, Sparkles, UserCheck, HelpCircle, 
  MapPin, LogOut, CheckCircle2, Navigation, AlertCircle, LayoutDashboard, FileSpreadsheet,
  Menu, X, RefreshCw, Layers, Trophy, BookOpen, Calculator, Settings, Key, Lock, User
} from 'lucide-react';
import { UserRole, AccessMode, Department } from './types';
import { MockDatabase } from './data/mockDatabase';

// Subcomponents
import OnboardingFlow from './components/OnboardingFlow';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import CompanyAdminDashboard from './components/CompanyAdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import HRHeadApprovalDashboard from './components/HRHeadApprovalDashboard';

const roleMetadata = {
  SUPER_ADMIN: {
    title: 'Super Admin Authority',
    subtitle: 'System Architect',
    badge: 'SA',
    desc: 'Configure licensing, trials, and global workspace parameters.',
    headerTitle: 'Global Sandbox System Registry & Super Control Panel'
  },
  COMPANY_ADMIN: {
    title: 'Executive Overview Board',
    subtitle: 'Acme Management Board',
    badge: 'EX',
    desc: 'Explore real-time departmental health rates, math parameters, and intrinsic flow.',
    headerTitle: 'Enterprise Executive Overview'
  },
  HR_HEAD: {
    title: 'HR Head Desk',
    subtitle: 'Clearance & Verification Desk',
    badge: 'HR',
    desc: 'Verify candidate requests and authorize encrypted credentials.',
    headerTitle: 'HR Head Clearance Center'
  },
  EMPLOYEE: {
    title: 'Employee Private Space',
    subtitle: 'Workforce Participant',
    badge: 'EM',
    desc: 'Respond to micro-pulses, trace task motivation, and view medals received.',
    headerTitle: 'Personal Workplace Well-being Hub'
  },
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('wbm_is_logged_in') === 'true';
  });

  const [authRole, setAuthRole] = useState<UserRole>(() => {
    return (localStorage.getItem('wbm_auth_role') as UserRole) || 'COMPANY_ADMIN';
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem('wbm_active_role') as UserRole) || 'COMPANY_ADMIN';
  });

  const [loggedInEmployeeId, setLoggedInEmployeeId] = useState<string>(() => {
    return localStorage.getItem('wbm_logged_in_emp_id') || '';
  });

  const [accessMode, setAccessMode] = useState<AccessMode>(() => {
    return (localStorage.getItem('wbm_access_mode') as AccessMode) || 'FULL';
  });

  // Login form temporary states
  const [loginRole, setLoginRole] = useState<'SU' | 'EX' | 'EM'>('EX');
  const [selectedLoginEmpId, setSelectedLoginEmpId] = useState<string>('');
  const [loginPass, setLoginPass] = useState('•••••••••');
  const [loginError, setLoginError] = useState<string | null>(null);

  const [selectedDeptId, setSelectedDeptId] = useState<string>('dept-eng');
  const [tick, setTick] = useState(0);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [showGuide, setShowGuide] = useState(true);
  const [tickerMessage, setTickerMessage] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNudgeSpinning, setIsNudgeSpinning] = useState(false);

  // Sync initial employee select lists
  useEffect(() => {
    const list = MockDatabase.getEmployees().filter(e => e.status === 'APPROVED');
    if (list.length > 0 && !selectedLoginEmpId) {
      setSelectedLoginEmpId(list[0].id);
    }
  }, []);

  // Background ticker checking for lapsing daily pulse check events
  useEffect(() => {
    const timer = setInterval(() => {
      const result = MockDatabase.tickNudgesAndCheckLapses();
      if (result.statusChanged) {
        setTick(t => t + 1);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem('wbm_active_role', role);
    setIsMobileSidebarOpen(false);
    setTick(t => t + 1);
  };

  const handleAccessModeChange = (mode: AccessMode) => {
    setAccessMode(mode);
    localStorage.setItem('wbm_access_mode', mode);
    setTick(t => t + 1);
  };

  const triggerStateRefresh = () => {
    setSelectedDeptId(selectedDeptId);
    setTick(t => t + 1);
  };

  const handleFastForward = () => {
    const activeNudges = MockDatabase.getNudges();
    const now = Date.now();
    
    const updated = activeNudges.map(nudge => {
      if (nudge.status === 'PENDING') {
        return {
          ...nudge,
          expiresAt: now - 1000
        };
      }
      return nudge;
    });
    
    MockDatabase.saveNudges(updated);
    const result = MockDatabase.tickNudgesAndCheckLapses();
    triggerStateRefresh();

    if (result.statusChanged) {
      setTickerMessage(result.message || 'Timeline fast-forwarded! Lapsed pending questions triggered secondary follow-up surveys.');
    } else {
      setTickerMessage('All active pulses updated. Check dashboards for lapsed/pending states.');
    }

    setTimeout(() => setTickerMessage(null), 6000);
  };

  const handleTriggerNewNudge = () => {
    setIsNudgeSpinning(true);
    setTimeout(() => setIsNudgeSpinning(false), 700);

    const employees = MockDatabase.getEmployees().filter(e => e.role === 'EMPLOYEE');
    if (employees.length > 0) {
      employees.forEach(emp => {
        MockDatabase.triggerNewRandomNudge(emp.id);
      });
      triggerStateRefresh();
      setTickerMessage('Dispatched randomized wellbeing nudges to all registered employees!');
      setTimeout(() => setTickerMessage(null), 5000);
    } else {
      setTickerMessage('No active employees to trigger nudges for!');
      setTimeout(() => setTickerMessage(null), 5000);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data and clear simulated localStorage state?')) {
      MockDatabase.resetToDefault();
      triggerStateRefresh();
      
      const list = MockDatabase.getEmployees().filter(e => e.status === 'APPROVED');
      if (list.length > 0) {
        setSelectedLoginEmpId(list[0].id);
      }

      setTickerMessage('Database values reset successfully to system defaults.');
      setTimeout(() => setTickerMessage(null), 4000);
    }
  };

  const handleShowNudgeLab = () => {
    setTickerMessage('Aggregate Index (59%) formula: (0.1x Sad + 0.5x Neutral + 1.0x Happy) * Nudge Coefficient. Adjusted dynamically by response latency.');
    setTimeout(() => setTickerMessage(null), 7000);
  };

  const handleShowMetricRoadmaps = () => {
    setTickerMessage('Strategic goal: Maintain >80% pulse reply rates and implement automated supportive checklists for distressed departments.');
    setTimeout(() => setTickerMessage(null), 7000);
  };

  // Perform secure login action
  const executeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (loginRole === 'SU') {
      // Super admin authorize
      setIsLoggedIn(true);
      localStorage.setItem('wbm_is_logged_in', 'true');
      setCurrentRole('SUPER_ADMIN');
      localStorage.setItem('wbm_active_role', 'SUPER_ADMIN');
      setAuthRole('SUPER_ADMIN');
      localStorage.setItem('wbm_auth_role', 'SUPER_ADMIN');
      setLoggedInEmployeeId('');
      localStorage.removeItem('wbm_logged_in_emp_id');
    } else if (loginRole === 'EX') {
      // Executive Overview authorize
      setIsLoggedIn(true);
      localStorage.setItem('wbm_is_logged_in', 'true');
      setCurrentRole('COMPANY_ADMIN');
      localStorage.setItem('wbm_active_role', 'COMPANY_ADMIN');
      setAuthRole('COMPANY_ADMIN');
      localStorage.setItem('wbm_auth_role', 'COMPANY_ADMIN');
      setLoggedInEmployeeId('');
      localStorage.removeItem('wbm_logged_in_emp_id');
    } else {
      // Respective Employee authorize
      if (!selectedLoginEmpId) {
        setLoginError('No approved employee profiles exist. Head to Onboarding, register your staff, then sign in.');
        return;
      }
      setIsLoggedIn(true);
      localStorage.setItem('wbm_is_logged_in', 'true');
      setCurrentRole('EMPLOYEE');
      localStorage.setItem('wbm_active_role', 'EMPLOYEE');
      setAuthRole('EMPLOYEE');
      localStorage.setItem('wbm_auth_role', 'EMPLOYEE');
      setLoggedInEmployeeId(selectedLoginEmpId);
      localStorage.setItem('wbm_logged_in_emp_id', selectedLoginEmpId);
    }
  };

  const executeLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('wbm_is_logged_in');
    setLoggedInEmployeeId('');
    localStorage.removeItem('wbm_logged_in_emp_id');
    
    // Default logged role back
    setCurrentRole('COMPANY_ADMIN');
    localStorage.setItem('wbm_active_role', 'COMPANY_ADMIN');
    setAuthRole('COMPANY_ADMIN');
    localStorage.setItem('wbm_auth_role', 'COMPANY_ADMIN');
    setLoginError(null);
  };

  const departments: Department[] = MockDatabase.getDepartments();
  const pendingCount = MockDatabase.getRegistrationRequests().filter(r => r.status === 'pending').length;

  // Render Login screen if unauthenticated
  if (!isLoggedIn) {
    const approvedEmps = MockDatabase.getEmployees().filter(e => e.status === 'APPROVED');
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 antialiased selection:bg-indigo-500 selection:text-white">
        <div className="absolute inset-0 bg-radial from-indigo-500/10 via-slate-950/20 to-transparent pointer-events-none" />
        
        <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative z-10 transition-all duration-350">
          
          {/* Logo & title header */}
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 bg-indigo-600 text-white font-bold rounded-2xl flex items-center justify-center font-display mx-auto text-xl shadow-lg shadow-indigo-600/20 border border-indigo-400/30">
              M
            </div>
            <h1 className="text-xl font-display font-medium text-white tracking-tight pt-2">
              Meraki Access Gateway
            </h1>
            <p className="text-xs text-indigo-300 font-sans italic max-w-xs mx-auto">
              "Feels like miracle!"
            </p>
            <p className="text-[11px] text-slate-400 font-sans max-w-xs mx-auto">
              Continuous support analytics, secure private coaching, and motivational employee recognitions.
            </p>
          </div>

          <form onSubmit={executeLogin} className="space-y-4">
            {/* Custom role selector toggles */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                Select Portal Access Mode
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setLoginRole('EX')}
                  className={`py-2 rounded-lg text-xs font-semibold uppercase tracking-tight transition-all font-mono ${
                    loginRole === 'EX' 
                      ? 'bg-indigo-600 text-white font-bold' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Board
                </button>
                <button
                  type="button"
                  onClick={() => setLoginRole('EM')}
                  className={`py-2 rounded-lg text-xs font-semibold uppercase tracking-tight transition-all font-mono ${
                    loginRole === 'EM' 
                      ? 'bg-indigo-600 text-white font-bold' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Employee
                </button>
                <button
                  type="button"
                  onClick={() => setLoginRole('SU')}
                  className={`py-2 rounded-lg text-xs font-semibold uppercase tracking-tight transition-all font-mono ${
                    loginRole === 'SU' 
                      ? 'bg-indigo-600 text-white font-bold' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            {/* Target inputs based on role */}
            <div className="space-y-3 pt-1">
              {loginRole === 'SU' && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    Super Admin Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">
                      <Shield className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      disabled
                      value="super.admin@healthmap.org"
                      className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-850 rounded-xl text-slate-450 text-slate-400 font-mono focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {loginRole === 'EX' && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    Executive Board Domain
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">
                      <Building2 className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      disabled
                      value="exec.board@acme.com"
                      className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-850 rounded-xl text-slate-450 text-slate-400 font-mono focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {loginRole === 'EM' && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    Choose Respective Employee Profile
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-550 text-indigo-405 text-slate-500">
                      <User className="w-4 h-4" />
                    </span>
                    <select
                      value={selectedLoginEmpId}
                      onChange={(e) => setSelectedLoginEmpId(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-905 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 font-semibold focus:outline-none focus:border-indigo-500"
                    >
                      {approvedEmps.length === 0 ? (
                        <option value="">No Active Profiles Registered...</option>
                      ) : (
                        approvedEmps.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name} ({emp.employeeId})</option>
                        ))
                      )}
                    </select>
                  </div>
                  {approvedEmps.length === 0 && (
                    <div className="pt-1.5 text-rose-450 text-[11px] text-rose-400 font-semibold leading-normal">
                      💡 Quick Demo Tip: Sign in as "Board" or "Admin", click on onboarding simulator to add & approve a new employee, then sign in securely as them here!
                    </div>
                  )}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                  Authentication Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-300 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {loginError && (
              <div className="bg-rose-950/40 border border-rose-900 p-3 rounded-lg text-[11px] text-rose-300 leading-normal">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Key className="w-3.5 h-3.5" /> Authenticate Secure Session
            </button>
          </form>

          {/* Secure disclaimer bar */}
          <div className="border-t border-slate-800/85 pt-4 text-center select-all flex items-center justify-between text-[10px] text-slate-500 font-mono font-medium">
            <span>MNC AES-256 COMPLIANT</span>
            <span>SECURE GATEWAY v2.4</span>
          </div>

        </div>
      </div>
    );
  }

  // Active current profile object
  const activeEmployeeDetail = MockDatabase.getEmployees().find(e => e.id === loggedInEmployeeId);
  const isAuthedAsSuperAdmin = authRole === 'SUPER_ADMIN';

  return (
    <div className="flex h-screen w-screen bg-slate-50 font-sans text-slate-800 overflow-hidden select-none antialiased">
      
      {/* Mobile Sidebar backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-40 md:hidden transition-opacity" 
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar - SLEEK THEME PRECISE RIGHT-ROLE VISIBILITY SEGREGATION */}
      {/* Only display the left navigational sidebar if authorized as Board Admin or Super Admin! */}
      {(currentRole !== 'EMPLOYEE' || authRole === 'SUPER_ADMIN' || authRole === 'COMPANY_ADMIN') && (
        <aside className={`w-64 bg-slate-900 flex flex-col shrink-0 z-50 transition-all duration-300 md:static fixed inset-y-0 left-0 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } border-r border-slate-800`}>
          
          {/* Brand Container */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white font-display">M</div>
              <div className="flex flex-col">
                <span className="text-base font-semibold text-white tracking-tight font-display">Meraki</span>
                <span className="text-[9px] text-indigo-300 italic font-sans">Feels like miracle!</span>
              </div>
            </div>
            <button 
              onClick={() => setIsMobileSidebarOpen(false)}
              className="text-slate-400 hover:text-white md:hidden block focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Content */}
          <nav className="flex-1 p-4 space-y-6 overflow-y-auto font-sans">
            
            {/* Perspective buttons section with strict access rules */}
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-3 font-mono">My Perspectives</div>
              
              {/* Only show Super Admin views to strictly verified super account roles */}
              {authRole === 'SUPER_ADMIN' && (
                <button
                  id="switch-super-admin"
                  onClick={() => handleRoleChange('SUPER_ADMIN')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                    currentRole === 'SUPER_ADMIN'
                      ? 'bg-indigo-605 bg-indigo-600 text-white shadow-md font-semibold font-sans'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <Shield className={`w-4 h-4 shrink-0 ${currentRole === 'SUPER_ADMIN' ? 'text-white' : 'text-slate-500'}`} />
                  <span className="text-xs">Super Admin Desk</span>
                </button>
              )}

              {/* Company Admin/Executive view - available to SA and executive board */}
              {(authRole === 'SUPER_ADMIN' || authRole === 'COMPANY_ADMIN') && (
                <button
                  id="switch-company-admin"
                  onClick={() => handleRoleChange('COMPANY_ADMIN')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                    currentRole === 'COMPANY_ADMIN'
                      ? 'bg-indigo-600 text-white shadow-md font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <Users className={`w-4 h-4 shrink-0 ${currentRole === 'COMPANY_ADMIN' ? 'text-white' : 'text-slate-500'}`} />
                  <span className="text-xs">Executive Overview</span>
                </button>
              )}

              {/* HR Clearance Desk - available to SA and executive board */}
              {(authRole === 'SUPER_ADMIN' || authRole === 'COMPANY_ADMIN') && (
                <button
                  id="switch-hr-head"
                  onClick={() => handleRoleChange('HR_HEAD')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                    currentRole === 'HR_HEAD'
                      ? 'bg-indigo-600 text-white shadow-md font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <UserCheck className={`w-4 h-4 shrink-0 ${currentRole === 'HR_HEAD' ? 'text-white' : 'text-slate-500'}`} />
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs">HR Clearance Gate</span>
                    {pendingCount > 0 && (
                      <span className="text-[9px] bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full font-mono shrink-0">
                        {pendingCount}
                      </span>
                    )}
                  </div>
                </button>
              )}

              {/* Simulated Employee Sandbox - available to SA and executive board */}
              {(authRole === 'SUPER_ADMIN' || authRole === 'COMPANY_ADMIN') && (
                <button
                  id="switch-employee"
                  onClick={() => handleRoleChange('EMPLOYEE')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left ${
                    currentRole === 'EMPLOYEE'
                      ? 'bg-indigo-600 text-white shadow-md font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                  }`}
                >
                  <LayoutDashboard className={`w-4 h-4 shrink-0 ${currentRole === 'EMPLOYEE' ? 'text-white' : 'text-slate-500'}`} />
                  <span className="text-xs font-sans">Employee Sandbox</span>
                </button>
              )}
            </div>

            {/* Research & Insights links - available to SA and executive board */}
            {(authRole === 'SUPER_ADMIN' || authRole === 'COMPANY_ADMIN') && (
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-3 font-mono">Research & Insights</div>
                
                <button
                  onClick={handleShowNudgeLab}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-850 transition-all text-left"
                >
                  <BookOpen className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="text-xs">Nudge Theory Labs</span>
                </button>

                <button
                  onClick={handleShowMetricRoadmaps}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-850 transition-all text-left"
                >
                  <Trophy className="w-4 h-4 text-slate-500 shrink-0" />
                  <span className="text-xs">Metric Roadmaps</span>
                </button>
              </div>
            )}

            {/* Simulation Tools Area - strictly hidden from standard admin views, restricted to verified system controller */}
            {(authRole === 'SUPER_ADMIN' || authRole === 'COMPANY_ADMIN') && (
              <div className="space-y-1 pt-1 border-t border-slate-850">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 px-3 font-mono">Sandbox Controls</div>
                
                <button
                  id="trigger-time-lapse"
                  onClick={handleFastForward}
                  className="w-full flex items-center gap-3 px-3 py-2 bg-slate-800/40 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition-all text-left font-mono text-[11px]"
                  title="Fast-forward current clock to tick down nudge expirations, demonstrating lapsed statuses and secondary prompt triggers."
                >
                  <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>FF Timeline (Lapse Pulse)</span>
                </button>

                <button
                  id="trigger-nudge-pulse"
                  onClick={handleTriggerNewNudge}
                  className="w-full flex items-center gap-3 px-3 py-2 bg-slate-800/40 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition-all text-left font-mono text-[11px]"
                >
                  <Layers className={`w-3.5 h-3.5 text-sky-400 shrink-0 transition-transform duration-700 ease-in-out ${
                    isNudgeSpinning ? 'rotate-[360deg] scale-110' : ''
                  }`} />
                  <span>Trigger Random Nudge</span>
                </button>

                <button
                  onClick={() => setIsOnboardingOpen(!isOnboardingOpen)}
                  className={`w-full flex items-center gap-3 px-3 py-2 border rounded-xl transition-all text-left text-xs ${
                    isOnboardingOpen 
                      ? 'bg-rose-950/30 text-rose-300 border-rose-900/50 hover:bg-rose-900/40' 
                      : 'bg-indigo-950/30 text-indigo-300 border-indigo-900/50 hover:bg-indigo-900/40'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>
                    {isOnboardingOpen ? 'Close Entry Sim' : 'Test Onboarding Flow'}
                  </span>
                </button>

                <button
                  id="reset-simulation"
                  onClick={handleReset}
                  className="w-full flex items-center gap-3 px-3 py-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 rounded-xl transition-all text-left text-[11px] font-mono"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset All Databases
                </button>
              </div>
            )}

          </nav>

          {/* Sidebar Footer License Detail */}
          <div className="p-4 mt-auto">
            <div className="bg-slate-805 bg-slate-950 border border-slate-850 rounded-2xl p-4">
              <div className="text-[10px] text-indigo-400 font-mono font-bold mb-1 uppercase tracking-wider">Demo Sandbox Access</div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-[11px] text-slate-300 font-sans">
                  License: {accessMode === 'FULL' ? 'MNC Full Mode' : 'Trial Active'}
                </span>
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              </div>
              <select
                value={accessMode}
                onChange={(e) => handleAccessModeChange(e.target.value as AccessMode)}
                className="w-full bg-slate-900 text-slate-200 border border-slate-800 rounded px-2 py-1 text-[11px] focus:outline-none mb-3 font-sans"
              >
                <option value="TRIAL">Trial Mode (14-day Window)</option>
                <option value="FULL">Full Mode (MNC License)</option>
              </select>
              <button
                onClick={() => setShowGuide(!showGuide)}
                className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold rounded-lg shadow-sm transition-all duration-150"
              >
                {showGuide ? 'Hide Tour Guide' : 'Show Tour Guide'}
              </button>
            </div>
          </div>

        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50">
        
        {/* Header - Sleek Theme Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {(currentRole !== 'EMPLOYEE' || isAuthedAsSuperAdmin) && (
              <button 
                onClick={() => setIsMobileSidebarOpen(true)}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 hover:text-slate-900 md:hidden block focus:outline-none"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            
            <div className="flex items-center gap-2">
              <h2 className="text-sm md:text-base font-semibold text-slate-850 tracking-tight font-display text-slate-900">
                {currentRole === 'EMPLOYEE' 
                  ? `Secure Private Workspace: ${activeEmployeeDetail?.name || 'Authorized Member'}` 
                  : roleMetadata[currentRole].headerTitle
                }
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4 font-sans">
            {pendingCount > 0 && (currentRole !== 'EMPLOYEE' || isAuthedAsSuperAdmin) && (
              <div 
                onClick={() => handleRoleChange('HR_HEAD')}
                className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-amber-800 text-xs font-semibold cursor-pointer hover:bg-amber-100 transition-colors"
                title={`${pendingCount} pending workforce applications awaiting confirmation`}
              >
                <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                {pendingCount} Pending HR Approvals
              </div>
            )}
            <div className="hidden sm:block h-8 w-px bg-slate-200"></div>
            
            {/* User Meta Information & Log Out actions */}
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-800">
                  {currentRole === 'EMPLOYEE' ? activeEmployeeDetail?.name : roleMetadata[currentRole].title}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {currentRole === 'EMPLOYEE' ? `Employee ID: ${activeEmployeeDetail?.employeeId}` : roleMetadata[currentRole].subtitle}
                </div>
              </div>
              <div className="w-10 h-10 bg-indigo-50 text-indigo-700 rounded-full border-2 border-indigo-200 shadow-2xs overflow-hidden flex items-center justify-center font-display font-bold text-xs select-none">
                {currentRole === 'EMPLOYEE' ? activeEmployeeDetail?.name[0] : roleMetadata[currentRole].badge}
              </div>

              {/* High visibility Logout button */}
              <button
                onClick={executeLogout}
                className="p-2 hover:bg-rose-50 text-slate-405 text-slate-550 border border-slate-200 hover:text-rose-600 hover:border-rose-100 rounded-xl transition-all shadow-2xs flex items-center gap-1 font-semibold text-xs cursor-pointer"
                title="Log out of secure session"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                <span className="hidden md:inline text-[11px] font-bold uppercase tracking-tight">Log Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Frame Scroll Container */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto space-y-6">
          
          {/* Ticker Notifications */}
          {tickerMessage && (
            <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs px-4 py-3 rounded-xl font-mono flex items-center gap-2 animate-fade-in shadow-xs">
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
              {tickerMessage}
            </div>
          )}

          {/* Tour Guide banner - hidden if strictly personal employee view */}
          {showGuide && currentRole !== 'EMPLOYEE' && (
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-5 border border-slate-800 shadow-md relative overflow-hidden">
              <div className="absolute right-3 top-3 bg-slate-950/40 p-1 rounded-md">
                <button 
                  onClick={() => setShowGuide(false)}
                  className="text-slate-400 hover:text-white"
                  title="Dismiss guide"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs mb-3 font-mono">
                <Sparkles className="w-4 h-4 animate-pulse text-indigo-400" />
                ACTIVE EVALUATION TOUR GUIDE
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
                <div className="bg-slate-850 bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                  <span className="font-bold text-indigo-400 block mb-1">1. Simulate Onboarding</span>
                  <p className="text-slate-300 leading-relaxed">
                    Head into Super Admin, click <strong>"Test Onboarding Flow"</strong>. See how a custom subdomain link is issued to candidate applicants.
                  </p>
                </div>
                <div className="bg-slate-850 bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                  <span className="font-bold text-emerald-400 block mb-1">2. Clear Applicant Desk</span>
                  <p className="text-slate-300 leading-relaxed">
                    Check the <strong>HR Clearance Desk</strong>. Examine the newly received requests, and click <strong>"Grant Access Token"</strong>.
                  </p>
                </div>
                <div className="bg-slate-850 bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                  <span className="font-bold text-sky-400 block mb-1">3. Recalculate Aggregates</span>
                  <p className="text-slate-300 leading-relaxed">
                    Switch to <strong>Executive Overview</strong>. Inspect automatic transparency math and trigger a randomized check-in nudge!
                  </p>
                </div>
                <div className="bg-slate-850 bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
                  <span className="font-bold text-amber-400 block mb-1">4. Log in as Employee</span>
                  <p className="text-slate-300 leading-relaxed">
                    Log out of the board, select <strong>"Employee Portal Mode"</strong>, and pick John or Elena to transmute stressors & select micro wellness check-ins!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Onboarding Registration View */}
          {isOnboardingOpen && (
            <div className="bg-indigo-50 border border-indigo-150 p-5 rounded-2xl animate-fade-in relative shadow-xs">
              <div className="absolute top-4 right-4 bg-white px-2 py-0.5 border border-indigo-200 rounded text-[9px] font-bold font-mono text-indigo-600">
                ACTIVE SIMULATION FRAME
              </div>
              <h3 className="text-xs font-display font-semibold text-slate-800 flex items-center gap-1.5 mb-4">
                <Users className="w-4 h-4 text-indigo-600" />
                Employee Onboarding Registration Simulation
              </h3>
              <OnboardingFlow 
                departments={departments}
                onSuccess={() => {
                  setIsOnboardingOpen(false);
                  triggerStateRefresh();
                }}
              />
            </div>
          )}

          {/* Dynamic perspective body */}
          <div className="transition-all duration-200">
            {currentRole === 'SUPER_ADMIN' && (
              <SuperAdminDashboard onTriggerTick={triggerStateRefresh} />
            )}

            {currentRole === 'COMPANY_ADMIN' && (
              <CompanyAdminDashboard onTriggerTick={triggerStateRefresh} tick={tick} />
            )}

            {currentRole === 'HR_HEAD' && (
              <HRHeadApprovalDashboard 
                departments={departments} 
                onTriggerTick={triggerStateRefresh} 
              />
            )}

            {currentRole === 'EMPLOYEE' && (
              <EmployeeDashboard 
                onTriggerTick={triggerStateRefresh} 
                isEmployeeOverview={authRole === 'EMPLOYEE'}
                loggedInEmployeeId={loggedInEmployeeId}
                showAllTabsForBoard={authRole === 'COMPANY_ADMIN' || authRole === 'SUPER_ADMIN'}
              />
            )}
          </div>
        </div>

        {/* Bottom Action Bar / Footer */}
        <footer className="h-12 bg-slate-150 border-t border-slate-205 border-t-slate-200 px-4 md:px-8 flex items-center justify-between shrink-0 text-[10px] sm:text-xs">
          <div className="flex items-center gap-6 text-[10px] font-semibold text-slate-500">
            <span className="flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Secure Session Active
            </span>
            <span className="hidden sm:inline font-sans">Corporate Certification: Fully Compliant with Nudge Theory Expiry Rules</span>
          </div>
          <div className="flex items-center gap-4 text-[10px]">
            <span className="text-slate-450 hidden sm:inline">Insider Privacy Mode: ENFORCED</span>
            <button 
              onClick={() => {
                alert("Academic MNC well-being index details exported! Overall aggregate happiness rate stands at 59% based on weighted pulse formulas.");
              }}
              className="px-3 py-1 bg-white border border-slate-300 rounded shadow-2xs hover:bg-slate-50 font-bold"
            >
              Export Detailed Research Metrics
            </button>
          </div>
        </footer>
      </div>

    </div>
  );
}
