import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createDownloadRequestSchema, downloadRecordSchema } from '@cinenova/contracts';
import { evaluateDownload, rightsFromTitle } from '@cinenova/domain';
import { getCatalogProvider } from '../../../../lib/providers';
import { problemResponse, validationProblem } from '../../../../lib/problem';
import { requireCsrf } from '../../../../lib/csrf-guard';

export async function POST(request: Request) {
  const csrf = await requireCsrf(request);
  if ('response' in csrf) {
    return csrf.response;
  }

  const json = await request.json().catch(() => null);
  const parsed = createDownloadRequestSchema.safeParse(json);

  if (!parsed.success) {
    return validationProblem(parsed.error.message);
  }

  const provider = getCatalogProvider();
  const title = await provider.titleById(parsed.data.titleId, parsed.data.territory);
  if (!title) {
    return problemResponse({
      type: 'https://docs.cinenova.local/errors/not-found',
      title: 'Title not found',
      status: 404,
      code: 'NOT_FOUND',
      detail: 'Title was not found.',
    });
  }

  const principal = csrf.principal;
  const assetId = parsed.data.assetId ?? title.primaryAssetId;
  const decision = evaluateDownload({
    title: {
      titleId: title.id,
      kind: title.kind,
      maturityRating: title.maturityRating,
      assetId,
    },
    rights: [rightsFromTitle(title)],
    entitlement: principal.entitlement,
    profile: principal.profile,
    territory: parsed.data.territory,
    at: new Date(),
    operation: 'download',
    device: {
      deviceId: parsed.data.deviceId,
      trusted: true,
      offlineRegistered: false,
      activeDownloadCount: 0,
    },
    activeOfflineDeviceCount: 0,
    maxDownloadsPerDevice: 10,
  });

  const record = downloadRecordSchema.parse({
    id: randomUUID(),
    titleId: title.id,
    profileId: parsed.data.profileId,
    deviceId: parsed.data.deviceId,
    status: decision.allowed ? 'authorized' : 'unavailable',
    expiresAt: decision.allowed
      ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString()
      : null,
    message: decision.allowed
      ? 'Download authorization created for mock offline-capable content.'
      : decision.denials.map((denial) => denial.message).join(' '),
  });

  return NextResponse.json(record, {
    status: decision.allowed ? 201 : 200,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
