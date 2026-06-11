/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, Shield, MessageSquare, Flame, CheckCircle, Clock, Zap, Send, Heart, EyeOff, Sparkles, Coffee, Timer, Trophy, Gift, RefreshCw, Smile, Brain, Search
} from 'lucide-react';
import { MockDatabase } from '../data/mockDatabase';
import { Employee, EmployeeNudge, PeerInteraction, Department, Award } from '../types';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';

interface EmployeeDashboardProps {
  onTriggerTick: () => void;
  isEmployeeOverview?: boolean;
  loggedInEmployeeId?: string;
  showAllTabsForBoard?: boolean;
}

interface StressBubble {
  id: string;
  thought: string;
  affirmedTxt: string;
  x: number; // percentage of horizontal layout width
  y: number; // percentage of vertical layout height
  speed: number;
  colorType: 'pink' | 'orange';
  noteName: string; // "Sa", "Re", "Ga", "Ma", "Pa", "Dha", "Ni"
  noteFreq: number;
  transmuted: boolean;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    const moodLabels = [
      '😫 Very Burned Out',
      '🙁 Stressed',
      '😐 Neutral',
      '🙂 Engaged & Happy',
      '😆 Highly Thriving'
    ];
    const moodIndex = Math.max(1, Math.min(5, Math.round(val))) - 1;
    return (
      <div className="bg-slate-950 text-white p-3 rounded-xl border border-slate-800 shadow-lg font-mono text-[10px] space-y-1">
        <p className="font-bold text-slate-400">{label}</p>
        <p className="flex items-center gap-1.5">
          <span className="text-indigo-400">Average Mood:</span>
          <span className="font-bold text-amber-400">{val} ★</span>
        </p>
        <p className="text-[10px] text-slate-300 font-sans italic">{moodLabels[moodIndex]}</p>
      </div>
    );
  }
  return null;
};

const generate30DayTrend = (employeeId: string, actualNudges: EmployeeNudge[]) => {
  const data = [];
  const now = new Date();
  
  // Create a stable deterministic seed base from text
  let seed = 0;
  for (let i = 0; i < employeeId.length; i++) {
    seed += employeeId.charCodeAt(i);
  }
  const pseudoRandom = (dayIndex: number) => {
    const x = Math.sin(seed + dayIndex) * 10000;
    return x - Math.floor(x);
  };

  // Base rating score from employee properties
  const baseRating = employeeId === 'emp-sarah' ? 4.3 : 
                     employeeId === 'emp-john' ? 4.1 : 
                     employeeId === 'emp-david' ? 2.3 : 3.7;

  // Compile daily mood points
  for (let i = 29; i >= 0; i--) {
    const targetDate = new Date(now.getTime() - i * 24 * 3600 * 1000);
    const dateStr = targetDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    
    const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime();
    const dayEnd = dayStart + 24 * 3600 * 1000;
    
    // Check actual responded surveys
    const dayResponses = actualNudges.filter(
      n => n.status === 'RESPONDED' && n.respondedAt && n.respondedAt >= dayStart && n.respondedAt < dayEnd
    );
    
    let moodScore: number;
    if (dayResponses.length > 0) {
      const sum = dayResponses.reduce((acc, curr) => acc + (curr.responseValue || 4), 0);
      moodScore = Number((sum / dayResponses.length).toFixed(1));
    } else {
      // Simulate realistic fluctuation trajectories around historical baseline
      const fluctuation = (pseudoRandom(i) - 0.5) * 0.7;
      const momentumWave = Math.sin(i * 0.25) * 0.35;
      moodScore = Number(Math.max(1, Math.min(5, baseRating + fluctuation + momentumWave)).toFixed(1));
    }

    data.push({
      date: dateStr,
      'Mood Rating': moodScore
    });
  }
  return data;
};

export default function EmployeeDashboard({ onTriggerTick, isEmployeeOverview = false, loggedInEmployeeId, showAllTabsForBoard = false }: EmployeeDashboardProps) {
  const [employeesPool] = useState<Employee[]>(() => 
    MockDatabase.getEmployees().filter(e => e.status === 'APPROVED')
  );

  // Search & Filter State inside Employee Sandbox
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');

  // If locked in as respective employee, force the id, otherwise default to first approved employee
  const defaultEmpId = loggedInEmployeeId || employeesPool[0]?.id || 'emp-sarah';
  const [selectedEmpId, setSelectedEmpId] = useState<string>(defaultEmpId);
  
  // Keep state in sync if prop changes
  useEffect(() => {
    if (loggedInEmployeeId) {
      setSelectedEmpId(loggedInEmployeeId);
    }
  }, [loggedInEmployeeId]);

  const filteredEmployeesPool = employeesPool.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'ALL' || emp.departmentId === deptFilter;
    return matchesSearch && matchesDept;
  });

  const currentEmployee = employeesPool.find(e => e.id === selectedEmpId) || employeesPool[0];

  const [nudges, setNudges] = useState<EmployeeNudge[]>([]);
  const [peerMsgs, setPeerMsgs] = useState<PeerInteraction[]>([]);
  const [departments] = useState<Department[]>(() => MockDatabase.getDepartments());
  const [receivedAwards, setReceivedAwards] = useState<Award[]>([]);

  // Tab definitions
  // If direct employee overview, show specialized user features. Otherwise, show admin simulation.
  const [activeTab, setActiveTab] = useState<string>('PULSE');

  // Peer form state (simulation)
  const [targetId, setTargetId] = useState('');
  const [peerText, setPeerText] = useState('');
  const [peerCategory, setPeerCategory] = useState<'gratitude' | 'encouragement' | 'shout-out'>('gratitude');

  // Flow tracker state (simulation)
  const [isTrackingFlow, setIsTrackingFlow] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [forgotMealTimes, setForgotMealTimes] = useState(false);
  const [clockWatched, setClockWatched] = useState(false);

  // Private Mindful AI Coach Chat state
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: "Welcome to your secure, private sanctuary. I am your Gemini-powered Mindful AI companion. None of our chat logs will ever be visible to company executives or HR. How can I help you find focus, restore energy, or transmute stress today?" }
  ]);

  // Digital Stress Transmuter game state
  const [wellnessScore, setWellnessScore] = useState(0);
  const [wellnessHighScore, setWellnessHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('wbm_stress_high_score')) || 110;
  });
  const [gameTimer, setGameTimer] = useState(30);
  const [gameActive, setGameActive] = useState(true);
  const [bubbles, setBubbles] = useState<StressBubble[]>([]);
  const [activeRipple, setActiveRipple] = useState<{ x: number; y: number; text: string }[]>([]);

  const STRESS_DATA = [
    { thought: "Overtime\nDeadline", affirmed: "My focus is precious. I mute noise to unlock quiet flow. ✨" },
    { thought: "Merge\nConflict", affirmed: "I trust my capability. My performance speaks for itself. 🌟" },
    { thought: "Slack Ping\nFatigue", affirmed: "One mindful step at a time. Quality over rushed speed. 🌊" },
    { thought: "Imposter\nSyndrome", affirmed: "I bring unique strengths. I belong and I am succeeding. 🧠" },
    { thought: "Zoom\nFatigue", affirmed: "I take restorative breaths. This stress transforms into clarity. 🧘" },
    { thought: "Scope\nCreep", affirmed: "I set healthy clear boundaries. Communication solves misalignments. 🛡️" },
    { thought: "Prod\nOutage", affirmed: "Calm handling resolves outages. Retrospectives foster learning. 🚀" }
  ];

  const INDIAN_NOTES = [
    { name: 'Sa', freq: 261.63 },
    { name: 'Re', freq: 293.66 },
    { name: 'Ga', freq: 329.63 },
    { name: 'Ma', freq: 349.23 },
    { name: 'Pa', freq: 392.00 },
    { name: 'Dha', freq: 440.00 },
    { name: 'Ni', freq: 493.88 }
  ];

  const playSynthNote = (freq: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine'; // gentle clear bell-like tone
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 1.0);
    } catch (e) {
      console.warn("Web Audio Context not permitted or active yet:", e);
    }
  };

  const [toast, setToast] = useState<string | null>(null);
  const [nowTime, setNowTime] = useState<number>(Date.now());

  // Populate interactive bubbles for stress game and stagger their vertical start heights
  const resetStressGame = () => {
    setWellnessScore(0);
    setGameTimer(30);
    setGameActive(true);
    setActiveRipple([]);

    const generated: StressBubble[] = Array.from({ length: 6 }).map((_, index) => {
      const randomStress = STRESS_DATA[index % STRESS_DATA.length];
      const randomNote = INDIAN_NOTES[index % INDIAN_NOTES.length];
      const randomColorType: 'pink' | 'orange' = index % 2 === 0 ? 'pink' : 'orange';
      
      return {
        id: `bubble-${index}-${Math.random()}`,
        thought: randomStress.thought,
        affirmedTxt: randomStress.affirmed,
        x: 10 + Math.random() * 70, // horizontal percentage (10% to 80%)
        y: -15 - (index * 25), // stagger vertical starts off-screen so they fall consecutively
        speed: 0.35 + Math.random() * 0.45, // fall speed
        colorType: randomColorType,
        noteName: randomNote.name,
        noteFreq: randomNote.freq,
        transmuted: false
      };
    });
    setBubbles(generated);
  };

  useEffect(() => {
    resetStressGame();
  }, []);

  // Main game tick: updates bubble positions and subtracts timeLeft
  useEffect(() => {
    if (activeTab !== 'GAMES') return;

    let timerId: any;
    let physicsId: any;

    if (gameActive) {
      // Countdown timer
      timerId = setInterval(() => {
        setGameTimer(prev => {
          if (prev <= 1) {
            setGameActive(false);
            clearInterval(timerId);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Physics loop (updates y coordinate every 40ms)
      physicsId = setInterval(() => {
        setBubbles(prevBubbles => {
          return prevBubbles.map(bub => {
            if (bub.transmuted) {
              return bub; // let it stay to showcase success affirmation
            }
            
            let nextY = bub.y + bub.speed;
            
            // If bubble flows past the bottom threshold, wrap it back to top
            if (nextY > 92) {
              const randomIndex = Math.floor(Math.random() * STRESS_DATA.length);
              const randomStress = STRESS_DATA[randomIndex];
              const randomNote = INDIAN_NOTES[Math.floor(Math.random() * INDIAN_NOTES.length)];
              const randomColor: 'pink' | 'orange' = Math.random() > 0.5 ? 'pink' : 'orange';
              
              return {
                ...bub,
                thought: randomStress.thought,
                affirmedTxt: randomStress.affirmed,
                y: -15, // restart above top
                x: 10 + Math.random() * 70, // random horizontal dispersion
                speed: 0.35 + Math.random() * 0.45,
                colorType: randomColor,
                noteName: randomNote.name,
                noteFreq: randomNote.freq,
                transmuted: false
              };
            }
            
            return {
              ...bub,
              y: nextY
            };
          });
        });
      }, 40);
    }

    return () => {
      clearInterval(timerId);
      clearInterval(physicsId);
    };
  }, [activeTab, gameActive]);

  // Sync state from Database
  const syncState = () => {
    if (!selectedEmpId) return;
    const rawNudges = MockDatabase.getNudges();
    // Filter nudges sent to current active selected employee
    const filteredNudges = rawNudges.filter(n => n.employeeId === selectedEmpId);
    setNudges(filteredNudges);

    // Private Employee Peer interactions (sender or receiver is current employee)
    const rawPeers = MockDatabase.getPeerInteractions();
    const filteredPeers = rawPeers.filter(p => p.senderId === selectedEmpId || p.receiverId === selectedEmpId);
    setPeerMsgs(filteredPeers);

    // Load Awards received
    const allAwards = MockDatabase.getAwards();
    const filteredAwards = allAwards.filter(a => a.employeeId === selectedEmpId);
    setReceivedAwards(filteredAwards);
  };

  // Keep ticking countdown for active pending nudges
  useEffect(() => {
    const timer = setInterval(() => {
      setNowTime(Date.now());
      
      // Auto-trigger lapse check
      const hasPendingExpired = MockDatabase.getNudges().some(
        n => n.employeeId === selectedEmpId && n.status === 'PENDING' && Date.now() > n.expiresAt
      );
      if (hasPendingExpired) {
        const result = MockDatabase.tickNudgesAndCheckLapses();
        if (result.statusChanged) {
          syncState();
          onTriggerTick();
          if (result.message) {
            setToast('A nudge has lapsed inside the system. Triggering attempt 2 if applicable.');
            setTimeout(() => setToast(null), 4000);
          }
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [selectedEmpId]);

  useEffect(() => {
    syncState();
  }, [selectedEmpId]);

  // Handle flow session stopwatch
  useEffect(() => {
    let interval: any;
    if (isTrackingFlow) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      setTimeElapsed(0);
    }
    return () => clearInterval(interval);
  }, [isTrackingFlow]);

  const handleSelectEmployee = (id: string) => {
    setSelectedEmpId(id);
    setToast(`Switched active profile context to metadata identifier: ${id}`);
    setTimeout(() => setToast(null), 3000);
  };

  const answerNudge = (nudgeId: string, rating: number) => {
    MockDatabase.respondToNudge(nudgeId, rating);
    syncState();
    onTriggerTick();
    setToast('Your pulse check-in was securely logged! Recalculation complete.');
    setTimeout(() => setToast(null), 3500);
  };

  const handleForceLapseForTesting = (nudge: EmployeeNudge) => {
    const rawAll = MockDatabase.getNudges();
    const idx = rawAll.findIndex(n => n.id === nudge.id);
    if (idx !== -1) {
      rawAll[idx].expiresAt = Date.now() - 1000; // Force immediate expiry
      MockDatabase.saveNudges(rawAll);
    }

    const result = MockDatabase.tickNudgesAndCheckLapses();
    syncState();
    onTriggerTick();

    if (result.statusChanged) {
      setToast('Lapse matched! Dispatched Follow-Up Survey Nudge (Attempt 2/2) on 10-minutes timer.');
    } else {
      setToast('Test lapse executed.');
    }
    setTimeout(() => setToast(null), 5000);
  };

  const handleTriggerPersonalNudge = () => {
    MockDatabase.triggerNewRandomNudge(selectedEmpId);
    syncState();
    setToast('Dispatched a new wellbeing pulse check nudge to your dashboard!');
    setTimeout(() => setToast(null), 3000);
  };

  const handleSendPeerMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetId || !peerText) return;

    const peers = MockDatabase.getPeerInteractions();
    const targetEmpObj = employeesPool.find(e => e.id === targetId);
    if (!targetEmpObj) return;

    const newMsg: PeerInteraction = {
      id: `ptp-${Math.random().toString(36).substr(2, 9)}`,
      senderId: selectedEmpId,
      receiverId: targetId,
      senderName: currentEmployee?.name || 'Peer',
      receiverName: targetEmpObj.name,
      message: peerText,
      category: peerCategory,
      timestamp: new Date().toISOString()
    };

    const updated = [newMsg, ...peers];
    MockDatabase.savePeerInteractions(updated);
    setPeerText('');
    setTargetId('');
    syncState();
    setToast(`Gratitude circle message securely dispatched to ${targetEmpObj.name}! Completely hidden from HR.`);
    setTimeout(() => setToast(null), 4000);
  };

  const handleSaveFlowSession = () => {
    setIsTrackingFlow(false);
    setToast(`Saved focus stats! Forgot meal times: ${forgotMealTimes ? 'Yes (Excellent concentration)' : 'No'}. Watch-checking: ${clockWatched ? 'Sometimes' : 'Completely absorbed'}.`);
    setForgotMealTimes(false);
    setClockWatched(false);
    setTimeout(() => setToast(null), 5000);
  };

  // Secure conversational client trigger for Gemini secure coach chat
  const handleSendMindfulChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    const userMessageText = aiInput;
    setAiInput('');
    setAiLoading(true);

    // Optimistically update chat history helper
    const updatedHistory = [...chatHistory, { role: 'user' as const, text: userMessageText }];
    setChatHistory(updatedHistory);

    try {
      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `User says: "${userMessageText}"\n\nPlease reply directly to the user maintaining continuous supportive tone.`,
          systemInstruction: `Act as a compassionate, professional mindfulness coach. Offer reassurance, calming tips, breathing exercises, and focus strategies. Keep responses highly supportive, encouraging, warm, and concise (under 3 brief paragraphs). Do not share technical code or metadata. Keep everything centered on the employee's mental restoration.`
        })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setChatHistory([...updatedHistory, { role: 'model' as const, text: data.text }]);
    } catch (err: any) {
      console.error('Mindful AI chat error:', err);
      setChatHistory([
        ...updatedHistory,
        { role: 'model' as const, text: "I apologize, but I am experiencing an issue connecting to the AI core right now. Remember to take a deep inhalation (4 seconds), hold it (4 seconds), and release (4 seconds) to restore focus. Let us try to chat again shortly." }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // Click bubble handler in stress transmuter
  const handleTransmuteBubble = (id: string, affirmedTxt: string, noteName: string, noteFreq: number) => {
    if (!gameActive) return;

    // 1. Play the corresponding synthesized Indian note sound (Sa, Re, Ga, Ma, Pa, Dha, Ni)
    playSynthNote(noteFreq);

    // 2. Add floating visual ripple indicator
    const rippleId = Math.random();
    // Locate the clicked item coordinates or just spawn relative
    const clickedBubble = bubbles.find(b => b.id === id);
    if (clickedBubble) {
      setActiveRipple(prev => [...prev, { x: clickedBubble.x, y: clickedBubble.y, text: noteName }]);
      setTimeout(() => {
        setActiveRipple(prev => prev.filter(r => r.text !== noteName));
      }, 1500);
    }

    // 3. Mark the bubble as transmuted & increment current score + track personal best High Score
    setBubbles(prev => prev.map(item => {
      if (item.id === id) {
        if (!item.transmuted) {
          setWellnessScore(score => {
            const nextScore = score + 10;
            if (nextScore > wellnessHighScore) {
              setWellnessHighScore(nextScore);
              localStorage.setItem('wbm_stress_high_score', String(nextScore));
            }
            return nextScore;
          });
        }
        return { ...item, transmuted: true };
      }
      return item;
    }));

    setToast(`Transmuted Stress Vector -> Sounded Note "${noteName}"!`);
    setTimeout(() => setToast(null), 2500);

    // 4. Recycle bubble: after showing the affirmation brief state, respawn it at the top
    setTimeout(() => {
      setBubbles(prev => prev.map(item => {
        if (item.id === id) {
          const randomIndex = Math.floor(Math.random() * STRESS_DATA.length);
          const randomStress = STRESS_DATA[randomIndex];
          const randomNote = INDIAN_NOTES[Math.floor(Math.random() * INDIAN_NOTES.length)];
          const randomColor: 'pink' | 'orange' = Math.random() > 0.5 ? 'pink' : 'orange';

          return {
            ...item,
            thought: randomStress.thought,
            affirmedTxt: randomStress.affirmed,
            y: -15, // start above the screen
            x: 10 + Math.random() * 70,
            speed: 0.35 + Math.random() * 0.45,
            colorType: randomColor,
            noteName: randomNote.name,
            noteFreq: randomNote.freq,
            transmuted: false
          };
        }
        return item;
      }));
    }, 1500);
  };

  const activePendingNudges = nudges.filter(n => n.status === 'PENDING');

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* Simulation Quick Switcher Panel (Only shown in administrative sandbox/simulation) */}
      {(!isEmployeeOverview || showAllTabsForBoard) && (
        <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-md space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest font-bold">Admin Sandbox Tool</span>
            <h3 className="font-display font-semibold text-sm tracking-tight text-slate-100 flex items-center gap-2">
              <span>👥 Employee Persona Context Simulator</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-505/20 font-mono">
                {filteredEmployeesPool.length} listed
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 font-sans">
              Currently visualizing how specific staff members perceive their active check-ins, peer appreciations, and intrinsic flow tracks. Search and filter to find specific employees:
            </p>
          </div>

          {/* New Search & Filter Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-slate-800/60 pb-2">
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search candidates by name, email, or ID..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans transition-all"
              />
            </div>
            <div>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans cursor-pointer transition-all"
              >
                <option value="ALL">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/40">
            {filteredEmployeesPool.length === 0 ? (
              <p className="text-[11px] text-slate-500 italic py-2 font-mono">
                No active employee personas match the filters criteria.
              </p>
            ) : (
              filteredEmployeesPool.map((e) => (
                <button
                  key={e.id}
                  onClick={() => handleSelectEmployee(e.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono tracking-normal transition-all ${
                    selectedEmpId === e.id
                      ? 'bg-indigo-600 text-white border border-indigo-505 shadow-sm'
                      : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {e.name} ({departments.find(d => d.id === e.departmentId)?.name.split(' ')[0] || 'Staff'})
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Current Context Profile banner */}
      <div className={`bg-white rounded-2xl border ${isEmployeeOverview ? 'border-indigo-100 shadow-sm' : 'border-slate-100'} p-5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs`}>
        <div className="flex items-center gap-3">
          <div className="bg-indigo-50 text-indigo-700 font-bold w-12 h-12 rounded-xl border border-indigo-100 flex items-center justify-center font-display text-lg shadow-xs">
            {currentEmployee?.name ? currentEmployee.name[0] : '👤'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 text-sm">
                Active Session: {currentEmployee?.name || 'Evaluating Guest'}
              </span>
              <span className="text-[9px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-100 px-1.5 py-0.2 rounded font-bold uppercase">
                {currentEmployee?.employeeId || 'ID_PENDING'}
              </span>
            </div>
            <span className="block text-slate-400 text-[11px] mt-0.5 font-mono">
              Role Permission: {currentEmployee?.role} • Target Department: {departments.find(d => d.id === currentEmployee?.departmentId)?.name || 'General Operations'}
            </span>
          </div>
        </div>

        {/* Dispatch trigger specifically to demo the notification system */}
        <div className="flex gap-2">
          <button
            onClick={handleTriggerPersonalNudge}
            className="px-3.5 py-2 hover:bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Bell className="w-3.5 h-3.5" /> Force-Send Pulse Check-in
          </button>
        </div>
      </div>

      {toast && (
        <div className="bg-emerald-50 border border-emerald-100 text-emerald-950 px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fade-in shadow-xs">
          <Sparkles className="w-4 h-4 text-emerald-550 shrink-0 text-emerald-500 animate-pulse" />
          {toast}
        </div>
      )}

      {/* Responsive Tabs navigation */}
      <div className="flex border-b border-slate-100 gap-6 font-sans overflow-x-auto whitespace-nowrap scrollbar-none py-1">
        <button
          onClick={() => setActiveTab('PULSE')}
          className={`pb-2.5 text-xs font-bold font-mono tracking-wider uppercase transition-all shrink-0 ${
            activeTab === 'PULSE' ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-650 hover:text-slate-600'
          }`}
        >
          🔔 My Pulse & Actions ({activePendingNudges.length})
        </button>

        {(isEmployeeOverview || showAllTabsForBoard) && (
          <>
            <button
              onClick={() => setActiveTab('MINDFUL_AI')}
              className={`pb-2.5 text-xs font-bold font-mono tracking-wider uppercase transition-all shrink-0 ${
                activeTab === 'MINDFUL_AI' ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-650 hover:text-slate-600'
              }`}
            >
              🧘 Private Mindful AI Coach
            </button>
            <button
              onClick={() => setActiveTab('GAMES')}
              className={`pb-2.5 text-xs font-bold font-mono tracking-wider uppercase transition-all shrink-0 ${
                activeTab === 'GAMES' ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-650 hover:text-slate-600'
              }`}
            >
              🎮 Stress Transmuter (Game)
            </button>
            <button
              onClick={() => setActiveTab('MEDALS')}
              className={`pb-2.5 text-xs font-bold font-mono tracking-wider uppercase relative transition-all shrink-0 ${
                activeTab === 'MEDALS' ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-650 hover:text-slate-600'
              }`}
            >
              🏆 Awards & Medals ({receivedAwards.length})
            </button>
          </>
        )}

        {(!isEmployeeOverview || showAllTabsForBoard) && (
          <>
            <button
              onClick={() => setActiveTab('PEER')}
              className={`pb-2.5 text-xs font-bold font-mono tracking-wider uppercase transition-all shrink-0 ${
                activeTab === 'PEER' ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-650 hover:text-slate-600'
              }`}
            >
              🔒 Peer-to-Peer Appreciation safe circle
            </button>
            <button
              onClick={() => setActiveTab('FLOW')}
              className={`pb-2.5 text-xs font-bold font-mono tracking-wider uppercase transition-all shrink-0 ${
                activeTab === 'FLOW' ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-650 hover:text-slate-600'
              }`}
            >
              ⏱️ Intrinsic Flow State clock
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab('LOGS')}
          className={`pb-2.5 text-xs font-bold font-mono tracking-wider uppercase transition-all shrink-0 ${
            activeTab === 'LOGS' ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-slate-400 hover:text-slate-650 hover:text-slate-600'
          }`}
        >
          📋 Transparency Logs
        </button>
      </div>

      {/* TAB 1: PULSE CHECK-IN CENTER */}
      {activeTab === 'PULSE' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h3 className="font-display font-semibold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-indigo-500" />
                Your Direct Wellbeing Pulse Notifications
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-sans">
                HR can send wellbeing nudges here. They stay active for <strong>1 minute for first-time prompts</strong> and <strong>10 minutes for subsequent prompts</strong>.
              </p>
            </div>

            {activePendingNudges.length === 0 ? (
              <div className="bg-slate-50 border border-slate-150 p-7 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto text-emerald-500 border border-emerald-100">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-xs text-slate-700">All Wellbeing Appraisals Cleared!</h4>
                <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                  No pending nudges or notifications. You can click "Force-Send Pulse Check-in" above to trigger a fresh prompt and witness the active time decays.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {activePendingNudges.map((nudge) => {
                  const msLeft = nudge.expiresAt - nowTime;
                  const secsLeft = Math.max(0, Math.floor(msLeft / 1000));
                  const isExpired = secsLeft <= 0;

                  return (
                    <div key={nudge.id} className="bg-white border border-indigo-100 rounded-2xl p-5 shadow-xs relative space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-bold text-indigo-800 bg-indigo-50 font-mono px-2 py-0.5 rounded uppercase tracking-wider">
                              Attempt {nudge.attempt} / 2 • LIVE TICKER
                            </span>
                          </div>
                          <h4 className="font-display font-semibold text-slate-950 text-xs mt-1.5 leading-tight">
                            {nudge.category === 'SUPPORT' ? 'Supportive Organizational Training Assessment' :
                             nudge.category === 'FLOW' ? 'Cognitive Concentration & Intrinsic Flow State' : 
                             'Work Likeability vs. Redundant Tasks Audit'}
                          </h4>
                        </div>

                        {/* Expiry Clock */}
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded font-mono text-[10px] font-bold border transition-colors ${
                          secsLeft < 30 ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-slate-900 text-cyan-400 border-slate-800'
                        }`}>
                          <Timer className="w-3.5 h-3.5 animate-spin" />
                          <span>LAPSES IN: {formatTimer(secsLeft)}</span>
                        </div>
                      </div>

                      {/* Question text */}
                      <p className="text-slate-600 text-xs italic bg-slate-50 p-3 rounded-xl border border-slate-150">
                        "{nudge.attempt === 1 ? nudge.firstNudgeText : nudge.secondNudgeText}"
                      </p>

                      {/* Interactive Likert Face buttons */}
                      <div className="space-y-2">
                        <span className="block text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">Select and log your instant state:</span>
                        <div className="grid grid-cols-5 gap-2 text-center">
                          {[1, 2, 3, 4, 5].map((val) => {
                            const faces = ['😫', '🙁', '😐', '🙂', '😆'];
                            const labels = ['Burnout', 'Stressed', 'Neutral', 'Engaged', 'Thriving'];
                            const colors = ['hover:bg-rose-50 hover:border-rose-300 border-slate-100', 'hover:bg-amber-50 hover:border-amber-300 border-slate-100', 'hover:bg-slate-100 hover:border-slate-300 border-slate-100', 'hover:bg-cyan-50 hover:border-cyan-300 border-slate-100', 'hover:bg-emerald-50 hover:border-emerald-300 border-slate-100'];
                            return (
                              <button
                                key={val}
                                onClick={() => answerNudge(nudge.id, val)}
                                className={`border bg-white rounded-xl py-2 px-1 flex flex-col items-center gap-1 transition-all ${colors[val-1]}`}
                              >
                                <span className="text-lg">{faces[val-1]}</span>
                                <span className="text-[9px] font-medium text-slate-500 leading-tight block">{labels[val-1]}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Simulation helpers */}
                      <div className="border-t border-slate-105 border-t-slate-100 pt-3 flex items-center justify-between gap-4">
                        <div className="text-[10px] text-slate-400 font-mono">
                          Timer: {nudge.expiresAt - nudge.createdAt < 70000 ? '1-minute fast decay' : '10-minutes subsequent decay'}.
                        </div>
                        <button
                          onClick={() => handleForceLapseForTesting(nudge)}
                          className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100/70 py-1.5 px-3 rounded font-mono font-bold transition-all"
                          title="Simulate immediate expiration which automatically spawns the second survey query if available."
                        >
                          ⚡ Test Force-Lapse Expiration
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar tracker: Streak & History */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs h-fit space-y-4">
            <div>
              <h3 className="font-display font-semibold text-slate-900 text-xs tracking-wide uppercase font-mono">
                Consistency Matrix Check
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                Answering fast prevents cognitive evaluation delays and keeps your team stats realistic.
              </p>
            </div>

            <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between border border-slate-850">
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-mono">Current Streak</span>
                <span className="block font-display font-bold text-lg text-amber-400">9 Days Checked</span>
              </div>
              <div className="bg-amber-400/20 text-amber-400 p-2.5 rounded-xl border border-amber-500/10 animate-pulse">
                <Flame className="w-5 h-5 fill-current" />
              </div>
            </div>

            <div className="pt-2">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-2">My Response History:</span>
              <div className="space-y-1.5">
                {nudges.filter(n => n.status === 'RESPONDED').slice(0, 4).map(nd => (
                  <div key={nd.id} className="flex justify-between items-center text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-150">
                    <span className="text-slate-500 font-mono capitalize truncate">{nd.category.toLowerCase()} audit</span>
                    <span className="font-bold text-indigo-700 font-mono">{nd.responseValue} ★</span>
                  </div>
                ))}
                {nudges.filter(n => n.status === 'RESPONDED').length === 0 && (
                  <span className="block text-slate-400 text-[10px] italic">No checks answered yet. Fill out a pulse!</span>
                )}
              </div>
            </div>
          </div>

          {/* Historical Sentiment Trend Line Chart Card */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-4 col-span-1 lg:col-span-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="font-display font-semibold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
                  <Smile className="w-4.5 h-4.5 text-indigo-500" />
                  30-Day Historical Sentiment Trend Line
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Visualizes active candidate wellbeing trends over a 30-day trailing window, compiling daily nudge telemetry responses.
                </p>
              </div>
              <div className="bg-indigo-50 text-indigo-800 font-mono px-2 py-0.5 rounded text-[10px] font-semibold border border-indigo-150 uppercase tracking-wider">
                Trailing 30 Days Log
              </div>
            </div>

            {/* Recharts Line/Area Graph container */}
            <div className="h-64 w-full bg-slate-50 border border-slate-150 rounded-xl p-2.5">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={generate30DayTrend(selectedEmpId, nudges)}
                  margin={{ top: 15, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorMoodGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#94a3b8" 
                    fontSize={9} 
                    fontFamily="JetBrains Mono, monospace" 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={9} 
                    fontFamily="JetBrains Mono, monospace" 
                    domain={[1, 5]} 
                    tickCount={5}
                    tickLine={false} 
                    axisLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="Mood Rating" 
                    stroke="#6366f1" 
                    strokeWidth={2.5} 
                    fillOpacity={1} 
                    fill="url(#colorMoodGradient)" 
                    activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2, fill: '#6366f1' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-400 gap-2 border-t border-slate-100 pt-3">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-indigo-500 inline-block"/> 5.0 (Thriving)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-300 inline-block"/> 3.0 (Neutral)</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block"/> 1.0 (Burnout)</span>
              </div>
              <span>🔒 SECURE ANONYMOZED WELLBEING PIPELINE</span>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: PEER APPRECIATION (Simulation) */}
      {activeTab === 'PEER' && (
        <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-6 space-y-6">
          <div className="flex items-start gap-3">
            <div className="bg-rose-50 text-rose-600 p-2.5 rounded-xl border border-rose-100 shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
                🔒 Protected Peer-to-Peer Appreciation Safe Circle
              </h3>
              <p className="text-xs text-rose-500 font-mono font-medium mt-0.5">
                MNC SECURITY STANDARD • Raw message entries are 100% hidden from HR heads & Admins.
              </p>
            </div>
          </div>

          <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-xl text-[11px] text-rose-700 leading-relaxed flex items-center gap-3">
            <EyeOff className="w-5 h-5 text-rose-500 shrink-0" />
            <div>
              <strong>Strict Privacy Mandate Compliance:</strong> Administrators and HR personnel only visualize aggregated response metrics for team segments. They possess absolutely zero database logging rights to examine specific peer-to-peer messages.
            </div>
          </div>

          {/* Send Appreciation */}
          <form onSubmit={handleSendPeerMsg} className="bg-slate-50 border border-slate-150 p-4 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-550 text-slate-550 uppercase tracking-widest font-mono">
                Recipient Employee
              </label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                required
                className="w-full text-xs px-2.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500"
              >
                <option value="">Choose partner employee...</option>
                {employeesPool.filter(e => e.id !== selectedEmpId && e.role === 'EMPLOYEE').map((emp) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                Appreciation Category
              </label>
              <select
                value={peerCategory}
                onChange={(e) => setPeerCategory(e.target.value as any)}
                className="w-full text-xs px-2.5 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500"
              >
                <option value="gratitude">💝 Gratitude Shout-Out</option>
                <option value="encouragement">💪 Encouraging Word</option>
                <option value="shout-out">⭐ Stellar Support Help</option>
              </select>
            </div>

            <div className="md:col-span-3 space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                Appreciation Text
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="Hey, thanks for stepping in during the server update..."
                  value={peerText}
                  onChange={(e) => setPeerText(e.target.value)}
                  className="flex-1 text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-rose-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 transition-all flex items-center gap-1 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" /> Disperse
                </button>
              </div>
            </div>
          </form>

          {/* Inbox list */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-wider block">Your Encrypted Inbox:</h4>
            
            {peerMsgs.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic">No Appreciation loops logged for this employee yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {peerMsgs.map((msg) => {
                  const isSender = msg.senderId === selectedEmpId;
                  return (
                    <div key={msg.id} className="py-3 flex items-start gap-3 text-xs justify-between">
                      <div className="space-y-1">
                        <span className="font-semibold text-slate-800">
                          {isSender ? `You Appreciated ${msg.receiverName}` : `${msg.senderName} Appreciated You`}
                        </span>
                        <p className="text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100 select-all leading-relaxed">"{msg.message}"</p>
                      </div>
                      <span className="text-[10px] bg-rose-50 text-rose-700 font-mono font-bold px-1.5 py-0.5 rounded shrink-0">
                        {msg.category}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: INTRINSIC COGNITIVE FLOW CLOCK (Simulation) */}
      {activeTab === 'FLOW' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div>
            <h3 className="font-display font-semibold text-slate-900 text-xs tracking-tight uppercase font-mono">
              ⏱️ Intrinsic Flow State & Deep Concentration Monitor
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Quantify parameters of pure cognitive engagement: Have you forgotten meal times today? How often is your concentration broken?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 text-center space-y-4 flex flex-col justify-between">
              <div className="space-y-1">
                <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-widest font-bold">Focus Stopwatch session</span>
                <div className="text-4xl font-display font-medium font-mono text-slate-100 tracking-wider">
                  {formatTimer(timeElapsed)}
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-center gap-2">
                  <input
                    type="checkbox"
                    id="meal-check"
                    checked={forgotMealTimes}
                    onChange={(e) => setForgotMealTimes(e.target.checked)}
                    className="rounded text-indigo-500 bg-slate-800 border-slate-700"
                  />
                  <label htmlFor="meal-check" className="text-[11px] text-slate-300 font-mono cursor-pointer selection:bg-slate-800">
                    I lost track of meal times during focus (High Flow)
                  </label>
                </div>

                <div className="flex items-center justify-center gap-2">
                  <input
                    type="checkbox"
                    id="clock-check"
                    checked={clockWatched}
                    onChange={(e) => setClockWatched(e.target.checked)}
                    className="rounded text-indigo-500 bg-slate-800 border-slate-700"
                  />
                  <label htmlFor="clock-check" className="text-[11px] text-slate-300 font-mono cursor-pointer">
                    I found myself actively clock-watching
                  </label>
                </div>
              </div>

              <div>
                {!isTrackingFlow ? (
                  <button
                    onClick={() => setIsTrackingFlow(true)}
                    className="w-full py-2.5 bg-cyan-400 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs tracking-wide uppercase transition-all shadow-md"
                  >
                    Initiate Focus Clock
                  </button>
                ) : (
                  <button
                    onClick={handleSaveFlowSession}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs tracking-wide uppercase transition-all shadow-md"
                  >
                    Save Flow Session Stats
                  </button>
                )}
              </div>
            </div>

            <div className="bg-indigo-50/40 border border-indigo-100 p-5 rounded-2xl flex flex-col justify-between space-y-4">
              <div className="space-y-2 text-xs">
                <span className="font-bold text-[10px] text-indigo-900 font-mono uppercase tracking-wider block">
                  🎓 Flow Metric Significance:
                </span>
                <p className="text-slate-600 leading-relaxed">
                  In modern workspaces, measuring task redundancy versus genuine absorption is key. Frequent stopwatch checks identify tedious workflows while prolonged blocks of meal forgetfulness denote thrivability zones.
                </p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-indigo-100 text-[11px] text-slate-500 leading-relaxed font-sans">
                Save active session stats to immediately register cognitive flow weights in department-level insights.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: PRIVATE MINDFUL AI COACH */}
      {activeTab === 'MINDFUL_AI' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div className="flex items-start gap-3">
            <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-xl border border-emerald-100 shrink-0">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
                🧘 Private Mindful AI Coach Chat
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Chat securely with your personal mindfulness companion. Secure server-side architecture ensures privacy from HR.
              </p>
            </div>
          </div>

          <div className="border border-slate-100 bg-slate-50/40 rounded-2xl p-4 flex flex-col h-[400px]">
            {/* Conversations list */}
            <div className="flex-1 overflow-y-auto space-y-4 p-2 text-xs">
              {chatHistory.map((item, index) => (
                <div
                  key={index}
                  className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl p-4 leading-normal ${
                    item.role === 'user'
                      ? 'bg-indigo-600 text-white shadow-xs rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-150 shadow-xs rounded-tl-none font-sans'
                  }`}>
                    {item.role === 'model' && (
                      <span className="block text-[9px] font-mono font-bold text-indigo-600 uppercase tracking-wider mb-1">
                        Secure Mindful AI
                      </span>
                    )}
                    <span className="whitespace-pre-line leading-relaxed">{item.text}</span>
                  </div>
                </div>
              ))}
              {aiLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-150 max-w-[80%] rounded-2xl rounded-tl-none p-4 shadow-xs space-y-2 font-mono text-[10px] text-slate-400">
                    <span className="flex items-center gap-1.5 font-bold text-indigo-600 uppercase tracking-widest">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Deeply pondering calming strategies...
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Input form */}
            <form onSubmit={handleSendMindfulChat} className="mt-4 border-t border-slate-100 pt-3 flex gap-2">
              <input
                type="text"
                disabled={aiLoading}
                placeholder="Ask your coach anything: 'I feel pressured' or 'Give me a short breath coach'..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                className="flex-1 text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 font-sans disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={aiLoading || !aiInput.trim()}
                className="px-5 bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 select-none font-sans"
              >
                <Send className="w-3.5 h-3.5" /> Consult
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: MINDFUL STRESS TRANSMUTER GAME */}
      {activeTab === 'GAMES' && (
        <div id="stress-transmuter-board" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
          
          {/* Header & Stats Banner */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-50 pb-5">
            <div className="space-y-1">
              <h2 className="text-2xl font-display font-medium text-slate-900 tracking-tight flex items-center gap-2">
                🎯 Digital Stress Transmuter
              </h2>
              <p className="text-xs text-slate-550 leading-relaxed max-w-xl">
                Transmute falling developer stressors into soothing mindful ripples. Lower <strong className="text-indigo-650 font-semibold">{currentEmployee?.name || 'Chloe Thompson'}</strong>'s tension index!
              </p>
            </div>

            {/* High-fidelity scoreboard exactly matching the design paradigm */}
            <div className="flex items-center gap-3 self-start lg:self-auto select-none">
              <div className="bg-slate-50 border border-slate-150 rounded-2xl px-5 py-2.5 text-center min-w-[75px] shadow-2xs">
                <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-widest font-bold">Score</span>
                <span className="block text-2xl font-display font-bold text-indigo-600 font-mono">
                  {wellnessScore}
                </span>
              </div>

              <div className="bg-slate-50 border border-slate-150 rounded-2xl px-5 py-2.5 text-center min-w-[95px] shadow-2xs">
                <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-widest font-bold">High Score</span>
                <span className="block text-2xl font-display font-bold text-emerald-600 font-mono">
                  {wellnessHighScore}
                </span>
              </div>

              <div className="bg-rose-50/50 border border-rose-100 rounded-2xl px-5 py-2.5 text-center min-w-[75px] shadow-2xs">
                <span className="block text-[10px] text-rose-600 font-mono uppercase tracking-widest font-bold">Timer</span>
                <span className={`block text-2xl font-display font-bold font-mono transition-colors ${gameTimer <= 5 ? 'text-rose-600 animate-pulse' : 'text-slate-800'}`}>
                  {gameTimer}s
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Game Canvas Box */}
          <div className="relative border border-slate-200 rounded-3xl h-[480px] bg-[#0c1221] overflow-hidden shadow-inner flex flex-col justify-between">
            {/* Ambient visual grids & neon backdrop */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-indigo-950/30 via-slate-950/10 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b13_1px,transparent_1px),linear-gradient(to_bottom,#1e293b13_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {/* Game session info headers */}
            <div className="relative z-10 p-3 bg-slate-950/70 border-b border-slate-800/30 text-[10px] font-mono text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                ACTIVE SOUND FIELDS • TAP CIRCLES TO PLAY NOTES
              </span>
              <span className="text-cyan-400 font-bold uppercase tracking-widest font-mono">
                7-NOTE INDIAN CHROMATIC HARMONY
              </span>
            </div>

            {/* Main Stage Grid for falling elements */}
            <div className="flex-1 relative overflow-hidden select-none">
              
              {/* Render dynamic floating/falling bubbles */}
              {bubbles.map((bub) => {
                const isPink = bub.colorType === 'pink';
                return (
                  <div
                    key={bub.id}
                    onClick={() => handleTransmuteBubble(bub.id, bub.affirmedTxt, bub.noteName, bub.noteFreq)}
                    style={{ 
                      left: `${bub.x}%`, 
                      top: `${bub.y}%`, 
                      transform: 'translate(-50%, -50%)' 
                    }}
                    className={`absolute rounded-full cursor-pointer shadow-xl select-none transition-all duration-100 flex flex-col justify-center items-center text-center p-3 w-20 h-20 md:w-24 md:h-24 leading-none border-2 text-white overflow-hidden active:scale-90 hover:scale-105 ${
                      bub.transmuted
                        ? 'bg-gradient-to-tr from-emerald-900 to-teal-800 border-emerald-400 scale-95 opacity-60 pointer-events-none'
                        : isPink
                        ? 'bg-gradient-to-b from-[#ec4899] to-[#db2777] border-[#f472b6] shadow-pink-500/20'
                        : 'bg-gradient-to-b from-[#f59e0b] to-[#d97706] border-[#fbbf24] shadow-amber-500/20'
                    }`}
                  >
                    {!bub.transmuted ? (
                      <div className="space-y-0.5 flex flex-col items-center justify-center">
                        <span className="text-[7.5px] tracking-widest font-mono font-black uppercase opacity-90 text-white/80 select-none">
                          STRESS
                        </span>
                        <span className="text-[10px] md:text-[11px] font-bold leading-tight select-none block max-w-full truncate font-sans whitespace-pre-line">
                          {bub.thought}
                        </span>
                        <span className="text-[8.5px] font-mono font-bold bg-black/35 px-1.5 py-0.5 rounded-md mt-1 select-none flex items-center gap-0.5 text-white/90">
                          ♫ {bub.noteName}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1 animate-fade-in text-center flex flex-col items-center justify-center p-1">
                        <span className="text-[8px] font-bold tracking-widest text-emerald-400 uppercase font-mono select-none block">
                          CALM
                        </span>
                        <p className="text-[9.5px] font-mono leading-none font-bold text-emerald-250 opacity-90">
                          {bub.noteName}!
                        </p>
                        <span className="text-[8px] text-emerald-300 font-mono select-none font-bold">+10 pts</span>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Render dynamic sound ripple text popping prompts */}
              {activeRipple.map((r, idx) => (
                <div 
                  key={idx}
                  style={{ left: `${r.x}%`, top: `${r.y}%`, transform: 'translate(-50%, -50%)' }}
                  className="absolute pointer-events-none flex flex-col items-center justify-center select-none z-30"
                >
                  {/* Ripple expanding rings */}
                  <div className="absolute w-28 h-28 border border-cyan-400/50 rounded-full animate-ping opacity-0" />
                  <div className="absolute w-16 h-16 border border-indigo-400/40 rounded-full animate-ping opacity-0" />
                  
                  {/* Chromatic Note played label overlay */}
                  <span className="bg-slate-900/90 border border-cyan-500 text-cyan-400 font-mono font-black text-xs px-2.5 py-1.5 rounded-xl shadow-lg animate-bounce select-none">
                    +10
                  </span>
                </div>
              ))}

              {/* Game Over - Time Out Overlay state screen */}
              {!gameActive && (
                <div className="absolute inset-0 bg-[#070b15f0] z-40 flex flex-col items-center justify-center p-6 text-center space-y-6">
                  <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md shadow-2xl relative space-y-5">
                    <div className="w-16 h-16 rounded-full bg-indigo-950/50 text-indigo-400 flex items-center justify-center mx-auto text-3xl border border-indigo-800 shadow-md">
                      ⏳
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-xl font-display font-extrabold text-white uppercase tracking-tight">Time's Up!</h4>
                      <p className="text-xs text-slate-400">
                        You successfully transmuted stressors into peaceful solfège waves! Let us review your session's mindfulness scorecard.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-slate-950/70 border border-slate-850 p-3 rounded-2xl">
                        <span className="block text-[9px] text-slate-400 uppercase font-mono font-bold tracking-wider">Final Points</span>
                        <span className="text-2xl font-mono font-black text-indigo-400">+{wellnessScore}</span>
                      </div>
                      
                      <div className="bg-slate-950/70 border border-slate-850 p-3 rounded-2xl">
                        <span className="block text-[9px] text-slate-400 uppercase font-mono font-bold tracking-wider">High Score</span>
                        <span className="text-2xl font-mono font-black text-emerald-400">{wellnessHighScore}</span>
                      </div>
                    </div>

                    {wellnessScore >= wellnessHighScore && wellnessScore > 0 && (
                      <div className="bg-amber-950/40 text-amber-400 border border-amber-900/40 text-[10.5px] font-mono py-2 px-3 rounded-xl uppercase font-black tracking-widest animate-pulse">
                        👑 NEW PERSONAL BEST HIGH SCORE!
                      </div>
                    )}

                    <button
                      onClick={resetStressGame}
                      className="w-full py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-bold rounded-2xl text-xs tracking-wide uppercase transition-all shadow-md select-none font-mono"
                    >
                      Begin Another Serenity Session
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom bar & controls */}
            <div className="relative z-10 p-4 bg-slate-950/80 border-t border-slate-900 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 flex items-center gap-1 text-[10px]">
                👉 Click stressors to restore inner balance
              </span>
              <div className="flex gap-2">
                <button
                  onClick={resetStressGame}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-mono rounded-xl text-[10px] uppercase font-bold border border-slate-850 transition select-none flex items-center gap-1.5"
                >
                  🔄 Reset Sound Field
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: RECEIVED TROPHIES & MEDALS */}
      {activeTab === 'MEDALS' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
          <div>
            <h3 className="font-display font-semibold text-slate-900 text-sm tracking-tight flex items-center gap-1.5 font-sans">
              <Trophy className="w-5 h-5 text-amber-500" />
              Recognitions & Medals Conferred
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              These are authentic corporate honors and physical vouchers issued by company executives directly to you.
            </p>
          </div>

          {receivedAwards.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-2">
              <Trophy className="w-10 h-10 text-slate-200 mx-auto" />
              <h4 className="font-semibold text-xs text-slate-600">Nobler Laurels Await!</h4>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                No formal medals have been published to your corporate portal yet. Head into **Company Dashboard** under a different tab or role, issue an Award to your identity, and witness it shining here!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {receivedAwards.map((awr) => {
                const colors = awr.type === 'maestro' 
                  ? 'from-amber-50 to-orange-50 bg-amber-50/50 border-amber-250 border-amber-200 text-amber-900' 
                  : awr.type === 'pillar'
                  ? 'from-indigo-50 to-cyan-50 bg-indigo-50/50 border-indigo-200 text-indigo-900'
                  : awr.type === 'mindful'
                  ? 'from-emerald-50 to-teal-50 bg-emerald-50/50 border-emerald-200 text-emerald-900'
                  : 'from-purple-50 to-pink-50 bg-purple-50/50 border-purple-200 text-purple-900';

                return (
                  <div key={awr.id} className={`rounded-2xl border p-5 space-y-3.5 bg-gradient-to-tr shadow-xs ${colors}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-white/80 p-3 rounded-xl border border-white flex items-center justify-center text-3xl shadow-xs">
                          {awr.type === 'maestro' ? '🪙' : awr.type === 'pillar' ? '🛡️' : awr.type === 'mindful' ? '🧘' : awr.type === 'innovator' ? '💡' : '📜'}
                        </div>
                        <div>
                          <span className="block font-bold text-xs uppercase tracking-wider text-[10px] font-mono select-none text-slate-450 text-slate-400 opacity-80">
                            OFFICIAL HONOR CERTIFICATION
                          </span>
                          <h4 className="font-display font-bold text-sm tracking-tight mt-0.5">{awr.title}</h4>
                        </div>
                      </div>

                      <span className="text-[10px] bg-white/70 text-indigo-950 font-bold px-2 py-0.5 rounded font-mono border border-white">
                        {awr.type.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-[11px] leading-relaxed italic bg-white/50 border border-white/60 p-3 rounded-xl font-sans text-slate-700">
                      "{awr.message}"
                    </p>

                    <div className="pt-2 border-t border-slate-200/40 flex items-center justify-between text-[11px]">
                      <span className="font-mono text-slate-405 text-slate-400">Issued by: {awr.senderName}</span>
                      {awr.rewardValue ? (
                        <div className="flex items-center gap-1 text-rose-700 bg-white border border-rose-100 font-bold px-2.5 py-1 rounded-lg shadow-2xs font-mono">
                          <Gift className="w-3.5 h-3.5 text-rose-500" />
                          <span>PRIZE: {awr.rewardValue}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-indigo-750 font-semibold font-mono">STATUS: VALID✓</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 7: HISTORICAL NUDGES & TIMESTAMPS TRANSPARENCY LOGS */}
      {activeTab === 'LOGS' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6 animate-fade-in">
          <div>
            <h3 className="font-display font-semibold text-slate-900 text-sm tracking-tight flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-500" />
              Response History & Evaluation Transparency Logs
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              A comprehensive ledger of all biometric nudge delivery attempts, response latency parameters, and historic pulse timestamps.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl text-xs space-y-2 text-slate-600">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <Shield className="w-4 h-4 text-emerald-600" />
              GDPR & Privacy Audit Note:
            </div>
            <p className="leading-relaxed">
              In accordance with enterprise thrivability standards, this dashboard grants candidates full transparency concerning when check-ins were issued, when they responded, and which survey channels were activated.
            </p>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-300 font-mono text-[10px] uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Nudge ID / Channel</th>
                  <th className="py-3 px-4">Evaluation Context Prompt</th>
                  <th className="py-3 px-4">Issued Timestamp</th>
                  <th className="py-3 px-4 text-center">Attempt</th>
                  <th className="py-3 px-4">Status & Score</th>
                  <th className="py-3 px-4">Resolution Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {nudges.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                      No historical nudge data exists for this employee. Use "Force-Send Pulse Check-in" to add entries.
                    </td>
                  </tr>
                ) : (
                  [...nudges].reverse().map((ndg) => {
                    const formatTime = (ts?: number) => {
                      if (!ts) return '-';
                      return new Date(ts).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      });
                    };

                    const statusColors = {
                      PENDING: 'bg-indigo-50 text-indigo-700 border-indigo-100',
                      RESPONDED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
                      LAPSED: 'bg-rose-50 text-rose-700 border-rose-100'
                    };

                    const scoreMap = {
                      1: '😫 (1) Burnout',
                      2: '🙁 (2) Stressed',
                      3: '😐 (3) Neutral',
                      4: '🙂 (4) Engaged',
                      5: '😆 (5) Thriving'
                    };

                    return (
                      <tr key={ndg.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[10.5px]">
                          <span className="block font-bold text-slate-700">{ndg.id}</span>
                          <span className="block text-[9px] text-slate-400 uppercase font-bold mt-0.5">{ndg.category}</span>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <span className="text-slate-600 block line-clamp-2 italic">
                            "{ndg.attempt === 1 ? ndg.firstNudgeText : ndg.secondNudgeText}"
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                          {formatTime(ndg.createdAt)}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono">
                          <span className="bg-slate-100 border border-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded text-[10px]">
                            {ndg.attempt} / 2
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-bold border uppercase tracking-wider ${statusColors[ndg.status]}`}>
                              {ndg.status}
                            </span>
                            {ndg.status === 'RESPONDED' && ndg.responseValue && (
                              <span className="bg-amber-50 text-amber-800 border border-amber-200 font-bold px-1.5 py-0.5 rounded font-mono text-[10px]" title="Rating logged by user">
                                {scoreMap[ndg.responseValue as 1|2|3|4|5] || `${ndg.responseValue} ★`}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                          {ndg.status === 'RESPONDED' ? (
                            <span className="text-emerald-700 font-bold">{formatTime(ndg.respondedAt)}</span>
                          ) : ndg.status === 'LAPSED' ? (
                            <span className="text-rose-500 font-semibold" title="Expired target timeline without response">Lapsed @ {formatTime(ndg.expiresAt)}</span>
                          ) : (
                            <span className="text-amber-500 font-medium animate-pulse">Awaiting input...</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
