import * as Icons from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '../store/useStore';

export function Toolbar() {
  const {
    nodes,
    targetRps,
    setTargetRps,
    simulate,
    clearSimulation,
    clearCanvas,
    isSimulating,
    simulationResult,
  } = useStore();

  const hasNodes = nodes.length > 0;
  const hasSimulation = simulationResult !== null;

  return (
    <div className="flex h-[52px] items-center justify-between border-b border-border-light bg-white px-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
            <Icons.Boxes size={18} className="text-indigo-500" />
          </div>
          <div>
            <h1 className="text-[14px] font-bold leading-tight text-gray-800">
              System Design Simulator
            </h1>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-lg border border-border-light bg-gray-50/50 px-3 py-1.5">
          <Icons.Gauge size={13} className="text-gray-400" />
          <span className="text-[11px] font-medium text-gray-400">
            Target:
          </span>
          <input
            type="number"
            value={targetRps}
            onChange={(e) => setTargetRps(Number(e.target.value))}
            className="w-[80px] bg-transparent text-[13px] font-semibold text-gray-700 outline-none"
            min={0}
            step={1000}
          />
          <span className="text-[11px] text-gray-400">req/s</span>
        </div>

        <div className="mx-1 h-5 w-px bg-border-light" />

        {hasSimulation ? (
          <button
            onClick={clearSimulation}
            className="flex items-center gap-1.5 rounded-lg border border-border-light px-3 py-1.5 text-[12px] font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
          >
            <Icons.RotateCcw size={13} />
            Reset
          </button>
        ) : null}

        <button
          onClick={simulate}
          disabled={!hasNodes || isSimulating}
          className={clsx(
            'flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-[12px] font-semibold transition-all',
            hasNodes && !isSimulating
              ? 'bg-indigo-500 text-white shadow-sm hover:bg-indigo-600 active:bg-indigo-700'
              : 'cursor-not-allowed bg-gray-100 text-gray-300'
          )}
        >
          {isSimulating ? (
            <>
              <Icons.Loader2 size={13} className="animate-spin" />
              Simulating...
            </>
          ) : (
            <>
              <Icons.Play size={13} />
              Simulate
            </>
          )}
        </button>

        <div className="mx-1 h-5 w-px bg-border-light" />

        <button
          onClick={clearCanvas}
          disabled={!hasNodes}
          className={clsx(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors',
            hasNodes
              ? 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
              : 'cursor-not-allowed text-gray-200'
          )}
        >
          <Icons.Trash2 size={13} />
          Clear
        </button>
      </div>
    </div>
  );
}
