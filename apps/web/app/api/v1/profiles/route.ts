import { NextResponse } from 'next/server';
import { createProfileRequestSchema } from '@cinenova/contracts';
import { DEMO_PROFILES, getPrincipalDto } from '../../../../lib/local-principal';
import { recordAuditPlaceholder } from '../../../../lib/audit';
import { validationProblem } from '../../../../lib/problem';

export const dynamic = 'force-dynamic';

export async function GET() {
  const principal = await getPrincipalDto();
  return NextResponse.json(
    { profiles: principal.profiles, activeProfile: principal.activeProfile },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = createProfileRequestSchema.safeParse(json);

  if (!parsed.success) {
    return validationProblem(parsed.error.message);
  }

  const profile = {
    id: `local-profile-${parsed.data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
    name: parsed.data.name,
    avatarInitial: parsed.data.name.slice(0, 1).toUpperCase(),
    type: parsed.data.type,
    maturityCeiling: parsed.data.maturityCeiling,
    pinProtected: Boolean(parsed.data.pin),
    language: 'en',
    autoplay: parsed.data.type !== 'child',
    active: false,
  };

  return NextResponse.json(
    {
      profile,
      profiles: [...DEMO_PROFILES, profile],
      audit: recordAuditPlaceholder('profile.create.requested', 'profile', profile.id),
      persisted: false,
      message:
        'Profile creation contract is implemented. Persistence will be enabled when the identity database writer is connected.',
    },
    { status: 202, headers: { 'Cache-Control': 'no-store' } },
  );
}
