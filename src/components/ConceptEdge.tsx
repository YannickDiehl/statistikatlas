import { BaseEdge, EdgeLabelRenderer, type Edge, type EdgeProps } from '@xyflow/react';
import type { Point } from '../lib/graph';
import { connectionColor } from '../theme';

export type AtlasEdge = Edge<{
  points: Point[];
  labelPosition: Point;
  label: string;
  kind: 'build' | 'condition' | 'optional';
  active: boolean;
}, 'conceptEdge'>;

function roundPolyline(points: Point[], radius = 12) {
  if (!points.length) return '';
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const a = points[i - 1], b = points[i], c = points[i + 1];
    const ab = Math.hypot(b.x - a.x, b.y - a.y), bc = Math.hypot(c.x - b.x, c.y - b.y);
    if (!ab || !bc) continue;
    const r = Math.min(radius, ab / 2, bc / 2);
    const p = { x: b.x + (a.x - b.x) * r / ab, y: b.y + (a.y - b.y) * r / ab };
    const q = { x: b.x + (c.x - b.x) * r / bc, y: b.y + (c.y - b.y) * r / bc };
    path += ` L ${p.x} ${p.y} Q ${b.x} ${b.y} ${q.x} ${q.y}`;
  }
  const end = points.at(-1)!;return `${path} L ${end.x} ${end.y}`;
}

export function ConceptEdge({ id, data, markerEnd }: EdgeProps<AtlasEdge>) {
  if (!data) return null;
  const color = connectionColor(data.kind, data.active);
  return <>
    <BaseEdge id={id} path={roundPolyline(data.points)} markerEnd={markerEnd} style={{ stroke: color, strokeWidth: data.active ? 2 : 1.5, strokeDasharray: data.kind === 'condition' ? '3 5' : data.kind === 'optional' ? '7 5' : undefined }} />
    <EdgeLabelRenderer>
      <span className={`connection-label connection-${data.kind} ${data.active ? 'is-active' : ''}`} style={{ transform: `translate(-50%, -50%) translate(${data.labelPosition.x}px, ${data.labelPosition.y}px)` }}>{data.label}</span>
    </EdgeLabelRenderer>
  </>;
}
