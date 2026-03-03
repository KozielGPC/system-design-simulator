import type { InterviewPhase } from '../types';

export const INTERVIEW_PHASES: InterviewPhase[] = [
  {
    id: 'requirements',
    name: 'Requirements',
    startMinute: 0,
    endMinute: 10,
    color: '#3b82f6',
    hints: [
      'Clarify functional requirements (what the system must do)',
      'Identify non-functional requirements (latency, availability, consistency)',
      'Determine scale: DAU, read/write ratio, data volume',
      'Ask about constraints: budget, tech stack preferences, timeline',
    ],
  },
  {
    id: 'estimation',
    name: 'Estimation',
    startMinute: 10,
    endMinute: 15,
    color: '#8b5cf6',
    hints: [
      'Calculate QPS from DAU and usage patterns',
      'Estimate storage needs (record size × volume × retention)',
      'Estimate bandwidth (QPS × payload size)',
      'Consider peak traffic multiplier (2-5× average)',
    ],
  },
  {
    id: 'high-level',
    name: 'High-Level Design',
    startMinute: 15,
    endMinute: 30,
    color: '#10b981',
    hints: [
      'Draw core components: clients, LB, servers, databases',
      'Define APIs for key operations',
      'Choose data model and database type',
      'Address data flow from write to read path',
    ],
  },
  {
    id: 'deep-dive',
    name: 'Deep Dive',
    startMinute: 30,
    endMinute: 45,
    color: '#f59e0b',
    hints: [
      'Discuss detailed design for critical components',
      'Address failure scenarios and fault tolerance',
      'Optimize for identified bottlenecks',
      'Consider caching, sharding, and replication strategies',
    ],
  },
];
