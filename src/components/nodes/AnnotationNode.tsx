import { memo, useCallback } from 'react';
import { type NodeProps } from '@xyflow/react';
import type { AnnotationNode as AnnotationNodeType } from '../../types';
import { useStore } from '../../store/useStore';

const COLOR_MAP: Record<string, { bg: string; border: string }> = {
  '#fef08a': { bg: '#fef9c3', border: '#fde047' },
  '#bfdbfe': { bg: '#dbeafe', border: '#93c5fd' },
  '#bbf7d0': { bg: '#dcfce7', border: '#86efac' },
  '#fecdd3': { bg: '#ffe4e6', border: '#fda4af' },
  '#e5e7eb': { bg: '#f3f4f6', border: '#d1d5db' },
};

export const AnnotationNode = memo(function AnnotationNode({
  id,
  data,
  selected,
}: NodeProps<AnnotationNodeType>) {
  const updateAnnotation = useStore((s) => s.updateAnnotation);

  const colors = COLOR_MAP[data.color] ?? { bg: data.color, border: data.color };

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateAnnotation(id, { text: e.target.value });
    },
    [id, updateAnnotation]
  );

  return (
    <div
      className="nodrag min-w-[140px] max-w-[260px] rounded-lg p-3 shadow-sm transition-shadow"
      style={{
        backgroundColor: colors.bg,
        border: `1.5px solid ${selected ? '#6366f1' : colors.border}`,
        boxShadow: selected ? '0 0 0 2px rgba(99,102,241,0.2)' : undefined,
      }}
    >
      <textarea
        value={data.text}
        onChange={handleChange}
        placeholder="Add note..."
        rows={3}
        className="w-full resize-none bg-transparent text-[12px] leading-relaxed text-gray-700 placeholder-gray-400 outline-none"
        style={{ minWidth: 120 }}
      />
    </div>
  );
});
