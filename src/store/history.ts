import type { SystemNode, SystemEdge, AnnotationNode } from '../types';

export interface HistoryEntry {
  nodes: SystemNode[];
  edges: SystemEdge[];
  annotations: AnnotationNode[];
}

export function createHistory(maxEntries: number) {
  let past: HistoryEntry[] = [];
  let future: HistoryEntry[] = [];

  return {
    push(entry: HistoryEntry) {
      past.push(structuredClone(entry));
      if (past.length > maxEntries) past.shift();
      future = [];
    },

    undo(): HistoryEntry | null {
      if (past.length === 0) return null;
      const entry = past.pop()!;
      future.push(entry);
      return structuredClone(entry);
    },

    redo(): HistoryEntry | null {
      if (future.length === 0) return null;
      const entry = future.pop()!;
      past.push(entry);
      return structuredClone(entry);
    },

    canUndo() {
      return past.length > 0;
    },

    canRedo() {
      return future.length > 0;
    },

    clear() {
      past = [];
      future = [];
    },
  };
}
