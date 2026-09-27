/**
 * Refund Calculator for BookMyShow Clone (Phase 4.5)
 * Computes time-tiered refund amounts based on operational cinema policy
 * with support for administrative overrides.
 */

export const REFUND_POLICY_TIERS = [
  { minHours: 24, percentage: 100, label: 'Full Refund (>24h before show)' },
  { minHours: 6, percentage: 75, label: '75% Refund (6h–24h before show)' },
  { minHours: 1, percentage: 50, label: '50% Refund (1h–6h before show)' },
  { minHours: 0, percentage: 0, label: 'No Refund (<1h before or after show)' },
];

/**
 * Calculates refundable amount based on show start time and policy rules
 *
 * @param {object} params
 * @param {number} params.totalAmount - Total booking amount in INR
 * @param {Date|string} params.showStartTime - Show start timestamp
 * @param {number} [params.overridePercentage] - Optional admin override percentage (0-100)
 * @param {number} [params.overrideAmount] - Optional admin override exact amount
 * @param {string} [params.overrideReason] - Reason provided for manual override
 * @returns {object} Calculated refund details
 */
export const calculateRefund = ({
  totalAmount = 0,
  showStartTime,
  overridePercentage = null,
  overrideAmount = null,
  overrideReason = null,
}) => {
  const total = Math.max(0, Number(totalAmount));
  const now = new Date();
  const showTime = new Date(showStartTime);

  // Compute time difference in hours (can be negative if show has already started)
  const diffMs = showTime.getTime() - now.getTime();
  const hoursUntilShow = Number((diffMs / (1000 * 60 * 60)).toFixed(2));

  // 1. Determine standard policy tier percentage
  let policyPercentage = 0;
  if (hoursUntilShow >= 24) {
    policyPercentage = 100;
  } else if (hoursUntilShow >= 6) {
    policyPercentage = 75;
  } else if (hoursUntilShow >= 1) {
    policyPercentage = 50;
  } else {
    policyPercentage = 0;
  }

  // 2. Check for manual admin override
  let applicablePercentage = policyPercentage;
  let isOverride = false;
  let refundableAmount = 0;

  if (overrideAmount !== null && overrideAmount !== undefined) {
    refundableAmount = Math.min(total, Math.max(0, Number(overrideAmount)));
    applicablePercentage = total > 0 ? Math.round((refundableAmount / total) * 100) : 0;
    isOverride = true;
  } else if (overridePercentage !== null && overridePercentage !== undefined) {
    applicablePercentage = Math.min(100, Math.max(0, Number(overridePercentage)));
    refundableAmount = Math.round((total * applicablePercentage) / 100);
    isOverride = applicablePercentage !== policyPercentage;
  } else {
    refundableAmount = Math.round((total * policyPercentage) / 100);
  }

  return {
    originalAmount: total,
    refundableAmount,
    deductionAmount: total - refundableAmount,
    hoursUntilShow,
    policyPercentage,
    applicablePercentage,
    isOverride,
    overrideReason: isOverride ? overrideReason || 'Admin discretion' : null,
  };
};

export default {
  REFUND_POLICY_TIERS,
  calculateRefund,
};
