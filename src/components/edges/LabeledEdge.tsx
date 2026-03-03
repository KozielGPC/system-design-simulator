import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
  type Edge,
} from '@xyflow/react';
import type { EdgeData } from '../../types';

const PROTOCOL_COLORS: Record<string, string> = {
  HTTP: '#3b82f6',
  gRPC: '#8b5cf6',
  WebSocket: '#10b981',
  TCP: '#64748b',
  AMQP: '#ec4899',
};

export function LabeledEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  style,
  markerEnd,
}: EdgeProps<Edge<EdgeData>>) {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const protocol = data?.protocol ?? 'HTTP';
  const isAsync = data?.isAsync ?? false;
  const label = data?.label ?? '';
  const protocolColor = PROTOCOL_COLORS[protocol] ?? '#94a3b8';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          strokeDasharray: isAsync ? '6 3' : undefined,
          stroke: selected ? '#6366f1' : (style?.stroke as string) ?? '#94a3b8',
          strokeWidth: selected ? 2.5 : 2,
        }}
      />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan pointer-events-auto flex items-center gap-1"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
        >
          <span
            className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-white"
            style={{ backgroundColor: protocolColor }}
          >
            {protocol}
          </span>
          {label && (
            <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-600 shadow-sm ring-1 ring-gray-200">
              {label}
            </span>
          )}
          {isAsync && (
            <span className="rounded bg-amber-50 px-1 py-0.5 text-[9px] font-medium text-amber-600 ring-1 ring-amber-200">
              async
            </span>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
