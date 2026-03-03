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
  EdgeData,
  EnvelopeEstimation,
  RequirementItem,
  NonFunctionalRequirement,
  AnnotationNode,
} from '../types';
import { getComponentType } from '../data/componentTypes';
import { runSimulation } from '../simulation/engine';
import { DEFAULT_ESTIMATION } from '../utils/envelopeCalculator';
import { createHistory } from './history';

interface AppState {
  nodes: SystemNode[];
  edges: SystemEdge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  targetRps: number;
  simulationResult: SimulationResult | null;
  isSimulating: boolean;
  showSimulationPanel: boolean;
  sidebarCollapsed: boolean;

  // Timer (Feature 3)
  timerStartedAt: number | null;
  timerPausedAt: number | null;
  timerTotalMinutes: number;

  // Calculator (Feature 4)
  showCalculator: boolean;
  envelopeEstimation: EnvelopeEstimation;

  // Requirements (Feature 7)
  functionalRequirements: RequirementItem[];
  nonFunctionalRequirements: NonFunctionalRequirement[];

  // Annotations (Feature 8)
  annotations: AnnotationNode[];

  // Undo/Redo (Feature 9)
  canUndo: boolean;
  canRedo: boolean;

  // Sidebar tab
  sidebarTab: 'components' | 'requirements';

  onNodesChange: OnNodesChange<SystemNode>;
  onEdgesChange: OnEdgesChange<SystemEdge>;
  onConnect: OnConnect;

  addNode: (
    componentTypeId: string,
    position: { x: number; y: number }
  ) => void;
  selectNode: (nodeId: string | null) => void;
  selectEdge: (edgeId: string | null) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  updateNodeConfig: (
    nodeId: string,
    config: Partial<ComponentTypeConfig>
  ) => void;
  updateEdgeData: (edgeId: string, data: Partial<EdgeData>) => void;
  deleteNode: (nodeId: string) => void;
  deleteEdge: (edgeId: string) => void;

  setTargetRps: (rps: number) => void;
  simulate: () => void;
  clearSimulation: () => void;
  toggleSimulationPanel: () => void;
  toggleSidebar: () => void;
  setSidebarTab: (tab: 'components' | 'requirements') => void;
  clearCanvas: () => void;
  loadDemoState: (
    nodes: SystemNode[],
    edges: SystemEdge[],
    targetRps?: number,
    opts?: { simulationResult: SimulationResult | null; showSimulationPanel: boolean }
  ) => void;

  // Timer actions
  startTimer: () => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;

  // Calculator actions
  toggleCalculator: () => void;
  updateEstimation: (partial: Partial<EnvelopeEstimation>) => void;
  resetEstimation: () => void;

  // Requirement actions
  addFunctionalRequirement: (text: string) => void;
  toggleFunctionalRequirement: (id: string) => void;
  removeFunctionalRequirement: (id: string) => void;
  addNonFunctionalRequirement: (category: string, label: string, target: string) => void;
  toggleNonFunctionalRequirement: (id: string) => void;
  removeNonFunctionalRequirement: (id: string) => void;

  // Annotation actions
  addAnnotation: (position: { x: number; y: number }, color?: string) => void;
  updateAnnotation: (id: string, updates: Partial<{ text: string; color: string }>) => void;
  deleteAnnotation: (id: string) => void;

  // Undo/Redo actions
  undo: () => void;
  redo: () => void;

  // Template action
  loadTemplate: (
    nodes: SystemNode[],
    edges: SystemEdge[],
    targetRps?: number,
    requirements?: { fr: string[]; nfr: { category: string; label: string; target: string }[] }
  ) => void;
}

let nodeIdCounter = 0;
let reqIdCounter = 0;
let annotationIdCounter = 0;

const history = createHistory(50);

function pushHistory(state: { nodes: SystemNode[]; edges: SystemEdge[]; annotations: AnnotationNode[] }) {
  history.push({ nodes: state.nodes, edges: state.edges, annotations: state.annotations });
}

function syncHistoryFlags(set: (partial: Partial<AppState>) => void) {
  set({ canUndo: history.canUndo(), canRedo: history.canRedo() });
}

export const useStore = create<AppState>((set, get) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedEdgeId: null,
  targetRps: 10_000,
  simulationResult: null,
  isSimulating: false,
  showSimulationPanel: false,
  sidebarCollapsed: false,
  sidebarTab: 'components',

  // Timer
  timerStartedAt: null,
  timerPausedAt: null,
  timerTotalMinutes: 45,

  // Calculator
  showCalculator: false,
  envelopeEstimation: { ...DEFAULT_ESTIMATION },

  // Requirements
  functionalRequirements: [],
  nonFunctionalRequirements: [],

  // Annotations
  annotations: [],

  // Undo/Redo
  canUndo: false,
  canRedo: false,

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
        selectedEdgeId: selected ? null : get().selectedEdgeId,
      });
    }

    set({ nodes: applyNodeChanges(changes, get().nodes) });
  },

  onEdgesChange: (changes: EdgeChange<SystemEdge>[]) => {
    set({ edges: applyEdgeChanges(changes, get().edges) });
  },

  onConnect: (connection: Connection) => {
    const state = get();
    pushHistory({ nodes: state.nodes, edges: state.edges, annotations: state.annotations });
    const newEdge = {
      ...connection,
      type: 'labeled',
      animated: false,
      style: { stroke: '#94a3b8', strokeWidth: 2 },
      data: { label: '', protocol: 'HTTP' as const, isAsync: false },
    };
    set({ edges: addEdge(newEdge, get().edges) as SystemEdge[] });
    syncHistoryFlags(set);
  },

  addNode: (componentTypeId: string, position: { x: number; y: number }) => {
    const compType = getComponentType(componentTypeId);
    if (!compType) return;

    const state = get();
    pushHistory({ nodes: state.nodes, edges: state.edges, annotations: state.annotations });

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
    syncHistoryFlags(set);
  },

  selectNode: (nodeId: string | null) => {
    set({ selectedNodeId: nodeId, selectedEdgeId: nodeId ? null : get().selectedEdgeId });
  },

  selectEdge: (edgeId: string | null) => {
    set({ selectedEdgeId: edgeId, selectedNodeId: edgeId ? null : get().selectedNodeId });
  },

  updateNodeLabel: (nodeId: string, label: string) => {
    const state = get();
    pushHistory({ nodes: state.nodes, edges: state.edges, annotations: state.annotations });
    set({
      nodes: get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, label } } : n
      ),
    });
    syncHistoryFlags(set);
  },

  updateNodeConfig: (nodeId: string, config: Partial<ComponentTypeConfig>) => {
    const state = get();
    pushHistory({ nodes: state.nodes, edges: state.edges, annotations: state.annotations });
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
    syncHistoryFlags(set);
  },

  updateEdgeData: (edgeId: string, data: Partial<EdgeData>) => {
    set({
      edges: get().edges.map((e) =>
        e.id === edgeId
          ? { ...e, data: { ...e.data, ...data } as EdgeData }
          : e
      ),
    });
  },

  deleteNode: (nodeId: string) => {
    const state = get();
    pushHistory({ nodes: state.nodes, edges: state.edges, annotations: state.annotations });
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      ),
      selectedNodeId:
        get().selectedNodeId === nodeId ? null : get().selectedNodeId,
    });
    syncHistoryFlags(set);
  },

  deleteEdge: (edgeId: string) => {
    const state = get();
    pushHistory({ nodes: state.nodes, edges: state.edges, annotations: state.annotations });
    set({
      edges: get().edges.filter((e) => e.id !== edgeId),
      selectedEdgeId:
        get().selectedEdgeId === edgeId ? null : get().selectedEdgeId,
    });
    syncHistoryFlags(set);
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

  setSidebarTab: (tab) => {
    set({ sidebarTab: tab });
  },

  clearCanvas: () => {
    set({
      nodes: [],
      edges: [],
      annotations: [],
      selectedNodeId: null,
      selectedEdgeId: null,
      simulationResult: null,
      showSimulationPanel: false,
    });
  },

  loadDemoState: (nodes, edges, targetRps, opts) => {
    set({
      nodes,
      edges,
      selectedNodeId: null,
      selectedEdgeId: null,
      targetRps: targetRps ?? 10_000,
      simulationResult: opts?.simulationResult ?? null,
      showSimulationPanel: opts?.showSimulationPanel ?? false,
    });
  },

  // --- Timer ---
  startTimer: () => {
    set({ timerStartedAt: Date.now(), timerPausedAt: null });
  },
  pauseTimer: () => {
    set({ timerPausedAt: Date.now() });
  },
  resumeTimer: () => {
    const { timerStartedAt, timerPausedAt } = get();
    if (timerStartedAt && timerPausedAt) {
      const pausedDuration = Date.now() - timerPausedAt;
      set({ timerStartedAt: timerStartedAt + pausedDuration, timerPausedAt: null });
    }
  },
  resetTimer: () => {
    set({ timerStartedAt: null, timerPausedAt: null });
  },

  // --- Calculator ---
  toggleCalculator: () => {
    set({ showCalculator: !get().showCalculator });
  },
  updateEstimation: (partial) => {
    set({ envelopeEstimation: { ...get().envelopeEstimation, ...partial } });
  },
  resetEstimation: () => {
    set({ envelopeEstimation: { ...DEFAULT_ESTIMATION } });
  },

  // --- Requirements ---
  addFunctionalRequirement: (text: string) => {
    const id = `fr-${++reqIdCounter}-${Date.now()}`;
    set({
      functionalRequirements: [
        ...get().functionalRequirements,
        { id, text, checked: false },
      ],
    });
  },
  toggleFunctionalRequirement: (id: string) => {
    set({
      functionalRequirements: get().functionalRequirements.map((r) =>
        r.id === id ? { ...r, checked: !r.checked } : r
      ),
    });
  },
  removeFunctionalRequirement: (id: string) => {
    set({
      functionalRequirements: get().functionalRequirements.filter(
        (r) => r.id !== id
      ),
    });
  },
  addNonFunctionalRequirement: (category, label, target) => {
    const id = `nfr-${++reqIdCounter}-${Date.now()}`;
    set({
      nonFunctionalRequirements: [
        ...get().nonFunctionalRequirements,
        { id, category, label, target, checked: false },
      ],
    });
  },
  toggleNonFunctionalRequirement: (id: string) => {
    set({
      nonFunctionalRequirements: get().nonFunctionalRequirements.map((r) =>
        r.id === id ? { ...r, checked: !r.checked } : r
      ),
    });
  },
  removeNonFunctionalRequirement: (id: string) => {
    set({
      nonFunctionalRequirements: get().nonFunctionalRequirements.filter(
        (r) => r.id !== id
      ),
    });
  },

  // --- Annotations ---
  addAnnotation: (position, color = '#fef08a') => {
    const state = get();
    pushHistory({ nodes: state.nodes, edges: state.edges, annotations: state.annotations });
    const id = `annotation-${++annotationIdCounter}-${Date.now()}`;
    const newAnnotation: AnnotationNode = {
      id,
      type: 'annotation',
      position,
      data: { text: '', color },
    };
    set({ annotations: [...get().annotations, newAnnotation] });
    syncHistoryFlags(set);
  },
  updateAnnotation: (id, updates) => {
    set({
      annotations: get().annotations.map((a) =>
        a.id === id ? { ...a, data: { ...a.data, ...updates } } : a
      ),
    });
  },
  deleteAnnotation: (id: string) => {
    const state = get();
    pushHistory({ nodes: state.nodes, edges: state.edges, annotations: state.annotations });
    set({
      annotations: get().annotations.filter((a) => a.id !== id),
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
    });
    syncHistoryFlags(set);
  },

  // --- Undo/Redo ---
  undo: () => {
    const entry = history.undo();
    if (entry) {
      set({
        nodes: entry.nodes,
        edges: entry.edges,
        annotations: entry.annotations,
        selectedNodeId: null,
        selectedEdgeId: null,
      });
      syncHistoryFlags(set);
    }
  },
  redo: () => {
    const entry = history.redo();
    if (entry) {
      set({
        nodes: entry.nodes,
        edges: entry.edges,
        annotations: entry.annotations,
        selectedNodeId: null,
        selectedEdgeId: null,
      });
      syncHistoryFlags(set);
    }
  },

  // --- Templates ---
  loadTemplate: (nodes, edges, targetRps, requirements) => {
    const frItems: RequirementItem[] = (requirements?.fr ?? []).map((text, i) => ({
      id: `fr-tpl-${i}`,
      text,
      checked: false,
    }));
    const nfrItems: NonFunctionalRequirement[] = (requirements?.nfr ?? []).map((r, i) => ({
      id: `nfr-tpl-${i}`,
      ...r,
      checked: false,
    }));
    set({
      nodes,
      edges,
      annotations: [],
      selectedNodeId: null,
      selectedEdgeId: null,
      targetRps: targetRps ?? 10_000,
      simulationResult: null,
      showSimulationPanel: false,
      functionalRequirements: frItems,
      nonFunctionalRequirements: nfrItems,
    });
  },
}));
