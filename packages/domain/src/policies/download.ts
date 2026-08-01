import { evaluateRights } from './rights';
import type { DevicePolicyContext, PolicyDecision, PolicyDenial, RightsEvaluationInput } from '../types';

export interface DownloadEvaluationInput extends RightsEvaluationInput {
  device: DevicePolicyContext;
  activeOfflineDeviceCount: number;
  maxDownloadsPerDevice: number;
}

export function evaluateDownload(input: DownloadEvaluationInput): PolicyDecision {
  const base = evaluateRights({ ...input, operation: 'download' });
  const denials: PolicyDenial[] = [...base.denials];

  if (!input.device.trusted) {
    denials.push({
      code: 'DOWNLOAD_NOT_ALLOWED',
      message: 'This device must be trusted before offline download is allowed.',
    });
  }

  if (!input.device.offlineRegistered && input.activeOfflineDeviceCount >= input.entitlement.offlineDeviceLimit) {
    denials.push({
      code: 'DOWNLOAD_NOT_ALLOWED',
      message: 'Offline device limit reached for this plan.',
    });
  }

  if (input.device.activeDownloadCount >= input.maxDownloadsPerDevice) {
    denials.push({
      code: 'DOWNLOAD_NOT_ALLOWED',
      message: 'Download quota reached for this device.',
    });
  }

  const decision: PolicyDecision = {
    allowed: denials.length === 0,
    denials,
  };

  if (base.matchedRight) {
    decision.matchedRight = base.matchedRight;
  }

  return decision;
}
