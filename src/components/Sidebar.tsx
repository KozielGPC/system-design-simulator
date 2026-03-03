import { useState } from 'react';
import * as Icons from 'lucide-react';
import clsx from 'clsx';
import { COMPONENT_TYPES, CATEGORY_LABELS, CATEGORY_ORDER } from '../data/componentTypes';
import type { ComponentType } from '../types';
import { useStore } from '../store/useStore';
import { RequirementsPanel } from './RequirementsPanel';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyIcon = React.ComponentType<any>;

function getIcon(iconName: string): AnyIcon {
  return (Icons as unknown as Record<string, AnyIcon>)[iconName] ?? Icons.Box;
}

function DraggableComponent({ comp }: { comp: ComponentType }) {
  const Icon = getIcon(comp.icon);

  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/system-design', comp.id);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="group flex cursor-grab items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50 active:cursor-grabbing active:bg-gray-100"
      title={comp.description}
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105"
        style={{ backgroundColor: `${comp.color}14` }}
      >
        <Icon size={16} style={{ color: comp.color }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium text-gray-700">
          {comp.name}
        </div>
        <div className="truncate text-[11px] text-gray-400">
          {comp.description}
        </div>
      </div>
    </div>
  );
}

function ComponentsPanel() {
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(CATEGORY_ORDER)
  );

  const filtered = search
    ? COMPONENT_TYPES.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.description.toLowerCase().includes(search.toLowerCase())
      )
    : COMPONENT_TYPES;

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    label: CATEGORY_LABELS[cat],
    components: filtered.filter((c) => c.category === cat),
  })).filter((g) => g.components.length > 0);

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  return (
    <>
      <div className="px-3 py-2">
        <div className="relative">
          <Icons.Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300"
          />
          <input
            type="text"
            placeholder="Search components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border-light bg-gray-50/50 py-1.5 pl-8 pr-3 text-[13px] text-gray-700 placeholder-gray-300 outline-none transition-colors focus:border-indigo-300 focus:bg-white focus:ring-1 focus:ring-indigo-100"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {grouped.map(({ category, label, components }) => (
          <div key={category} className="mt-1">
            <button
              onClick={() => toggleCategory(category)}
              className="flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-400 transition-colors hover:text-gray-600"
            >
              <Icons.ChevronRight
                size={12}
                className={clsx(
                  'transition-transform',
                  expandedCategories.has(category) && 'rotate-90'
                )}
              />
              {label}
              <span className="text-gray-300">({components.length})</span>
            </button>
            {expandedCategories.has(category) && (
              <div className="mb-2 space-y-0.5">
                {components.map((comp) => (
                  <DraggableComponent key={comp.id} comp={comp} />
                ))}
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="mt-8 text-center text-[13px] text-gray-300">
            No components match your search
          </div>
        )}
      </div>

      <div className="border-t border-border-light px-4 py-3">
        <p className="text-[11px] leading-relaxed text-gray-500">
          Drag components onto the canvas and connect them to design your
          system architecture.
        </p>
      </div>
    </>
  );
}

export function Sidebar() {
  const sidebarCollapsed = useStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useStore((s) => s.toggleSidebar);
  const sidebarTab = useStore((s) => s.sidebarTab);
  const setSidebarTab = useStore((s) => s.setSidebarTab);

  if (sidebarCollapsed) {
    return (
      <div className="flex w-12 flex-col items-center border-r border-border-light bg-white py-3">
        <button
          onClick={toggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <Icons.PanelLeftOpen size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex w-[272px] shrink-0 flex-col border-r border-border-light bg-white">
      <div className="flex items-center justify-between border-b border-border-light px-4 py-3">
        <div className="flex gap-1">
          <button
            onClick={() => setSidebarTab('components')}
            className={clsx(
              'rounded-lg px-2.5 py-1 text-[12px] font-medium transition-colors',
              sidebarTab === 'components'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-400 hover:text-gray-600'
            )}
          >
            Components
          </button>
          <button
            onClick={() => setSidebarTab('requirements')}
            className={clsx(
              'rounded-lg px-2.5 py-1 text-[12px] font-medium transition-colors',
              sidebarTab === 'requirements'
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-400 hover:text-gray-600'
            )}
          >
            Requirements
          </button>
        </div>
        <button
          onClick={toggleSidebar}
          className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <Icons.PanelLeftClose size={14} />
        </button>
      </div>

      {sidebarTab === 'components' ? <ComponentsPanel /> : <RequirementsPanel />}
    </div>
  );
}
