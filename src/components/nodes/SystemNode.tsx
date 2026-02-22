import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import * as Icons from 'lucide-react';
import clsx from 'clsx';
import type { SystemNode as SystemNodeType } from '../../types';
import { getComponentType } from '../../data/componentTypes';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyIcon = React.ComponentType<any>;

function getIcon(iconName: string): AnyIcon {
  return (Icons as unknown as Record<string, AnyIcon>)[iconName] ?? Icons.Box;
}

function formatRps(rps: number): string {
  if (rps >= 1_000_000) return `${(rps / 1_000_000).toFixed(1)}M`;
  if (rps >= 1_000) return `${(rps / 1_000).toFixed(rps >= 10_000 ? 0 : 1)}k`;
  return rps.toString();
}

export const SystemNode = memo(function SystemNode({
  data,
  selected,
}: NodeProps<SystemNodeType>) {
  const compType = getComponentType(data.componentTypeId);
  if (!compType) return null;

  const Icon = getIcon(compType.icon);
  const isClient = data.componentTypeId === 'web-client' || data.componentTypeId === 'mobile-client';
  const sim = data.simulation;

  const statusColor = sim
    ? sim.status === 'healthy'
      ? 'border-emerald-400'
      : sim.status === 'warning'
        ? 'border-amber-400'
        : sim.status === 'critical'
          ? 'border-red-400'
          : 'border-border-light'
    : 'border-border-light';

  const statusBg = sim
    ? sim.status === 'healthy'
      ? 'bg-emerald-50'
      : sim.status === 'warning'
        ? 'bg-amber-50'
        : sim.status === 'critical'
          ? 'bg-red-50'
          : 'bg-white'
    : 'bg-white';

  return (
    <div
      className={clsx(
        'relative min-w-[180px] rounded-xl border-[1.5px] transition-all duration-200',
        statusColor,
        statusBg,
        selected
          ? 'shadow-node-selected ring-2 ring-indigo-500/20'
          : 'shadow-node hover:shadow-node-hover'
      )}
    >
      <div
        className="h-[3px] rounded-t-xl"
        style={{ backgroundColor: compType.color }}
      />

      <div className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${compType.color}14` }}
          >
            <Icon size={16} style={{ color: compType.color }} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-semibold text-gray-800">
              {data.label}
            </div>
            {!isClient && (
              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-gray-400">
                <span>{formatRps(data.config.throughput)} req/s</span>
                <span>·</span>
                <span>{data.config.latency}ms</span>
              </div>
            )}
          </div>
          {data.config.instances > 1 && (
            <div className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-100 px-1.5 text-[10px] font-semibold text-gray-500">
              ×{data.config.instances}
            </div>
          )}
        </div>

        {sim && sim.status !== 'idle' && !isClient && (
          <div className="mt-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-gray-400">Utilization</span>
              <span
                className={clsx(
                  'font-semibold',
                  sim.status === 'healthy' && 'text-emerald-600',
                  sim.status === 'warning' && 'text-amber-600',
                  sim.status === 'critical' && 'text-red-600'
                )}
              >
                {Math.min(sim.utilization * 100, 999).toFixed(0)}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div
                className={clsx(
                  'h-full rounded-full transition-all duration-500',
                  sim.status === 'healthy' && 'bg-emerald-400',
                  sim.status === 'warning' && 'bg-amber-400',
                  sim.status === 'critical' && 'bg-red-400'
                )}
                style={{
                  width: `${Math.min(sim.utilization * 100, 100)}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-gray-400">
              <span>{formatRps(Math.round(sim.incomingRps))} in</span>
              <span>{formatRps(sim.effectiveCapacity)} cap</span>
            </div>
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Left}
        className="!h-3 !w-3 !rounded-full !border-2 !border-gray-300 !bg-white hover:!border-indigo-400 hover:!bg-indigo-50"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!h-3 !w-3 !rounded-full !border-2 !border-gray-300 !bg-white hover:!border-indigo-400 hover:!bg-indigo-50"
      />
    </div>
  );
});
