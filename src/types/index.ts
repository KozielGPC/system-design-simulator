import type { Node, Edge } from '@xyflow/react';

export type ComponentCategory =
  | 'clients'
  | 'infrastructure'
  | 'compute'
  | 'data'
  | 'messaging'
  | 'storage'
  | 'security';

// --- Edge types ---
export type EdgeProtocol = 'HTTP' | 'gRPC' | 'WebSocket' | 'TCP' | 'AMQP';

export interface EdgeData {
  label: string;
  protocol: EdgeProtocol;
  isAsync: boolean;
  [key: string]: unknown;
}

// --- LB / Cache strategy types ---
export type LBAlgorithm =
  | 'round-robin'
  | 'least-connections'
  | 'consistent-hashing'
  | 'weighted'
  | 'ip-hash';

export type CacheEvictionPolicy = 'LRU' | 'LFU' | 'TTL';
export type CachePattern =
  | 'cache-aside'
  | 'write-through'
  | 'write-back'
  | 'read-through';
export type CacheInvalidation = 'TTL' | 'event-driven' | 'manual';

export interface ComponentTypeConfig {
  throughput: number;
  latency: number;
  instances: number;
  scalingType: 'vertical' | 'horizontal' | 'both';
  cacheHitRate?: number;
  replicationFactor?: number;
  partitions?: number;
  lbAlgorithm?: LBAlgorithm;
  cacheEvictionPolicy?: CacheEvictionPolicy;
  cachePattern?: CachePattern;
  cacheInvalidation?: CacheInvalidation;
  cacheTtlSeconds?: number;
}

export interface ComponentType {
  id: string;
  name: string;
  category: ComponentCategory;
  icon: string;
  color: string;
  description: string;
  defaultConfig: ComponentTypeConfig;
}

export interface SimulationState {
  incomingRps: number;
  effectiveCapacity: number;
  utilization: number;
  isBottleneck: boolean;
  status: 'idle' | 'healthy' | 'warning' | 'critical';
}

export interface SystemNodeData {
  componentTypeId: string;
  label: string;
  config: ComponentTypeConfig;
  simulation?: SimulationState;
  [key: string]: unknown;
}

export type SystemNode = Node<SystemNodeData, 'system'>;
export type SystemEdge = Edge<EdgeData>;

// --- Interview timer ---
export interface InterviewPhase {
  id: string;
  name: string;
  startMinute: number;
  endMinute: number;
  color: string;
  hints: string[];
}

// --- Envelope estimation ---
export interface EnvelopeEstimation {
  dau: number;
  readWriteRatio: number;
  avgRequestsPerUser: number;
  peakMultiplier: number;
  recordSizeBytes: number;
  newRecordsPerDay: number;
  retentionYears: number;
  avgReadPayloadBytes: number;
  avgWritePayloadBytes: number;
}

// --- Requirements ---
export interface RequirementItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface NonFunctionalRequirement {
  id: string;
  category: string;
  label: string;
  target: string;
  checked: boolean;
}

// --- Annotations ---
export interface AnnotationNodeData {
  text: string;
  color: string;
  [key: string]: unknown;
}

export type AnnotationNode = Node<AnnotationNodeData, 'annotation'>;

export interface NodeSimResult {
  nodeId: string;
  label: string;
  componentTypeId: string;
  incomingRps: number;
  effectiveCapacity: number;
  utilization: number;
  isBottleneck: boolean;
  latencyMs: number;
}

export interface SimulationResult {
  success: boolean;
  targetRps: number;
  maxAchievableRps: number;
  bottlenecks: NodeSimResult[];
  nodeResults: Map<string, NodeSimResult>;
  totalLatencyMs: number;
  criticalPath: string[];
}
