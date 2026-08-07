import { notFound } from 'next/navigation';
import { PlayerFrame } from '@cinenova/ui';
import { createPlaybackSession } from '../../../lib/playback';
import { getLocalPrincipal } from '../../../lib/local-principal';

interface WatchPageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ assetId?: string }>;
}

export const dynamic = 'force-dynamic';

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const { id } = await params;
  const resolved = searchParams ? await searchParams : {};
  const playbackRequest = {
    titleId: id,
    profileId: 'local-profile',
    deviceId: 'local-browser',
    territory: 'NG',
    ...(resolved.assetId ? { assetId: resolved.assetId } : {}),
  };

  const principal = await getLocalPrincipal();

  let result: Awaited<ReturnType<typeof createPlaybackSession>>;
  try {
    result = await createPlaybackSession(playbackRequest, principal);
  } catch {
    result = { source: null, title: null, decision: null, error: 'The stream service did not respond.' };
  }

  if (!result.title) {
    notFound();
  }

  return <PlayerFrame title={result.title} source={result.source} error={result.error} />;
}
