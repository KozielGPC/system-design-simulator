import type { SystemNode, SystemEdge, SimulationResult } from '../types';

export type DemoScene =
  | 'empty'
  | 'step1-lb'
  | 'step2-api'
  | 'step3-connect'
  | 'design'
  | 'results';

const DEMO_SIMULATION_RESULT: SimulationResult = {
  success: false,
  targetRps: 10_000,
  maxAchievableRps: 3_000,
  bottlenecks: [
    {
      nodeId: 'demo-api',
      label: 'API Server',
      componentTypeId: 'api-server',
      incomingRps: 10_000,
      effectiveCapacity: 3_000,
      utilization: 1,
      isBottleneck: true,
      latencyMs: 50,
    },
  ],
  nodeResults: new Map([
    ['demo-lb', { nodeId: 'demo-lb', label: 'Load Balancer', componentTypeId: 'load-balancer', incomingRps: 10_000, effectiveCapacity: 50_000, utilization: 0.2, isBottleneck: false, latencyMs: 1 }],
    ['demo-api', { nodeId: 'demo-api', label: 'API Server', componentTypeId: 'api-server', incomingRps: 10_000, effectiveCapacity: 3_000, utilization: 1, isBottleneck: true, latencyMs: 50 }],
    ['demo-cache', { nodeId: 'demo-cache', label: 'Redis Cache', componentTypeId: 'cache', incomingRps: 1_500, effectiveCapacity: 100_000, utilization: 0.015, isBottleneck: false, latencyMs: 1 }],
    ['demo-db', { nodeId: 'demo-db', label: 'PostgreSQL', componentTypeId: 'sql-db', incomingRps: 8_500, effectiveCapacity: 5_000, utilization: 0.85, isBottleneck: false, latencyMs: 10 }],
  ]),
  totalLatencyMs: 62,
  criticalPath: ['demo-lb', 'demo-api', 'demo-db'],
};

export const DEMO_STATES: Record<
  DemoScene,
  {
    nodes: SystemNode[];
    edges: SystemEdge[];
    targetRps?: number;
    simulationResult?: SimulationResult;
    showSimulationPanel?: boolean;
  }
> = {
  empty: {
    nodes: [],
    edges: [],
    targetRps: 10_000,
  },
  'step1-lb': {
    nodes: [
      {
        id: 'demo-lb',
        type: 'system',
        position: { x: 420, y: 180 },
        data: {
          componentTypeId: 'load-balancer',
          label: 'Load Balancer',
          config: {
            throughput: 50_000,
            latency: 1,
            instances: 1,
            scalingType: 'horizontal',
          },
        },
      },
    ],
    edges: [],
    targetRps: 10_000,
  },
  'step2-api': {
    nodes: [
      {
        id: 'demo-lb',
        type: 'system',
        position: { x: 420, y: 120 },
        data: {
          componentTypeId: 'load-balancer',
          label: 'Load Balancer',
          config: {
            throughput: 50_000,
            latency: 1,
            instances: 1,
            scalingType: 'horizontal',
          },
        },
      },
      {
        id: 'demo-api',
        type: 'system',
        position: { x: 420, y: 260 },
        data: {
          componentTypeId: 'api-server',
          label: 'API Server',
          config: {
            throughput: 1_000,
            latency: 50,
            instances: 3,
            scalingType: 'both',
          },
        },
      },
    ],
    edges: [],
    targetRps: 10_000,
  },
  'step3-connect': {
    nodes: [
      {
        id: 'demo-lb',
        type: 'system',
        position: { x: 400, y: 80 },
        data: {
          componentTypeId: 'load-balancer',
          label: 'Load Balancer',
          config: {
            throughput: 50_000,
            latency: 1,
            instances: 1,
            scalingType: 'horizontal',
          },
        },
      },
      {
        id: 'demo-api',
        type: 'system',
        position: { x: 400, y: 220 },
        data: {
          componentTypeId: 'api-server',
          label: 'API Server',
          config: {
            throughput: 1_000,
            latency: 50,
            instances: 3,
            scalingType: 'both',
          },
        },
      },
    ],
    edges: [
      {
        id: 'e-lb-api',
        source: 'demo-lb',
        target: 'demo-api',
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      },
    ],
    targetRps: 10_000,
  },
  design: {
    nodes: [
      {
        id: 'demo-lb',
        type: 'system',
        position: { x: 400, y: 80 },
        data: {
          componentTypeId: 'load-balancer',
          label: 'Load Balancer',
          config: {
            throughput: 50_000,
            latency: 1,
            instances: 1,
            scalingType: 'horizontal',
          },
        },
      },
      {
        id: 'demo-api',
        type: 'system',
        position: { x: 400, y: 220 },
        data: {
          componentTypeId: 'api-server',
          label: 'API Server',
          config: {
            throughput: 1_000,
            latency: 50,
            instances: 3,
            scalingType: 'both',
          },
        },
      },
      {
        id: 'demo-cache',
        type: 'system',
        position: { x: 220, y: 380 },
        data: {
          componentTypeId: 'cache',
          label: 'Redis Cache',
          config: {
            throughput: 100_000,
            latency: 1,
            instances: 1,
            scalingType: 'horizontal',
            cacheHitRate: 0.85,
          },
        },
      },
      {
        id: 'demo-db',
        type: 'system',
        position: { x: 580, y: 380 },
        data: {
          componentTypeId: 'sql-db',
          label: 'PostgreSQL',
          config: {
            throughput: 5_000,
            latency: 10,
            instances: 1,
            scalingType: 'vertical',
            replicationFactor: 1,
          },
        },
      },
    ],
    edges: [
      {
        id: 'e-lb-api',
        source: 'demo-lb',
        target: 'demo-api',
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      },
      {
        id: 'e-api-cache',
        source: 'demo-api',
        target: 'demo-cache',
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      },
      {
        id: 'e-api-db',
        source: 'demo-api',
        target: 'demo-db',
        type: 'smoothstep',
        animated: false,
        style: { stroke: '#94a3b8', strokeWidth: 2 },
      },
    ],
    targetRps: 10_000,
  },
  results: {
    nodes: [
      {
        id: 'demo-lb',
        type: 'system',
        position: { x: 400, y: 80 },
        data: {
          componentTypeId: 'load-balancer',
          label: 'Load Balancer',
          config: {
            throughput: 50_000,
            latency: 1,
            instances: 1,
            scalingType: 'horizontal',
          },
          simulation: {
            incomingRps: 10_000,
            effectiveCapacity: 50_000,
            utilization: 0.2,
            isBottleneck: false,
            status: 'healthy',
          },
        },
      },
      {
        id: 'demo-api',
        type: 'system',
        position: { x: 400, y: 220 },
        data: {
          componentTypeId: 'api-server',
          label: 'API Server',
          config: {
            throughput: 1_000,
            latency: 50,
            instances: 3,
            scalingType: 'both',
          },
          simulation: {
            incomingRps: 10_000,
            effectiveCapacity: 3_000,
            utilization: 1,
            isBottleneck: true,
            status: 'critical',
          },
        },
      },
      {
        id: 'demo-cache',
        type: 'system',
        position: { x: 220, y: 380 },
        data: {
          componentTypeId: 'cache',
          label: 'Redis Cache',
          config: {
            throughput: 100_000,
            latency: 1,
            instances: 1,
            scalingType: 'horizontal',
            cacheHitRate: 0.85,
          },
          simulation: {
            incomingRps: 1_500,
            effectiveCapacity: 100_000,
            utilization: 0.015,
            isBottleneck: false,
            status: 'healthy',
          },
        },
      },
      {
        id: 'demo-db',
        type: 'system',
        position: { x: 580, y: 380 },
        data: {
          componentTypeId: 'sql-db',
          label: 'PostgreSQL',
          config: {
            throughput: 5_000,
            latency: 10,
            instances: 1,
            scalingType: 'vertical',
            replicationFactor: 1,
          },
          simulation: {
            incomingRps: 8_500,
            effectiveCapacity: 5_000,
            utilization: 0.85,
            isBottleneck: false,
            status: 'warning',
          },
        },
      },
    ],
    edges: [
      {
        id: 'e-lb-api',
        source: 'demo-lb',
        target: 'demo-api',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 },
      },
      {
        id: 'e-api-cache',
        source: 'demo-api',
        target: 'demo-cache',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 },
      },
      {
        id: 'e-api-db',
        source: 'demo-api',
        target: 'demo-db',
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 },
      },
    ],
    targetRps: 10_000,
    simulationResult: DEMO_SIMULATION_RESULT,
    showSimulationPanel: true,
  },
};
