// SIH 26130 --- Module 07: LEVEL 1 --- Structural Validation
// -----------------------------------------------------------------------------
// The first gate. Verifies that an application is structurally complete BEFORE
// any cross-record or workflow reasoning:
//   - required fields are present (form + profile)
//   - required documents are attached AND in an acceptable state
//   - file validity: type, size, naming pattern, required metadata
//   - declarations are confirmed / signed / dated sanely
//
// Core principle: "document exists" != "document is valid". A present-but-
// rejected / expired / unverified / malformed document is NOT accepted.
//
// Pure + deterministic. No file contents are read; deep interpretation is a
// separate extension point.
// -----------------------------------------------------------------------------

import type {
  ApprovalDag,
  ApplicationValidationInput,
  DocumentEvaluation,
  DocumentRecord,
  DocumentRequirement,
  DocumentState,
  PrevalidationContext,
  ValidationIssue,
} from './types';
import { documentStateSeverity } from './severity';
import { singleNodeImpact } from './approval-dag';
import {
  buildIssue,
  daysBetween,
  getNodeMap,
  inferMimeType,
  isPresent,
  nodeLabel,
  parseDate,
  readProfileValue,
  resolveNow,
} from './internal';

export interface Level1Output {
  issues: ValidationIssue[];
  documentEvaluations: DocumentEvaluation[];
}

// ----------------------------------------------------------------------------
// Public entry
// ----------------------------------------------------------------------------

export function runLevel1(context: PrevalidationContext, dag: ApprovalDag): Level1Output {
  const nodeMap = getNodeMap(context);
  const { date: now } = resolveNow(context);
  const config = context.config;

  const issues: ValidationIssue[] = [];
  const documentEvaluations: DocumentEvaluation[] = [];

  for (const app of context.applications) {
    const approvalConfig = config?.approvals[app.approvalCode];
    const { name: nodeName } = nodeLabel(nodeMap, app.approvalCode);

    if (!approvalConfig) {
      // Never auto-pass an unconfigured node — escalate to human review.
      issues.push(
        buildIssue({
          id: `L1-${app.approvalCode}-CONFIG`,
          level: 'STRUCTURAL',
          category: 'CONFIGURATION',
          severity: 'REVIEW_REQUIRED',
          confidence: 'LOW',
          approvalCode: app.approvalCode,
          target: app.approvalCode,
          reason: `No validation policy is configured for approval '${app.approvalCode}'.`,
          requirementViolated:
            'Every submitted approval must have a configured validation policy.',
          recommendedAction:
            'Configure a validation policy for this approval, or route it to manual scrutiny.',
          dagImpact: singleNodeImpact(dag, app.approvalCode, false),
        }),
      );
      continue;
    }

    // --- 1a. Required fields -------------------------------------------------
    for (const fieldReq of approvalConfig.requiredFields) {
      const value =
        fieldReq.source === 'PROFILE'
          ? readProfileValue(context, fieldReq.field)
          : app.formData[fieldReq.field];

      if (!isPresent(value)) {
        const severity = fieldReq.severity ?? 'BLOCKING';
        issues.push(
          buildIssue({
            id: `L1-${app.approvalCode}-FIELD-${fieldReq.field}`,
            level: 'STRUCTURAL',
            category: 'REQUIRED_FIELD',
            severity,
            approvalCode: app.approvalCode,
            target: fieldReq.label,
            reason: `Required ${fieldReq.source === 'PROFILE' ? 'profile' : 'application'} field '${fieldReq.label}' is empty.`,
            requirementViolated: `'${fieldReq.label}' is mandatory for ${nodeName}.`,
            recommendedAction:
              fieldReq.source === 'PROFILE'
                ? `Complete '${fieldReq.label}' in the business profile.`
                : `Provide '${fieldReq.label}' on the application form.`,
            dagImpact: singleNodeImpact(dag, app.approvalCode, severity === 'BLOCKING'),
          }),
        );
      }
    }

    // --- 1b. Required documents + file validity ------------------------------
    for (const docReq of approvalConfig.requiredDocuments) {
      const { record, overrideState } = resolveAttachment(context, app, docReq.docCode);
      const evaluation = evaluateDocument(docReq, record, overrideState, now, context);
      documentEvaluations.push(evaluation);

      if (evaluation.acceptable) continue;

      const severity = documentStateSeverity(
        evaluation.state,
        Boolean(docReq.requireVerified),
      );
      if (severity === null) continue; // defensive; acceptable states return null

      issues.push(
        buildIssue({
          id: `L1-${app.approvalCode}-DOC-${docReq.docCode}`,
          level: 'STRUCTURAL',
          category: categoryForState(evaluation.state),
          severity,
          approvalCode: app.approvalCode,
          target: docReq.docName,
          sourceDocument: docReq.docCode,
          reason: evaluation.reasons.join(' ') || describeState(evaluation.state, docReq.docName),
          requirementViolated: requirementTextForState(evaluation.state, docReq.docName, nodeName),
          recommendedAction: actionForState(evaluation.state, docReq.docName),
          dagImpact: singleNodeImpact(dag, app.approvalCode, severity === 'BLOCKING'),
        }),
      );
    }

    // --- 1c. Declaration -----------------------------------------------------
    if (approvalConfig.declarationRequired) {
      issues.push(...evaluateDeclaration(app, dag, nodeName, now));
    }
  }

  return { issues, documentEvaluations };
}

// ----------------------------------------------------------------------------
// Attachment resolution
// ----------------------------------------------------------------------------

interface ResolvedAttachment {
  record?: DocumentRecord;
  overrideState?: DocumentState;
}

/**
 * Resolve the vault record backing a required document.
 *   - If the application declares explicit attachments, ONLY those count; the
 *     vault record is found via the attachment's vaultDocCode (or docCode).
 *   - If the application declares no attachments at all, the whole vault acts as
 *     the pool and is matched by docCode (convenient for demos / drafts).
 */
export function resolveAttachment(
  context: PrevalidationContext,
  app: ApplicationValidationInput,
  docCode: string,
): ResolvedAttachment {
  const vaultByCode = (code: string): DocumentRecord | undefined =>
    context.vault.find((d) => d.docCode === code);

  if (app.attachedDocuments && app.attachedDocuments.length > 0) {
    const attachment = app.attachedDocuments.find((a) => a.docCode === docCode);
    if (!attachment) return {}; // required doc simply not attached -> MISSING
    const vaultCode = attachment.vaultDocCode ?? attachment.docCode;
    return { record: vaultByCode(vaultCode), overrideState: attachment.overrideState };
  }

  // No explicit attachment list -> vault pool fallback.
  return { record: vaultByCode(docCode) };
}

// ----------------------------------------------------------------------------
// Document state evaluation
// ----------------------------------------------------------------------------

export function evaluateDocument(
  req: DocumentRequirement,
  record: DocumentRecord | undefined,
  overrideState: DocumentState | undefined,
  now: Date,
  context: PrevalidationContext,
): DocumentEvaluation {
  const base = {
    docCode: req.docCode,
    docName: req.docName,
    required: req.mandatory,
  };

  // Explicit override (officer action / test harness) wins.
  if (overrideState) {
    const acceptable =
      documentStateSeverity(overrideState, Boolean(req.requireVerified)) === null;
    return {
      ...base,
      present: overrideState !== 'MISSING',
      state: overrideState,
      acceptable,
      reasons: [`State overridden to ${overrideState}.`],
    };
  }

  if (!record) {
    return {
      ...base,
      present: false,
      state: 'MISSING',
      acceptable: false,
      reasons: [`Required document '${req.docName}' is not attached.`],
    };
  }

  const reasons: string[] = [];
  let state: DocumentState;

  const status = record.verificationStatus;
  const expiry = parseDate(record.expiresAt);
  const isExpired = status === 'EXPIRED' || (expiry !== null && expiry.getTime() < now.getTime());
  const fileIssues = checkFileValidity(req, record);
  const maxAge = context.config?.maxDocumentAgeDays;
  const uploadedAt = parseDate(record.uploadedAt);
  const isStale =
    typeof maxAge === 'number' &&
    uploadedAt !== null &&
    daysBetween(now, uploadedAt) > maxAge;

  if (status === 'REJECTED') {
    state = 'REJECTED';
    reasons.push(`'${req.docName}' was rejected during verification.`);
  } else if (isExpired) {
    state = 'EXPIRED';
    reasons.push(
      expiry
        ? `'${req.docName}' expired on ${record.expiresAt}.`
        : `'${req.docName}' is marked expired.`,
    );
  } else if (fileIssues.length > 0) {
    state = 'INVALID';
    reasons.push(...fileIssues);
  } else if (isStale) {
    state = 'STALE';
    reasons.push(
      `'${req.docName}' was uploaded ${Math.round(daysBetween(now, uploadedAt as Date))} days ago and may predate the current project details.`,
    );
  } else if (req.requireVerified && status !== 'VERIFIED') {
    state = 'UPLOADED';
    reasons.push(`'${req.docName}' is uploaded but not yet verified.`);
  } else {
    state = 'APPROVED';
  }

  const acceptable = documentStateSeverity(state, Boolean(req.requireVerified)) === null;
  return { ...base, present: true, state, acceptable, reasons };
}

/** Deterministic file-validity checks (no file contents are read). */
export function checkFileValidity(
  req: DocumentRequirement,
  record: DocumentRecord,
): string[] {
  const reasons: string[] = [];

  // Type
  if (req.acceptableMimeTypes && req.acceptableMimeTypes.length > 0) {
    const effectiveMime = record.mimeType ?? inferMimeType(record.fileName);
    if (effectiveMime && !req.acceptableMimeTypes.includes(effectiveMime)) {
      reasons.push(
        `File type '${effectiveMime}' is not accepted (expected: ${req.acceptableMimeTypes.join(', ')}).`,
      );
    }
  }

  // Size
  if (typeof record.fileSizeKb === 'number') {
    if (typeof req.minSizeKb === 'number' && record.fileSizeKb < req.minSizeKb) {
      reasons.push(
        `File is ${record.fileSizeKb}KB, smaller than the ${req.minSizeKb}KB minimum (possibly empty or corrupt).`,
      );
    }
    if (typeof req.maxSizeKb === 'number' && record.fileSizeKb > req.maxSizeKb) {
      reasons.push(`File is ${record.fileSizeKb}KB, exceeding the ${req.maxSizeKb}KB limit.`);
    }
  }

  // Naming pattern
  if (req.namingPattern && record.fileName) {
    let ok = true;
    try {
      ok = new RegExp(req.namingPattern, 'i').test(record.fileName);
    } catch {
      ok = true; // a bad pattern in config must not manufacture a false failure
    }
    if (!ok) {
      reasons.push(`File name '${record.fileName}' does not match the required naming pattern.`);
    }
  }

  // Required metadata
  if (req.requiredMetadata && req.requiredMetadata.length > 0) {
    for (const key of req.requiredMetadata) {
      if (!record.metadata || !(key in record.metadata)) {
        reasons.push(`Missing required metadata '${key}'.`);
      }
    }
  }

  return reasons;
}

// ----------------------------------------------------------------------------
// Declaration checks
// ----------------------------------------------------------------------------

function evaluateDeclaration(
  app: ApplicationValidationInput,
  dag: ApprovalDag,
  nodeName: string,
  now: Date,
): ValidationIssue[] {
  const out: ValidationIssue[] = [];
  const decl = app.declaration;

  if (!decl || !decl.confirmed) {
    out.push(
      buildIssue({
        id: `L1-${app.approvalCode}-DECL`,
        level: 'STRUCTURAL',
        category: 'DECLARATION',
        severity: 'BLOCKING',
        approvalCode: app.approvalCode,
        target: 'Applicant declaration',
        reason: 'The mandatory applicant declaration has not been confirmed.',
        requirementViolated: `A confirmed declaration is mandatory for ${nodeName}.`,
        recommendedAction: 'Review and confirm the declaration before submitting.',
        dagImpact: singleNodeImpact(dag, app.approvalCode, true),
      }),
    );
    return out;
  }

  if (!isPresent(decl.signatoryName)) {
    out.push(
      buildIssue({
        id: `L1-${app.approvalCode}-DECL-SIGNATORY`,
        level: 'STRUCTURAL',
        category: 'DECLARATION',
        severity: 'WARNING',
        approvalCode: app.approvalCode,
        target: 'Declaration signatory',
        reason: 'The declaration is confirmed but no authorised signatory name is recorded.',
        requirementViolated: 'A declaration should record the authorised signatory.',
        recommendedAction: 'Record the authorised signatory name on the declaration.',
        dagImpact: singleNodeImpact(dag, app.approvalCode, false),
        requiresRevalidation: false,
      }),
    );
  }

  const signedAt = parseDate(decl.signedAt);
  if (signedAt && signedAt.getTime() > now.getTime()) {
    out.push(
      buildIssue({
        id: `L1-${app.approvalCode}-DECL-DATE`,
        level: 'STRUCTURAL',
        category: 'DECLARATION',
        severity: 'REVIEW_REQUIRED',
        confidence: 'MEDIUM',
        approvalCode: app.approvalCode,
        target: 'Declaration date',
        reason: `The declaration is dated ${decl.signedAt}, which is in the future.`,
        requirementViolated: 'A declaration cannot be signed with a future date.',
        recommendedAction: 'Correct the declaration date to a valid (non-future) date.',
        dagImpact: singleNodeImpact(dag, app.approvalCode, false),
      }),
    );
  }

  return out;
}

// ----------------------------------------------------------------------------
// State -> presentation helpers
// ----------------------------------------------------------------------------

function categoryForState(state: DocumentState): ValidationIssue['category'] {
  if (state === 'MISSING') return 'REQUIRED_DOCUMENT';
  if (state === 'INVALID') return 'FILE_VALIDITY';
  return 'DOCUMENT_STATE';
}

function describeState(state: DocumentState, docName: string): string {
  switch (state) {
    case 'MISSING':
      return `'${docName}' is missing.`;
    case 'REJECTED':
      return `'${docName}' was rejected.`;
    case 'EXPIRED':
      return `'${docName}' has expired.`;
    case 'STALE':
      return `'${docName}' may be stale.`;
    case 'UPLOADED':
      return `'${docName}' is not yet verified.`;
    case 'INVALID':
      return `'${docName}' failed file-validity checks.`;
    default:
      return `'${docName}' is not in an acceptable state.`;
  }
}

function requirementTextForState(state: DocumentState, docName: string, nodeName: string): string {
  if (state === 'MISSING') return `'${docName}' is a mandatory document for ${nodeName}.`;
  if (state === 'UPLOADED')
    return `'${docName}' must be verified (not merely uploaded) for ${nodeName}.`;
  return `'${docName}' must be a valid, accepted document for ${nodeName}.`;
}

function actionForState(state: DocumentState, docName: string): string {
  switch (state) {
    case 'MISSING':
      return `Upload '${docName}' and have it verified.`;
    case 'REJECTED':
      return `Re-upload a corrected '${docName}' addressing the rejection reason.`;
    case 'EXPIRED':
      return `Upload a current, unexpired '${docName}'.`;
    case 'STALE':
      return `Confirm '${docName}' still reflects the current project, or re-upload the latest version.`;
    case 'UPLOADED':
      return `Get '${docName}' verified before submitting.`;
    case 'INVALID':
      return `Re-upload '${docName}' in the required format and size.`;
    default:
      return `Provide a valid '${docName}'.`;
  }
}
