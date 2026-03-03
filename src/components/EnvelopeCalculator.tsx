import { useState } from 'react';
import * as Icons from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '../store/useStore';
import {
  computeEnvelope,
  formatBytes,
  formatBandwidth,
  formatQps,
} from '../utils/envelopeCalculator';

function CalcInput({
  label,
  value,
  onChange,
  suffix,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  step?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label className="text-[11px] text-gray-500">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          step={step}
          min={0}
          className="w-[120px] rounded-lg border border-border-light bg-white px-2 py-1 text-right text-[12px] text-gray-700 outline-none focus:border-indigo-300"
        />
        {suffix && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-300 pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function ResultCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-gray-50 px-3 py-2">
      <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
        {label}
      </div>
      <div className="mt-0.5 text-[14px] font-bold text-gray-800">{value}</div>
    </div>
  );
}

function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border-light">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-[12px] font-semibold text-gray-600 hover:bg-gray-50"
      >
        {title}
        <Icons.ChevronRight
          size={14}
          className={clsx('transition-transform text-gray-400', open && 'rotate-90')}
        />
      </button>
      {open && <div className="space-y-2.5 px-4 pb-4">{children}</div>}
    </div>
  );
}

export function EnvelopeCalculator() {
  const { showCalculator, toggleCalculator, envelopeEstimation, updateEstimation, resetEstimation, setTargetRps } =
    useStore();

  if (!showCalculator) return null;

  const results = computeEnvelope(envelopeEstimation);
  const est = envelopeEstimation;

  return (
    <div className="absolute right-0 top-0 z-40 flex h-full w-[360px] flex-col border-l border-border-light bg-white shadow-lg">
      <div className="flex items-center justify-between border-b border-border-light px-4 py-3">
        <div className="flex items-center gap-2">
          <Icons.Calculator size={16} className="text-indigo-500" />
          <span className="text-[13px] font-semibold text-gray-700">
            Estimation Calculator
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={resetEstimation}
            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            title="Reset"
          >
            <Icons.RotateCcw size={13} />
          </button>
          <button
            onClick={toggleCalculator}
            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <Icons.X size={14} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Section title="Traffic">
          <CalcInput
            label="Daily Active Users"
            value={est.dau}
            onChange={(v) => updateEstimation({ dau: v })}
            step={100000}
          />
          <CalcInput
            label="Read:Write Ratio"
            value={est.readWriteRatio}
            onChange={(v) => updateEstimation({ readWriteRatio: v })}
            step={1}
          />
          <CalcInput
            label="Avg Requests/User/Day"
            value={est.avgRequestsPerUser}
            onChange={(v) => updateEstimation({ avgRequestsPerUser: v })}
            step={5}
          />
          <CalcInput
            label="Peak Multiplier"
            value={est.peakMultiplier}
            onChange={(v) => updateEstimation({ peakMultiplier: v })}
            step={0.5}
          />

          <div className="mt-1 grid grid-cols-2 gap-2">
            <ResultCard label="Avg Read QPS" value={formatQps(results.avgReadQps)} />
            <ResultCard label="Avg Write QPS" value={formatQps(results.avgWriteQps)} />
            <ResultCard label="Peak Read QPS" value={formatQps(results.peakReadQps)} />
            <ResultCard label="Peak Write QPS" value={formatQps(results.peakWriteQps)} />
          </div>

          <button
            onClick={() =>
              setTargetRps(Math.round(results.peakReadQps + results.peakWriteQps))
            }
            className="mt-1 w-full rounded-lg bg-indigo-50 py-1.5 text-[11px] font-semibold text-indigo-600 transition-colors hover:bg-indigo-100"
          >
            Apply Peak QPS as Target RPS
          </button>
        </Section>

        <Section title="Storage" defaultOpen={false}>
          <CalcInput
            label="Record Size"
            value={est.recordSizeBytes}
            onChange={(v) => updateEstimation({ recordSizeBytes: v })}
            suffix="B"
            step={256}
          />
          <CalcInput
            label="New Records/Day"
            value={est.newRecordsPerDay}
            onChange={(v) => updateEstimation({ newRecordsPerDay: v })}
            step={10000}
          />
          <CalcInput
            label="Retention"
            value={est.retentionYears}
            onChange={(v) => updateEstimation({ retentionYears: v })}
            suffix="yrs"
            step={1}
          />

          <div className="mt-1 grid grid-cols-2 gap-2">
            <ResultCard label="Daily" value={formatBytes(results.dailyStorageBytes)} />
            <ResultCard label="Yearly" value={formatBytes(results.yearlyStorageBytes)} />
            <ResultCard label="Total" value={formatBytes(results.totalStorageBytes)} />
          </div>
        </Section>

        <Section title="Bandwidth" defaultOpen={false}>
          <CalcInput
            label="Avg Read Payload"
            value={est.avgReadPayloadBytes}
            onChange={(v) => updateEstimation({ avgReadPayloadBytes: v })}
            suffix="B"
            step={256}
          />
          <CalcInput
            label="Avg Write Payload"
            value={est.avgWritePayloadBytes}
            onChange={(v) => updateEstimation({ avgWritePayloadBytes: v })}
            suffix="B"
            step={256}
          />

          <div className="mt-1 grid grid-cols-2 gap-2">
            <ResultCard label="Incoming" value={formatBandwidth(results.incomingBandwidthBps)} />
            <ResultCard label="Outgoing" value={formatBandwidth(results.outgoingBandwidthBps)} />
            <ResultCard
              label="Peak In"
              value={formatBandwidth(results.peakIncomingBandwidthBps)}
            />
            <ResultCard
              label="Peak Out"
              value={formatBandwidth(results.peakOutgoingBandwidthBps)}
            />
          </div>
        </Section>
      </div>
    </div>
  );
}
