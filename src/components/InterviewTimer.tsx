import { useState, useEffect, useCallback } from 'react';
import * as Icons from 'lucide-react';
import { useStore } from '../store/useStore';
import { INTERVIEW_PHASES } from '../data/interviewPhases';

export function InterviewTimer() {
  const {
    timerStartedAt,
    timerPausedAt,
    timerTotalMinutes,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
  } = useStore();

  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!timerStartedAt || timerPausedAt) {
      if (timerStartedAt && timerPausedAt) {
        setElapsed(timerPausedAt - timerStartedAt);
      }
      return;
    }
    const tick = () => setElapsed(Date.now() - timerStartedAt);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timerStartedAt, timerPausedAt]);

  const elapsedSec = Math.floor(elapsed / 1000);
  const minutes = Math.floor(elapsedSec / 60);
  const seconds = elapsedSec % 60;
  const isRunning = timerStartedAt !== null && timerPausedAt === null;
  const isPaused = timerStartedAt !== null && timerPausedAt !== null;
  const elapsedMinutes = elapsedSec / 60;

  const currentPhase = INTERVIEW_PHASES.find(
    (p) => elapsedMinutes >= p.startMinute && elapsedMinutes < p.endMinute
  );

  const handlePlayPause = useCallback(() => {
    if (!timerStartedAt) startTimer();
    else if (isPaused) resumeTimer();
    else pauseTimer();
  }, [timerStartedAt, isPaused, startTimer, resumeTimer, pauseTimer]);

  const [hoveredPhase, setHoveredPhase] = useState<string | null>(null);
  const hintPhase = INTERVIEW_PHASES.find((p) => p.id === hoveredPhase);

  return (
    <div className="relative flex items-center gap-2">
      <button
        onClick={handlePlayPause}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
        title={isRunning ? 'Pause' : 'Start'}
      >
        {isRunning ? <Icons.Pause size={14} /> : <Icons.Play size={14} />}
      </button>

      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[13px] font-semibold text-gray-700">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </span>
          <span className="text-[11px] text-gray-300">/</span>
          <span className="font-mono text-[11px] text-gray-400">
            {timerTotalMinutes}:00
          </span>
        </div>

        <div className="flex h-1.5 w-[180px] overflow-hidden rounded-full bg-gray-100">
          {INTERVIEW_PHASES.map((phase) => {
            const widthPct =
              ((phase.endMinute - phase.startMinute) / timerTotalMinutes) * 100;
            const isCurrent = currentPhase?.id === phase.id;
            return (
              <div
                key={phase.id}
                className="relative cursor-pointer transition-opacity"
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: isCurrent ? phase.color : `${phase.color}40`,
                  opacity: elapsedMinutes > phase.endMinute ? 0.5 : 1,
                }}
                onMouseEnter={() => setHoveredPhase(phase.id)}
                onMouseLeave={() => setHoveredPhase(null)}
              />
            );
          })}
        </div>

        {currentPhase && (
          <span
            className="text-[10px] font-medium"
            style={{ color: currentPhase.color }}
          >
            {currentPhase.name}
          </span>
        )}
      </div>

      <button
        onClick={resetTimer}
        disabled={!timerStartedAt}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-30"
        title="Reset"
      >
        <Icons.RotateCcw size={13} />
      </button>

      {hintPhase && (
        <div className="absolute left-1/2 top-full z-50 mt-2 w-[240px] -translate-x-1/2 rounded-xl border border-border-light bg-white p-3 shadow-lg">
          <div
            className="mb-2 text-[11px] font-semibold"
            style={{ color: hintPhase.color }}
          >
            {hintPhase.name} ({hintPhase.startMinute}-{hintPhase.endMinute} min)
          </div>
          <ul className="space-y-1">
            {hintPhase.hints.map((hint, i) => (
              <li key={i} className="text-[11px] leading-relaxed text-gray-500">
                • {hint}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
