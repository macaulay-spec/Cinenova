import { notFound } from 'next/navigation';
import { AppShell, PlayerFrame } from '@cinenova/ui';
import { createPlaybackSession } from '../../../lib/playback';
import { getLocalPrincipal } from '../../../lib/local-principal';
import { AnchorButton } from '@cinenova/ui';

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

  const principal = await getLocalPrincipal();

  let result: Awaited<ReturnType<typeof createPlaybackSession>>;
  try {
    result = await createPlaybackSession(playbackRequest, principal);
  } catch {
    return (
      <AppShell active="home">
        <section className="grid min-h-screen place-items-center px-4 py-28">
          <div className="max-w-xl rounded-[2rem] border border-amber/30 bg-amber/10 p-10 text-center">
            <h1 className="text-3xl font-black text-white">Playback is unavailable right now</h1>
            <p className="mt-3 text-cinenova-muted">
              The catalogue/stream service did not respond. Please try again shortly. No internal
              details or provider keys are exposed.
            </p>
            <AnchorButton href="/" variant="secondary" className="mt-6">
              Back to home
            </AnchorButton>
          </div>
        </section>
      </AppShell>
    );
  }

  if (!result.title) {
    notFound();
  }

  return (
    <AppShell active="home">
      <PlayerFrame title={result.title} source={result.source} error={result.error} />
    </AppShell>
  );
}
