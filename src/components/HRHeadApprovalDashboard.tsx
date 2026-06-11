/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, UserCheck, UserX, Clock, Calendar, Sparkles, Building, Briefcase, Users } from 'lucide-react';
import { RegistrationRequest, Department } from '../types';
import { MockDatabase } from '../data/mockDatabase';
import EmployeeDashboard from './EmployeeDashboard';

interface HRHeadApprovalDashboardProps {
  onTriggerTick: () => void;
  departments: Department[];
}

export default function HRHeadApprovalDashboard({ onTriggerTick, departments }: HRHeadApprovalDashboardProps) {
  const [requests, setRequests] = useState<RegistrationRequest[]>(() => MockDatabase.getRegistrationRequests());
  const [toast, setToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'REQUESTS' | 'EMPLOYEE_VIEW'>('REQUESTS');

  const syncList = () => {
    setRequests(MockDatabase.getRegistrationRequests());
  };

  const handleApprove = (id: string, name: string) => {
    MockDatabase.approveRegistration(id);
    syncList();
    onTriggerTick();
    setToast(`Employee "${name}" has been cleared and authorized! Credentials decrypted into the active staff ledger.`);
    setTimeout(() => setToast(null), 5000);
  };

  const handleReject = (id: string, name: string) => {
    MockDatabase.rejectRegistration(id);
    syncList();
    onTriggerTick();
    setToast(`Employee registration request for "${name}" was rejected.`);
    setTimeout(() => setToast(null), 4000);
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Upper header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 relative overflow-hidden shadow-lg border border-slate-800">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 rounded-full blur-2xl" />
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg tracking-tight">HR Head Clearance Center</h2>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Strict Encryption Gate • Employee Verification & Access Control Protocols
            </p>
          </div>
        </div>
      </div>

      {toast && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-950 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-xs">
          <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
          {toast}
        </div>
      )}

      {/* Clearance Dashboard Tabs */}
      <div className="flex border-b border-slate-100 gap-6 my-2">
        <button
          onClick={() => setActiveTab('REQUESTS')}
          className={`pb-2.5 text-xs font-bold font-mono uppercase tracking-wider relative transition-all ${
            activeTab === 'REQUESTS' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-650'
          }`}
        >
          🔑 Verification Clearances ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('EMPLOYEE_VIEW')}
          className={`pb-2.5 text-xs font-bold font-mono uppercase tracking-wider relative transition-all ${
            activeTab === 'EMPLOYEE_VIEW' ? 'text-emerald-600 border-b-2 border-emerald-500' : 'text-slate-400 hover:text-slate-650'
          }`}
        >
          👥 Simulated Employee Dashboard
        </button>
      </div>

      {activeTab === 'REQUESTS' && (
        /* Requests Ledger card */
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div>
          <h3 className="font-display font-semibold text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
            <Clock className="w-4.5 h-4.5 text-emerald-500" />
            Pending Onboarding Authorization Requests ({pendingRequests.length})
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Verify newly submitted employee applications. Approved staff gains immediate access to check-ins and notification timers.
          </p>
        </div>

        {pendingRequests.length === 0 ? (
          <div className="border border-slate-150 rounded-2xl p-8 text-center space-y-3 bg-slate-50/50">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto text-emerald-500">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-xs text-slate-700">Clearance Queue Empty!</h4>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              All registration applications resolved. If testing, switch to **Onboarding Flow** on the main login widget, submit a fresh request, and return here to approve!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req) => {
              const deptName = departments.find(d => d.id === req.departmentId)?.name || 'General Operations';
              return (
                <div key={req.id} className="border border-slate-205 border-slate-100 bg-white hover:border-emerald-100 hover:shadow-xs rounded-2xl p-4 space-y-4 transition-all flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-0.5">
                        <span className="block text-[9px] text-slate-400 font-mono tracking-wider font-bold uppercase">Candidate Application</span>
                        <h4 className="font-semibold text-sm text-slate-900 tracking-tight">{req.name}</h4>
                      </div>
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                        {req.employeeId}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      Tenant Company: <strong>{req.companyName}</strong>
                    </p>

                    <p className="text-[11px] text-slate-500 flex items-center gap-1">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      Target Department: <strong>{deptName}</strong>
                    </p>

                    <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 font-mono" />
                      Requested timestamp: {new Date(req.requestedAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                    <button
                      onClick={() => handleReject(req.id, req.name)}
                      className="py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-300 text-slate-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                    >
                      <UserX className="w-4 h-4 text-rose-500" /> Decline
                    </button>
                    
                    <button
                      onClick={() => handleApprove(req.id, req.name)}
                      className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all shadow-sm"
                    >
                      <UserCheck className="w-4 h-4 text-emerald-100" /> Grant Access
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}

      {activeTab === 'EMPLOYEE_VIEW' && (
        <div className="space-y-6 animate-fade-in text-xs">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-xs space-y-1.5 text-emerald-950 leading-relaxed shadow-xs">
            <h4 className="font-bold flex items-center gap-1.5 font-mono">
              🛡️ HR COMPLIANCE PREVIEW: Live Employee Dashboard
            </h4>
            <p>
              HR evaluation desk overview. As authorized under compliance logging standards, you are viewing the <strong>Employee Dashboard entirely</strong>. Toggle candidate views below to verify pulse, test transmuters, or view transparency response logs.
            </p>
          </div>
          <EmployeeDashboard onTriggerTick={onTriggerTick} showAllTabsForBoard={true} />
        </div>
      )}

    </div>
  );
}
