import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Background, Controls, Handle, MarkerType, MiniMap, Position, ReactFlow, type Edge, type Node, type NodeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { AlertTriangle, ArrowRight, CheckCircle2, ChevronRight, CircleDot, Clock3, LockKeyhole, MapPin, Network, PlayCircle, ShieldCheck, Unlock, X } from 'lucide-react';
import { useAppStore } from '@/lib/use-app-store';
import { APPROVAL_GRAPH_STAGES, calculateCriticalPath, MAHARASHTRA_COLD_STORAGE_EDGES, MAHARASHTRA_COLD_STORAGE_NODES, resolveApprovalStatuses, validateApprovalGraph, type ApprovalGraphNode, type ApprovalGraphStage, type ApprovalGraphStatus } from '@/lib/approval-graph';
import { usePrevalidation } from '@/lib/prevalidation/use-prevalidation';
import type { OverallStatus } from '@/lib/prevalidation';
import './RoadmapPage.css';

// Base graph statuses plus the two engine-driven escalations overlaid by the
// live Module 07 pre-validation engine: BLOCKED = a direct blocking issue on
// that node; REVIEW = ambiguous/conflicting evidence that needs a human.
export type DisplayStatus = ApprovalGraphStatus | 'BLOCKED' | 'REVIEW';

type ApprovalNodeData = { approval: ApprovalGraphNode; status: DisplayStatus; applicationStatus?: string; selected: boolean; onSelect: (id: string) => void };
type StageNodeData = { stage: ApprovalGraphStage };

const STATUS_META: Record<DisplayStatus, { label: string; icon: React.ReactNode }> = {
  COMPLETED: { label: 'Completed', icon: <CheckCircle2 size={12} /> },
  IN_PROGRESS: { label: 'In progress', icon: <PlayCircle size={12} /> },
  READY_TO_APPLY: { label: 'Ready to apply', icon: <Unlock size={12} /> },
  LOCKED: { label: 'Locked', icon: <LockKeyhole size={12} /> },
  BLOCKED: { label: 'Blocked', icon: <AlertTriangle size={12} /> },
  REVIEW: { label: 'Review', icon: <CircleDot size={12} /> },
};

// Short labels for the live engine verdict rendered in the footer.
const PREVAL_LABEL: Record<OverallStatus, string> = {
  READY_TO_SUBMIT: 'Ready to submit',
  BLOCKED: 'Submission blocked',
  REVIEW_REQUIRED: 'Manual review required',
  PARTIALLY_VALID: 'Partially valid (warnings)',
};

function ApprovalNode({ data }: NodeProps<Node<ApprovalNodeData>>) {
  const { approval, status, selected, onSelect, applicationStatus } = data;
  const meta = STATUS_META[status];
  return <button type="button" className={`approval-flow-node approval-flow-node--${status.toLowerCase()} ${selected ? 'is-selected' : ''}`} onClick={() => onSelect(approval.id)} aria-label={`Open statutory details for ${approval.title}`}>
    <Handle type="target" position={Position.Left} className="approval-flow-handle" />
    <div className="approval-flow-node__topline"><span className="approval-flow-node__code">{approval.id.replace('MH_', '').replaceAll('_', ' ')}</span><span className={`approval-status approval-status--${status.toLowerCase()}`}>{meta.icon}{meta.label}</span></div>
    <span className="approval-flow-node__title">{approval.title}</span><span className="approval-flow-node__authority">{approval.authority}</span>
    <div className="approval-flow-node__footer"><span><Clock3 size={12} /> {approval.durationDays} days</span>{approval.applicationLinked && applicationStatus && <span className="approval-flow-node__live">LIVE</span>}</div>
    <Handle type="source" position={Position.Right} className="approval-flow-handle" />
  </button>;
}

function StageNode({ data }: NodeProps<Node<StageNodeData>>) {
  const stage = APPROVAL_GRAPH_STAGES[data.stage];
  return <div className="approval-stage-node"><div className="approval-stage-node__label">{stage.title}</div><div className="approval-stage-node__subtitle">{stage.subtitle}</div></div>;
}

const nodeTypes = { approval: ApprovalNode, stage: StageNode };
const graphPositions: Record<string, { x: number; y: number }> = {
  MH_MPCB_CTE: { x: 42, y: 222 }, MH_MIDC_PLAN_FIRE: { x: 278, y: 142 }, MH_FSSAI_CENTRAL: { x: 278, y: 310 }, MH_MSEDCL_HT: { x: 570, y: 142 }, MH_MIDC_WATER: { x: 570, y: 310 }, MH_MPCB_CTO: { x: 860, y: 142 }, MH_FIRE_FINAL: { x: 1100, y: 142 }, MH_DISH_FACTORY: { x: 1340, y: 142 }, MH_LABOUR_BOCW: { x: 1100, y: 310 },
};
const stageNodes: Node<StageNodeData>[] = [
  { id: 'stage-foundation', type: 'stage', position: { x: 12, y: 18 }, data: { stage: 'FOUNDATION' }, draggable: false, selectable: false, style: { width: 510, height: 442 }, zIndex: -1 },
  { id: 'stage-utilities', type: 'stage', position: { x: 540, y: 18 }, data: { stage: 'UTILITIES' }, draggable: false, selectable: false, style: { width: 500, height: 442 }, zIndex: -1 },
  { id: 'stage-operations', type: 'stage', position: { x: 1060, y: 18 }, data: { stage: 'OPERATIONS' }, draggable: false, selectable: false, style: { width: 525, height: 442 }, zIndex: -1 },
];

export default function PersonalizedRoadmapPage() {
  const { business, application } = useAppStore();
  const [selectedId, setSelectedId] = useState('MH_FSSAI_CENTRAL');
  const [drawerOpen, setDrawerOpen] = useState(true);
  const statuses = useMemo(() => resolveApprovalStatuses(application.status), [application.status]);
  // Live, DAG-aware pre-validation overlay (Module 07). Escalate any roadmap
  // node the engine reports as BLOCKED / LOCKED / REVIEW; the hook never emits
  // an escalation that would downgrade a completed or ready node.
  const { result: preval, roadmapOverlay } = usePrevalidation();
  const displayStatuses = useMemo<Record<string, DisplayStatus>>(() => {
    const merged: Record<string, DisplayStatus> = { ...statuses };
    for (const [nodeId, overlay] of Object.entries(roadmapOverlay)) merged[nodeId] = overlay;
    return merged;
  }, [statuses, roadmapOverlay]);
  const validation = useMemo(() => validateApprovalGraph(MAHARASHTRA_COLD_STORAGE_NODES, MAHARASHTRA_COLD_STORAGE_EDGES), []);
  const criticalPath = useMemo(() => calculateCriticalPath(MAHARASHTRA_COLD_STORAGE_NODES, MAHARASHTRA_COLD_STORAGE_EDGES), []);
  const selectedApproval = MAHARASHTRA_COLD_STORAGE_NODES.find((node) => node.id === selectedId) ?? MAHARASHTRA_COLD_STORAGE_NODES[0];
  const prerequisites = MAHARASHTRA_COLD_STORAGE_EDGES.filter((edge) => edge.target === selectedApproval.id);
  const unblocks = MAHARASHTRA_COLD_STORAGE_EDGES.filter((edge) => edge.source === selectedApproval.id);
  const readyCount = Object.values(displayStatuses).filter((status) => status === 'READY_TO_APPLY').length;
  const lockedCount = Object.values(displayStatuses).filter((status) => status === 'LOCKED').length;
  const overlayEntries = Object.entries(roadmapOverlay);
  const engineOverlayNote = overlayEntries.length
    ? `Engine escalations: ${overlayEntries.map(([id, s]) => `${id.replace('MH_', '').replaceAll('_', ' ')} → ${s}`).join(', ')}`
    : 'No engine escalations on the live graph.';
  const selectNode = (id: string) => { setSelectedId(id); setDrawerOpen(true); };
  const flowNodes = useMemo(() => [...stageNodes, ...MAHARASHTRA_COLD_STORAGE_NODES.map((approval) => ({ id: approval.id, type: 'approval' as const, position: graphPositions[approval.id], data: { approval, status: displayStatuses[approval.id], selected: approval.id === selectedId, onSelect: selectNode, applicationStatus: approval.applicationLinked ? application.status : undefined } }))], [application.status, selectedId, displayStatuses]);
  const flowEdges = useMemo<Edge[]>(() => MAHARASHTRA_COLD_STORAGE_EDGES.map((edge) => ({ id: edge.id, source: edge.source, target: edge.target, type: 'smoothstep', animated: statuses[edge.source] === 'COMPLETED' && statuses[edge.target] !== 'COMPLETED', markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16, color: '#64748b' }, style: { stroke: statuses[edge.source] === 'COMPLETED' ? '#2563eb' : '#94a3b8', strokeWidth: 1.75 } })), [statuses]);
  const approvalFor = (id: string) => MAHARASHTRA_COLD_STORAGE_NODES.find((node) => node.id === id)!;

  return <div className="page-body approval-roadmap-page">
    <div className="approval-roadmap-header"><div><div className="approval-roadmap-header__badges"><span className="badge badge-blue"><Network size={12} /> Intelligent approval DAG</span><span className="badge badge-green"><ShieldCheck size={12} /> Validated dependency route</span></div><h1>Approval Journey Intelligence</h1><p><strong>{business.name}</strong><span>•</span><MapPin size={13} /> {business.district}, {business.state}<span>•</span>{business.subSector}</p></div><Link to={`/application/${application.id}`} className="btn btn-primary">Open FSSAI Application <ArrowRight size={14} /></Link></div>
    <section className="approval-hero-strip" aria-label="Graph summary"><div className="approval-hero-strip__metric"><span className="approval-hero-strip__icon"><Network size={20} /></span><div><strong>9 statutory approvals</strong><small>Mapped across 3 execution stages</small></div></div><div className="approval-hero-strip__metric"><span className="approval-hero-strip__icon approval-hero-strip__icon--amber"><Unlock size={20} /></span><div><strong>{readyCount} ready to apply</strong><small>{lockedCount} gates remain dependency-locked</small></div></div><div className="approval-hero-strip__metric"><span className="approval-hero-strip__icon approval-hero-strip__icon--blue"><Clock3 size={20} /></span><div><strong>{criticalPath.durationDays}-day critical path</strong><small>Longest path calculated from the active DAG</small></div></div><div className="approval-hero-strip__notice"><AlertTriangle size={15} /><span>The supplied 123-day route excludes the 15-day Final Fire gate; the declared dependencies calculate to <strong>{criticalPath.durationDays} days</strong>.</span></div></section>
    <div className={`approval-dag-layout ${drawerOpen ? 'approval-dag-layout--drawer-open' : ''}`}><section className="approval-graph-card" aria-label="Interactive approval dependency graph"><div className="approval-graph-card__toolbar"><div><h2>Dependency canvas</h2><p>Follow arrows to apply in statutory order. Parallel cards may progress together.</p></div><div className="approval-legend" aria-label="Node status legend">{(Object.keys(STATUS_META) as DisplayStatus[]).map((status) => <span key={status} className={`approval-status approval-status--${status.toLowerCase()}`}>{STATUS_META[status].icon}{STATUS_META[status].label}</span>)}</div></div><div className="approval-flow"><ReactFlow nodes={flowNodes} edges={flowEdges} nodeTypes={nodeTypes} minZoom={0.4} maxZoom={1.4} fitView fitViewOptions={{ padding: 0.12 }} nodesConnectable={false} nodesDraggable={false} elementsSelectable={false} onNodeClick={(_, node) => { if (node.type === 'approval') selectNode(node.id); }} proOptions={{ hideAttribution: true }}><Background color="#dbeafe" gap={18} size={1} /><Controls showInteractive={false} /><MiniMap zoomable pannable nodeColor={(node) => node.type === 'stage' ? '#e2e8f0' : '#2563eb'} maskColor="rgba(248, 250, 252, 0.72)" /></ReactFlow></div><div className="approval-graph-card__footer"><span><CircleDot size={13} /> Blue arrows show a predecessor already completed.</span><span><ChevronRight size={13} /> Select any card for statutory details and gate logic.</span></div></section>
    {drawerOpen && <aside className="statutory-drawer" aria-label="Statutory approval details"><div className="statutory-drawer__header"><div><span className="statutory-drawer__eyebrow">Statutory drawer</span><h2>{selectedApproval.title}</h2></div><button type="button" className="statutory-drawer__close" onClick={() => setDrawerOpen(false)} aria-label="Close statutory details"><X size={18} /></button></div><div className="statutory-drawer__status-row"><span className={`approval-status approval-status--${displayStatuses[selectedApproval.id].toLowerCase()}`}>{STATUS_META[displayStatuses[selectedApproval.id]].icon}{STATUS_META[displayStatuses[selectedApproval.id]].label}</span>{selectedApproval.applicationLinked && <span className="badge badge-blue">Synced: {application.status.replaceAll('_', ' ')}</span>}</div><p className="statutory-drawer__description">{selectedApproval.description}</p><dl className="statutory-drawer__facts"><div><dt>Authority</dt><dd>{selectedApproval.authority}</dd></div><div><dt>Indicative SLA</dt><dd>{selectedApproval.durationDays} working days</dd></div><div><dt>Legal basis</dt><dd>{selectedApproval.legalBasis}</dd></div></dl><div className="statutory-drawer__section"><h3>Required before this step</h3>{prerequisites.length ? prerequisites.map((edge) => <button type="button" key={edge.id} className="dependency-row" onClick={() => selectNode(edge.source)}><span><strong>{approvalFor(edge.source).title}</strong><small>{edge.rationale}</small></span><ChevronRight size={15} /></button>) : <p className="statutory-drawer__empty">This is a source approval and can begin without an in-graph prerequisite.</p>}</div><div className="statutory-drawer__section"><h3>Unlocks next</h3>{unblocks.length ? unblocks.map((edge) => <button type="button" key={edge.id} className="dependency-row" onClick={() => selectNode(edge.target)}><span><strong>{approvalFor(edge.target).title}</strong><small>{edge.rationale}</small></span><ChevronRight size={15} /></button>) : <p className="statutory-drawer__empty">No further statutory node is linked from this clearance.</p>}</div>{selectedApproval.applicationLinked && <Link to={`/application/${application.id}`} className="btn btn-primary statutory-drawer__cta">Manage live FSSAI application <ArrowRight size={14} /></Link>}</aside>}</div>
    <div className="approval-validation-line"><span className={validation.isValid ? 'approval-validation-line__ok' : 'approval-validation-line__error'}>{validation.isValid ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}{validation.isValid ? `Graph validation passed: ${validation.topologicalOrder.length} nodes, ${MAHARASHTRA_COLD_STORAGE_EDGES.length} dependency edges, no cycles.` : validation.errors.join(' ')}</span><span>Critical sequence: {criticalPath.nodeIds.map((id) => id.replace('MH_', '').replaceAll('_', ' ')).join(' → ')}</span></div>
    <div className="approval-validation-line"><span className={preval.overallStatus === 'READY_TO_SUBMIT' ? 'approval-validation-line__ok' : 'approval-validation-line__error'}>{preval.overallStatus === 'READY_TO_SUBMIT' ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}Live pre-validation: {PREVAL_LABEL[preval.overallStatus]} · {preval.summary.blockedNodes.length} blocked / {preval.summary.lockedNodes.length} locked · critical path {preval.summary.criticalPathImpacted ? 'impacted' : 'intact'}</span><span>{engineOverlayNote}</span></div>
  </div>;
}
