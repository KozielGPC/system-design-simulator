import { useCallback, useRef, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  BackgroundVariant,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStore } from '../store/useStore';
import { SystemNode } from './nodes/SystemNode';
import { AnnotationNode } from './nodes/AnnotationNode';
import { LabeledEdge } from './edges/LabeledEdge';

const nodeTypes = { system: SystemNode, annotation: AnnotationNode };
const edgeTypes = { labeled: LabeledEdge };

export function Canvas() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reactFlowInstance = useRef<any>(null);
  const {
    nodes,
    edges,
    annotations,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    selectEdge,
    selectNode,
    addAnnotation,
  } = useStore();

  const allNodes = useMemo(
    () => [...nodes, ...annotations] as Node[],
    [nodes, annotations]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const componentTypeId = event.dataTransfer.getData(
        'application/system-design'
      );
      if (!componentTypeId || !reactFlowInstance.current) return;

      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(componentTypeId, position);
    },
    [addNode]
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onInit = useCallback((instance: any) => {
    reactFlowInstance.current = instance;
  }, []);

  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: { id: string }) => {
      selectEdge(edge.id);
    },
    [selectEdge]
  );

  const handlePaneClick = useCallback(() => {
    selectNode(null);
    selectEdge(null);
  }, [selectNode, selectEdge]);

  const handleDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      if (!reactFlowInstance.current) return;
      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      addAnnotation(position);
    },
    [addAnnotation]
  );

  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'labeled',
      style: { stroke: '#94a3b8', strokeWidth: 2 },
    }),
    []
  );

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={allNodes}
        edges={edges}
        onNodesChange={onNodesChange as OnNodesChange<Node>}
        onEdgesChange={onEdgesChange as OnEdgesChange<Edge>}
        onConnect={onConnect}
        onInit={onInit}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onEdgeClick={handleEdgeClick}
        onPaneClick={handlePaneClick}
        onDoubleClick={handleDoubleClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView={false}
        snapToGrid
        snapGrid={[16, 16]}
        deleteKeyCode={['Backspace', 'Delete']}
        proOptions={{ hideAttribution: true }}
        className="bg-canvas"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
          color="#d4d4cc"
        />
        <Controls
          showInteractive={false}
          className="!rounded-xl !border !border-border-light !bg-white !shadow-panel [&>button]:!rounded-lg [&>button]:!border-border-light [&>button]:!bg-white hover:[&>button]:!bg-gray-50"
        />
        <MiniMap
          nodeStrokeWidth={2}
          pannable
          zoomable
          className="!rounded-xl !border !border-border-light !bg-white/90 !shadow-panel"
          maskColor="rgba(250, 250, 248, 0.7)"
        />
        {nodes.length === 0 && annotations.length === 0 && (
          <Panel position="top-center">
            <div className="pointer-events-none mt-[25vh] flex flex-col items-center gap-4 rounded-2xl border border-border-light bg-white/90 px-10 py-8 text-center shadow-panel backdrop-blur-sm">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-indigo-400"
                >
                  <rect x="2" y="6" width="8" height="8" rx="2" />
                  <rect x="14" y="10" width="8" height="8" rx="2" />
                  <path d="M10 10h4" />
                </svg>
              </div>
              <div>
                <p className="text-[15px] font-semibold text-gray-600">
                  Design your system architecture
                </p>
                <p className="mt-1.5 max-w-[260px] text-[13px] leading-relaxed text-gray-400">
                  Drag components from the sidebar and connect them to build
                  and test your design
                </p>
              </div>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}
