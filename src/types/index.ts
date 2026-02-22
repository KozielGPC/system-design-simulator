import type { Node, Edge } from '@xyflow/react';

export type ComponentCategory =
  | 'clients'
  | 'infrastructure'
  | 'compute'
  | 'data'
  | 'messaging'
  | 'storage';

export interface ComponentTypeConfig {
  throughput: number;
  latency: number;
  instances: number;
  scalingType: 'vertical' | 'horizontal' | 'both';
  cacheHitRate?: number;
  replicationFactor?: number;
  partitions?: number;
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
export type SystemEdge = Edge;

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
