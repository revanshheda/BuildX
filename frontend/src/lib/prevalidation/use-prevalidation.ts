// SIH 26130 --- Module 07: usePrevalidation React hook
// -----------------------------------------------------------------------------
// The single integration seam between the deterministic pre-validation engine
// and the live BuildX UI. Reads the app store, runs the engine (memoized), and
// returns the full result plus UI-ready helpers:
//   - canSubmit      : the hard submission gate (permitsSubmission)
//   - nodeStatusByCode : engine status per engine approval code
//   - roadmapOverlay : engine problem-statuses keyed by roadmap MH_ node id,
//                      so the RoadmapPage DAG can reflect the real cascade.
//
// The engine is pure and dependency-free; this hook keeps that boundary intact
// (no React inside the engine, no engine internals leaking into components).
// -----------------------------------------------------------------------------

import { useMemo } from 'react';
import { useAppStore } from '../use-app-store';
import { buildPrevalidationContext } from './adapter';
import { runPrevalidation } from './engine';
import { permitsSubmission } from './severity';
import type { NodeValidationStatus, PrevalidationResult } from './types';

export interface UsePrevalidationOptions {
  /** Live declaration checkbox state from the ApplicationPage (default true). */
  declarationAccepted?: boolean;
  /** Live (possibly unsaved) form values; falls back to application.formData. */
  formData?: Record<string, unknown>;
  /** ISO time override (tests / deterministic runs). */
  now?: string;
}

/** Roadmap-facing display escalations produced by the engine. */
export type RoadmapOverlayStatus = 'BLOCKED' | 'LOCKED' | 'REVIEW';

export interface UsePrevalidationValue {
  result: PrevalidationResult;
  /** Hard gate: true only when overallStatus === 'READY_TO_SUBMIT'. */
  canSubmit: boolean;
  /** Engine status for every engine approval code (DAG node). */
  nodeStatusByCode: Record<string, NodeValidationStatus>;
  /**
   * Problem statuses to overlay onto the roadmap DAG, keyed by MH_ node id.
   * Only escalations (BLOCKED / LOCKED / REVIEW) are emitted, so a completed or
   * not-yet-evaluated roadmap node keeps its base status.
   */
  roadmapOverlay: Record<string, RoadmapOverlayStatus>;
}

/**
 * Semantic mapping from engine approval codes (rule-engine / cold-storage
 * config) to the roadmap graph's MH_-prefixed node ids (approval-graph.ts).
 * MIDC_DRAINAGE / MIDC_OCCUPANCY have no roadmap node; MH_MPCB_CTO /
 * MH_LABOUR_BOCW have no engine node — both are intentionally unmapped.
 */
export const ENGINE_CODE_TO_ROADMAP_NODE: Record<string, string> = {
  MIDC_BUILDING_FIRE: 'MH_MIDC_PLAN_FIRE',
  FSSAI_CENTRAL_LICENSE: 'MH_FSSAI_CENTRAL',
  MPCB_CTE: 'MH_MPCB_CTE',
  MSEDCL_POWER: 'MH_MSEDCL_HT',
  MIDC_WATER: 'MH_MIDC_WATER',
  DISH_FACTORY_LICENSE: 'MH_DISH_FACTORY',
  FIRE_FINAL_NOC: 'MH_FIRE_FINAL',
};

/** Map an engine node status to a roadmap escalation, or undefined to keep base. */
export function engineStatusToRoadmapOverlay(
  status: NodeValidationStatus,
): RoadmapOverlayStatus | undefined {
  switch (status) {
    case 'BLOCKED':
      return 'BLOCKED';
    case 'LOCKED':
      return 'LOCKED';
    case 'REVIEW':
      return 'REVIEW';
    default:
      // READY / APPROVED / NOT_EVALUATED -> never downgrade the base roadmap.
      return undefined;
  }
}

export function usePrevalidation(options: UsePrevalidationOptions = {}): UsePrevalidationValue {
  const { business, documents, application } = useAppStore();
  const { declarationAccepted, formData, now } = options;

  return useMemo<UsePrevalidationValue>(() => {
    const context = buildPrevalidationContext({
      business,
      documents,
      application,
      declarationAccepted,
      formData,
      now,
    });

    const result = runPrevalidation(context);
    const canSubmit = permitsSubmission(result.overallStatus);

    const nodeStatusByCode: Record<string, NodeValidationStatus> = {};
    const roadmapOverlay: Record<string, RoadmapOverlayStatus> = {};
    for (const node of result.nodeResults) {
      nodeStatusByCode[node.approvalCode] = node.status;
      const roadmapId = ENGINE_CODE_TO_ROADMAP_NODE[node.approvalCode];
      if (!roadmapId) continue;
      const overlay = engineStatusToRoadmapOverlay(node.status);
      if (overlay) roadmapOverlay[roadmapId] = overlay;
    }

    return { result, canSubmit, nodeStatusByCode, roadmapOverlay };
  }, [business, documents, application, declarationAccepted, formData, now]);
}
