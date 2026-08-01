import { notFound } from 'next/navigation';
import { AppShell, PlayerFrame } from '@cinenova/ui';
import { createPlaybackSession } from '../../../lib/playback';

interface WatchPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    assetId?: string;
  }>;
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const playbackRequest = {
    titleId: id,
    profileId: 'local-profile',
    deviceId: 'local-browser',
    territory: 'NG',
    ...(resolvedSearchParams.assetId ? { assetId: resolvedSearchParams.assetId } : {}),
  };

  const result = await createPlaybackSession(playbackRequest);

  if (!result.title) {
    notFound();
  }

  return (
    <AppShell active="home">
      <PlayerFrame title={result.title} source={result.source} error={result.error} />
    </AppShell>
  );
}
