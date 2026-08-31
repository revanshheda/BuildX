import React from 'react';
import { ApplicationStatus, DocumentVerificationStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: ApplicationStatus | DocumentVerificationStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let badgeClass = 'badge-neutral';
  const safeStatus = status ? String(status) : '';
  const displayLabel = safeStatus.replace(/_/g, ' ');

  switch (status) {
    case 'APPROVED':
    case 'VERIFIED':
    case 'SATISFACTORY':
      badgeClass = 'badge-green';
      break;
    case 'UNDER_REVIEW':
    case 'SUBMITTED':
    case 'ASSIGNED':
    case 'INSPECTION_SCHEDULED':
      badgeClass = 'badge-blue';
      break;
    case 'QUERY_RAISED':
    case 'PENDING_VERIFICATION':
    case 'VALIDATION_ERROR':
    case 'ACTION_REQUIRED':
      badgeClass = 'badge-amber';
      break;
    case 'REJECTED':
    case 'UNSATISFACTORY':
    case 'EXPIRED':
    case 'MISSING':
      badgeClass = 'badge-red';
      break;
    case 'DRAFT':
    case 'UPLOADED':
    case 'READY_TO_SUBMIT':
    default:
      badgeClass = 'badge-neutral';
      break;
  }

  return (
    <span className={`badge ${badgeClass}`}>
      {displayLabel}
    </span>
  );
};
