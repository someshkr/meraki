/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, Sparkles, Plus, Calendar, Landmark, CheckCircle, Clock, Zap, Map, FileCode, Users, Send, Layers } from 'lucide-react';
import { TrialInvite, RoadmapGoal, AccessMode } from '../types';
import { MockDatabase } from '../data/mockDatabase';

interface SuperAdminDashboardProps {
  onTriggerTick: () => void;
}

export default function SuperAdminDashboard({ onTriggerTick }: SuperAdminDashboardProps) {
  const [invites, setInvites] = useState<TrialInvite[]>(() => MockDatabase.getTrialInvites());
  const [goals, setGoals] = useState<RoadmapGoal[]>(() => MockDatabase.getRoadmap());
  
  // Invite state
  const [clientEmail, setClientEmail] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [inviteMode, setInviteMode] = useState<AccessMode>('TRIAL');
  const [alert, setAlert] = useState<string | null>(null);

  // New Goal State
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDesc, setGoalDesc] = useState('');
  const [goalTimeline, setGoalTimeline] = useState<'SHORT' | 'MEDIUM' | 'LONG'>('SHORT');

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientEmail || !clientCompany) {
      setAlert('Please specify email and organization name.');
      return;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = `${inviteMode === 'TRIAL' ? 'DEMO' : 'FULL'}-${randomSuffix}`;
    const now = new Date();
    const expiry = new Date();
    if (inviteMode === 'TRIAL') {
      expiry.setDate(now.getDate() + 14); // 14 days
    } else {
      expiry.setMonth(now.getMonth() + 3); // 90 days
    }

    const newInvite: TrialInvite = {
      id: `inv-${Math.random().toString(36).substr(2, 9)}`,
      email: clientEmail,
      companyName: clientCompany,
      invitedBy: 'Super Admin Default',
      mode: inviteMode,
      code,
      createdAt: now.toISOString(),
      expiresAt: expiry.toISOString()
    };

    const updated = [newInvite, ...invites];
    setInvites(updated);
    MockDatabase.saveTrialInvites(updated);
    onTriggerTick();

    setClientEmail('');
    setClientCompany('');
    setAlert(`Evaluation invite created with secure verification key ${code}!`);
    setTimeout(() => setAlert(null), 5000);
  };

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle || !goalDesc) return;

    const newGoal: RoadmapGoal = {
      id: `rm-${Math.random().toString(36).substr(2, 9)}`,
      timeline: goalTimeline,
      title: goalTitle,
      description: goalDesc,
      status: 'PLANNED'
    };

    const updated = [...goals, newGoal];
    setGoals(updated);
    MockDatabase.saveRoadmap(updated);
    onTriggerTick();

    setGoalTitle('');
    setGoalDesc('');
    setAlert(`Added goal to Product Roadmap: "${goalTitle}"`);
    setTimeout(() => setAlert(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Upper stats widgets / Welcome banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-lg border border-slate-800">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-gradient-to-tr from-cyan-500/20 to-indigo-500/10 rounded-full blur-2xl" />
        <div className="flex items-center gap-3">
          <div className="bg-cyan-500/10 border border-cyan-500/30 p-2.5 rounded-xl text-cyan-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg tracking-tight">Super Admin Hub</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Service Provider Environment • Strict Multi-Tenant Isolation Enforced
            </p>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-slate-800 pt-6">
          <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
            <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-wider">Active Client Orgs</span>
            <span className="block font-display font-semibold text-xl text-slate-100">8 MNC Tenants</span>
          </div>
          <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
            <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-wider">Global User Volume</span>
            <span className="block font-display font-semibold text-xl text-slate-100">14,204 Employees</span>
          </div>
          <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
            <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-wider">Demo / Trial Keys</span>
            <span className="block font-display font-semibold text-xl text-slate-100">{invites.filter(i => i.mode === 'TRIAL').length} Pending</span>
          </div>
          <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800">
            <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-wider">Database Isolation Integrity</span>
            <span className="block font-display font-bold text-xs text-emerald-400 mt-1 uppercase flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> SECURE (100%)
            </span>
          </div>
        </div>
      </div>

      {alert && (
        <div className="bg-cyan-50 border border-cyan-100 text-cyan-900 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-sm">
          <Sparkles className="w-4 h-4 text-cyan-500 animate-spin" />
          {alert}
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Invite Generator Panel */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <div>
            <h3 className="font-display font-semibold text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-cyan-500" />
              Demo Invite & License Setup
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Provision instant sandboxed evaluation spaces for foreign MNC stakeholders.
            </p>
          </div>

          <form onSubmit={handleSendInvite} className="space-y-3 pt-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1">
                Client Target Email ID
              </label>
              <input
                type="email"
                required
                placeholder="hr.manager@company.com"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1">
                Prospect Company Name
              </label>
              <input
                type="text"
                required
                placeholder="Spacex Innovations"
                value={clientCompany}
                onChange={(e) => setClientCompany(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1">
                Evaluation License Level
              </label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setInviteMode('TRIAL')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    inviteMode === 'TRIAL'
                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Trial (14 Days)
                </button>
                <button
                  type="button"
                  onClick={() => setInviteMode('FULL')}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    inviteMode === 'FULL'
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Full Mode Access
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-3 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <Send className="w-3.5 h-3.5 text-cyan-400" />
              Issue License Key
            </button>
          </form>

          {/* Secure segregation compliance note */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] text-slate-500 leading-relaxed space-y-1">
            <span className="font-bold text-slate-700 tracking-wider font-mono block uppercase">
              🔐 Isolation Architecture Compliance
            </span>
            <p>
              Data structures are compartmentalized using modern multi-tenant logical routing. Sub-tenants possess separated indices, guaranteeing zero leaks between rival corporations.
            </p>
          </div>
        </div>

        {/* Invited License logs */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
          <div>
            <h3 className="font-display font-semibold text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-cyan-500" />
              Active Evaluation License Ledger
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Review prospect registrations and activation status codes.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-450 uppercase font-mono text-[10px] tracking-wider pb-2">
                  <th className="py-2.5">Corporation</th>
                  <th>Designated Email</th>
                  <th>Key / Licence Code</th>
                  <th>Type</th>
                  <th>Validity Period</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {invites.map((invite) => (
                  <tr key={invite.id} className="hover:bg-slate-50/50">
                    <td className="py-2.5 font-medium text-slate-900">{invite.companyName}</td>
                    <td className="text-slate-500 font-mono text-[11px]">{invite.email}</td>
                    <td>
                      <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-bold border border-slate-200">
                        {invite.code}
                      </span>
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        invite.mode === 'TRIAL'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {invite.mode}
                      </span>
                    </td>
                    <td className="text-slate-400 font-mono text-[10px]">
                      {new Date(invite.expiresAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Product Roadmap Management */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-semibold text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
              <Map className="w-4 h-4 text-cyan-500" />
              Interactive Strategic Product Roadmap
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Set clear objectives for Short-Term, Medium-Term, and Long-Term wellbeing technology milestones.
            </p>
          </div>

          <form onSubmit={handleAddGoal} className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              required
              placeholder="e.g. Cognitive Fatigue Alert"
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-cyan-500"
            />
            <input
              type="text"
              required
              placeholder="Description..."
              value={goalDesc}
              onChange={(e) => setGoalDesc(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-cyan-500 w-48"
            />
            <select
              value={goalTimeline}
              onChange={(e) => setGoalTimeline(e.target.value as any)}
              className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-cyan-500"
            >
              <option value="SHORT">Short-Term (1-3 Mo)</option>
              <option value="MEDIUM">Medium-Term (3-6 Mo)</option>
              <option value="LONG">Long-Term (6-12 Mo)</option>
            </select>
            <button
              type="submit"
              className="py-1.5 px-3 bg-cyan-600 text-white rounded-lg text-xs font-semibold hover:bg-cyan-700 transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Goal
            </button>
          </form>
        </div>

        {/* Dynamic Roadmap Timeline Lanes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Lane 1: SHORT TERM */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <span className="font-display font-semibold text-xs text-slate-900 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Short-Term Goals
              </span>
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded font-mono">
                1-3 Months
              </span>
            </div>
            <div className="space-y-3">
              {goals.filter(g => g.timeline === 'SHORT').map(goal => (
                <div key={goal.id} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm space-y-2">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-semibold text-xs text-slate-800 tracking-tight leading-tight">{goal.title}</h4>
                    <span className="text-[9px] bg-slate-150 text-slate-500 px-1 py-0.2 rounded font-mono font-bold shrink-0">
                      {goal.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">{goal.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Lane 2: MEDIUM TERM */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <span className="font-display font-semibold text-xs text-slate-900 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-cyan-500" />
                Medium-Term Goals
              </span>
              <span className="text-[10px] bg-cyan-100 text-cyan-800 font-bold px-1.5 py-0.5 rounded font-mono">
                3-6 Months
              </span>
            </div>
            <div className="space-y-3">
              {goals.filter(g => g.timeline === 'MEDIUM').map(goal => (
                <div key={goal.id} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm space-y-2 font-sans">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-semibold text-xs text-slate-800 tracking-tight leading-tight">{goal.title}</h4>
                    <span className="text-[9px] bg-blue-50 text-blue-600 px-1 py-0.2 rounded font-mono font-bold shrink-0">
                      {goal.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">{goal.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Lane 3: LONG TERM */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-4 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <span className="font-display font-semibold text-xs text-slate-900 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-500" />
                Long-Term Vision
              </span>
              <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded font-mono">
                6-12 Months
              </span>
            </div>
            <div className="space-y-3">
              {goals.filter(g => g.timeline === 'LONG').map(goal => (
                <div key={goal.id} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm space-y-2">
                  <div className="flex items-start justify-between gap-1 font-sans">
                    <h4 className="font-semibold text-xs text-slate-800 tracking-tight leading-tight">{goal.title}</h4>
                    <span className="text-[9px] bg-slate-100 text-slate-400 px-1 py-0.2 rounded font-mono font-bold shrink-0">
                      {goal.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-normal">{goal.description}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
