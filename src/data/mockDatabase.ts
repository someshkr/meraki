/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Department, Employee, RegistrationRequest, EmployeeNudge, PeerInteraction, CompanyConfig, TrialInvite, RoadmapGoal, Award } from '../types';

const INITIAL_AWARDS: Award[] = [
  {
    id: 'awd-1',
    employeeId: 'emp-sarah',
    senderName: 'Executive Admin',
    type: 'maestro',
    title: 'Flow Maestro Medal',
    message: 'Sarah achieved flawless cognitive flow score during the system sprint!',
    rewardValue: 'Extra Paid Day Off',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'awd-2',
    employeeId: 'emp-john',
    senderName: 'Executive Admin',
    type: 'pillar',
    title: 'Stress Transmuter Champion',
    message: 'John successfully completed all stress transmutation modules and supported the sales segment.',
    rewardValue: '$50 Wellness Voucher',
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  }
];


const INITIAL_DEPARTMENTS: Department[] = [
  {
    id: 'dept-eng',
    name: 'Engineering & Systems',
    manager: 'Sarah Chen, CTO',
    sentiment: 'happy',
    happinessRating: 72,
    responseRate: 88,
    supportiveExperience: 74,
    workLikeability: 70,
    intrinsicFlow: 82, // High flow
    headcount: 14
  },
  {
    id: 'dept-sales',
    name: 'Sales & Customer Acquisition',
    manager: 'Marcus Vance, VP Sales',
    sentiment: 'sad',
    happinessRating: 46, // Sad sentiment
    responseRate: 92,
    supportiveExperience: 40, // Lack of support/training
    workLikeability: 52,
    intrinsicFlow: 45, // Interrupted, clock-watching
    headcount: 18
  },
  {
    id: 'dept-cust',
    name: 'Customer Experience & Success',
    manager: 'Elena Rostova, Director CX',
    sentiment: 'neutral',
    happinessRating: 59, // Neutral
    responseRate: 74,
    supportiveExperience: 58,
    workLikeability: 62,
    intrinsicFlow: 54,
    headcount: 12
  },
  {
    id: 'dept-hr',
    name: 'People Operations & Culture',
    manager: 'Diana Prince, HR Head',
    sentiment: 'very-happy',
    happinessRating: 91,
    responseRate: 95,
    supportiveExperience: 94,
    workLikeability: 88,
    intrinsicFlow: 90,
    headcount: 5
  },
  {
    id: 'dept-prod',
    name: 'Product & UX Design',
    manager: 'Kenji Sato, VP Product',
    sentiment: 'happy',
    happinessRating: 78,
    responseRate: 85,
    supportiveExperience: 76,
    workLikeability: 80,
    intrinsicFlow: 78,
    headcount: 8
  }
];

const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'emp-sarah',
    name: 'Sarah Chen',
    email: 'sarah.chen@acme.com',
    employeeId: 'ACM-2041',
    departmentId: 'dept-eng',
    role: 'EMPLOYEE',
    status: 'APPROVED',
    accessMode: 'FULL',
    journeyStep: 4,
    joinedAt: '2025-01-15'
  },
  {
    id: 'emp-john',
    name: 'John Doe',
    email: 'john.doe@acme.com',
    employeeId: 'ACM-2042',
    departmentId: 'dept-sales',
    role: 'EMPLOYEE',
    status: 'APPROVED',
    accessMode: 'TRIAL',
    journeyStep: 2,
    joinedAt: '2025-05-10'
  },
  {
    id: 'emp-elena',
    name: 'Elena Rostova',
    email: 'elena.r@acme.com',
    employeeId: 'ACM-2045',
    departmentId: 'dept-cust',
    role: 'EMPLOYEE',
    status: 'APPROVED',
    accessMode: 'FULL',
    journeyStep: 3,
    joinedAt: '2025-03-22'
  },
  {
    id: 'emp-david',
    name: 'David Low',
    email: 'david.low@acme.com',
    employeeId: 'ACM-2049',
    departmentId: 'dept-sales',
    role: 'EMPLOYEE',
    status: 'APPROVED',
    accessMode: 'FULL',
    journeyStep: 1,
    joinedAt: '2025-05-18'
  },
  {
    id: 'emp-hrhead',
    name: 'Diana Prince',
    email: 'diana.p@acme.com',
    employeeId: 'ACM-1001',
    departmentId: 'dept-hr',
    role: 'HR_HEAD',
    status: 'APPROVED',
    accessMode: 'FULL',
    journeyStep: 5,
    joinedAt: '2024-06-01'
  }
];

const INITIAL_REGISTRATION_REQUESTS: RegistrationRequest[] = [
  {
    id: 'req-1',
    email: 'alice.m@acme.com',
    name: 'Alice Miller',
    employeeId: 'ACM-3081',
    companyName: 'Acme Corp',
    departmentId: 'dept-eng',
    requestedAt: '2026-06-09T14:32:00Z',
    status: 'pending'
  },
  {
    id: 'req-2',
    email: 'ray.park@acme.com',
    name: 'Ray Park',
    employeeId: 'ACM-3082',
    companyName: 'Acme Corp',
    departmentId: 'dept-sales',
    requestedAt: '2026-06-10T05:10:00Z',
    status: 'pending'
  }
];

const RESEARCH_QUESTIONS_POOL = {
  SUPPORT: {
    firstNudge: 'Nudge 1/2: Do you feel you have received the necessary support and feedback to excel in your tasks today?',
    secondNudge: 'Nudge 2/2: (Follow-up) Since you missed the last pulse check, we wanted to briefly ask: Is a lack of support or training currently holding you back?',
    questionText: 'Do you feel supported, equipped, and trained to perform your role without friction?'
  },
  LIKEABILITY: {
    firstNudge: 'Nudge 1/2: Reflecting on your tasks today, to what extent do you feel you genuinely like your work, as opposed to feeling repulsed or exhausted by it?',
    secondNudge: 'Nudge 2/2: (Follow-up) Continuing from earlier: Are you encountering redundant tasks or work that feels internally repulsive?',
    questionText: 'Measure of Work Likeability vs Work Repulsiveness (intrinsic task alignment)'
  },
  FLOW: {
    firstNudge: 'Nudge 1/2: Nudge Theory Survey: Have you been so engrossed in your projects today that you forgot about meal times or lost track of clock-watching?',
    secondNudge: 'Nudge 2/2: (Follow-up) Intrinsic Flow check: Are you feeling deeply engaged, or does each hour feel long and clock-centered?',
    questionText: 'Measurement of Intrinsic Flow and deep cognitive immersion'
  }
};

const INITIAL_NUDGES: EmployeeNudge[] = [
  // Sarah has responded to some nudges
  {
    id: 'ndg-1',
    employeeId: 'emp-sarah',
    category: 'SUPPORT',
    questionText: RESEARCH_QUESTIONS_POOL.SUPPORT.questionText,
    firstNudgeText: RESEARCH_QUESTIONS_POOL.SUPPORT.firstNudge,
    secondNudgeText: RESEARCH_QUESTIONS_POOL.SUPPORT.secondNudge,
    attempt: 1,
    status: 'RESPONDED',
    createdAt: Date.now() - 4 * 3600 * 1000,
    expiresAt: Date.now() - 3.9 * 3600 * 1000,
    responseValue: 5, // very happy
    respondedAt: Date.now() - 3.95 * 3600 * 1000
  },
  {
    id: 'ndg-2',
    employeeId: 'emp-sarah',
    category: 'FLOW',
    questionText: RESEARCH_QUESTIONS_POOL.FLOW.questionText,
    firstNudgeText: RESEARCH_QUESTIONS_POOL.FLOW.firstNudge,
    secondNudgeText: RESEARCH_QUESTIONS_POOL.FLOW.secondNudge,
    attempt: 1,
    status: 'RESPONDED',
    createdAt: Date.now() - 2 * 3600 * 1000,
    expiresAt: Date.now() - 1.9 * 3600 * 1000,
    responseValue: 4, // happy
    respondedAt: Date.now() - 1.95 * 3600 * 1000
  },
  // David in Sales has some lapsed/pending nudges, causing poor team metrics
  {
    id: 'ndg-3',
    employeeId: 'emp-david',
    category: 'SUPPORT',
    questionText: RESEARCH_QUESTIONS_POOL.SUPPORT.questionText,
    firstNudgeText: RESEARCH_QUESTIONS_POOL.SUPPORT.firstNudge,
    secondNudgeText: RESEARCH_QUESTIONS_POOL.SUPPORT.secondNudge,
    attempt: 1,
    status: 'LAPSED', // didn't respond to first nudge, which then lapsed
    createdAt: Date.now() - 12 * 3600 * 1000,
    expiresAt: Date.now() - 11.95 * 3600 * 1000,
  },
  {
    id: 'ndg-4',
    employeeId: 'emp-david',
    category: 'SUPPORT',
    questionText: RESEARCH_QUESTIONS_POOL.SUPPORT.questionText,
    firstNudgeText: RESEARCH_QUESTIONS_POOL.SUPPORT.firstNudge,
    secondNudgeText: RESEARCH_QUESTIONS_POOL.SUPPORT.secondNudge,
    attempt: 2, // triggered second reminder!
    status: 'PENDING', // currently waiting for action
    createdAt: Date.now() - 1000, // just now
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes from now for live demo trigger
  },
  // John has an active first nudge
  {
    id: 'ndg-5',
    employeeId: 'emp-john',
    category: 'LIKEABILITY',
    questionText: RESEARCH_QUESTIONS_POOL.LIKEABILITY.questionText,
    firstNudgeText: RESEARCH_QUESTIONS_POOL.LIKEABILITY.firstNudge,
    secondNudgeText: RESEARCH_QUESTIONS_POOL.LIKEABILITY.secondNudge,
    attempt: 1,
    status: 'PENDING',
    createdAt: Date.now() - 30 * 1000,
    expiresAt: Date.now() + 2 * 60 * 1000 // expires soon
  },
  // Lapsed nudge for Elena
  {
    id: 'ndg-6',
    employeeId: 'emp-elena',
    category: 'FLOW',
    questionText: RESEARCH_QUESTIONS_POOL.FLOW.questionText,
    firstNudgeText: RESEARCH_QUESTIONS_POOL.FLOW.firstNudge,
    secondNudgeText: RESEARCH_QUESTIONS_POOL.FLOW.secondNudge,
    attempt: 1,
    status: 'LAPSED',
    createdAt: Date.now() - 24 * 3600 * 1000,
    expiresAt: Date.now() - 23.9 * 3600 * 1000,
  }
];

const INITIAL_PEER_INTERACTIONS: PeerInteraction[] = [
  {
    id: 'ptp-1',
    senderId: 'emp-sarah',
    receiverId: 'emp-elena',
    senderName: 'Sarah Chen',
    receiverName: 'Elena Rostova',
    message: 'Thanks Elena for help resolving that critical server incident at 2 AM. Your supportive organizational experience is legendary!',
    category: 'gratitude',
    timestamp: '2026-06-09T18:45:00Z'
  },
  {
    id: 'ptp-2',
    senderId: 'emp-john',
    receiverId: 'emp-david',
    senderName: 'John Doe',
    receiverName: 'David Low',
    message: 'Hey David, super helpful presentation on key feedback loops in active customer engagement. Keep up the high flow!',
    category: 'encouragement',
    timestamp: '2026-06-10T02:30:00Z'
  }
];

const INITIAL_ROADMAP_GOALS: RoadmapGoal[] = [
  {
    id: 'rm-1',
    timeline: 'SHORT',
    title: 'Automated Micro-Pulse Nudge Scheduler',
    description: 'Provide daily calendar-integrated nudges to minimize time decay and prevent notification fatigue using Nudge Theory principles.',
    status: 'RELEASED'
  },
  {
    id: 'rm-2',
    timeline: 'SHORT',
    title: 'Transparent Metrics Calculation Engine',
    description: 'Ensure administrators see complete details and raw calculations of how Department Health and Happiness index numbers are computed, showing count of neutral, happy, and sad responses.',
    status: 'RELEASED'
  },
  {
    id: 'rm-3',
    timeline: 'MEDIUM',
    title: 'AI Grounded Cognitive Flow Optimization',
    description: 'Integrate deep organizational flow recommendation engines to automatically snooze and reschedule internal slack/email interruptions during high-immersion zones.',
    status: 'IN_DEVELOPMENT'
  },
  {
    id: 'rm-4',
    timeline: 'MEDIUM',
    title: 'Anonymized Peer Support Circles',
    description: 'Unlock secure peer-to-peer micro-support avenues with zero HR telemetry or logging, enabling secure and raw employee-only interactions.',
    status: 'PLANNED'
  },
  {
    id: 'rm-5',
    timeline: 'LONG',
    title: 'Cross-MNC Wellbeing Benchmark Map',
    description: 'Compare department performance and supportive experience structures against global industry leaders, validating best-of-class engagement scores.',
    status: 'PLANNED'
  }
];

const INITIAL_TRIAL_INVITES: TrialInvite[] = [
  {
    id: 'inv-1',
    email: 'hr.director@spacex.com',
    companyName: 'SpaceX Innovations',
    invitedBy: 'Super Admin',
    mode: 'TRIAL',
    code: 'DEMO-9912',
    createdAt: '2026-06-09T10:00:00Z',
    expiresAt: '2026-06-23T10:00:00Z'
  },
  {
    id: 'inv-2',
    email: 'peoplesupport@netflix.com',
    companyName: 'Netflix StreamOps',
    invitedBy: 'Super Admin',
    mode: 'FULL',
    code: 'FULL-8841',
    createdAt: '2026-06-10T04:15:00Z',
    expiresAt: '2026-09-10T04:15:00Z'
  }
];

const INITIAL_COMPANY_CONFIG: CompanyConfig = {
  id: 'acme-corp',
  name: 'Acme Corp',
  nudgeExpiryMinutes: 3, // fast for demo evaluation purposes!
  streakCount: 8
};

// State wrappers
export class MockDatabase {
  private static getStored<T>(key: string, defaults: T): T {
    try {
      const stored = localStorage.getItem(`wbm_${key}`);
      return stored ? JSON.parse(stored) : defaults;
    } catch {
      return defaults;
    }
  }

  private static setStored<T>(key: string, data: T): void {
    localStorage.setItem(`wbm_${key}`, JSON.stringify(data));
  }

  public static getDepartments(): Department[] {
    return this.getStored<Department[]>('departments', INITIAL_DEPARTMENTS);
  }

  public static saveDepartments(depts: Department[]): void {
    this.setStored('departments', depts);
  }

  public static getEmployees(): Employee[] {
    return this.getStored<Employee[]>('employees', INITIAL_EMPLOYEES);
  }

  public static saveEmployees(employees: Employee[]): void {
    this.setStored('employees', employees);
  }

  public static getRegistrationRequests(): RegistrationRequest[] {
    return this.getStored<RegistrationRequest[]>('registration_requests', INITIAL_REGISTRATION_REQUESTS);
  }

  public static saveRegistrationRequests(reqs: RegistrationRequest[]): void {
    this.setStored('registration_requests', reqs);
  }

  public static getNudges(): EmployeeNudge[] {
    return this.getStored<EmployeeNudge[]>('nudges', INITIAL_NUDGES);
  }

  public static saveNudges(nudges: EmployeeNudge[]): void {
    this.setStored('nudges', nudges);
  }

  public static getPeerInteractions(): PeerInteraction[] {
    // Strictly Employee-to-Employee, hidden from HR
    return this.getStored<PeerInteraction[]>('peer_interactions', INITIAL_PEER_INTERACTIONS);
  }

  public static savePeerInteractions(interactions: PeerInteraction[]): void {
    this.setStored('peer_interactions', interactions);
  }

  public static getRoadmap(): RoadmapGoal[] {
    return this.getStored<RoadmapGoal[]>('roadmap', INITIAL_ROADMAP_GOALS);
  }

  public static saveRoadmap(goals: RoadmapGoal[]): void {
    this.setStored('roadmap', goals);
  }

  public static getTrialInvites(): TrialInvite[] {
    return this.getStored<TrialInvite[]>('trial_invites', INITIAL_TRIAL_INVITES);
  }

  public static saveTrialInvites(invites: TrialInvite[]): void {
    this.setStored('trial_invites', invites);
  }

  public static getCompanyConfig(): CompanyConfig {
    return this.getStored<CompanyConfig>('company_config', INITIAL_COMPANY_CONFIG);
  }

  public static saveCompanyConfig(config: CompanyConfig): void {
    this.setStored('company_config', config);
  }

  public static getAwards(): Award[] {
    return this.getStored<Award[]>('awards', INITIAL_AWARDS);
  }

  public static saveAwards(awards: Award[]): void {
    this.setStored('awards', awards);
  }

  public static giveAward(employeeId: string, senderName: string, type: Award['type'], title: string, message: string, rewardValue?: string): Award {
    const awards = this.getAwards();
    const newAward: Award = {
      id: `awd-${Math.random().toString(36).substr(2, 9)}`,
      employeeId,
      senderName,
      type,
      title,
      message,
      rewardValue,
      createdAt: new Date().toISOString()
    };
    awards.push(newAward);
    this.saveAwards(awards);
    return newAward;
  }


  // Business calculations & workflow simulation helpers
  public static triggerNewRandomNudge(employeeId: string): EmployeeNudge {
    const nudges = this.getNUDGE_POOL_FOR_SIMULATION();
    const categories: ('SUPPORT' | 'LIKEABILITY' | 'FLOW')[] = ['SUPPORT', 'LIKEABILITY', 'FLOW'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const content = nudges[randomCategory];

    const now = Date.now();
    
    // Check if employee has had previous nudges
    const previousNudges = this.getNudges().filter(n => n.employeeId === employeeId);
    const hasHadNudgesBefore = previousNudges.length > 0;
    
    // 1 minute (60 * 1000 ms) for the first time, 10 minutes (10 * 60 * 1000 ms) from 2nd nudge onwards
    const durationMs = hasHadNudgesBefore ? 10 * 60 * 1000 : 1 * 60 * 1000;
    const expiresAt = now + durationMs;

    const newNudge: EmployeeNudge = {
      id: `ndg-${Math.random().toString(36).substr(2, 9)}`,
      employeeId,
      category: randomCategory,
      questionText: content.questionText,
      firstNudgeText: content.firstNudge,
      secondNudgeText: content.secondNudge,
      attempt: 1,
      status: 'PENDING',
      createdAt: now,
      expiresAt
    };

    const currentNudges = this.getNudges();
    currentNudges.push(newNudge);
    this.saveNudges(currentNudges);
    return newNudge;
  }

  public static getNUDGE_POOL_FOR_SIMULATION() {
    return RESEARCH_QUESTIONS_POOL;
  }

  // Checks and updates nudge lapse timeticks and triggers secondary nudges
  public static tickNudgesAndCheckLapses(): { statusChanged: boolean; message?: string } {
    const activeNudges = this.getNudges();
    const now = Date.now();
    let statusChanged = false;
    let message = '';

    const updatedNudges = activeNudges.map(nudge => {
      if (nudge.status === 'PENDING' && now > nudge.expiresAt) {
        statusChanged = true;
        
        if (nudge.attempt === 1) {
          // Lapse first attempt and trigger secondary attempt reminder!
          message = `Nudge ID ${nudge.id} for Employee has lapsed without reply. Triggering Secondary Nudge (Nudge 2/2) under Nudge Theory.`;
          return {
            ...nudge,
            status: 'LAPSED' as const,
          };
        } else {
          // Second attempt also lapsed, now it completely expires
          return {
            ...nudge,
            status: 'LAPSED' as const
          };
        }
      }
      return nudge;
    });

    // Check if we need to spawn secondary attempt for any newly lapsed attempt=1 nudges
    const newlySpawnedNudges: EmployeeNudge[] = [];
    activeNudges.forEach(nudge => {
      if (nudge.status === 'PENDING' && now > nudge.expiresAt && nudge.attempt === 1) {
        // Create attempt 2 - stays for 10 minutes
        newlySpawnedNudges.push({
          id: `ndg-sec-${Math.random().toString(36).substr(2, 9)}`,
          employeeId: nudge.employeeId,
          category: nudge.category,
          questionText: nudge.questionText,
          firstNudgeText: nudge.firstNudgeText,
          secondNudgeText: nudge.secondNudgeText,
          attempt: 2,
          status: 'PENDING',
          createdAt: now,
          expiresAt: now + 10 * 60 * 1000 // attempt 2 or subsequent always stays for 10 minutes
        });
      }
    });

    if (statusChanged || newlySpawnedNudges.length > 0) {
      this.saveNudges([...updatedNudges, ...newlySpawnedNudges]);
      this.recalculateDepartmentSummaries();
      return { statusChanged: true, message: message || 'Nudge states updated.' };
    }

    return { statusChanged: false };
  }

  public static respondToNudge(nudgeId: string, value: number): void {
    const nudges = this.getNudges();
    const matchedIdx = nudges.findIndex(n => n.id === nudgeId);
    if (matchedIdx !== -1) {
      nudges[matchedIdx].status = 'RESPONDED';
      nudges[matchedIdx].responseValue = value;
      nudges[matchedIdx].respondedAt = Date.now();
      
      this.saveNudges(nudges);
      this.recalculateDepartmentSummaries();
    }
  }

  public static addRegistrationRequest(req: Omit<RegistrationRequest, 'id' | 'requestedAt' | 'status'>): RegistrationRequest {
    const requests = this.getRegistrationRequests();
    const newReq: RegistrationRequest = {
      ...req,
      id: `req-${Math.random().toString(36).substr(2, 9)}`,
      requestedAt: new Date().toISOString(),
      status: 'pending'
    };
    requests.push(newReq);
    this.saveRegistrationRequests(requests);
    return newReq;
  }

  public static approveRegistration(reqId: string): void {
    const reqs = this.getRegistrationRequests();
    const matchedIdx = reqs.findIndex(r => r.id === reqId);
    if (matchedIdx !== -1) {
      reqs[matchedIdx].status = 'approved';
      this.saveRegistrationRequests(reqs);

      // Add to actual employees!
      const targetReq = reqs[matchedIdx];
      const employees = this.getEmployees();
      const newEmp: Employee = {
        id: `emp-${Math.random().toString(36).substr(2, 9)}`,
        name: targetReq.name,
        email: targetReq.email,
        employeeId: targetReq.employeeId,
        departmentId: targetReq.departmentId,
        role: 'EMPLOYEE',
        status: 'APPROVED',
        accessMode: 'FULL',
        journeyStep: 1, // Start at step 1 of route map
        joinedAt: new Date().toISOString().split('T')[0]
      };
      
      employees.push(newEmp);
      this.saveEmployees(employees);
      this.recalculateDepartmentSummaries();
    }
  }

  public static rejectRegistration(reqId: string): void {
    const reqs = this.getRegistrationRequests();
    const matchedIdx = reqs.findIndex(r => r.id === reqId);
    if (matchedIdx !== -1) {
      reqs[matchedIdx].status = 'rejected';
      this.saveRegistrationRequests(reqs);
    }
  }

  public static addNewEmployeeDirectly(name: string, email: string, employeeId: string, deptId: string): Employee {
    const employees = this.getEmployees();
    const newEmp: Employee = {
      id: `emp-${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      employeeId,
      departmentId: deptId,
      role: 'EMPLOYEE',
      status: 'APPROVED',
      accessMode: 'FULL',
      journeyStep: 1,
      joinedAt: new Date().toISOString().split('T')[0]
    };
    employees.push(newEmp);
    this.saveEmployees(employees);
    this.recalculateDepartmentSummaries();
    return newEmp;
  }

  // Recalculates metrics for departments with complete transparent formulas
  public static recalculateDepartmentSummaries(): void {
    const departments = this.getDepartments();
    const employees = this.getEmployees();
    const nudges = this.getNudges();

    const updatedDepts = departments.map(dept => {
      const deptEmployees = employees.filter(e => e.departmentId === dept.id && e.status === 'APPROVED');
      const deptEmpIds = deptEmployees.map(e => e.id);

      // Find all nudges belonging to department employees
      const deptNudges = nudges.filter(n => deptEmpIds.includes(n.employeeId));

      const totalNudges = deptNudges.length;
      const responses = deptNudges.filter(n => n.status === 'RESPONDED');
      const totalResponsesCount = responses.length;
      const lapsedCount = deptNudges.filter(n => n.status === 'LAPSED').length;

      // Response Rate
      const responseRate = totalNudges > 0 ? Math.round((totalResponsesCount / totalNudges) * 100) : 85;

      // Calculation of weighted happiness:
      // Very Happy (5) = 100%, Happy (4) = 75%, Neutral (3) = 50%, Sad (2) = 25%, Very Sad (1) = 0%
      let happinessSum = 0;
      let supportSum = 0;
      let flowSum = 0;
      let likeabilitySum = 0;

      let supportCount = 0;
      let flowCount = 0;
      let likeabilityCount = 0;

      responses.forEach(resp => {
        const val = resp.responseValue || 3;
        const happinessPercent = (val - 1) * 25; // 1->0%, 2->25%, 3->50%, 4->75%, 5->100%
        happinessSum += happinessPercent;

        if (resp.category === 'SUPPORT') {
          supportSum += happinessPercent;
          supportCount++;
        } else if (resp.category === 'FLOW') {
          flowSum += happinessPercent;
          flowCount++;
        } else if (resp.category === 'LIKEABILITY') {
          likeabilitySum += happinessPercent;
          likeabilityCount++;
        }
      });

      const happinessRating = totalResponsesCount > 0 ? Math.round(happinessSum / totalResponsesCount) : dept.happinessRating;
      const supportiveExperience = supportCount > 0 ? Math.round(supportSum / supportCount) : dept.supportiveExperience;
      const intrinsicFlow = flowCount > 0 ? Math.round(flowSum / flowCount) : dept.intrinsicFlow;
      const workLikeability = likeabilityCount > 0 ? Math.round(likeabilitySum / likeabilityCount) : dept.workLikeability;

      // Determine sentiment based on happiness rating
      let sentiment: Department['sentiment'] = 'neutral';
      if (happinessRating >= 80) sentiment = 'very-happy';
      else if (happinessRating >= 65) sentiment = 'happy';
      else if (happinessRating >= 50) sentiment = 'neutral';
      else if (happinessRating >= 35) sentiment = 'sad';
      else sentiment = 'very-sad';

      return {
        ...dept,
        happinessRating,
        responseRate,
        supportiveExperience,
        workLikeability,
        intrinsicFlow,
        sentiment,
        headcount: deptEmployees.length || dept.headcount
      };
    });

    this.saveDepartments(updatedDepts);
  }

  // Generates transparent detailed calculation explanation object
  public static getCalculationExplanationForAcme(): {
    veryHappyCount: number;
    happyCount: number;
    neutralCount: number;
    sadCount: number;
    verySadCount: number;
    totalResponses: number;
    weightedTotal: number;
    happinessPercentage: number;
    pendingCount: number;
    lapsedCount: number;
    totalSent: number;
    responseRate: number;
  } {
    const nudges = this.getNudges();
    const responses = nudges.filter(n => n.status === 'RESPONDED');
    const pendingCount = nudges.filter(n => n.status === 'PENDING').length;
    const lapsedCount = nudges.filter(n => n.status === 'LAPSED').length;

    let vh = 0, h = 0, n = 0, s = 0, vs = 0;
    responses.forEach(r => {
      const v = r.responseValue || 3;
      if (v === 5) vh++;
      else if (v === 4) h++;
      else if (v === 3) n++;
      else if (v === 2) s++;
      else if (v === 1) vs++;
    });

    // Weighted Formula:
    // VH gives 100 pt, H gives 75 pt, N gives 50 pt, S gives 25 pt, VS gives 0 pt.
    const weightedTotalPoints = (vh * 100) + (h * 75) + (n * 50) + (s * 25) + (vs * 0);
    const totalResponses = responses.length || 1;
    const happinessPercentage = Math.round(weightedTotalPoints / totalResponses);

    return {
      veryHappyCount: vh,
      happyCount: h,
      neutralCount: n,
      sadCount: s,
      verySadCount: vs,
      totalResponses: responses.length,
      weightedTotal: weightedTotalPoints,
      happinessPercentage,
      pendingCount,
      lapsedCount,
      totalSent: nudges.length,
      responseRate: Math.round((responses.length / (nudges.length || 1)) * 100)
    };
  }

  public static resetToDefault(): void {
    localStorage.removeItem('wbm_departments');
    localStorage.removeItem('wbm_employees');
    localStorage.removeItem('wbm_registration_requests');
    localStorage.removeItem('wbm_nudges');
    localStorage.removeItem('wbm_peer_interactions');
    localStorage.removeItem('wbm_roadmap');
    localStorage.removeItem('wbm_trial_invites');
    localStorage.removeItem('wbm_company_config');
    localStorage.removeItem('wbm_awards');
    window.location.reload();
  }
}
