import { createLogger } from '@cinenova/observability';

const logger = createLogger('worker');

export interface WorkerQueueDefinition {
  name: string;
  purpose: string;
  retryPolicy: string;
}

export const queueDefinitions: WorkerQueueDefinition[] = [
  {
    name: 'catalogue-sync',
    purpose: 'Sync licensed provider metadata into normalized catalogue tables.',
    retryPolicy: 'Exponential backoff, safe metadata reads only, DLQ after five attempts.',
  },
  {
    name: 'rights-expiry',
    purpose: 'Activate and expire content rights windows without serving stale availability.',
    retryPolicy: 'Idempotent scheduled job with advisory lock.',
  },
  {
    name: 'billing-webhooks',
    purpose: 'Verify and reconcile signed payment webhooks idempotently.',
    retryPolicy: 'Provider-specific retry plus local reconciliation job.',
  },
  {
    name: 'data-deletion',
    purpose: 'Process privacy export/delete workflows with audit records.',
    retryPolicy: 'Manual-reviewable DLQ for irreversible actions.',
  },
];

if (process.env.NODE_ENV !== 'test') {
  logger.info('CineNova worker placeholder started', {
    queues: queueDefinitions.map((queue) => queue.name),
  });
}
