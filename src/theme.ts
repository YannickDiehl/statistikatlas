/** SVG markers and paths share the poster palette defined in styles.css. */
export function connectionColor(kind: 'build' | 'condition' | 'optional', active: boolean) {
  if (kind === 'condition') return '#8B2E2E';
  if (kind === 'optional') return '#6B6558';
  return active ? '#8B2E2E' : '#6B6558';
}
