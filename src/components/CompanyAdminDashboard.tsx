/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Building2, Users, LayoutDashboard, Plus, Send, RefreshCw, BarChart3, HelpCircle, 
  MapPin, Clipboard, CheckCircle2, AlertTriangle, ArrowRight, UserPlus, FileText, Sparkles, Code,
  Gift, Trophy, Award as MedalIcon, Download
} from 'lucide-react';
import { MockDatabase } from '../data/mockDatabase';
import { Department, Employee, RegistrationRequest, Award } from '../types';
import EmployeeDashboard from './EmployeeDashboard';

interface CompanyAdminDashboardProps {
  onTriggerTick: () => void;
  tick?: number;
}

export default function CompanyAdminDashboard({ onTriggerTick, tick }: CompanyAdminDashboardProps) {
  // Read state from mockup database
  const [departments, setDepartments] = useState<Department[]>(() => MockDatabase.getDepartments());
  const [employees, setEmployees] = useState<Employee[]>(() => MockDatabase.getEmployees());
  
  // Dashboard Tabs
  const [activeTab, setActiveTab] = useState<'INSIGHTS' | 'SETUP' | 'JOURNEY' | 'AWARDS' | 'EMPLOYEE_PORTAL'>('INSIGHTS');

  const [awards, setAwards] = useState<Award[]>(() => MockDatabase.getAwards());
  
  // Award Form State
  const [awardEmpId, setAwardEmpId] = useState(() => {
    const approved = MockDatabase.getEmployees().filter(e => e.status === 'APPROVED');
    return approved[0]?.id || '';
  });
  const [awardType, setAwardType] = useState<Award['type']>('maestro');
  const [awardTitle, setAwardTitle] = useState('Flow Maestro Medal');
  const [awardMessage, setAwardMessage] = useState('');
  const [awardValue, setAwardValue] = useState('');

  // Nudge Dispatch Form State
  const [nudgeEmpId, setNudgeEmpId] = useState(() => {
    const approved = MockDatabase.getEmployees().filter(e => e.status === 'APPROVED');
    return approved[0]?.id || '';
  });

  // Form states - Add department
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptManager, setNewDeptManager] = useState('');

  // Form states - Add employee
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpId, setNewEmpId] = useState('');
  const [newEmpDept, setNewEmpDept] = useState(departments[0]?.id || '');

  // Journey steps array
  const [journeySteps, setJourneySteps] = useState([
    { step: 1, title: 'Frictionless Entry', desc: 'Secure custom workspace link activated and initial supportive training review dispatched.' },
    { step: 2, title: 'Primary Cognitive Check', desc: 'Baseline Work Likeability pulse triggered to capture task alignment and highlight redundant bottlenecks.' },
    { step: 3, title: 'Intrinsic Flow Capture', desc: 'Evaluation of focus levels and clock checking patterns to discover peak engagement zones.' },
    { step: 4, title: 'Micro-Feedback Assessment', desc: 'Direct employee-to-employee gratitude circle unlocked with zero management logging.' },
    { step: 5, title: 'Comprehensive Wellness Unlock', desc: 'Full Mode activated. Dynamic weekly tracking frameworks integrated into routine habits.' }
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  // Recalculate metrics on tick
  const triggerRecalculate = (showToast = false) => {
    MockDatabase.recalculateDepartmentSummaries();
    setDepartments(MockDatabase.getDepartments());
    setEmployees(MockDatabase.getEmployees());
    onTriggerTick();
    if (showToast) {
      setNotification('Recalculation complete! All department-level wellness metrics and employee response logs have been synchronized.');
      setTimeout(() => setNotification(null), 4500);
    }
  };

  // Bulk Export for metrics report
  const handleBulkExport = () => {
    // Generate CSV data from current departments
    const headers = [
      'Department ID',
      'Department Name',
      'Manager',
      'Headcount',
      'Sentiment Rating',
      'Wellness Index (%)',
      'Supportive Experience (%)',
      'Work Likeability (%)',
      'Intrinsic Flow (%)',
      'Response Rate (%)'
    ];

    const rows = departments.map(d => [
      d.id,
      `"${d.name.replace(/"/g, '""')}"`,
      `"${d.manager.replace(/"/g, '""')}"`,
      d.headcount,
      d.sentiment.toUpperCase(),
      d.happinessRating,
      d.supportiveExperience,
      d.workLikeability,
      d.intrinsicFlow,
      d.responseRate
    ]);

    // Overall metrics summary in report footer
    const currentMath = MockDatabase.getCalculationExplanationForAcme();
    const summaryHeaders = ['', ''];
    const summaryRows = [
      ['OVERALL ORGANIZATION METRICS SUMMARY', ''],
      ['Overall Organization Wellbeing Happiness Index (%)', `${currentMath.happinessPercentage}%`],
      ['Total Pulse Reminders Sent', currentMath.totalSent],
      ['Total Pulse Responses Answers Received', currentMath.totalResponses],
      ['Overall Pulse Response Weight Rate (%)', `${currentMath.responseRate}%`],
      ['Missed/Lapsed surveys Count', currentMath.lapsedCount],
      ['Active Running Nudges in App', currentMath.pendingCount]
    ];

    const csvContent = [
      'ACME CORPORATION - EXECUTIVE WELLNESS & DEPARTMENT HEALTH METRICS REPORT',
      `Timestamp: ${new Date().toISOString()}`,
      `Generated by: Board Executive / Administrative Controller`,
      '',
      headers.join(','),
      ...rows.map(r => r.join(',')),
      '',
      ...summaryRows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `acme_department_health_metrics_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show custom toast notification
    setNotification('Telemetry metrics exported successfully! Verified CSV formatted download dispatched.');
    setTimeout(() => setNotification(null), 5000);
  };

  useEffect(() => {
    MockDatabase.recalculateDepartmentSummaries();
    setDepartments(MockDatabase.getDepartments());
    setEmployees(MockDatabase.getEmployees());
    setAwards(MockDatabase.getAwards());
  }, [tick]);

  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName || !newDeptManager) return;

    const currentDepts = MockDatabase.getDepartments();
    const newId = `dept-${newDeptName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    
    // Check duplication
    if (currentDepts.some(d => d.id === newId)) {
      setNotification('Department identifier already exists!');
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const created: Department = {
      id: newId,
      name: newDeptName,
      manager: newDeptManager,
      sentiment: 'neutral',
      happinessRating: 50,
      responseRate: 100,
      supportiveExperience: 50,
      workLikeability: 50,
      intrinsicFlow: 50,
      headcount: 0
    };

    const updated = [...currentDepts, created];
    MockDatabase.saveDepartments(updated);
    setDepartments(updated);
    
    // Auto sync selection
    if (!newEmpDept) setNewEmpDept(newId);
    
    setNewDeptName('');
    setNewDeptManager('');
    setNotification(`Successfully created new department: ${newDeptName}`);
    setTimeout(() => setNotification(null), 4000);
    triggerRecalculate();
  };

  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpName || !newEmpEmail || !newEmpId || !newEmpDept) {
      setNotification('Please fill in all mandatory employee fields.');
      setTimeout(() => setNotification(null), 3500);
      return;
    }

    MockDatabase.addNewEmployeeDirectly(newEmpName, newEmpEmail, newEmpId, newEmpDept);
    setEmployees(MockDatabase.getEmployees());
    setDepartments(MockDatabase.getDepartments());
    
    setNewEmpName('');
    setNewEmpEmail('');
    setNewEmpId('');
    setNotification(`Directly enrolled ${newEmpName} with Employee ID ${newEmpId}.`);
    setTimeout(() => setNotification(null), 4000);
    triggerRecalculate();
  };

  const handleGiveAward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!awardEmpId || !awardTitle || !awardMessage) {
      setNotification('Please select an employee and fill out award title and message.');
      setTimeout(() => setNotification(null), 3500);
      return;
    }

    const employee = employees.find(emp => emp.id === awardEmpId);
    if (!employee) return;

    MockDatabase.giveAward(
      awardEmpId,
      'Executive Board Admin',
      awardType,
      awardTitle,
      awardMessage,
      awardValue || undefined
    );

    setAwards(MockDatabase.getAwards());
    setAwardMessage('');
    setAwardValue('');
    setNotification(`Successfully conferred "${awardTitle}" on ${employee.name}!`);
    setTimeout(() => setNotification(null), 4000);
    onTriggerTick();
  };

  const handleSendNudge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nudgeEmpId) {
      setNotification('Please select an employee to notify.');
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const employee = employees.find(emp => emp.id === nudgeEmpId);
    if (!employee) return;

    MockDatabase.triggerNewRandomNudge(nudgeEmpId);
    
    const allNdgs = MockDatabase.getNudges().filter(n => n.employeeId === nudgeEmpId);
    const limitText = allNdgs.length === 1 ? '1 minute' : '10 minutes';

    setNotification(`Dispatched interactive Nudge prompt to ${employee.name}. Target active timer duration: ${limitText}.`);
    setTimeout(() => setNotification(null), 5000);
    onTriggerTick();
  };

  // Raw math details
  const math = MockDatabase.getCalculationExplanationForAcme();

  // Sentiment Face Map
  const getSentimentFace = (sentiment: Department['sentiment']) => {
    switch (sentiment) {
      case 'very-happy': return { icon: '😆', color: 'text-emerald-500 bg-emerald-50 border-emerald-100', text: 'Highly Thriving' };
      case 'happy': return { icon: '🙂', color: 'text-cyan-500 bg-cyan-50 border-cyan-100', text: 'Engaged' };
      case 'neutral': return { icon: '😐', color: 'text-slate-400 bg-slate-50 border-slate-150', text: 'Stagnating' };
      case 'sad': return { icon: '🙁', color: 'text-amber-500 bg-amber-50 border-amber-100', text: 'Vulnerable' };
      case 'very-sad': return { icon: '😫', color: 'text-rose-500 bg-rose-50 border-rose-100', text: 'Severe Burnout' };
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Upper Org Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 text-amber-800 p-2.5 rounded-xl border border-amber-200">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900 tracking-tight flex items-center gap-2">
                Meraki Executive Dashboard
                <span className="text-xs font-sans font-medium bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-0.5 rounded-full italic">
                  Feels like miracle!
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Continuous Real-Time Workforce Wellbeing Intelligence State
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => triggerRecalculate(true)}
              className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Recalculate Calculations
            </button>
          </div>
        </div>

        {/* HR Tab Row Selector */}
        <div className="flex border-b border-slate-100 mt-6 gap-6">
          <button
            onClick={() => setActiveTab('INSIGHTS')}
            className={`pb-2.5 text-xs font-bold font-mono uppercase tracking-wider relative transition-all ${
              activeTab === 'INSIGHTS' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Insights & Health Map
          </button>
          <button
            onClick={() => setActiveTab('SETUP')}
            className={`pb-2.5 text-xs font-bold font-mono uppercase tracking-wider relative transition-all ${
              activeTab === 'SETUP' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Create Departments & Staff
          </button>
          <button
            onClick={() => setActiveTab('JOURNEY')}
            className={`pb-2.5 text-xs font-bold font-mono uppercase tracking-wider relative transition-all ${
              activeTab === 'JOURNEY' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Employee Journey Map Route
          </button>
          <button
            onClick={() => setActiveTab('AWARDS')}
            className={`pb-2.5 text-xs font-bold font-mono uppercase tracking-wider relative transition-all ${
              activeTab === 'AWARDS' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            🏆 Recognitions & Nudges
          </button>
          <button
            onClick={() => setActiveTab('EMPLOYEE_PORTAL')}
            className={`pb-2.5 text-xs font-bold font-mono uppercase tracking-wider relative transition-all ${
              activeTab === 'EMPLOYEE_PORTAL' ? 'text-amber-600 border-b-2 border-amber-500' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            👥 Simulated Employee Portals
          </button>
        </div>
      </div>

      {notification && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
          {notification}
        </div>
      )}

      {/* TAB 1: INSIGHTS & HEALTH MAP (WITH COMPLETE TRANSPARENT MATH) */}
      {activeTab === 'INSIGHTS' && (
        <div className="space-y-6">

          {/* Org KPI Cards with Non-Response Tracking (Section 7) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* KPI 1: Overall Happiness Index */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs relative overflow-hidden">
              <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-widest font-bold">Overall Organization Happiness</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-display font-bold text-slate-900">{math.happinessPercentage}%</span>
                <span className={`text-[11px] font-bold px-1.5 py-0.2 rounded font-mono ${
                  math.happinessPercentage >= 65 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}>
                  Weighted
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-mono">Weighted from all active research dimensions.</p>
            </div>

            {/* KPI 2: Response Rate (Section 7) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-widest font-bold">Pulse Response Rate</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-display font-bold text-slate-900">{math.responseRate}%</span>
                <span className="text-[10px] text-slate-500 font-mono">({math.totalResponses}/{math.totalSent} pulse hits)</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-mono">Total answered versus total dispatched.</p>
            </div>

            {/* KPI 3: Non-Response (Lapsed) Tracking (Section 7) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs relative">
              <div className="absolute top-4 right-4 bg-rose-50 p-1 rounded-full border border-rose-100 text-rose-500">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              </div>
              <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-widest font-bold text-rose-900">Lapsed Pulses (Non-Response)</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-display font-medium text-rose-600">{math.lapsedCount} times</span>
                <span className="text-[10px] font-medium text-rose-500 bg-rose-50/50 px-1 rounded">No Response</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 leading-relaxed font-mono">Employee failed to respond before expiry timeline.</p>
            </div>

            {/* KPI 4: Pending / Active reminders */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
              <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-widest font-bold text-amber-900">Pending Safe Audits</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-display font-medium text-amber-600">{math.pendingCount} active</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 font-mono">Nudges actively running on employee devices.</p>
            </div>

          </div>

          {/* DYNAMIC METRIC CALCULATION METHODOLOGY CARD (Section 9) */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="bg-amber-100 text-amber-800 p-2 rounded-xl mt-1 shrink-0">
                <FileText className="w-4.5 h-4.5" />
              </div>
              <div className="space-y-3 w-full">
                <div>
                  <h3 className="font-display font-semibold text-sm text-slate-900 leading-none">
                    Transparent Happiness Calculation Methodology
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Unlike naive binary calculations, we expose clear dimensions. Individual answers count on a weighted index: Very Happy counts at 100%, Happy at 75%, Neutral at 50%, Sad at 25%, and Very Sad at 0%. This highlights vulnerables and preserves transparency.
                  </p>
                </div>

                {/* Formula display */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 font-mono text-[11px] grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-slate-400 block font-bold uppercase tracking-wider text-[9px]">Active Computation Formula:</span>
                    <div className="bg-slate-50 p-2.5 rounded border border-slate-150 text-slate-800 break-words font-semibold">
                      Happiness Rating = [ (VH * 1.0) + (H * 0.75) + (N * 0.5) + (S * 0.25) + (VS * 0) ] / [VH + H + N + S + VS]
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-slate-400 block font-bold uppercase tracking-wider text-[9px]">Live Data Computation Table:</span>
                    <div className="grid grid-cols-5 gap-1 text-center font-bold">
                      <div className="bg-emerald-50 text-emerald-700 p-1.5 rounded border border-emerald-100">
                        <span className="block text-[8px] text-emerald-500 font-sans">VH (5★)</span>
                        <span className="text-xs">{math.veryHappyCount}</span>
                      </div>
                      <div className="bg-cyan-50 text-cyan-700 p-1.5 rounded border border-cyan-100">
                        <span className="block text-[8px] text-cyan-500 font-sans">H (4★)</span>
                        <span className="text-xs">{math.happyCount}</span>
                      </div>
                      <div className="bg-slate-50 text-slate-600 p-1.5 rounded border border-slate-250">
                        <span className="block text-[8px] text-slate-400 font-sans">N (3★)</span>
                        <span className="text-xs">{math.neutralCount}</span>
                      </div>
                      <div className="bg-amber-50 text-amber-700 p-1.5 rounded border border-amber-100">
                        <span className="block text-[8px] text-amber-500 font-sans">S (2★)</span>
                        <span className="text-xs">{math.sadCount}</span>
                      </div>
                      <div className="bg-rose-50 text-rose-700 p-1.5 rounded border border-rose-100">
                        <span className="block text-[8px] text-rose-500 font-sans">VS (1★)</span>
                        <span className="text-xs">{math.verySadCount}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-amber-800 font-mono bg-amber-50/70 p-2.5 rounded border border-amber-200/50 flex flex-wrap items-center justify-between gap-2">
                  <span>
                    👉 <strong>Total Response Base:</strong> {math.totalResponses} answered. <strong>Weighted Score Sum:</strong> {math.weightedTotal} pts.
                  </span>
                  <span>
                    <strong>Net Index (Sum / Total): {math.happinessPercentage}%</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* DEPARTMENT HEALTH MAP & SENTIMENT INDICATORS (Section 10) */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-3">
              <div>
                <h3 className="font-display font-semibold text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
                  <BarChart3 className="w-4.5 h-4.5 text-amber-500" />
                  Department-Level Wellness Metrics & Health Map
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Overview of segment-wise happiness. Notice the smiley face sentiment index reflecting instant team health tags.
                </p>
              </div>
              <button
                onClick={handleBulkExport}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0"
              >
                <Download className="w-3.5 h-3.5" />
                Bulk Export CSV
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {departments.map((dept) => {
                const face = getSentimentFace(dept.sentiment);
                return (
                  <div key={dept.id} className="border border-slate-150 rounded-2xl p-4.5 space-y-4 hover:shadow-xs transition-all flex flex-col justify-between">
                    
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <h4 className="font-display font-semibold text-xs text-slate-900 leading-tight">
                          {dept.name}
                        </h4>
                        <span className="block text-[10px] text-slate-400 font-mono">
                          Manager: {dept.manager} • {dept.headcount} staff
                        </span>
                      </div>

                      {/* Happy Face Indicator (Section 10) */}
                      <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center font-display text-slate-800 border shrink-0 text-lg ${face.color}`} title={face.text}>
                        <span>{face.icon}</span>
                        <span className="text-[7px] font-mono tracking-tighter uppercase leading-none font-bold">{dept.sentiment}</span>
                      </div>
                    </div>

                    {/* Happiness rating bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-500">Department Wellness Rating</span>
                        <span className="font-bold text-slate-850">{dept.happinessRating}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            dept.happinessRating >= 75 ? 'bg-emerald-500' :
                            dept.happinessRating >= 60 ? 'bg-cyan-500' :
                            dept.happinessRating >= 45 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${dept.happinessRating}%` }}
                        />
                      </div>
                    </div>

                    {/* Key Dimensions Explorer (Section 12 - supportive Experience, work likeability, intrinsic motivation flow) */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-50 text-center text-[10px]">
                      <div className="bg-slate-50 rounded p-1.5">
                        <span className="block text-[8px] font-mono uppercase tracking-tight text-slate-400">Support Experience</span>
                        <span className="font-bold block text-slate-800 mt-0.5">{dept.supportiveExperience}%</span>
                        <span className="text-[7px] text-slate-400">Org training</span>
                      </div>

                      <div className="bg-slate-50 rounded p-1.5">
                        <span className="block text-[8px] font-mono uppercase tracking-tight text-slate-400">Work Likeability</span>
                        <span className="font-bold block text-slate-800 mt-0.5">{dept.workLikeability}%</span>
                        <span className="text-[7px] text-slate-400">No redundancy</span>
                      </div>

                      <div className="bg-slate-50 rounded p-1.5 font-mono">
                        <span className="block text-[8px] font-sans uppercase tracking-tight text-slate-400">Intrinsic Flow</span>
                        <span className="font-bold block text-slate-800 mt-0.5">{dept.intrinsicFlow}%</span>
                        <span className="text-[7px] text-slate-400 font-sans">Zone time</span>
                      </div>
                    </div>

                    {/* Goal Progress Bar: Pulse Reply Rate vs 80% Target */}
                    <div className="pt-2.5 border-t border-slate-50 space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-mono">
                        <span className="text-slate-500 font-sans">Pulse Reply Rate (Target: 80%)</span>
                        <div className="space-x-1">
                          <strong className={dept.responseRate >= 80 ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                            {dept.responseRate}%
                          </strong>
                          <span className="text-slate-400">/ 80%</span>
                        </div>
                      </div>
                      <div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        {/* Target Marker at 80% */}
                        <div className="absolute top-0 bottom-0 left-[80%] w-[2px] bg-slate-400 z-10" title="80% Target Goal" />
                        
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            dept.responseRate >= 80 ? 'bg-emerald-500' :
                            dept.responseRate >= 60 ? 'bg-amber-400' : 'bg-rose-500'
                          }`}
                          style={{ width: `${Math.min(100, dept.responseRate)}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-mono text-slate-400">
                        <span>Min Threshold</span>
                        <span className={`font-semibold ${dept.responseRate >= 85 ? 'text-emerald-600' : dept.responseRate >= 80 ? 'text-teal-600' : 'text-amber-600'}`}>
                          {dept.responseRate >= 80 ? '✓ Goal Achieved' : '⚠ Below Target'}
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>



        </div>
      )}

      {/* TAB 2: SETUP DEPARTMENTS & EMPLOYEES (Section 4) */}
      {activeTab === 'SETUP' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Create Department Form */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-xs">
            <div>
              <h3 className="font-display font-semibold text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-emerald-500" />
                Establish Corporate Department
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Add a new operating branch with custom leadership mapping.
              </p>
            </div>

            <form onSubmit={handleAddDept} className="space-y-3 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1">
                  Department Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Legal & Compliance Operations"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1">
                  Assigned Manager Email/Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Julia Sterling, VP Counsel"
                  value={newDeptManager}
                  onChange={(e) => setNewDeptManager(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 bg-slate-900 text-white hover:bg-slate-800 text-xs rounded-lg font-semibold flex items-center justify-center gap-1 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Initialize Department
              </button>
            </form>
          </div>

          {/* Create Employee Form (ID or Email ID, Section 4) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-xs">
            <div>
              <h3 className="font-display font-semibold text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
                <UserPlus className="w-4.5 h-4.5 text-cyan-500" />
                Enrol Company Employee Direct
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Direct register staff. Assign either unique Corporate ID or corporate Email identifier.
              </p>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1">
                    Employee Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ray Park"
                    value={newEmpName}
                    onChange={(e) => setNewEmpName(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1">
                    Staff Email Identification
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ray.park@acme.com"
                    value={newEmpEmail}
                    onChange={(e) => setNewEmpEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1">
                    Corporate ID Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ACM-9981"
                    value={newEmpId}
                    onChange={(e) => setNewEmpId(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1">
                    Department
                  </label>
                  <select
                    value={newEmpDept}
                    onChange={(e) => setNewEmpDept(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-cyan-500"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs rounded-lg font-semibold flex items-center justify-center gap-1 transition-all"
              >
                <UserPlus className="w-3.5 h-3.5" /> Enrol Corporate Employee
              </button>
            </form>
          </div>

          {/* STAFF LEDGER */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-5 shadow-xs space-y-4">
            <div>
              <h3 className="font-display font-semibold text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
                <Users className="w-4.5 h-4.5 text-amber-500" />
                Active Employee Register Ledger
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
                Review verified team accounts, active journey tracks, and database clearance tags.
              </p>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase font-mono text-[10px] tracking-wider font-bold pb-2">
                    <th className="py-2.5">Full Name</th>
                    <th>Staff Email ID</th>
                    <th>Corporate ID</th>
                    <th>Allocated Department ID</th>
                    <th>Clearing Status</th>
                    <th>Access Route Map Step</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-sans">
                  {employees.filter(e => e.status === 'APPROVED').map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/40">
                      <td className="py-3 font-semibold text-slate-800">{emp.name}</td>
                      <td className="text-slate-500 font-mono text-[11px]">{emp.email}</td>
                      <td className="font-mono text-slate-600 uppercase font-bold text-[11px]">{emp.employeeId}</td>
                      <td className="text-slate-400 font-mono text-[11px]">{emp.departmentId}</td>
                      <td>
                        <span className="px-2 py-0.5 text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-100 rounded font-mono font-bold tracking-wider">
                          {emp.role}
                        </span>
                      </td>
                      <td className="text-slate-600 font-bold">
                        Step {emp.journeyStep} : Onboarding Tracker
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: EMPLOYEE JOURNEY ROUTE MAP (Section 4) */}
      {activeTab === 'JOURNEY' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div>
            <h3 className="font-display font-semibold text-base text-slate-900 tracking-tight flex items-center gap-1.5">
              <MapPin className="w-5 h-5 text-amber-500" />
              Employee Journey Map Explorer / Route Matrix
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Define the automated onboarding roadmap and cognitive checkpoints corporate staff experience as they familiarize themselves with the well-being map.
            </p>
          </div>

          {/* Simulated Journey Visual Track */}
          <div className="relative">
            <div className="absolute left-6 top-3 h-[90%] w-0.5 bg-slate-100 -z-0" />
            
            <div className="space-y-6 relative z-10">
              {journeySteps.map((step) => (
                <div key={step.step} className="flex gap-4 items-start">
                  <div className="w-12 h-12 rounded-full bg-slate-900 text-cyan-400 font-display font-bold text-sm tracking-tight flex items-center justify-center border-4 border-slate-100 shrink-0 shadow-sm">
                    {step.step}
                  </div>
                  <div className="bg-slate-55 bg-slate-50/50 hover:bg-slate-50 border border-slate-150 p-4 rounded-xl flex-1 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="font-display font-semibold text-xs text-slate-900 tracking-tight">
                        {step.title}
                      </h4>
                      <span className="text-[9px] text-cyan-700 bg-cyan-50 font-bold px-1.5 py-0.2 rounded font-mono uppercase tracking-widest">
                        SIMULATION STEP
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 text-teal-400 p-4 rounded-xl border border-slate-800 text-xs font-mono flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="font-bold text-white uppercase tracking-wider block text-[10px]">Onboarding Journey Mapping Active:</span>
              <p className="text-slate-400 text-[11px]">Any newly approved employee begins at Step 1 of this route map automatically.</p>
            </div>
            <span className="text-[10px] bg-slate-800 text-slate-200 px-2 py-1 rounded font-bold border border-slate-700 font-mono">
              COMPLIANT
            </span>
          </div>
        </div>
      )}

      {/* TAB 4: EXECUTIVE RECOGNITIONS & NUDGE CENTER */}
      {activeTab === 'AWARDS' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Section 1: Wellbeing Nudge Pulse Sender */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5 shadow-xs">
            <div>
              <h3 className="font-display font-semibold text-base text-slate-900 tracking-tight flex items-center gap-2">
                <Send className="w-5 h-5 text-indigo-500 animate-pulse" />
                Dispatch Real-time Wellbeing Nudge
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                Nudge Theory reminds us to log support metrics in tiny daily blocks. Send a randomized check-in nudge to a selected team member.
              </p>
            </div>

            <form onSubmit={handleSendNudge} className="space-y-4 pt-1">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1.5">
                  Target Team Member
                </label>
                <select
                  value={nudgeEmpId}
                  onChange={(e) => setNudgeEmpId(e.target.value)}
                  className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-505 focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select recipient...</option>
                  {employees.filter(e => e.status === 'APPROVED').map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.employeeId})</option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-50 hover:bg-slate-100/60 p-4 rounded-xl border border-slate-150 space-y-2 text-xs">
                <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider font-mono">⏱️ Micro-Check-in Expiry Safeguards:</span>
                <p className="text-slate-500 leading-relaxed font-sans">
                  • <strong>First-ever nudge:</strong> Stays on the employee's screen for exactly <strong>1 minute</strong>, then lapses to reduce friction.
                </p>
                <p className="text-slate-500 leading-relaxed font-sans">
                  • <strong>Subsequent nudges (2nd+):</strong> Stays on target layout for <strong>10 minutes</strong> before lapsing.
                </p>
              </div>

              <button
                type="submit"
                disabled={!nudgeEmpId}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-150 disabled:text-slate-400 text-white text-xs rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Send className="w-3.5 h-3.5" /> Dispatch Active Wellbeing Nudge
              </button>
            </form>
          </div>

          {/* Section 2: Give Recognition or Reward */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5 shadow-xs">
            <div>
              <h3 className="font-display font-semibold text-base text-slate-900 tracking-tight flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                Bestow Corporate Medal & Reward
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Reward verified staff actions and grant intrinsic performance badges with real motivational assets.
              </p>
            </div>

            <form onSubmit={handleGiveAward} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1">
                    Select Laureate
                  </label>
                  <select
                    value={awardEmpId}
                    onChange={(e) => setAwardEmpId(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  >
                    <option value="">Select recipient...</option>
                    {employees.filter(e => e.status === 'APPROVED').map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1">
                    Medal Category
                  </label>
                  <select
                    value={awardType}
                    onChange={(e) => {
                      const type = e.target.value as Award['type'];
                      setAwardType(type);
                      if (type === 'maestro') setAwardTitle('Flow Maestro Medal');
                      else if (type === 'pillar') setAwardTitle('Supportive Pillar Achievement');
                      else if (type === 'mindful') setAwardTitle('Mindful Journey Pathfinder Badge');
                      else if (type === 'innovator') setAwardTitle('Cognitive Innovator Star');
                      else setAwardTitle('Custom Appreciation Laurels');
                    }}
                    className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                  >
                    <option value="maestro">🪙 Flow Maestro Medal</option>
                    <option value="pillar">🛡️ Supportive Pillar Achievement</option>
                    <option value="mindful">🧘 Mindful Journey Pathfinder</option>
                    <option value="innovator">💡 Cognitive Innovator Badge</option>
                    <option value="custom">📜 Custom Appreciation Certificate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1">
                  Award / Certificate Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Outstanding Focus Champion"
                  value={awardTitle}
                  onChange={(e) => setAwardTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1 font-mono">
                  Special Appreciation Message
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Tell them why they represent acme outstanding values..."
                  value={awardMessage}
                  onChange={(e) => setAwardMessage(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-1 flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-rose-500" />
                  Tangible Reward Allocation (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. $100 Wellness Voucher, Friday Half-Day Off, Spa Pass"
                  value={awardValue}
                  onChange={(e) => setAwardValue(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                disabled={!awardEmpId}
                className="w-full mt-1 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-150 disabled:text-slate-400 text-slate-950 text-xs rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Trophy className="w-3.5 h-3.5" /> Confer & Issue Reward
              </button>
            </form>
          </div>

          {/* Section 3: Historical Given Recognitions ledger */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-xs">
            <div>
              <h3 className="font-display font-semibold text-sm text-slate-900 tracking-tight flex items-center gap-1.5 font-mono">
                🎖️ Historical Recognition Ledger
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Active certified rewards published to the organization ledger. Employees immediately witness these inside their private panels.
              </p>
            </div>

            {awards.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">No certificates granted in this session yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {awards.map((awr) => {
                  const empName = employees.find(e => e.id === awr.employeeId)?.name || 'Acme Employee';
                  return (
                    <div key={awr.id} className="border border-slate-100 bg-slate-50/50 hover:bg-slate-50 p-4 rounded-xl flex items-start gap-3 justify-between transition-all">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">
                            {awr.type === 'maestro' ? '🪙' : awr.type === 'pillar' ? '🛡️' : awr.type === 'mindful' ? '🧘' : awr.type === 'innovator' ? '💡' : '📜'}
                          </span>
                          <div>
                            <h4 className="font-bold text-xs text-slate-900 leading-tight">{awr.title}</h4>
                            <span className="text-[10px] text-slate-400">Awarded to: <strong>{empName}</strong></span>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed italic bg-white border border-slate-100 p-2.5 rounded">
                          "{awr.message}"
                        </p>
                        {awr.rewardValue && (
                          <div className="flex items-center gap-1.5 text-rose-700 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded text-[10px] font-bold w-fit font-mono">
                            <Gift className="w-3 h-3 text-rose-500" />
                            Reward: {awr.rewardValue}
                          </div>
                        )}
                        <span className="block text-[9px] text-slate-400 font-mono">
                          Issued on: {new Date(awr.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'EMPLOYEE_PORTAL' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-xs space-y-1.5 text-amber-950 leading-relaxed shadow-xs">
            <h4 className="font-bold flex items-center gap-1.5 font-mono">
              🛡️ COMPLIANCE AUDIT MODE: Live Simulated Employee Portals
            </h4>
            <p>
              Under BOARD audit clearance protocols, directors can see the <strong>Employee Dashboard entirely</strong>. Use the persona switcher tool inside the dashboard below to evaluate any active candidate's direct pulse actions, biometric sound transmuters, and response history log transparency first-hand.
            </p>
          </div>
          <EmployeeDashboard onTriggerTick={onTriggerTick} showAllTabsForBoard={true} />
        </div>
      )}

    </div>
  );
}
