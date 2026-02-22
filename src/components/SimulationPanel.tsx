import * as Icons from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '../store/useStore';
import { getComponentType } from '../data/componentTypes';

function formatRps(rps: number): string {
  if (rps >= 1_000_000) return `${(rps / 1_000_000).toFixed(1)}M`;
  if (rps >= 1_000) return `${(rps / 1_000).toFixed(1)}k`;
  return rps.toString();
}

export function SimulationPanel() {
  const { simulationResult, showSimulationPanel, toggleSimulationPanel, nodes } =
    useStore();

  if (!simulationResult || !showSimulationPanel) return null;

  const { success, targetRps, maxAchievableRps, bottlenecks, nodeResults, totalLatencyMs } =
    simulationResult;

  const sortedResults = Array.from(nodeResults.values())
    .filter((r) => r.effectiveCapacity !== Infinity)
    .sort((a, b) => b.utilization - a.utilization);

  return (
    <div className="absolute bottom-4 left-1/2 z-50 w-[640px] max-w-[calc(100vw-32px)] -translate-x-1/2">
      <div className="overflow-hidden rounded-2xl border border-border-light bg-white shadow-panel">
        <div className="flex items-center justify-between border-b border-border-light px-5 py-3">
          <div className="flex items-center gap-3">
            {success ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50">
                <Icons.CheckCircle2 size={18} className="text-emerald-500" />
              </div>
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50">
                <Icons.AlertTriangle size={18} className="text-red-500" />
              </div>
            )}
            <div>
              <div className="text-[14px] font-semibold text-gray-800">
                {success
                  ? 'System can handle the load'
                  : `Bottleneck detected`}
              </div>
              <div className="text-[12px] text-gray-400">
                {success
                  ? `All components within capacity at ${formatRps(targetRps)} req/s`
                  : `Max achievable: ${formatRps(maxAchievableRps)} req/s of ${formatRps(targetRps)} target`}
              </div>
            </div>
          </div>

          <button
            onClick={toggleSimulationPanel}
            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <Icons.X size={14} />
          </button>
        </div>

        <div className="flex gap-px bg-gray-50">
          <Stat
            label="Target"
            value={formatRps(targetRps)}
            suffix="req/s"
          />
          <Stat
            label="Max Achievable"
            value={formatRps(maxAchievableRps)}
            suffix="req/s"
            highlight={!success}
          />
          <Stat
            label="E2E Latency"
            value={totalLatencyMs.toString()}
            suffix="ms"
          />
          <Stat
            label="Components"
            value={nodes.length.toString()}
          />
        </div>

        {bottlenecks.length > 0 && (
          <div className="border-t border-border-light px-5 py-3">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-red-400">
              Bottlenecks
            </h3>
            <div className="space-y-1.5">
              {bottlenecks.map((b) => {
                const compType = getComponentType(b.componentTypeId);
                return (
                  <div
                    key={b.nodeId}
                    className="flex items-center justify-between rounded-lg bg-red-50/50 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <Icons.AlertCircle size={13} className="text-red-400" />
                      <span className="text-[12px] font-medium text-gray-700">
                        {b.label}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {compType?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px]">
                      <span className="text-gray-400">
                        {formatRps(Math.round(b.incomingRps))} → {formatRps(b.effectiveCapacity)} cap
                      </span>
                      <span className="font-semibold text-red-500">
                        {(b.utilization * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {sortedResults.length > 0 && (
          <div className="border-t border-border-light px-5 py-3">
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Component Utilization
            </h3>
            <div className="max-h-[200px] space-y-1 overflow-y-auto">
              {sortedResults.map((r) => (
                <div
                  key={r.nodeId}
                  className="flex items-center gap-3 rounded-lg px-3 py-1.5"
                >
                  <span className="w-[120px] truncate text-[12px] text-gray-600">
                    {r.label}
                  </span>
                  <div className="flex-1">
                    <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={clsx(
                          'h-full rounded-full transition-all',
                          r.utilization <= 0.7 && 'bg-emerald-400',
                          r.utilization > 0.7 &&
                            r.utilization <= 0.9 &&
                            'bg-amber-400',
                          r.utilization > 0.9 && 'bg-red-400'
                        )}
                        style={{
                          width: `${Math.min(r.utilization * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <span
                    className={clsx(
                      'min-w-[40px] text-right text-[11px] font-semibold',
                      r.utilization <= 0.7 && 'text-emerald-600',
                      r.utilization > 0.7 &&
                        r.utilization <= 0.9 &&
                        'text-amber-600',
                      r.utilization > 0.9 && 'text-red-600'
                    )}
                  >
                    {Math.min(r.utilization * 100, 999).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
  highlight,
}: {
  label: string;
  value: string;
  suffix?: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col items-center bg-white px-4 py-3">
      <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
        {label}
      </div>
      <div className="mt-0.5 flex items-baseline gap-1">
        <span
          className={clsx(
            'text-[18px] font-bold',
            highlight ? 'text-red-500' : 'text-gray-800'
          )}
        >
          {value}
        </span>
        {suffix && (
          <span className="text-[11px] text-gray-400">{suffix}</span>
        )}
      </div>
    </div>
  );
}
