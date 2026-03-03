import type {
  SystemNode,
  SystemEdge,
  SimulationResult,
  NodeSimResult,
} from '../types';
import { getComponentType } from '../data/componentTypes';

export function runSimulation(
  nodes: SystemNode[],
  edges: SystemEdge[],
  targetRps: number
): SimulationResult {
  if (nodes.length === 0) {
    return {
      success: true,
      targetRps,
      maxAchievableRps: 0,
      bottlenecks: [],
      nodeResults: new Map(),
      totalLatencyMs: 0,
      criticalPath: [],
    };
  }

  const adjacency = new Map<string, string[]>();
  const incomingEdges = new Map<string, string[]>();

  for (const node of nodes) {
    adjacency.set(node.id, []);
    incomingEdges.set(node.id, []);
  }

  for (const edge of edges) {
    adjacency.get(edge.source)?.push(edge.target);
    incomingEdges.get(edge.target)?.push(edge.source);
  }

  const sourceNodes = nodes.filter(
    (n) => (incomingEdges.get(n.id)?.length ?? 0) === 0
  );

  const nodeResults = new Map<string, NodeSimResult>();
  const incomingRpsMap = new Map<string, number>();

  const rpsPerSource =
    sourceNodes.length > 0 ? targetRps / sourceNodes.length : targetRps;
  for (const source of sourceNodes) {
    incomingRpsMap.set(source.id, rpsPerSource);
  }

  const sorted = topologicalSort(nodes, edges);

  let maxLatencyPath = 0;
  const latencyTo = new Map<string, number>();
  const criticalPathParent = new Map<string, string>();

  for (const nodeId of sorted) {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) continue;

    const compType = getComponentType(node.data.componentTypeId);
    const config = node.data.config;
    const isClient =
      node.data.componentTypeId === 'web-client' ||
      node.data.componentTypeId === 'mobile-client';

    const incomingRps = incomingRpsMap.get(nodeId) ?? 0;

    const effectiveCapacity = isClient
      ? Infinity
      : config.throughput * Math.max(1, config.instances);

    const utilization =
      effectiveCapacity === Infinity
        ? 0
        : effectiveCapacity > 0
          ? incomingRps / effectiveCapacity
          : incomingRps > 0
            ? Infinity
            : 0;

    const passedRps = Math.min(incomingRps, effectiveCapacity);
    const nodeLatency = isClient ? 0 : config.latency;

    const parents = incomingEdges.get(nodeId) ?? [];
    let maxParentLatency = 0;
    let critParent = '';
    for (const p of parents) {
      const pl = latencyTo.get(p) ?? 0;
      if (pl > maxParentLatency) {
        maxParentLatency = pl;
        critParent = p;
      }
    }
    if (parents.length === 0 && sourceNodes.some((s) => s.id === nodeId)) {
      maxParentLatency = 0;
    }

    const totalLatency = maxParentLatency + nodeLatency;
    latencyTo.set(nodeId, totalLatency);
    if (critParent) criticalPathParent.set(nodeId, critParent);

    if (totalLatency > maxLatencyPath) {
      maxLatencyPath = totalLatency;
    }

    const children = adjacency.get(nodeId) ?? [];
    const isLoadBalancer = node.data.componentTypeId === 'load-balancer';
    const hasCacheHitRate =
      config.cacheHitRate !== undefined && config.cacheHitRate > 0;

    for (let ci = 0; ci < children.length; ci++) {
      const childId = children[ci];
      let rpsToChild: number;

      if (isLoadBalancer && children.length > 0) {
        const algo = config.lbAlgorithm ?? 'round-robin';
        if (algo === 'least-connections') {
          // Weighted by inverse utilization of children
          const childNodes = children.map((cid) => nodes.find((n) => n.id === cid)).filter(Boolean);
          const weights = childNodes.map((cn) => {
            if (!cn) return 1;
            const cap = cn.data.config.throughput * Math.max(1, cn.data.config.instances);
            return cap > 0 ? cap : 1;
          });
          const totalWeight = weights.reduce((a, b) => a + b, 0);
          rpsToChild = passedRps * (weights[ci] / totalWeight);
        } else if (algo === 'weighted') {
          // Proportional to child throughput × instances
          const childNodes = children.map((cid) => nodes.find((n) => n.id === cid)).filter(Boolean);
          const weights = childNodes.map((cn) => {
            if (!cn) return 1;
            return cn.data.config.throughput * Math.max(1, cn.data.config.instances);
          });
          const totalWeight = weights.reduce((a, b) => a + b, 0);
          rpsToChild = totalWeight > 0 ? passedRps * (weights[ci] / totalWeight) : passedRps / children.length;
        } else {
          // round-robin, ip-hash, consistent-hashing → even split
          rpsToChild = passedRps / children.length;
        }
      } else if (hasCacheHitRate) {
        rpsToChild = passedRps * (1 - (config.cacheHitRate ?? 0));
      } else {
        rpsToChild = passedRps;
      }

      const existing = incomingRpsMap.get(childId) ?? 0;
      incomingRpsMap.set(childId, existing + rpsToChild);
    }

    nodeResults.set(nodeId, {
      nodeId,
      label: node.data.label,
      componentTypeId: node.data.componentTypeId,
      incomingRps,
      effectiveCapacity,
      utilization,
      isBottleneck: utilization > 1.0,
      latencyMs: compType?.defaultConfig.latency ?? 0,
    });
  }

  const bottlenecks = Array.from(nodeResults.values()).filter(
    (r) => r.isBottleneck
  );

  let maxUtilization = 0;
  for (const result of nodeResults.values()) {
    if (result.utilization > maxUtilization && result.effectiveCapacity !== Infinity) {
      maxUtilization = result.utilization;
    }
  }

  const maxAchievableRps =
    maxUtilization > 0 ? Math.floor(targetRps / maxUtilization) : targetRps;

  let criticalPathEnd = '';
  let maxLat = 0;
  for (const [nodeId, lat] of latencyTo.entries()) {
    if (lat > maxLat) {
      maxLat = lat;
      criticalPathEnd = nodeId;
    }
  }

  const criticalPath: string[] = [];
  let current = criticalPathEnd;
  while (current) {
    criticalPath.unshift(current);
    current = criticalPathParent.get(current) ?? '';
  }

  return {
    success: bottlenecks.length === 0,
    targetRps,
    maxAchievableRps,
    bottlenecks,
    nodeResults,
    totalLatencyMs: maxLatencyPath,
    criticalPath,
  };
}

function topologicalSort(nodes: SystemNode[], edges: SystemEdge[]): string[] {
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const node of nodes) {
    inDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  }

  for (const edge of edges) {
    adjacency.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  const queue: string[] = [];
  for (const [nodeId, degree] of inDegree.entries()) {
    if (degree === 0) queue.push(nodeId);
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    sorted.push(nodeId);
    for (const child of adjacency.get(nodeId) ?? []) {
      const newDegree = (inDegree.get(child) ?? 1) - 1;
      inDegree.set(child, newDegree);
      if (newDegree === 0) queue.push(child);
    }
  }

  for (const node of nodes) {
    if (!sorted.includes(node.id)) {
      sorted.push(node.id);
    }
  }

  return sorted;
}
