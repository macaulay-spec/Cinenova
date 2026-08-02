'use client';

import {
  ArrowLeft,
  Captions,
  FastForward,
  Maximize,
  Pause,
  RotateCcw,
  SkipForward,
} from 'lucide-react';
import type { PlaybackSource, TitleDetail } from '@cinenova/contracts';

interface PlayerFrameProps {
  title: TitleDetail;
  source: PlaybackSource | null;
  error?: string | undefined;
  backHref?: string;
}

/**
 * Chromeless player: no app shell, full-viewport frame, top-down gradient.
 * Failure state: "Playback unavailable" naming territory/plan entitlement.
 */
export function PlayerFrame({ title, source, error, backHref = '/' }: PlayerFrameProps) {
  return (
    <section
      className="fixed inset-0 z-50 flex h-screen w-screen flex-col bg-black text-white"
      aria-label="Video player"
    >
      {/* Top-down gradient so both control zones stay legible */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-black/70 to-transparent" />

      {source && !error ? (
        <video
          className="absolute inset-0 h-full w-full object-contain"
          controls
          autoPlay
          preload="metadata"
          src={source.playbackUrl}
          aria-label={`Playback for ${title.title}`}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/70">
              Playback unavailable
            </p>
            <h1 className="font-display text-3xl text-white">{title.title}</h1>
            <p className="text-sm leading-6 text-white/60">
              {error ??
                'This title is not licensed in your territory or is not on your current plan.'}
            </p>
            <a
              href={backHref}
              className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
            >
              <ArrowLeft aria-hidden="true" className="mr-2 h-4 w-4" /> Back to Home
            </a>
          </div>
        </div>
      )}

      {/* Top bar: back + title */}
      <div className="absolute inset-x-0 top-0 z-20 flex items-center gap-3 p-4">
        <a
          href={backHref}
          aria-label="Back"
          className="grid h-11 w-11 place-items-center rounded-full bg-black/40 text-white ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-black/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        >
          <ArrowLeft aria-hidden="true" className="h-5 w-5" />
        </a>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{title.title}</p>
          <p className="text-xs text-white/60">
            {title.kind === 'series' ? 'S1:E1 · ' : ''}Sourced securely · expires{' '}
            {source ? new Date(source.expiresAt).toLocaleTimeString() : '—'}
          </p>
        </div>
      </div>

      {/* Bottom controls */}
      {source ? (
        <div className="absolute inset-x-0 bottom-0 z-20 space-y-3 bg-gradient-to-t from-black/80 to-transparent p-4 pb-6">
          {/* Seek */}
          <div className="mx-auto max-w-5xl">
            <label htmlFor="seek" className="sr-only">
              Seek
            </label>
            <div className="relative h-1 rounded-full bg-white/25">
              <div className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-primary" />
            </div>
            <input id="seek" type="range" min={0} max={100} defaultValue={33} className="sr-only" />
          </div>
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <p className="w-20 text-xs tabular-nums text-white/70">00:12 / 00:38</p>
            <div className="flex items-center gap-3" aria-label="Transport controls">
              <button type="button" aria-label="Rewind 10 seconds" className="transport-btn">
                <RotateCcw aria-hidden="true" className="h-6 w-6" />
              </button>
              <button
                type="button"
                aria-label="Pause"
                className="grid h-14 w-14 place-items-center rounded-full bg-black/40 ring-1 ring-white/30 backdrop-blur-sm transition hover:bg-black/60"
              >
                <Pause aria-hidden="true" className="h-6 w-6 fill-current" />
              </button>
              <button type="button" aria-label="Forward 10 seconds" className="transport-btn">
                <FastForward aria-hidden="true" className="h-6 w-6" />
              </button>
              {title.kind === 'series' ? (
                <button type="button" aria-label="Next episode" className="transport-btn">
                  <SkipForward aria-hidden="true" className="h-6 w-6" />
                </button>
              ) : null}
            </div>
            <div className="flex w-20 items-center justify-end gap-3 text-white/70" aria-label="Secondary controls">
              <button type="button" aria-label="Subtitles" className="transport-btn">
                <Captions aria-hidden="true" className="h-5 w-5" />
              </button>
              <button type="button" aria-label="Fullscreen" className="transport-btn">
                <Maximize aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
