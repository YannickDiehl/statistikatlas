import dagre from '@dagrejs/dagre';
import { concepts, connections, type Concept } from '../domain/concepts';

export const NODE_WIDTH = 248;
export const NODE_HEIGHT = 184;
export type Point = { x: number; y: number };
export type Diagram = {
  nodes: { id: string; position: Point }[];
  edges: { id: string; points: Point[]; labelPosition: Point }[];
};

export function incoming(id: string, alternatives = true) {
  return connections.filter(e => e.target === id && (alternatives || e.kind !== 'optional'));
}

export function visibleConcepts(focus: string, expanded: Set<string>, alternatives: boolean, whole = false): Set<string> {
  if (whole) return new Set(concepts.map(n => n.id));
  const visible = new Set<string>([focus]);
  const visited = new Set<string>();
  function visit(id: string) {
    if (visited.has(id) || !expanded.has(id)) return;
    visited.add(id);
    for (const e of incoming(id, alternatives)) {
      visible.add(e.source); visit(e.source);
    }
  }
  visit(focus);
  return visible;
}

/** A shared prerequisite is a single node, even when reached by several paths. */
export function allAncestors(focus: string, alternatives = true): Set<string> {
  const found = new Set<string>();
  const visit = (id: string) => {
    if (found.has(id)) return;
    found.add(id);
    for (const e of incoming(id, alternatives)) visit(e.source);
  };
  visit(focus); return found;
}

export function prerequisitePath(focus: string, target: string, alternatives = true): string[] | null {
  const queue: string[][] = [[focus]], visited = new Set<string>();
  while (queue.length) {
    const path = queue.shift()!;
    const last = path.at(-1)!;
    if (last === target) return path;
    if (visited.has(last)) continue;
    visited.add(last);
    for (const e of incoming(last, alternatives)) queue.push([...path, e.source]);
  }
  return null;
}

export function arrange(visible: Set<string>, alternatives: boolean): Diagram {
  const graph = new dagre.graphlib.Graph({ multigraph: true });
  graph.setGraph({ rankdir: 'BT', nodesep: 46, ranksep: 82, edgesep: 25, marginx: 30, marginy: 30 });
  graph.setDefaultEdgeLabel(() => ({}));
  for (const n of concepts.filter(n => visible.has(n.id))) {
    graph.setNode(n.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  }
  const edges = connections.filter(e => visible.has(e.source) && visible.has(e.target) && (alternatives || e.kind !== 'optional'));
  for (const e of edges) {
    graph.setEdge(e.source, e.target, {
      width: 142, height: 36, labelpos: 'c', labeloffset: 8,
      weight: e.kind === 'build' ? 3 : 1,
    }, e.id);
  }
  dagre.layout(graph);
  return {
    nodes: concepts.filter(n => visible.has(n.id)).map(n => {
      const position = graph.node(n.id);
      return { id: n.id, position: { x: position.x - NODE_WIDTH / 2, y: position.y - NODE_HEIGHT / 2 } };
    }),
    edges: edges.map(e => {
      const path = graph.edge({ v: e.source, w: e.target, name: e.id });
      return { id: e.id, points: path.points, labelPosition: { x: path.x, y: path.y } };
    }),
  };
}

export const categoryLabels: Record<Concept['category'], string> = {
  data: 'Daten', operation: 'Rechenschritt', summary: 'Kennzahl', relationship: 'Zusammenhang',
};

export const edgeLabels = { build: 'Rechenzutat', condition: 'Bedingung', optional: 'Alternativer Weg' };
