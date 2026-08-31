// SIH 26130 --- Module 07: Approval Dependency Graph (DAG)
// -----------------------------------------------------------------------------
// Builds and reasons over the approval dependency graph so that a single
// validation issue can (a) block the correct node and (b) lock the correct
// downstream nodes. Also computes the critical path and distinguishes
// critical-path impact from parallel-track impact.
//
// Semantics: an edge (from -> to) means `from` is a PREREQUISITE of `to`.
// Prerequisites are AND-combined: a node can only proceed when ALL of its
// prerequisites are satisfied. Therefore if any ancestor is BLOCKED, the node
// is LOCKED.
//
// Pure, deterministic, dependency-free.
// -----------------------------------------------------------------------------

import type {
  ApprovalDag,
  ApprovalDagEdge,
  ApprovalDagNode,
  DagImpact,
  NodeValidationStatus,
} from './types';
import type { ApprovalRuleResult } from '../rule-engine';

// ----------------------------------------------------------------------------
// Construction
// ----------------------------------------------------------------------------

/** Deterministic ordering key for a node: (sequenceOrder, code). */
function orderKey(node: ApprovalDagNode): string {
  const seq = String(node.sequenceOrder).padStart(6, '0');
  return `${seq}::${node.code}`;
}

/**
 * Build an ApprovalDag from evaluated rule results + configured edges.
 * Only edges whose endpoints both exist among the provided nodes are kept, so
 * the graph stays valid even when the rule engine returns a partial set
 * (e.g. NOT_CONFIGURED sub-sectors return a single node with no edges).
 */
export function buildApprovalDag(
  nodes: ApprovalRuleResult[],
  edges: ApprovalDagEdge[],
): ApprovalDag {
  const nodeMap: Record<string, ApprovalDagNode> = {};
  for (const n of nodes) {
    nodeMap[n.code] = {
      code: n.code,
      name: n.name,
      authority: n.authorityName,
      stage: n.stage,
      sequenceOrder: n.sequenceOrder,
      prerequisites: [],
    };
  }

  const validEdges: ApprovalDagEdge[] = [];
  for (const e of edges) {
    if (nodeMap[e.from] && nodeMap[e.to] && e.from !== e.to) {
      validEdges.push(e);
      nodeMap[e.to].prerequisites.push(e.from);
    }
  }
  // Deterministic prerequisite ordering.
  for (const code of Object.keys(nodeMap)) {
    nodeMap[code].prerequisites.sort((a, b) =>
      orderKey(nodeMap[a]).localeCompare(orderKey(nodeMap[b])),
    );
  }

  const topoOrder = topologicalOrder(nodeMap, validEdges);
  const criticalPath = computeCriticalPath(nodeMap, topoOrder);

  return { nodes: nodeMap, edges: validEdges, topoOrder, criticalPath };
}

// ----------------------------------------------------------------------------
// Graph algorithms
// ----------------------------------------------------------------------------

/** Kahn's algorithm with deterministic tie-breaking by (sequenceOrder, code). */
export function topologicalOrder(
  nodes: Record<string, ApprovalDagNode>,
  edges: ApprovalDagEdge[],
): string[] {
  const inDegree: Record<string, number> = {};
  const dependents: Record<string, string[]> = {};
  for (const code of Object.keys(nodes)) {
    inDegree[code] = 0;
    dependents[code] = [];
  }
  for (const e of edges) {
    inDegree[e.to] += 1;
    dependents[e.from].push(e.to);
  }

  const cmp = (a: string, b: string) =>
    orderKey(nodes[a]).localeCompare(orderKey(nodes[b]));

  const ready: string[] = Object.keys(nodes).filter((c) => inDegree[c] === 0);
  ready.sort(cmp);

  const order: string[] = [];
  while (ready.length > 0) {
    const code = ready.shift() as string;
    order.push(code);
    const outs = [...dependents[code]].sort(cmp);
    for (const dep of outs) {
      inDegree[dep] -= 1;
      if (inDegree[dep] === 0) {
        // Insert maintaining sort order.
        ready.push(dep);
        ready.sort(cmp);
      }
    }
  }

  // If a cycle exists (should never happen for a valid config), append the rest
  // deterministically so downstream code still functions.
  if (order.length < Object.keys(nodes).length) {
    const remaining = Object.keys(nodes)
      .filter((c) => !order.includes(c))
      .sort(cmp);
    order.push(...remaining);
  }
  return order;
}

/**
 * Longest prerequisite chain (critical path). Uses DP over topo order.
 * Tie-breaks deterministically so the same config always yields the same path.
 */
export function computeCriticalPath(
  nodes: Record<string, ApprovalDagNode>,
  topoOrder: string[],
): string[] {
  const dist: Record<string, number> = {};
  const pred: Record<string, string | null> = {};
  for (const code of topoOrder) {
    const prereqs = nodes[code].prerequisites;
    if (prereqs.length === 0) {
      dist[code] = 1;
      pred[code] = null;
      continue;
    }
    let best = -1;
    let bestPred: string | null = null;
    for (const p of prereqs) {
      const candidate = (dist[p] ?? 1) + 1;
      if (
        candidate > best ||
        (candidate === best &&
          bestPred !== null &&
          orderKey(nodes[p]).localeCompare(orderKey(nodes[bestPred])) < 0)
      ) {
        best = candidate;
        bestPred = p;
      }
    }
    dist[code] = best;
    pred[code] = bestPred;
  }

  // Endpoint = node with max dist (tie-break by order key).
  let endpoint: string | null = null;
  for (const code of topoOrder) {
    if (
      endpoint === null ||
      dist[code] > dist[endpoint] ||
      (dist[code] === dist[endpoint] &&
        orderKey(nodes[code]).localeCompare(orderKey(nodes[endpoint])) < 0)
    ) {
      endpoint = code;
    }
  }

  const path: string[] = [];
  let cur = endpoint;
  while (cur) {
    path.unshift(cur);
    cur = pred[cur] ?? null;
  }
  // A "critical path" of length 1 means the graph has no dependencies.
  return path.length > 1 ? path : [];
}

/** All transitive dependents (descendants) of a node. */
export function getDescendants(dag: ApprovalDag, code: string): string[] {
  const out: Set<string> = new Set();
  const adjacency: Record<string, string[]> = {};
  for (const c of Object.keys(dag.nodes)) adjacency[c] = [];
  for (const e of dag.edges) adjacency[e.from].push(e.to);

  const stack = [...(adjacency[code] ?? [])];
  while (stack.length > 0) {
    const n = stack.pop() as string;
    if (!out.has(n)) {
      out.add(n);
      stack.push(...(adjacency[n] ?? []));
    }
  }
  return sortByOrder(dag, [...out]);
}

/** All transitive prerequisites (ancestors) of a node. */
export function getAncestors(dag: ApprovalDag, code: string): string[] {
  const out: Set<string> = new Set();
  const stack = [...(dag.nodes[code]?.prerequisites ?? [])];
  while (stack.length > 0) {
    const n = stack.pop() as string;
    if (!out.has(n)) {
      out.add(n);
      stack.push(...(dag.nodes[n]?.prerequisites ?? []));
    }
  }
  return sortByOrder(dag, [...out]);
}

function sortByOrder(dag: ApprovalDag, codes: string[]): string[] {
  return [...codes].sort((a, b) =>
    orderKey(dag.nodes[a]).localeCompare(orderKey(dag.nodes[b])),
  );
}

// ----------------------------------------------------------------------------
// Lock propagation
// ----------------------------------------------------------------------------

export interface PropagationOutcome {
  /** Final status for every node after propagating locks downstream. */
  status: Record<string, NodeValidationStatus>;
  /** For each locked node, the nearest prerequisite codes that caused the lock. */
  lockedBy: Record<string, string[]>;
}

/**
 * Given each node's OWN status (from its direct validation issues), propagate
 * downstream locks in topological order.
 *
 * Rules:
 *   - A node keeps its own BLOCKED / REVIEW status.
 *   - A non-blocked node becomes LOCKED if any direct prerequisite is BLOCKED
 *     or LOCKED (AND-semantics: every prerequisite must be clear).
 *   - APPROVED prerequisites are treated as satisfied.
 *   - READY/APPROVED with all prerequisites clear stays READY/APPROVED.
 */
export function propagateLocks(
  dag: ApprovalDag,
  ownStatus: Record<string, NodeValidationStatus>,
): PropagationOutcome {
  const status: Record<string, NodeValidationStatus> = {};
  const lockedBy: Record<string, string[]> = {};

  for (const code of dag.topoOrder) {
    const own = ownStatus[code] ?? 'NOT_EVALUATED';

    if (own === 'BLOCKED') {
      status[code] = 'BLOCKED';
      continue;
    }

    const blockingPrereqs = dag.nodes[code].prerequisites.filter((p) => {
      const ps = status[p];
      return ps === 'BLOCKED' || ps === 'LOCKED';
    });

    if (blockingPrereqs.length > 0) {
      // A node with a blocked/locked prerequisite is LOCKED even if it was
      // never evaluated on its own — the cascade the DAG must express.
      status[code] = 'LOCKED';
      lockedBy[code] = sortByOrder(dag, blockingPrereqs);
      continue;
    }

    // Otherwise keep the node's own status. NOT_EVALUATED is preserved (rather
    // than optimistically promoted to READY) so un-validated nodes are never
    // presented as ready.
    status[code] = own;
  }

  return { status, lockedBy };
}

// ----------------------------------------------------------------------------
// DAG impact for a single issue
// ----------------------------------------------------------------------------

/**
 * Compute the DAG ripple of a single issue on `code`.
 * When `isBlocking` is true, all transitive descendants are reported as locked
 * (since prerequisites are AND-combined). Non-blocking issues do not lock
 * downstream nodes.
 */
export function singleNodeImpact(
  dag: ApprovalDag,
  code: string,
  isBlocking: boolean,
): DagImpact {
  const onGraph = Boolean(dag.nodes[code]);
  const criticalPath = dag.criticalPath;

  if (!isBlocking || !onGraph) {
    return {
      originNode: code,
      blockedNodes: isBlocking && onGraph ? [code] : [],
      lockedNodes: [],
      affectsCriticalPath: false,
      criticalPath,
      parallelTracksAffected: [],
      explanation: onGraph
        ? 'Advisory issue: no downstream approval nodes are locked.'
        : `Issue is not mapped to a configured approval node ('${code}').`,
    };
  }

  const locked = getDescendants(dag, code);
  const impacted = [code, ...locked];
  const cpSet = new Set(criticalPath);
  const affectsCriticalPath = impacted.some((n) => cpSet.has(n));
  const parallelTracksAffected = impacted.filter((n) => !cpSet.has(n));

  const lockedNote =
    locked.length > 0
      ? `Blocking ${code} locks ${locked.length} downstream node(s): ${locked.join(', ')}.`
      : `${code} has no downstream dependents; blocking it does not lock other nodes.`;
  const cpNote = affectsCriticalPath
    ? ' This impacts the critical path.'
    : ' This affects a parallel track only.';

  return {
    originNode: code,
    blockedNodes: [code],
    lockedNodes: locked,
    affectsCriticalPath,
    criticalPath,
    parallelTracksAffected,
    explanation: lockedNote + cpNote,
  };
}

/**
 * Aggregate DAG impact across a full validation run.
 * `blockedNodes` are nodes with a direct block; locked nodes are derived by
 * propagation and merged in.
 */
export function aggregateImpact(
  dag: ApprovalDag,
  propagation: PropagationOutcome,
  targetCode?: string,
): DagImpact {
  const blockedNodes: string[] = [];
  const lockedNodes: string[] = [];
  for (const code of dag.topoOrder) {
    if (propagation.status[code] === 'BLOCKED') blockedNodes.push(code);
    else if (propagation.status[code] === 'LOCKED') lockedNodes.push(code);
  }

  const impacted = [...blockedNodes, ...lockedNodes];
  const cpSet = new Set(dag.criticalPath);
  const affectsCriticalPath = impacted.some((n) => cpSet.has(n));
  const parallelTracksAffected = impacted.filter((n) => !cpSet.has(n));

  let explanation: string;
  if (impacted.length === 0) {
    explanation = 'No approval nodes are blocked or locked.';
  } else {
    explanation =
      `${blockedNodes.length} node(s) blocked, ${lockedNodes.length} locked downstream.` +
      (affectsCriticalPath
        ? ' The critical path is impacted — overall timeline is at risk.'
        : ' Only parallel tracks are impacted — the critical path is intact.');
  }

  return {
    originNode: targetCode ?? (blockedNodes[0] ?? 'NONE'),
    blockedNodes,
    lockedNodes,
    affectsCriticalPath,
    criticalPath: dag.criticalPath,
    parallelTracksAffected,
    explanation,
  };
}
