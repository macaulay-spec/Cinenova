import { Captions, Maximize2, Settings, Volume2 } from 'lucide-react';
import type { PlaybackSource, TitleDetail } from '@cinenova/contracts';

interface PlayerFrameProps {
  title: TitleDetail;
  source: PlaybackSource | null;
  error?: string | undefined;
}

export function PlayerFrame({ title, source, error }: PlayerFrameProps) {
  return (
    <section className="min-h-screen bg-black pt-16 text-white" aria-labelledby="player-heading">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-10">
        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-cinenova-panel shadow-card">
          <div className="relative aspect-video bg-black">
            {source && !error ? (
              <video
                className="h-full w-full"
                controls
                preload="metadata"
                src={source.playbackUrl}
                aria-label={`Secure mock playback for ${title.title}`}
              />
            ) : (
              <div className="grid h-full place-items-center p-8 text-center">
                <div className="max-w-xl space-y-3">
                  <p className="text-sm font-bold uppercase tracking-[0.35em] text-cinenova-accent">
                    Playback unavailable
                  </p>
                  <h1 id="player-heading" className="text-3xl font-black">{title.title}</h1>
                  <p className="text-cinenova-muted">{error ?? 'No authorized source is available.'}</p>
                </div>
              </div>
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h1 id="player-heading" className="text-xl font-black">{title.title}</h1>
                  <p className="text-sm text-white/70">
                    DRM: {source?.drmActive ? source.drmScheme : 'not active for mock provider'} · Source session expires{' '}
                    {source ? new Date(source.expiresAt).toLocaleTimeString() : 'n/a'}
                  </p>
                </div>
                <div className="hidden items-center gap-2 sm:flex" aria-label="Player control placeholders">
                  {[Volume2, Captions, Settings, Maximize2].map((Icon, index) => (
                    <span key={index} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white/85">
                      <Icon aria-hidden="true" className="h-5 w-5" />
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-4 border-t border-white/10 p-5 text-sm text-cinenova-muted md:grid-cols-3">
            <p>Keyboard controls and captions menus are designed as first-class accessible controls.</p>
            <p>Provider keys and signed provider URLs are never exposed by this mock session response.</p>
            <p>Playback is denied by default unless rights, territory, plan, and profile policy allow it.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
