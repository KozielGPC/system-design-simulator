import { useCallback } from 'react';
import * as Icons from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '../store/useStore';
import { getComponentType } from '../data/componentTypes';
import type { ComponentTypeConfig } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyIcon = React.ComponentType<any>;

function getIcon(iconName: string): AnyIcon {
  return (Icons as unknown as Record<string, AnyIcon>)[iconName] ?? Icons.Box;
}

function NumberInput({
  label,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] font-medium text-gray-500">
        {label}
      </label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className="w-full rounded-lg border border-border-light bg-white px-3 py-1.5 text-[13px] text-gray-700 outline-none transition-colors focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-300">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function SliderInput({
  label,
  value,
  onChange,
  min = 0,
  max = 1,
  step = 0.01,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="text-[11px] font-medium text-gray-500">
          {label}
        </label>
        <span className="text-[11px] font-semibold text-gray-600">
          {(value * 100).toFixed(0)}%
        </span>
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full accent-indigo-500"
      />
    </div>
  );
}

export function PropertiesPanel() {
  const selectedNodeId = useStore((s) => s.selectedNodeId);
  const nodes = useStore((s) => s.nodes);
  const updateNodeLabel = useStore((s) => s.updateNodeLabel);
  const updateNodeConfig = useStore((s) => s.updateNodeConfig);
  const deleteNode = useStore((s) => s.deleteNode);
  const selectNode = useStore((s) => s.selectNode);

  const node = nodes.find((n) => n.id === selectedNodeId);

  const handleConfigChange = useCallback(
    (updates: Partial<ComponentTypeConfig>) => {
      if (selectedNodeId) updateNodeConfig(selectedNodeId, updates);
    },
    [selectedNodeId, updateNodeConfig]
  );

  if (!node) return null;

  const compType = getComponentType(node.data.componentTypeId);
  if (!compType) return null;

  const Icon = getIcon(compType.icon);
  const config = node.data.config;
  const isClient =
    node.data.componentTypeId === 'web-client' ||
    node.data.componentTypeId === 'mobile-client';

  return (
    <div className="flex w-[280px] shrink-0 flex-col border-l border-border-light bg-white">
      <div className="flex items-center justify-between border-b border-border-light px-4 py-3">
        <span className="text-[13px] font-semibold text-gray-700">
          Properties
        </span>
        <button
          onClick={() => selectNode(null)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <Icons.X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="border-b border-border-light p-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${compType.color}14` }}
            >
              <Icon size={20} style={{ color: compType.color }} />
            </div>
            <div>
              <div className="text-[11px] text-gray-400">{compType.name}</div>
              <div className="text-[11px] text-gray-300">
                {compType.description}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-gray-500">
              Label
            </label>
            <input
              type="text"
              value={node.data.label}
              onChange={(e) => updateNodeLabel(node.id, e.target.value)}
              className="w-full rounded-lg border border-border-light bg-white px-3 py-1.5 text-[13px] text-gray-700 outline-none transition-colors focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100"
            />
          </div>

          {!isClient && (
            <>
              <NumberInput
                label="Max Throughput (per instance)"
                value={config.throughput}
                onChange={(v) => handleConfigChange({ throughput: v })}
                min={0}
                step={100}
                suffix="req/s"
              />

              <NumberInput
                label="Latency"
                value={config.latency}
                onChange={(v) => handleConfigChange({ latency: v })}
                min={0}
                step={1}
                suffix="ms"
              />
            </>
          )}

          <div>
            <label className="mb-1 block text-[11px] font-medium text-gray-500">
              Scaling
            </label>
            <div className="flex gap-1.5">
              {(['horizontal', 'vertical', 'both'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => handleConfigChange({ scalingType: type })}
                  className={clsx(
                    'flex-1 rounded-lg px-2 py-1.5 text-[11px] font-medium capitalize transition-colors',
                    config.scalingType === type
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-500'
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-gray-500">
              Instances
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  handleConfigChange({
                    instances: Math.max(1, config.instances - 1),
                  })
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-light text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
              >
                <Icons.Minus size={14} />
              </button>
              <span className="min-w-[32px] text-center text-[15px] font-semibold text-gray-700">
                {config.instances}
              </span>
              <button
                onClick={() =>
                  handleConfigChange({ instances: config.instances + 1 })
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-light text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
              >
                <Icons.Plus size={14} />
              </button>
              <div className="flex-1 text-right text-[11px] text-gray-300">
                {!isClient && (
                  <>
                    Total:{' '}
                    {(config.throughput * config.instances).toLocaleString()}{' '}
                    req/s
                  </>
                )}
              </div>
            </div>
          </div>

          {config.cacheHitRate !== undefined && (
            <SliderInput
              label="Cache Hit Rate"
              value={config.cacheHitRate}
              onChange={(v) => handleConfigChange({ cacheHitRate: v })}
            />
          )}

          {config.replicationFactor !== undefined && (
            <NumberInput
              label="Replication Factor"
              value={config.replicationFactor}
              onChange={(v) => handleConfigChange({ replicationFactor: v })}
              min={1}
              max={10}
            />
          )}

          {config.partitions !== undefined && (
            <NumberInput
              label="Partitions"
              value={config.partitions}
              onChange={(v) => handleConfigChange({ partitions: v })}
              min={1}
              max={256}
            />
          )}
        </div>

        {node.data.simulation && node.data.simulation.status !== 'idle' && !isClient && (
          <div className="border-t border-border-light p-4">
            <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Simulation Results
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-gray-500">Incoming</span>
                <span className="text-[12px] font-medium text-gray-700">
                  {Math.round(node.data.simulation.incomingRps).toLocaleString()}{' '}
                  req/s
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-gray-500">Capacity</span>
                <span className="text-[12px] font-medium text-gray-700">
                  {node.data.simulation.effectiveCapacity.toLocaleString()} req/s
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-gray-500">Utilization</span>
                <span
                  className={clsx(
                    'text-[12px] font-semibold',
                    node.data.simulation.status === 'healthy' &&
                      'text-emerald-600',
                    node.data.simulation.status === 'warning' &&
                      'text-amber-600',
                    node.data.simulation.status === 'critical' && 'text-red-600'
                  )}
                >
                  {(node.data.simulation.utilization * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-border-light p-3">
        <button
          onClick={() => deleteNode(node.id)}
          className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-[12px] font-medium text-red-400 transition-colors hover:bg-red-50 hover:text-red-500"
        >
          <Icons.Trash2 size={13} />
          Delete Component
        </button>
      </div>
    </div>
  );
}
