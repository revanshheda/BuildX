import { ApplicationStatus } from './types';

export type ApprovalGraphStatus = 'COMPLETED' | 'IN_PROGRESS' | 'READY_TO_APPLY' | 'LOCKED';
export type ApprovalGraphStage = 'FOUNDATION' | 'UTILITIES' | 'OPERATIONS';

export interface ApprovalGraphNode {
  id: string;
  title: string;
  authority: string;
  durationDays: number;
  defaultStatus: ApprovalGraphStatus;
  stage: ApprovalGraphStage;
  legalBasis: string;
  description: string;
  /** The FSSAI hero clearance mirrors the application record in the store. */
  applicationLinked?: boolean;
}

export interface ApprovalGraphEdge {
  id: string;
  source: string;
  target: string;
  rationale: string;
}

export interface GraphValidationResult {
  isValid: boolean;
  errors: string[];
  topologicalOrder: string[];
}

export interface CriticalPathResult {
  durationDays: number;
  nodeIds: string[];
}

export const APPROVAL_GRAPH_STAGES: Record<ApprovalGraphStage, { title: string; subtitle: string }> = {
  FOUNDATION: {
    title: 'Stage 1 · Pre-establishment & planning',
    subtitle: 'Foundation approvals that establish the permissible project route.',
  },
  UTILITIES: {
    title: 'Stage 2 · Infrastructure & utilities',
    subtitle: 'Parallel utility sanctions enabled by the approved site plan.',
  },
  OPERATIONS: {
    title: 'Stage 3 · Pre-commissioning & operations',
    subtitle: 'Final operational gates before the facility starts production.',
  },
};

export const MAHARASHTRA_COLD_STORAGE_NODES: ApprovalGraphNode[] = [
  {
    id: 'MH_MPCB_CTE',
    title: 'Consent to Establish (CTE – Orange Category)',
    authority: 'MPCB',
    durationDays: 24,
    defaultStatus: 'COMPLETED',
    stage: 'FOUNDATION',
    legalBasis: 'Water Act 1974 Sec 25 & Air Act 1981',
    description: 'Baseline pollution clearance required before the facility is established.',
  },
  {
    id: 'MH_MIDC_PLAN_FIRE',
    title: 'MIDC Building Plan & Provisional Fire NOC',
    authority: 'MIDC SPA & Fire Services',
    durationDays: 30,
    defaultStatus: 'COMPLETED',
    stage: 'FOUNDATION',
    legalBasis: 'MIDC DCR & MH Fire Safety Act',
    description: 'Plan sanction and provisional fire clearance for the proposed cold-storage premises.',
  },
  {
    id: 'MH_FSSAI_CENTRAL',
    title: 'FSSAI Central License for Cold Storage',
    authority: 'FSSAI Central Western Region',
    durationDays: 30,
    defaultStatus: 'IN_PROGRESS',
    stage: 'FOUNDATION',
    legalBasis: 'FSS (Licensing & Registration) Regulations 2011',
    description: 'Hero application for a food-storage and cold-chain business.',
    applicationLinked: true,
  },
  {
    id: 'MH_MSEDCL_HT',
    title: 'HT Industrial Power Sanction (750 kW)',
    authority: 'MSEDCL',
    durationDays: 15,
    defaultStatus: 'READY_TO_APPLY',
    stage: 'UTILITIES',
    legalBasis: 'MERC Supply Code Regulations',
    description: 'High-tension power sanction for refrigeration compressors and plant operations.',
  },
  {
    id: 'MH_MIDC_WATER',
    title: 'MIDC Industrial Water Connection (25 KLD)',
    authority: 'MIDC Water Works',
    durationDays: 14,
    defaultStatus: 'READY_TO_APPLY',
    stage: 'UTILITIES',
    legalBasis: 'MIDC Water Supply Regulations',
    description: 'Industrial water connection for the planned facility.',
  },
  {
    id: 'MH_MPCB_CTO',
    title: 'Consent to Operate (CTO)',
    authority: 'MPCB Regional Office',
    durationDays: 24,
    defaultStatus: 'LOCKED',
    stage: 'OPERATIONS',
    legalBasis: 'Water Act 1974 Sec 25 & Air Act 1981',
    description: 'Operating consent after power-backed plant and pollution-control trials.',
  },
  {
    id: 'MH_FIRE_FINAL',
    title: 'Final Fire Safety Occupancy Certificate',
    authority: 'MH Fire Services',
    durationDays: 15,
    defaultStatus: 'LOCKED',
    stage: 'OPERATIONS',
    legalBasis: 'MH Fire Safety Act',
    description: 'Final site fire audit after site completion and operating-consent readiness.',
  },
  {
    id: 'MH_DISH_FACTORY',
    title: 'Factory License Registration & Grant (Form 4)',
    authority: 'DISH Maharashtra',
    durationDays: 30,
    defaultStatus: 'LOCKED',
    stage: 'OPERATIONS',
    legalBasis: 'Factories Act & Maharashtra Factories Rules',
    description: 'Final operational gate after CTO and the final fire certificate.',
  },
  {
    id: 'MH_LABOUR_BOCW',
    title: 'Labour Welfare & Contract Labour Registration',
    authority: 'Labour Dept',
    durationDays: 7,
    defaultStatus: 'READY_TO_APPLY',
    stage: 'OPERATIONS',
    legalBasis: 'Applicable Maharashtra labour welfare and contract-labour requirements',
    description: 'Parallel labour registration track for the project workforce.',
  },
];

export const MAHARASHTRA_COLD_STORAGE_EDGES: ApprovalGraphEdge[] = [
  { id: 'cte-plan', source: 'MH_MPCB_CTE', target: 'MH_MIDC_PLAN_FIRE', rationale: 'Environmental clearance is required before plan sanction.' },
  { id: 'cte-fssai', source: 'MH_MPCB_CTE', target: 'MH_FSSAI_CENTRAL', rationale: 'Baseline pollution clearance supports the food-warehouse approval route.' },
  { id: 'plan-power', source: 'MH_MIDC_PLAN_FIRE', target: 'MH_MSEDCL_HT', rationale: 'Building sanction is required for substation feasibility.' },
  { id: 'plan-water', source: 'MH_MIDC_PLAN_FIRE', target: 'MH_MIDC_WATER', rationale: 'Plot layout is required for pipeline laying.' },
  { id: 'power-cto', source: 'MH_MSEDCL_HT', target: 'MH_MPCB_CTO', rationale: 'Energized power is required for ETP and compressor trial runs.' },
  { id: 'cte-cto', source: 'MH_MPCB_CTE', target: 'MH_MPCB_CTO', rationale: 'CTE remains a mandatory prerequisite to operate.' },
  { id: 'cto-fire', source: 'MH_MPCB_CTO', target: 'MH_FIRE_FINAL', rationale: 'Completed site and operating consent precede the final fire audit.' },
  { id: 'plan-fire', source: 'MH_MIDC_PLAN_FIRE', target: 'MH_FIRE_FINAL', rationale: 'Approved building plan is required before the final fire audit.' },
  { id: 'cto-factory', source: 'MH_MPCB_CTO', target: 'MH_DISH_FACTORY', rationale: 'CTO is a factory-license prerequisite.' },
  { id: 'fire-factory', source: 'MH_FIRE_FINAL', target: 'MH_DISH_FACTORY', rationale: 'Final Fire NOC strictly gates the factory license.' },
];

const applicationStatusToGraphStatus = (status: ApplicationStatus): ApprovalGraphStatus => {
  if (status === 'APPROVED') return 'COMPLETED';
  if (['DRAFT', 'VALIDATION_ERROR', 'READY_TO_SUBMIT'].includes(status)) return 'READY_TO_APPLY';
  return 'IN_PROGRESS';
};

/** Resolves application-backed status and keeps statutory gates locked until every predecessor completes. */
export function resolveApprovalStatuses(applicationStatus: ApplicationStatus): Record<string, ApprovalGraphStatus> {
  const statuses = Object.fromEntries(
    MAHARASHTRA_COLD_STORAGE_NODES.map((node) => [node.id, node.applicationLinked ? applicationStatusToGraphStatus(applicationStatus) : node.defaultStatus]),
  ) as Record<string, ApprovalGraphStatus>;

  const validation = validateApprovalGraph(MAHARASHTRA_COLD_STORAGE_NODES, MAHARASHTRA_COLD_STORAGE_EDGES);
  for (const nodeId of validation.topologicalOrder) {
    const prerequisites = MAHARASHTRA_COLD_STORAGE_EDGES.filter((edge) => edge.target === nodeId).map((edge) => edge.source);
    if (prerequisites.length > 0 && prerequisites.some((sourceId) => statuses[sourceId] !== 'COMPLETED')) {
      statuses[nodeId] = 'LOCKED';
    }
  }
  return statuses;
}

/** Validates ids, references, duplicate edges, and cycles with Kahn's topological sort. */
export function validateApprovalGraph(nodes: ApprovalGraphNode[], edges: ApprovalGraphEdge[]): GraphValidationResult {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const node of nodes) {
    if (ids.has(node.id)) errors.push(`Duplicate node id: ${node.id}`);
    ids.add(node.id);
  }

  const edgeIds = new Set<string>();
  const relationships = new Set<string>();
  for (const edge of edges) {
    if (edgeIds.has(edge.id)) errors.push(`Duplicate edge id: ${edge.id}`);
    edgeIds.add(edge.id);
    if (!ids.has(edge.source) || !ids.has(edge.target)) errors.push(`Edge ${edge.id} references a missing node.`);
    if (edge.source === edge.target) errors.push(`Edge ${edge.id} cannot reference itself.`);
    const relationship = `${edge.source}->${edge.target}`;
    if (relationships.has(relationship)) errors.push(`Duplicate relationship: ${relationship}`);
    relationships.add(relationship);
  }

  const inDegree = new Map(nodes.map((node) => [node.id, 0]));
  const outgoing = new Map(nodes.map((node) => [node.id, [] as string[]]));
  for (const edge of edges) {
    if (!ids.has(edge.source) || !ids.has(edge.target)) continue;
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
    outgoing.get(edge.source)?.push(edge.target);
  }

  const queue = nodes.filter((node) => inDegree.get(node.id) === 0).map((node) => node.id);
  const topologicalOrder: string[] = [];
  while (queue.length) {
    const current = queue.shift()!;
    topologicalOrder.push(current);
    for (const next of outgoing.get(current) ?? []) {
      const nextDegree = (inDegree.get(next) ?? 0) - 1;
      inDegree.set(next, nextDegree);
      if (nextDegree === 0) queue.push(next);
    }
  }
  if (topologicalOrder.length !== nodes.length) errors.push('Approval dependency graph contains a cycle.');

  return { isValid: errors.length === 0, errors, topologicalOrder };
}

/** Returns the longest weighted source-to-terminal path in a valid approval DAG. */
export function calculateCriticalPath(nodes: ApprovalGraphNode[], edges: ApprovalGraphEdge[]): CriticalPathResult {
  const validation = validateApprovalGraph(nodes, edges);
  if (!validation.isValid) throw new Error(validation.errors.join(' '));

  const byId = new Map(nodes.map((node) => [node.id, node]));
  const incoming = new Map(nodes.map((node) => [node.id, [] as string[]]));
  for (const edge of edges) incoming.get(edge.target)?.push(edge.source);

  const duration = new Map<string, number>();
  const previous = new Map<string, string | undefined>();
  for (const nodeId of validation.topologicalOrder) {
    const node = byId.get(nodeId)!;
    const parents = incoming.get(nodeId) ?? [];
    const bestParent = parents.reduce<string | undefined>((best, parent) => !best || (duration.get(parent) ?? 0) > (duration.get(best) ?? 0) ? parent : best, undefined);
    duration.set(nodeId, node.durationDays + (bestParent ? duration.get(bestParent)! : 0));
    previous.set(nodeId, bestParent);
  }

  const terminal = nodes.filter((node) => !edges.some((edge) => edge.source === node.id));
  const end = terminal.reduce((best, node) => !best || (duration.get(node.id) ?? 0) > (duration.get(best) ?? 0) ? node.id : best, undefined as string | undefined);
  if (!end) return { durationDays: 0, nodeIds: [] };

  const nodeIds: string[] = [];
  for (let current: string | undefined = end; current; current = previous.get(current)) nodeIds.unshift(current);
  return { durationDays: duration.get(end) ?? 0, nodeIds };
}
