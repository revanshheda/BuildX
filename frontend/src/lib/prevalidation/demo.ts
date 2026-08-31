// SIH 26130 --- Module 07: Pre-Validation Demo + Self-Checking Harness
// -----------------------------------------------------------------------------
// A dependency-free, runnable demonstration of the deep pre-validation engine on
// the real FreshChain Cold Logistics hero dataset. It doubles as a test harness:
// every scenario asserts its expected verdict, discrepancy count and DAG impact,
// and the script exits non-zero if any expectation fails.
//
// No test framework is required. Run it with any TypeScript runner, e.g.:
//     npx tsx src/lib/prevalidation/demo.ts
//     # or, after `tsc`, node dist/.../demo.js
//
// Scenarios
//   A1  FSSAI Central Licence, base vault (Process Flow missing)  -> BLOCKED
//   A2  FSSAI Central Licence, verified vault (query answered)    -> READY_TO_SUBMIT
//   B   Building/Fire submission with contradictory records       -> BLOCKED + DAG locks
// -----------------------------------------------------------------------------

import type {
  ApplicationValidationInput,
  PrevalidationContext,
  PrevalidationResult,
  RegistrySnapshot,
} from './types';
import { runPrevalidation } from './engine';
import { permitsSubmission } from './severity';
import { evaluateApprovalRules } from '../rule-engine';
import {
  INITIAL_HERO_BUSINESS,
  BASE_VAULT_DOCUMENTS,
  VERIFIED_HERO_DOCUMENTS,
} from '../data/hero-data';

// ----------------------------------------------------------------------------
// The 9 evaluated approval nodes for the hero profile (shared by all scenarios).
// ----------------------------------------------------------------------------

const HERO_NODES = evaluateApprovalRules(INITIAL_HERO_BUSINESS).results;

// A registry snapshot that agrees with the profile (used for the clean scenarios).
const MATCHING_REGISTRY: RegistrySnapshot = {
  entityName: INITIAL_HERO_BUSINESS.name, // exact match -> no registry discrepancy
  pan: INITIAL_HERO_BUSINESS.pan,
  cin: INITIAL_HERO_BUSINESS.cin,
  gstin: INITIAL_HERO_BUSINESS.gstin,
  registeredAddress: 'Plot No. E-45, MIDC Chakan Phase II, Pune',
  authorizedSignatory: 'Vikram Malhotra',
};

const NOW = '2026-08-28T15:00:00Z';

// ----------------------------------------------------------------------------
// Application builders
// ----------------------------------------------------------------------------

/** A complete, internally-consistent FSSAI Central Licence application. */
function heroFssaiApplication(): ApplicationValidationInput {
  return {
    approvalCode: 'FSSAI_CENTRAL_LICENSE',
    appNumber: 'APP-MH-2026-00124',
    // Consistent with the profile: name matches, capacity matches.
    formData: {
      fboName: INITIAL_HERO_BUSINESS.name, // 'FreshChain Cold Logistics Pvt. Ltd.'
      fboType: 'Storage / Cold Chain (Food Warehouse)',
      premisesType: 'Owned (MIDC Industrial Leasehold)',
      storageCapacityMt: INITIAL_HERO_BUSINESS.storageCapacityMt, // 5000
      foodCategories: ['Dairy & Frozen Foods', 'Fresh Fruits & Vegetables', 'Processed Packaged Goods'],
    },
    attachedDocuments: [], // empty -> the whole vault acts as the attachment pool
    declaration: {
      required: true,
      confirmed: true,
      signatoryName: 'Vikram Malhotra',
      signedAt: '2026-08-28T09:30:00Z',
    },
    selectedRoute: 'FSSAI Central Licence',
    workflowStage: 'PLANNING',
    isTargetForSubmission: true,
  };
}

/** Scenario A: FSSAI application validated against a given vault state. */
function fssaiContext(vault: PrevalidationContext['vault']): PrevalidationContext {
  return {
    profile: INITIAL_HERO_BUSINESS,
    approvalNodes: HERO_NODES,
    vault,
    applications: [heroFssaiApplication()],
    registry: MATCHING_REGISTRY,
    now: NOW,
  };
}

/**
 * Scenario B: the applicant tries to submit the MIDC Building/Fire approval
 * (the root of the construction chain) with a plot number that contradicts the
 * profile, while a parallel FSSAI draft carries a wrong legal name and capacity.
 * Every document is on file — the block comes purely from contradictory DATA.
 */
function contradictionContext(): PrevalidationContext {
  const buildingFire: ApplicationValidationInput = {
    approvalCode: 'MIDC_BUILDING_FIRE',
    appNumber: 'APP-MH-2026-00131',
    formData: {
      plotNumber: 'Plot No. E-52', // profile says E-45 -> ADDRESS_MISMATCH (blocking)
    },
    attachedDocuments: [],
    declaration: {
      required: true,
      confirmed: true,
      signatoryName: 'Vikram Malhotra',
      signedAt: '2026-08-27T10:00:00Z',
    },
    workflowStage: 'PLANNING',
    isTargetForSubmission: true, // this is the node the user is trying to submit
  };

  const fssaiDraft: ApplicationValidationInput = {
    approvalCode: 'FSSAI_CENTRAL_LICENSE',
    appNumber: 'APP-MH-2026-00124',
    formData: {
      fboName: 'FreshChain Logistics Limited', // drops "Cold" -> ENTITY_MISMATCH (blocking)
      fboType: 'Storage / Cold Chain (Food Warehouse)',
      premisesType: 'Owned (MIDC Industrial Leasehold)',
      storageCapacityMt: 6000, // profile says 5000 -> CAPACITY_MISMATCH (blocking)
      foodCategories: ['Dairy & Frozen Foods'],
    },
    attachedDocuments: [],
    declaration: {
      required: true,
      confirmed: true,
      signatoryName: 'Vikram Malhotra',
      signedAt: '2026-08-28T09:30:00Z',
    },
    selectedRoute: 'FSSAI Central Licence',
    workflowStage: 'PLANNING',
    isTargetForSubmission: false,
  };

  // A registry that disagrees with the profile name at MEDIUM confidence
  // -> REGISTRY_INCONSISTENCY surfaced as REVIEW_REQUIRED (not a hard block).
  const registry: RegistrySnapshot = {
    ...MATCHING_REGISTRY,
    entityName: 'FreshChain Cold Chain Pvt. Ltd.',
  };

  return {
    profile: INITIAL_HERO_BUSINESS,
    approvalNodes: HERO_NODES,
    vault: VERIFIED_HERO_DOCUMENTS, // everything is filed; only the data conflicts
    applications: [buildingFire, fssaiDraft],
    registry,
    now: NOW,
  };
}

// ----------------------------------------------------------------------------
// Pretty printing
// ----------------------------------------------------------------------------

const LINE = '='.repeat(78);
const THIN = '-'.repeat(78);

function printResult(title: string, result: PrevalidationResult): void {
  console.log(`\n${LINE}\n${title}\n${LINE}`);
  console.log(`Overall status : ${result.overallStatus}`);
  console.log(`Submittable    : ${permitsSubmission(result.overallStatus) ? 'YES' : 'NO'}`);
  if (result.targetApprovalCode) console.log(`Target node    : ${result.targetApprovalCode}`);
  console.log(
    `Totals         : ${result.summary.totalBlockingIssues} blocking, ` +
      `${result.summary.totalReviewItems} review, ${result.summary.totalWarnings} warning, ` +
      `${result.summary.totalDiscrepancies} discrepancies`,
  );

  if (result.blockingIssues.length + result.reviewItems.length > 0) {
    console.log(`\n${THIN}\nISSUES (why / what / how)\n${THIN}`);
    for (const line of result.explainability) console.log(line);
  }

  if (result.discrepancyMatrix.length > 0) {
    console.log(`\n${THIN}\nCROSS-DOCUMENT DISCREPANCY MATRIX\n${THIN}`);
    for (const d of result.discrepancyMatrix) {
      console.log(
        `• [${d.severity}/${d.confidence}] ${d.mismatchType} — ${d.attribute}\n` +
          `    ${d.recordA.label} = "${d.valueA}"\n` +
          `    ${d.recordB.label} = "${d.valueB}"\n` +
          `    node: ${d.affectedApprovalPath.join(' -> ')} | blocking: ${d.blocking}\n` +
          `    fix: ${d.recommendedAction}`,
      );
    }
  }

  console.log(`\n${THIN}\nAPPROVAL GRAPH — NODE STATUS\n${THIN}`);
  for (const n of result.nodeResults) {
    const locks =
      n.lockedByPrerequisites.length > 0 ? `  (locked by: ${n.lockedByPrerequisites.join(', ')})` : '';
    const counts =
      n.blockingCount + n.reviewCount + n.warningCount > 0
        ? `  [B${n.blockingCount} R${n.reviewCount} W${n.warningCount}]`
        : '';
    console.log(`  ${n.status.padEnd(13)} ${n.approvalCode}${counts}${locks}`);
  }
  console.log(`\nDAG impact     : ${result.dagImpact.explanation}`);
  if (result.dagImpact.criticalPath.length > 0) {
    console.log(
      `Critical path  : ${result.dagImpact.criticalPath.join(' -> ')} ` +
        `[${result.dagImpact.affectsCriticalPath ? 'IMPACTED' : 'intact'}]`,
    );
  }

  if (result.recovery.length > 0) {
    console.log(`\n${THIN}\nRECOVERY PLAN\n${THIN}`);
    result.recovery.forEach((step, i) =>
      console.log(`  ${i + 1}. ${step.action}${step.requiresRevalidation ? '  (re-validate after fix)' : ''}`),
    );
  }

  if (result.notes.length > 0) {
    console.log(`\nNotes:`);
    for (const note of result.notes) console.log(`  - ${note}`);
  }
}

// ----------------------------------------------------------------------------
// Minimal assertion harness (no external test runner needed)
// ----------------------------------------------------------------------------

interface CheckResult {
  name: string;
  pass: boolean;
  detail: string;
}

const checks: CheckResult[] = [];

function expect(name: string, condition: boolean, detail = ''): void {
  checks.push({ name, pass: condition, detail });
}

function expectEqual<T>(name: string, actual: T, expected: T): void {
  const pass = actual === expected;
  expect(name, pass, pass ? '' : `expected ${String(expected)}, got ${String(actual)}`);
}

// ----------------------------------------------------------------------------
// Demo runner
// ----------------------------------------------------------------------------

export function runDemo(): boolean {
  console.log('SIH 26130 · Module 07 · Deep Document Pre-Validation — Demonstration');
  console.log(`Business: ${INITIAL_HERO_BUSINESS.name} (${INITIAL_HERO_BUSINESS.subSector})`);

  // --- Scenario A1: base vault, Process Flow missing -> BLOCKED ---------------
  const a1 = runPrevalidation(fssaiContext(BASE_VAULT_DOCUMENTS));
  printResult('SCENARIO A1 — FSSAI Central Licence · base vault (Process Flow not yet uploaded)', a1);
  expectEqual('A1 overall status is BLOCKED', a1.overallStatus, 'BLOCKED');
  expectEqual('A1 has exactly one blocking issue', a1.blockingIssues.length, 1);
  expectEqual('A1 blocker is a required-document issue', a1.blockingIssues[0]?.category, 'REQUIRED_DOCUMENT');
  expectEqual('A1 blocker is the Process Flow Diagram', a1.blockingIssues[0]?.sourceDocument, 'PROCESS_FLOW');
  expectEqual('A1 has no discrepancies', a1.discrepancyMatrix.length, 0);
  expect('A1 is not submittable', !permitsSubmission(a1.overallStatus));
  expectEqual('A1 FSSAI node is BLOCKED', nodeStatus(a1, 'FSSAI_CENTRAL_LICENSE'), 'BLOCKED');
  expect('A1 leaves the critical path intact', a1.summary.criticalPathImpacted === false);

  // --- Scenario A2: verified vault (query answered) -> READY_TO_SUBMIT ---------
  const a2 = runPrevalidation(fssaiContext(VERIFIED_HERO_DOCUMENTS));
  printResult('SCENARIO A2 — FSSAI Central Licence · verified vault (query answered, v2 uploaded)', a2);
  expectEqual('A2 overall status is READY_TO_SUBMIT', a2.overallStatus, 'READY_TO_SUBMIT');
  expectEqual('A2 has no issues at all', a2.issues.length, 0);
  expectEqual('A2 has no discrepancies', a2.discrepancyMatrix.length, 0);
  expect('A2 is submittable', permitsSubmission(a2.overallStatus));
  expectEqual('A2 evaluated all four required documents', a2.documentEvaluations.length, 4);
  expect('A2 every required document is acceptable', a2.documentEvaluations.every((d) => d.acceptable));

  // --- Scenario B: contradictory records -> BLOCKED + DAG lock cascade ---------
  const b = runPrevalidation(contradictionContext());
  printResult('SCENARIO B — MIDC Building/Fire submission with contradictory records', b);
  expectEqual('B overall status is BLOCKED', b.overallStatus, 'BLOCKED');
  expectEqual('B target node is MIDC_BUILDING_FIRE', b.targetApprovalCode, 'MIDC_BUILDING_FIRE');
  expectEqual('B produces four discrepancy rows', b.discrepancyMatrix.length, 4);
  expect(
    'B matrix contains an entity mismatch',
    b.discrepancyMatrix.some((d) => d.mismatchType === 'ENTITY_MISMATCH' && d.blocking),
  );
  expect(
    'B matrix contains a capacity mismatch',
    b.discrepancyMatrix.some((d) => d.mismatchType === 'CAPACITY_MISMATCH' && d.blocking),
  );
  expect(
    'B matrix contains an address (plot) mismatch',
    b.discrepancyMatrix.some((d) => d.mismatchType === 'ADDRESS_MISMATCH' && d.blocking),
  );
  expect(
    'B registry inconsistency is review-required, not blocking',
    b.discrepancyMatrix.some((d) => d.mismatchType === 'REGISTRY_INCONSISTENCY' && !d.blocking),
  );
  expectEqual('B blocks the Building/Fire node', nodeStatus(b, 'MIDC_BUILDING_FIRE'), 'BLOCKED');
  expectEqual('B locks six downstream nodes', b.summary.lockedNodes.length, 6);
  expect('B impacts the critical path', b.summary.criticalPathImpacted === true);
  expectEqual('B occupancy node is LOCKED', nodeStatus(b, 'MIDC_OCCUPANCY'), 'LOCKED');
  expect(
    'B occupancy is locked by DISH + Final Fire prerequisites',
    sameSet(lockedBy(b, 'MIDC_OCCUPANCY'), ['DISH_FACTORY_LICENSE', 'FIRE_FINAL_NOC']),
  );
  expectEqual('B leaves the independent MPCB track un-evaluated', nodeStatus(b, 'MPCB_CTE'), 'NOT_EVALUATED');

  // --- Report ----------------------------------------------------------------
  return reportChecks();
}

// ----------------------------------------------------------------------------
// Small result-inspection helpers used by the assertions
// ----------------------------------------------------------------------------

function nodeStatus(result: PrevalidationResult, code: string): string {
  return result.nodeResults.find((n) => n.approvalCode === code)?.status ?? 'MISSING';
}

function lockedBy(result: PrevalidationResult, code: string): string[] {
  return result.nodeResults.find((n) => n.approvalCode === code)?.lockedByPrerequisites ?? [];
}

function sameSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

function reportChecks(): boolean {
  console.log(`\n${LINE}\nSELF-CHECK RESULTS\n${LINE}`);
  let passed = 0;
  for (const c of checks) {
    console.log(`  ${c.pass ? 'PASS' : 'FAIL'}  ${c.name}${c.pass ? '' : `  <-- ${c.detail}`}`);
    if (c.pass) passed += 1;
  }
  const allPassed = passed === checks.length;
  console.log(`\n${passed}/${checks.length} checks passed — ${allPassed ? 'ALL GREEN ✅' : 'FAILURES PRESENT ❌'}`);
  return allPassed;
}

// ----------------------------------------------------------------------------
// Auto-run when executed directly (safe no-op when merely imported).
// ----------------------------------------------------------------------------

try {
  const directArg = typeof process !== 'undefined' ? process.argv?.[1] : undefined;
  if (directArg && import.meta.url === new URL(`file://${directArg}`).href) {
    const ok = runDemo();
    if (typeof process !== 'undefined' && !ok) process.exitCode = 1;
  }
} catch {
  /* import.meta / process not available in this host — importers call runDemo() themselves */
}
