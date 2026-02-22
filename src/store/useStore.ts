import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type Connection,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react';
import type {
  SystemNode,
  SystemEdge,
  SimulationResult,
  ComponentTypeConfig,
} from '../types';
import { getComponentType } from '../data/componentTypes';
import { runSimulation } from '../simulation/engine';

interface AppState {
  nodes: SystemNode[];
  edges: SystemEdge[];
  selectedNodeId: string | null;
  targetRps: number;
  simulationResult: SimulationResult | null;
  isSimulating: boolean;
  showSimulationPanel: boolean;
  sidebarCollapsed: boolean;

  onNodesChange: OnNodesChange<SystemNode>;
  onEdgesChange: OnEdgesChange<SystemEdge>;
  onConnect: OnConnect;

  addNode: (
    componentTypeId: string,
    position: { x: number; y: number }
  ) => void;
  selectNode: (nodeId: string | null) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  updateNodeConfig: (
    nodeId: string,
    config: Partial<ComponentTypeConfig>
  ) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;

  setTargetRps: (rps: number) => void;
  simulate: () => void;
  clearSimulation: () => void;
  toggleSimulationPanel: () => void;
  toggleSidebar: () => void;
  clearCanvas: () => void;
}

let nodeIdCounter = 0;

export const useStore = create<AppState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  targetRps: 10_000,
  simulationResult: null,
  isSimulating: false,
  showSimulationPanel: false,
  sidebarCollapsed: false,

  onNodesChange: (changes: NodeChange<SystemNode>[]) => {
    const selectionChanges = changes.filter(
      (c) => c.type === 'select'
    );
    if (selectionChanges.length > 0) {
      const selected = selectionChanges.find(
        (c) => c.type === 'select' && c.selected
      );
      set({
        selectedNodeId:
          selected && selected.type === 'select' ? selected.id : null,
      });
    }

    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes: EdgeChange<SystemEdge>[]) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection: Connection) => {
    const newEdge = {
      ...connection,
      type: 'smoothstep',
      animated: false,
      style: { stroke: '#94a3b8', strokeWidth: 2 },
    };
    set({ edges: addEdge(newEdge, get().edges) });
  },

  addNode: (componentTypeId: string, position: { x: number; y: number }) => {
    const compType = getComponentType(componentTypeId);
    if (!compType) return;

    const id = `node-${++nodeIdCounter}-${Date.now()}`;
    const newNode: SystemNode = {
      id,
      type: 'system',
      position,
      data: {
        componentTypeId,
        label: compType.name,
        config: { ...compType.defaultConfig },
      },
    };

    set({ nodes: [...get().nodes, newNode] });
  },

  selectNode: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId });
  },

  updateNodeLabel: (nodeId: string, label: string) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, label } } : n
      ),
    });
  },

  updateNodeConfig: (nodeId: string, config: Partial<ComponentTypeConfig>) => {
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              data: {
                ...n.data,
                config: { ...n.data.config, ...config },
              },
            }
          : n
      ),
    });
  },

  deleteNode: (nodeId: string) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      ),
      selectedNodeId:
        get().selectedNodeId === nodeId ? null : get().selectedNodeId,
    });
  },

  deleteEdge: (edgeId: string) => {
    set({ edges: get().edges.filter((e) => e.id !== edgeId) });
  },

  setTargetRps: (rps: number) => {
    set({ targetRps: rps });
  },

  simulate: () => {
    const { nodes, edges, targetRps } = get();
    set({ isSimulating: true });

    setTimeout(() => {
      const result = runSimulation(nodes, edges, targetRps);

      const updatedNodes = nodes.map((node) => {
        const nodeResult = result.nodeResults.get(node.id);
        if (!nodeResult) return node;

        let status: 'idle' | 'healthy' | 'warning' | 'critical' = 'idle';
        if (nodeResult.utilization <= 0.7) status = 'healthy';
        else if (nodeResult.utilization <= 0.9) status = 'warning';
        else status = 'critical';

        return {
          ...node,
          data: {
            ...node.data,
            simulation: {
              incomingRps: nodeResult.incomingRps,
              effectiveCapacity: nodeResult.effectiveCapacity,
              utilization: nodeResult.utilization,
              isBottleneck: nodeResult.isBottleneck,
              status,
            },
          },
        };
      });

      const updatedEdges = edges.map((edge) => ({
        ...edge,
        animated: true,
        style: { ...edge.style, stroke: '#6366f1', strokeWidth: 2 },
      }));

      set({
        nodes: updatedNodes,
        edges: updatedEdges,
        simulationResult: result,
        isSimulating: false,
        showSimulationPanel: true,
      });
    }, 400);
  },

  clearSimulation: () => {
    const { nodes, edges } = get();
    set({
      simulationResult: null,
      showSimulationPanel: false,
      nodes: nodes.map((n) => ({
        ...n,
        data: { ...n.data, simulation: undefined },
      })),
      edges: edges.map((e) => ({
        ...e,
        animated: false,
        style: { ...e.style, stroke: '#94a3b8' },
      })),
    });
  },

  toggleSimulationPanel: () => {
    set({ showSimulationPanel: !get().showSimulationPanel });
  },

  toggleSidebar: () => {
    set({ sidebarCollapsed: !get().sidebarCollapsed });
  },

  clearCanvas: () => {
    set({
      nodes: [],
      edges: [],
      selectedNodeId: null,
      simulationResult: null,
      showSimulationPanel: false,
    });
  },
}));
