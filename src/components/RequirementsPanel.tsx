import { useState } from 'react';
import * as Icons from 'lucide-react';
import clsx from 'clsx';
import { useStore } from '../store/useStore';
import { FR_SUGGESTIONS, NFR_PRESETS } from '../data/requirementSuggestions';

export function RequirementsPanel() {
  const {
    functionalRequirements,
    nonFunctionalRequirements,
    addFunctionalRequirement,
    toggleFunctionalRequirement,
    removeFunctionalRequirement,
    addNonFunctionalRequirement,
    toggleNonFunctionalRequirement,
    removeNonFunctionalRequirement,
  } = useStore();

  const [newFr, setNewFr] = useState('');
  const [showFrSuggestions, setShowFrSuggestions] = useState(false);
  const [showNfrPresets, setShowNfrPresets] = useState(false);

  const handleAddFr = () => {
    if (newFr.trim()) {
      addFunctionalRequirement(newFr.trim());
      setNewFr('');
    }
  };

  const frChecked = functionalRequirements.filter((r) => r.checked).length;
  const nfrChecked = nonFunctionalRequirements.filter((r) => r.checked).length;

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Functional Requirements */}
      <div className="border-b border-border-light px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Functional ({frChecked}/{functionalRequirements.length})
          </span>
          <button
            onClick={() => setShowFrSuggestions(!showFrSuggestions)}
            className="flex h-6 items-center gap-1 rounded px-1.5 text-[10px] font-medium text-indigo-500 hover:bg-indigo-50"
          >
            <Icons.Lightbulb size={11} />
            Suggest
          </button>
        </div>
      </div>

      {showFrSuggestions && (
        <div className="border-b border-border-light bg-indigo-50/50 px-3 py-2">
          <div className="mb-1 text-[10px] font-medium text-indigo-400">
            Click to add:
          </div>
          <div className="flex flex-wrap gap-1">
            {FR_SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                onClick={() => {
                  addFunctionalRequirement(s);
                  setShowFrSuggestions(false);
                }}
                className="rounded bg-white px-2 py-1 text-[10px] text-gray-600 shadow-sm ring-1 ring-gray-200 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="space-y-1">
          {functionalRequirements.map((req) => (
            <div
              key={req.id}
              className="group flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50"
            >
              <button
                onClick={() => toggleFunctionalRequirement(req.id)}
                className={clsx(
                  'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                  req.checked
                    ? 'border-indigo-500 bg-indigo-500'
                    : 'border-gray-300 hover:border-indigo-400'
                )}
              >
                {req.checked && <Icons.Check size={10} className="text-white" />}
              </button>
              <span
                className={clsx(
                  'flex-1 text-[12px] leading-relaxed',
                  req.checked ? 'text-gray-300 line-through' : 'text-gray-600'
                )}
              >
                {req.text}
              </span>
              <button
                onClick={() => removeFunctionalRequirement(req.id)}
                className="hidden h-5 w-5 shrink-0 items-center justify-center rounded text-gray-300 hover:text-red-400 group-hover:flex"
              >
                <Icons.X size={11} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-2 flex gap-1.5">
          <input
            type="text"
            placeholder="Add requirement..."
            value={newFr}
            onChange={(e) => setNewFr(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddFr()}
            className="flex-1 rounded-lg border border-border-light bg-gray-50/50 px-2.5 py-1.5 text-[12px] text-gray-700 placeholder-gray-300 outline-none focus:border-indigo-300 focus:bg-white"
          />
          <button
            onClick={handleAddFr}
            disabled={!newFr.trim()}
            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg bg-indigo-500 text-white transition-colors hover:bg-indigo-600 disabled:bg-gray-200 disabled:text-gray-400"
          >
            <Icons.Plus size={14} />
          </button>
        </div>
      </div>

      {/* Non-Functional Requirements */}
      <div className="border-t border-border-light px-3 py-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Non-Functional ({nfrChecked}/{nonFunctionalRequirements.length})
          </span>
          <button
            onClick={() => setShowNfrPresets(!showNfrPresets)}
            className="flex h-6 items-center gap-1 rounded px-1.5 text-[10px] font-medium text-indigo-500 hover:bg-indigo-50"
          >
            <Icons.ListPlus size={11} />
            Presets
          </button>
        </div>
      </div>

      {showNfrPresets && (
        <div className="border-b border-border-light bg-indigo-50/50 px-3 py-2">
          <div className="mb-1 text-[10px] font-medium text-indigo-400">
            Click to add:
          </div>
          <div className="flex flex-wrap gap-1">
            {NFR_PRESETS.map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  addNonFunctionalRequirement(p.category, p.label, p.target);
                  setShowNfrPresets(false);
                }}
                className="rounded bg-white px-2 py-1 text-[10px] text-gray-600 shadow-sm ring-1 ring-gray-200 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="max-h-[200px] overflow-y-auto px-3 py-2">
        <div className="space-y-1">
          {nonFunctionalRequirements.map((req) => (
            <div
              key={req.id}
              className="group flex items-start gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-50"
            >
              <button
                onClick={() => toggleNonFunctionalRequirement(req.id)}
                className={clsx(
                  'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors',
                  req.checked
                    ? 'border-emerald-500 bg-emerald-500'
                    : 'border-gray-300 hover:border-emerald-400'
                )}
              >
                {req.checked && <Icons.Check size={10} className="text-white" />}
              </button>
              <div className="min-w-0 flex-1">
                <span
                  className={clsx(
                    'text-[12px]',
                    req.checked ? 'text-gray-300 line-through' : 'text-gray-600'
                  )}
                >
                  {req.label}
                </span>
                <div className="text-[10px] text-gray-400">
                  <span className="font-medium">{req.category}</span> · {req.target}
                </div>
              </div>
              <button
                onClick={() => removeNonFunctionalRequirement(req.id)}
                className="hidden h-5 w-5 shrink-0 items-center justify-center rounded text-gray-300 hover:text-red-400 group-hover:flex"
              >
                <Icons.X size={11} />
              </button>
            </div>
          ))}

          {nonFunctionalRequirements.length === 0 && (
            <div className="py-2 text-center text-[11px] text-gray-300">
              Click "Presets" to add common NFRs
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
