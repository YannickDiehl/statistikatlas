import { memo } from 'react';
import { Handle, Position, type Node, type NodeProps } from '@xyflow/react';
import { ChevronDown, ChevronUp, ArrowUpRight, Check } from 'lucide-react';
import type { Concept } from '../domain/concepts';
import { categoryLabels } from '../lib/graph';

export type ConceptNodeData = {
  concept: Concept;
  value: string;
  valueLabel: string;
  selected: boolean;
  focus: boolean;
  expanded: boolean;
  hasInputs: boolean;
  inputCount: number;
  onSelect: (id: string) => void;
  onExpand: (id: string) => void;
};
export type AtlasNode = Node<ConceptNodeData, 'concept'>;

export const ConceptNode = memo(function ConceptNode({ data }: NodeProps<AtlasNode>) {
  const { concept } = data;
  return (
    <article className={`concept-card category-${concept.category} ${data.selected ? 'is-selected' : ''} ${data.focus ? 'is-focus' : ''}`} data-concept={concept.id}>
      <Handle type="source" position={Position.Top} isConnectable={false} />
      <button type="button" className="concept-main nodrag" onClick={event => { event.stopPropagation();data.onSelect(concept.id); }} aria-label={`${concept.title}: Erklärung anzeigen`}>
        <span className="concept-eyebrow">{data.focus ? 'Im Fokus' : categoryLabels[concept.category]}<ArrowUpRight size={13} /></span>
        <strong>{concept.title}</strong>
        <span className="concept-value" data-testid={`value-${concept.id}`}>{data.value}</span>
        <span className="concept-value-label">{data.valueLabel || concept.short}</span>
      </button>
      {data.hasInputs ? (
        <button type="button" className="concept-expand nodrag" onClick={event => { event.stopPropagation();data.onExpand(concept.id); }} aria-expanded={data.expanded} aria-label={`${concept.title}: Bausteine ${data.expanded ? 'zuklappen' : 'aufklappen'}`}>
          {data.expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          {data.expanded ? 'Bausteine zuklappen' : `${data.inputCount} Bausteine aufklappen`}
        </button>
      ) : <div className="concept-boundary"><Check size={12} />{concept.boundary ? 'Basis dieses Ausschnitts' : 'Erklärter Grundbaustein'}</div>}
      <Handle type="target" position={Position.Bottom} isConnectable={false} />
    </article>
  );
});
