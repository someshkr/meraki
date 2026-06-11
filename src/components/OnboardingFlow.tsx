/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Mail, Briefcase, Key, Link as LinkIcon, CheckCircle2, ShieldAlert, Sparkles, UserPlus, HelpCircle } from 'lucide-react';
import { MockDatabase } from '../data/mockDatabase';
import { Department } from '../types';

interface OnboardingFlowProps {
  onSuccess: () => void;
  departments: Department[];
}

export default function OnboardingFlow({ onSuccess, departments }: OnboardingFlowProps) {
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [selectedDept, setSelectedDept] = useState(departments[0]?.id || '');
  const [password, setPassword] = useState('');
  
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Email & Co -> 2: Link Received -> 3: Custom Password & Submission
  const [customLink, setCustomLink] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showHelper, setShowHelper] = useState(true);

  const handleGenerateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !companyName) {
      setErrorMsg('Please specify both your corporate Email ID and Company Name.');
      return;
    }
    if (!email.includes('@')) {
      setErrorMsg('Please provide a valid corporate email format (e.g., ray.park@company.com).');
      return;
    }

    setErrorMsg('');
    const formattedCo = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const generated = `https://wellbeingmap.app/portal/${formattedCo}/register?email=${encodeURIComponent(email)}`;
    setCustomLink(generated);
    setStep(2);
  };

  const handleSubmitOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !password || !employeeId) {
      setErrorMsg('Full Name, Employee ID/Reference, and a secure password are required.');
      return;
    }

    setErrorMsg('');
    // Save to simulated database
    MockDatabase.addRegistrationRequest({
      email,
      name: fullName,
      employeeId,
      companyName,
      departmentId: selectedDept
    });

    setStep(3);
  };

  return (
    <div className="max-w-md mx-auto my-8 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden transform transition-all duration-300">
      
      {/* Dynamic Header */}
      <div className="bg-slate-900 px-6 py-6 text-white relative">
        <div className="absolute top-4 right-4 text-cyan-400">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <h2 className="font-display font-semibold text-lg tracking-tight">Onboarding Portal</h2>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Nudge-Theory Compliant Employee Journey Setup
        </p>

        {/* Step dots */}
        <div className="flex gap-2 mt-4">
          <div className={`h-1 flex-1 rounded ${step >= 1 ? 'bg-cyan-400' : 'bg-slate-700'}`} />
          <div className={`h-1 flex-1 rounded ${step >= 2 ? 'bg-cyan-400' : 'bg-slate-700'}`} />
          <div className={`h-1 flex-1 rounded ${step >= 3 ? 'bg-cyan-400' : 'bg-slate-700'}`} />
        </div>
      </div>

      <div className="p-6">
        {errorMsg && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-2.5 rounded-lg text-xs font-medium flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* STEP 1: Generate customized link */}
        {step === 1 && (
          <form onSubmit={handleGenerateLink} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 font-mono">
                Corporate Email ID
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="ray.park@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500 font-sans"
                />
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">We will lock this Email ID as your core identifier.</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 font-mono">
                Company Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Acme Corp"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full text-sm pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                />
                <Briefcase className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5"
            >
              <LinkIcon className="w-4 h-4 text-cyan-400" />
              Generate Customized Link
            </button>
          </form>
        )}

        {/* STEP 2: Custom link received & setup account */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="p-3 bg-cyan-50 border border-cyan-100 rounded-lg">
              <span className="block text-[11px] font-bold text-cyan-800 font-mono uppercase tracking-widest mb-1">
                Your Customized Secure Domain Link:
              </span>
              <div className="flex bg-white border border-slate-200 rounded px-2 py-1.5 items-center justify-between">
                <span className="text-[11px] font-mono text-slate-600 overflow-hidden text-ellipsis whitespace-nowrap max-w-[260px]">
                  {customLink}
                </span>
                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold">
                  AUTOGEN
                </span>
              </div>
              <p className="text-[11px] text-cyan-700 mt-2">
                This secure invitation link is tailored specifically to anchor your activity metrics under <strong>{companyName}</strong>.
              </p>
            </div>

            <form onSubmit={handleSubmitOnboarding} className="space-y-3.5 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-widest font-mono mb-1">
                  Full Employee Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ray Park"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-widest font-mono mb-1">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ACM-3082"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    className="w-full text-sm px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-widest font-mono mb-1">
                    Department
                  </label>
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full text-sm px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                  >
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-widest font-mono mb-1">
                  Create Passphrase
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-sm pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500 font-mono text-xs"
                  />
                  <Key className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-3 py-3 bg-cyan-600 text-white rounded-lg text-xs font-semibold hover:bg-cyan-700 transition-all flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-4 h-4 text-cyan-100" />
                Submit Registration to HR
              </button>
            </form>
          </div>
        )}

        {/* STEP 3: Approval Pending Message */}
        {step === 3 && (
          <div className="text-center py-6 space-y-4 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="font-display font-medium text-slate-900 text-base">
                Onboarding Initiated successfully!
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Your credentials are encrypted. Under strict data protocols, your request is dispatched for HR clearance.
              </p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-xs text-left">
              <strong className="block text-[11px] uppercase font-mono tracking-wider mb-0.5 text-amber-900">
                🚀 Step-by-Step Testing Tip:
              </strong>
              Switch your dashboard view to <strong>"HR Head Approval"</strong> at the top to clear/approve this request manually, instantly placing this employee into the company's live active registry!
            </div>

            <button
              onClick={() => {
                setStep(1);
                setEmail('');
                setFullName('');
                setEmployeeId('');
                setPassword('');
                onSuccess();
              }}
              className="py-2.5 px-6 border border-slate-200 text-slate-700 font-medium text-xs rounded-lg hover:bg-slate-50 transition-all"
            >
              Return / Reset Entry Screen
            </button>
          </div>
        )}

        {/* Informative Helper on Nudge-Theory onboarding */}
        {showHelper && step !== 3 && (
          <div className="mt-6 border-t border-slate-100 pt-4">
            <div className="bg-slate-50 p-3 rounded-lg flex gap-2.5">
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[11px] text-slate-700 uppercase tracking-wider block font-mono">
                  MNC Human Onboarding Experience
                </span>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  We integrate Nudge Theory directly during login. By using the employee’s secure customized domain link, team members develop immediate familiarity with checking pulse reminders, minimizing compliance friction.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
