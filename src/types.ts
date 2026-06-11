/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'SUPER_ADMIN' | 'COMPANY_ADMIN' | 'HR_HEAD' | 'EMPLOYEE';

export type AccessMode = 'TRIAL' | 'FULL';

export type OnboardingStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'NOT_STARTED';

export interface Department {
  id: string;
  name: string;
  manager: string;
  sentiment: 'very-happy' | 'happy' | 'neutral' | 'sad' | 'very-sad';
  happinessRating: number; // calculated transparently
  responseRate: number; // percentage of answered nudges
  // Research dimensions (0 - 100)
  supportiveExperience: number; // Training, support, org experience
  workLikeability: number;      // Likeability vs repulsiveness
  intrinsicFlow: number;        // Deep immersion, losing track of time
  headcount: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  employeeId: string;
  departmentId: string;
  role: UserRole;
  status: OnboardingStatus;
  accessMode: AccessMode;
  journeyStep: number; // Current index on their path/route map
  joinedAt: string;
}

export interface RegistrationRequest {
  id: string;
  email: string;
  name: string;
  employeeId: string;
  companyName: string;
  departmentId: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface EmployeeNudge {
  id: string;
  employeeId: string;
  category: 'SUPPORT' | 'LIKEABILITY' | 'FLOW';
  questionText: string;
  firstNudgeText: string;
  secondNudgeText: string;
  attempt: 1 | 2;
  status: 'PENDING' | 'RESPONDED' | 'LAPSED';
  createdAt: number; // timestamp
  expiresAt: number;   // timestamp, lapses if not answered
  responseValue?: number; // 1 (Very Sad) to 5 (Very Happy)
  respondedAt?: number;
}

export interface PeerInteraction {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  receiverName: string;
  message: string;
  category: 'gratitude' | 'encouragement' | 'shout-out';
  timestamp: string;
}

export interface CompanyConfig {
  id: string;
  name: string;
  nudgeExpiryMinutes: number; // time before a nudge lapses (default: 3 mins for simulation/demo, or hours)
  streakCount: number;
}

export interface TrialInvite {
  id: string;
  email: string;
  companyName: string;
  invitedBy: string;
  mode: AccessMode;
  code: string;
  createdAt: string;
  expiresAt: string;
}

export interface RoadmapGoal {
  id: string;
  timeline: 'SHORT' | 'MEDIUM' | 'LONG';
  title: string;
  description: string;
  status: 'PLANNED' | 'IN_DEVELOPMENT' | 'RELEASED';
}

export interface Award {
  id: string;
  employeeId: string;
  senderName: string;
  type: 'maestro' | 'pillar' | 'mindful' | 'innovator' | 'custom';
  title: string;
  message: string;
  rewardValue?: string;
  createdAt: string;
}
