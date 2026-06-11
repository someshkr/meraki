/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, User, Users, RefreshCw, Layers, ArrowRight, HelpCircle, Flame, CheckCircle, Clock } from 'lucide-react';
import { UserRole, AccessMode } from '../types';
import { MockDatabase } from '../data/mockDatabase';

interface RoleSwitcherProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  accessMode: AccessMode;
  onAccessModeChange: (mode: AccessMode) => void;
  selectedDeptId: string;
  onSelectDeptId: (id: string) => void;
  onTriggerTick: () => void;
}

export default function RoleSwitcher({
  currentRole,
  onRoleChange,
  accessMode,
  onAccessModeChange,
  onTriggerTick
}: RoleSwitcherProps) {
  const [showGuide, setShowGuide] = useState(true);
  const [tickerMessage, setTickerMessage] = useState<string | null>(null);

  const handleFastForward = () => {
    // Fast forward timeline to lapse pending active nudges and trigger secondary ones
    const activeNudges = MockDatabase.getNudges();
    const now = Date.now();
    
    // Set pending nudges to be expired
    const updated = activeNudges.map(nudge => {
      if (nudge.status === 'PENDING') {
        return {
          ...nudge,
          expiresAt: now - 1000 // force expire
        };
      }
      return nudge;
    });
    
    MockDatabase.saveNudges(updated);
    const result = MockDatabase.tickNudgesAndCheckLapses();
    onTriggerTick();

    if (result.statusChanged) {
      setTickerMessage(result.message || 'Timeline fast-forwarded! Some first-attempt nudges lapsed and triggered secondary follow-up surveys.');
    } else {
      setTickerMessage('All active pulses updated. Check dashboards for lapsed/pending states.');
    }

    setTimeout(() => setTickerMessage(null), 6000);
  };

  const handleTriggerNewNudge = () => {
    const employees = MockDatabase.getEmployees().filter(e => e.role === 'EMPLOYEE');
    if (employees.length > 0) {
      // Trigger new random nudge for all employees
      employees.forEach(emp => {
        MockDatabase.triggerNewRandomNudge(emp.id);
      });
      onTriggerTick();
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
    }
  };

  return (
    <div id="demo-controls-wrapper" className="bg-slate-900 text-white border-b border-slate-800 shadow-xl relative z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Brand & Demo Banner */}
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500 text-slate-950 p-1.5 rounded-lg flex items-center justify-center font-display font-bold text-xs tracking-wider">
              <Sparkles className="w-4 h-4 animate-pulse mr-1" />
              DEMO MODE
            </div>
            <div>
              <h1 className="font-display font-bold text-base tracking-tight flex items-center gap-1.5 text-indigo-400">
                Meraki
              </h1>
              <p className="text-[11px] text-slate-300 font-medium italic">
                Feels like miracle!
              </p>
            </div>
          </div>

          {/* Interactive Role Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-400 font-mono mr-1">Switch Perspective:</span>
            
            <button
              id="switch-super-admin"
              onClick={() => onRoleChange('SUPER_ADMIN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                currentRole === 'SUPER_ADMIN'
                  ? 'bg-cyan-500 text-slate-950 shadow-md transform scale-102 font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Super Admin
            </button>

            <button
              id="switch-company-admin"
              onClick={() => onRoleChange('COMPANY_ADMIN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                currentRole === 'COMPANY_ADMIN'
                  ? 'bg-amber-500 text-slate-950 shadow-md transform scale-102 font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Company Admin
            </button>

            <button
              id="switch-hr-head"
              onClick={() => onRoleChange('HR_HEAD')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                currentRole === 'HR_HEAD'
                  ? 'bg-emerald-500 text-slate-950 shadow-md transform scale-102 font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-emerald-950" />
              HR Head Approval
            </button>

            <button
              id="switch-employee"
              onClick={() => onRoleChange('EMPLOYEE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                currentRole === 'EMPLOYEE'
                  ? 'bg-indigo-500 text-white shadow-md transform scale-102 font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Employee Dashboard
            </button>
          </div>

          {/* Quick Sandbox Action Triggers */}
          <div className="flex items-center gap-2">
            <button
              id="trigger-time-lapse"
              onClick={handleFastForward}
              title="Fast-forward current clock to tick down nudge expirations, demonstrating lapsed statuses and secondary prompt triggers."
              className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-[11px] text-slate-200 hover:text-white hover:bg-slate-700 flex items-center gap-1 transition-all"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              FF Timeline (Lapse & Trigger Nudge 2/2)
            </button>

            <button
              id="trigger-nudge-pulse"
              onClick={handleTriggerNewNudge}
              title="Dispatches a fresh randomized daily pulse question checking work-likeability or flow to all employees."
              className="px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-[11px] text-slate-200 hover:text-white hover:bg-slate-700 flex items-center gap-1 transition-all"
            >
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Trigger Random Nudge
            </button>

            <button
              id="reset-simulation"
              onClick={handleReset}
              className="p-1.5 bg-red-950/40 text-red-400 border border-red-900/50 rounded-lg text-xs hover:bg-red-900/60 transition-all"
              title="Reset Simulated Database State"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dynamic Sandbox Status Notification */}
        {tickerMessage && (
          <div className="mt-2 text-center text-xs text-cyan-300 bg-cyan-950/60 border border-cyan-900 px-3 py-1 rounded animate-fade-in font-mono flex items-center justify-center gap-2">
            <Flame className="w-3.5 h-3.5 animate-bounce" />
            {tickerMessage}
          </div>
        )}

        {/* Presentation Guides Toggle */}
        <div className="mt-2 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-cyan-500" />
            <span>Active License: <strong>Acme Corp</strong></span>
            <span className="mx-2 text-slate-600">|</span>
            <span>Plan Access Level:</span>
            <select
              value={accessMode}
              onChange={(e) => onAccessModeChange(e.target.value as AccessMode)}
              className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] focus:outline-none"
            >
              <option value="TRIAL">Trial Mode (14-day Window)</option>
              <option value="FULL">Full Mode (MNC License Locked)</option>
            </select>
          </div>

          <button 
            onClick={() => setShowGuide(!showGuide)} 
            className="text-slate-300 hover:text-white flex items-center gap-1 underline decoration-dotted capitalize"
          >
            <HelpCircle className="w-3 h-3 text-slate-400" />
            {showGuide ? 'Hide Evaluation Tour Guide' : 'Show Evaluation Tour Guide'}
          </button>
        </div>

        {/* Detailed Guided Tour Panels */}
        {showGuide && (
          <div className="mt-3 bg-slate-950/75 border border-slate-800 p-3 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-3 text-xs leading-relaxed">
            <div className="border-r border-slate-800/80 pr-2">
              <span className="font-bold text-cyan-400 block mb-1">1. Try Onboarding Flow</span>
              <p className="text-slate-400">
                Go to the Login Page or Employee dashboard. Click "Register Company Link". Fill the request to see the custom domain generation.
              </p>
            </div>
            <div className="border-r border-slate-800/80 pr-2">
              <span className="font-bold text-emerald-400 block mb-1">2. Approve the Request</span>
              <p className="text-slate-400">
                Switch to <strong>HR Head Approval</strong>. You will see the registration request. Click Approve. They will be added to Acme Corp.
              </p>
            </div>
            <div className="border-r border-slate-800/80 pr-2">
              <span className="font-bold text-indigo-400 block mb-1">3. Respond to Nudges</span>
              <p className="text-slate-400">
                Switch to <strong>Employee Dashboard</strong>. Act as Sarah or John, answer micro-pulse questions themed around intrinsic flow or support.
              </p>
            </div>
            <div>
              <span className="font-bold text-amber-400 block mb-1">4. Spot the Transparent Math</span>
              <p className="text-slate-400">
                Switch to <strong>Company Admin</strong>. Examine the formula widget showing exact response scores. See department-level sentiment indicators.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
