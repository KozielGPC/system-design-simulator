import { useState, useRef, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { useStore } from '../store/useStore';
import { TEMPLATES } from '../data/templates';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyIcon = React.ComponentType<any>;

function getIcon(iconName: string): AnyIcon {
  return (Icons as unknown as Record<string, AnyIcon>)[iconName] ?? Icons.Box;
}

export function TemplatePicker() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const loadTemplate = useStore((s) => s.loadTemplate);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 rounded-lg border border-border-light px-3 py-1.5 text-[12px] font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
      >
        <Icons.LayoutTemplate size={13} />
        Templates
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[320px] overflow-hidden rounded-xl border border-border-light bg-white shadow-lg">
          <div className="border-b border-border-light px-4 py-2.5">
            <span className="text-[12px] font-semibold text-gray-600">
              Design Templates
            </span>
          </div>
          <div className="max-h-[400px] overflow-y-auto p-2">
            {TEMPLATES.map((tpl) => {
              const Icon = getIcon(tpl.icon);
              return (
                <button
                  key={tpl.id}
                  onClick={() => {
                    loadTemplate(tpl.nodes, tpl.edges, tpl.targetRps, tpl.requirements);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                    <Icon size={18} className="text-indigo-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium text-gray-700">
                      {tpl.name}
                    </div>
                    <div className="truncate text-[11px] text-gray-400">
                      {tpl.description}
                    </div>
                  </div>
                  <span className="shrink-0 text-[10px] text-gray-300">
                    {tpl.nodes.length} nodes
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
