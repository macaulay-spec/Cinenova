import { PLAN_RANK, type EntitlementSnapshot, type PlanCode } from '../types';

export function hasMinimumPlan(entitlement: EntitlementSnapshot, requiredPlan: PlanCode): boolean {
  if (!entitlement.active) {
    return false;
  }

  return PLAN_RANK[entitlement.plan] >= PLAN_RANK[requiredPlan];
}

export function canOpenNewStream(
  entitlement: EntitlementSnapshot,
  currentConcurrentStreams: number,
): boolean {
  return entitlement.active && currentConcurrentStreams < entitlement.concurrentStreamLimit;
}

export function isInGracePeriod(entitlement: EntitlementSnapshot, at: Date): boolean {
  return Boolean(entitlement.graceUntil && entitlement.graceUntil.getTime() >= at.getTime());
}
