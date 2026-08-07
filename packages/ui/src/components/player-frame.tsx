'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Captions,
  FastForward,
  Maximize,
  Minimize,
  Pause,
  Play,
  PictureInPicture,
  RotateCcw,
  Settings,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import type { PlaybackSource, TitleDetail } from '@cinenova/contracts';
import { cn } from '../cn';

interface PlayerFrameProps {
  title: TitleDetail;
  source: PlaybackSource | null;
  error?: string | undefined;
  backHref?: string;
}

type MenuKind = 'captions' | 'audio' | 'quality' | null;

const CAPTIONS = ['Off', 'English (CC)'] as const;
const AUDIO = ['English'] as const;
const QUALITIES = ['Auto', '1080p', '720p', '480p', '360p'] as const;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Full chromeless video player: transport, seek, volume, caption/audio/quality
 * popover menus, fullscreen, PiP, and keyboard shortcuts. No raw provider URLs
 * or keys are exposed — only the sanitized playback URL is used.
 */
export function PlayerFrame({ title, source, error, backHref = '/' }: PlayerFrameProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [menu, setMenu] = useState<MenuKind>(null);
  const [captions, setCaptions] = useState<string>(CAPTIONS[0] ?? 'Off');
  const [quality, setQuality] = useState<string>(QUALITIES[0] ?? 'Auto');
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }, []);

  const seekBy = useCallback((delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + delta));
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (typeof document !== 'undefined') {
      if (document.fullscreenElement) {
        void document.exitFullscreen();
      } else {
        void document.documentElement.requestFullscreen();
      }
    }
  }, []);

  // Track fullscreen state client-side so render never reads `document`.
  useEffect(() => {
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const togglePip = useCallback(async () => {
    const v = videoRef.current;
    if (!v) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (v.requestPictureInPicture) {
        await v.requestPictureInPicture();
      }
    } catch {
      // PiP unsupported; ignore silently.
    }
  }, []);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!videoRef.current?.paused) setControlsVisible(false);
    }, 2500);
  }, []);

  // Keyboard shortcuts: Space/K play-pause, arrows seek/volume, M mute, F
  // fullscreen, Escape close menus.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (menu) {
        if (e.key === 'Escape') setMenu(null);
        return;
      }
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowright':
          e.preventDefault();
          seekBy(10);
          break;
        case 'arrowleft':
          e.preventDefault();
          seekBy(-10);
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          toggleFullscreen();
          break;
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menu, togglePlay, seekBy, toggleMute, toggleFullscreen]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime = () => setCurrentTime(v.currentTime);
    const onDur = () => setDuration(v.duration || 0);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('loadedmetadata', onDur);
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    return () => {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('loadedmetadata', onDur);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
    };
  }, []);

  // Cleanup the hide timer on unmount.
  useEffect(() => () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  function setVolumeValue(v: number) {
    const el = videoRef.current;
    if (!el) return;
    el.volume = v;
    setVolume(v);
    setMuted(v === 0);
  }

  const menuConfig: { key: NonNullable<MenuKind>; label: string; options: readonly string[]; value: string; onSelect: (v: string) => void }[] = [
    { key: 'captions', label: 'Subtitles', options: CAPTIONS, value: captions, onSelect: setCaptions },
    { key: 'audio', label: 'Audio', options: AUDIO, value: AUDIO[0] ?? 'English', onSelect: () => {} },
    { key: 'quality', label: 'Quality', options: QUALITIES, value: quality, onSelect: setQuality },
  ];

  return (
    <section
      className="fixed inset-0 z-50 flex h-screen w-screen flex-col bg-black text-white"
      aria-label="Video player"
      onMouseMove={showControls}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-40 bg-gradient-to-b from-black/70 to-transparent" />

      {source && !error ? (
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-contain"
          autoPlay
          preload="metadata"
          src={source.playbackUrl}
          onClick={togglePlay}
          aria-label={`Playback for ${title.title}`}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-4">
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-white/70">Playback unavailable</p>
            <h1 className="font-display text-3xl text-white">{title.title}</h1>
            <p className="text-sm leading-6 text-white/60">
              {error ?? 'This title is not licensed in your territory or is not on your current plan.'}
            </p>
            <a href={backHref} className="inline-flex items-center rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:opacity-80">
              <ArrowLeft aria-hidden="true" className="mr-2 h-4 w-4" /> Back to Home
            </a>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className={cn('absolute inset-x-0 top-0 z-20 flex items-center gap-3 p-4 transition-opacity', controlsVisible ? 'opacity-100' : 'opacity-0')}>
        <a href={backHref} aria-label="Back" className="grid h-11 w-11 place-items-center rounded-full bg-black/40 ring-1 ring-white/20 backdrop-blur-sm hover:bg-black/60">
          <ArrowLeft aria-hidden="true" className="h-5 w-5" />
        </a>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{title.title}</p>
          <p className="text-xs text-white/60">
            {title.kind === 'series' ? 'S1:E1 · ' : ''}Sourced securely · expires {source ? new Date(source.expiresAt).toLocaleTimeString() : '—'}
          </p>
        </div>
      </div>

      {/* Bottom controls */}
      {source ? (
        <div className={cn('absolute inset-x-0 bottom-0 z-20 space-y-3 bg-gradient-to-t from-black/80 to-transparent p-4 pb-5 transition-opacity', controlsVisible ? 'opacity-100' : 'pointer-events-none opacity-0')}>
          {/* Seek */}
          <div className="mx-auto max-w-5xl">
            <label htmlFor="seek" className="sr-only">Seek</label>
            <div className="relative h-1 w-full rounded-full bg-white/25">
              <div className="absolute inset-y-0 left-0 rounded-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
            <input
              id="seek"
              type="range"
              min={0}
              max={duration || 100}
              step={1}
              value={Math.min(currentTime, duration || 0)}
              onChange={(e) => {
                const v = videoRef.current;
                if (v) v.currentTime = Number(e.target.value);
              }}
              className="sr-only"
              aria-valuetext={formatTime(currentTime)}
            />
            <div className="mt-0.5 text-xs tabular-nums text-white/70" aria-hidden="true">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>

          <div className="mx-auto flex max-w-5xl items-center justify-between gap-2">
            <p className="w-14 text-xs tabular-nums text-white/70" aria-live="off">{formatTime(currentTime)}</p>

            <div className="flex items-center gap-2" aria-label="Transport controls">
              <button type="button" aria-label="Rewind 10 seconds" onClick={() => seekBy(-10)} className="transport-btn"><RotateCcw aria-hidden="true" className="h-6 w-6" /></button>
              <button type="button" aria-label={playing ? 'Pause' : 'Play'} onClick={togglePlay} className="grid h-14 w-14 place-items-center rounded-full bg-black/40 ring-1 ring-white/30 backdrop-blur-sm hover:bg-black/60">
                {playing ? <Pause aria-hidden="true" className="h-6 w-6 fill-current" /> : <Play aria-hidden="true" className="ml-0.5 h-6 w-6 fill-current" />}
              </button>
              <button type="button" aria-label="Forward 10 seconds" onClick={() => seekBy(10)} className="transport-btn"><FastForward aria-hidden="true" className="h-6 w-6" /></button>
              {title.kind === 'series' ? (
                <button type="button" aria-label="Next episode" className="transport-btn"><SkipForward aria-hidden="true" className="h-6 w-6" /></button>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-2 text-white/70" aria-label="Secondary controls">
              <button type="button" aria-label={muted ? 'Unmute' : 'Mute'} onClick={toggleMute} className="transport-btn">
                {muted ? <VolumeX aria-hidden="true" className="h-5 w-5" /> : <Volume2 aria-hidden="true" className="h-5 w-5" />}
              </button>
              <label htmlFor="volume" className="sr-only">Volume</label>
              <input
                id="volume"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={(e) => setVolumeValue(Number(e.target.value))}
                className="hidden w-20 sm:block"
                aria-valuetext={muted ? 'Muted' : `${Math.round(volume * 100)}%`}
              />
              {menuConfig.map((m) => (
                <div key={m.key} className="relative">
                  <button
                    type="button"
                    aria-label={m.label}
                    aria-haspopup="menu"
                    aria-expanded={menu === m.key}
                    onClick={() => setMenu(menu === m.key ? null : m.key)}
                    className="transport-btn"
                  >
                    {m.key === 'captions' ? <Captions aria-hidden="true" className="h-5 w-5" /> : <Settings aria-hidden="true" className="h-5 w-5" />}
                  </button>
                  {menu === m.key ? (
                    <div role="menu" aria-label={m.label} className="absolute bottom-12 right-0 w-52 overflow-hidden rounded-md bg-black/95 ring-1 ring-white/20 backdrop-blur">
                      <p className="px-4 py-2 text-[0.625rem] font-bold uppercase tracking-wider text-white/50">{m.label}</p>
                      {m.options.map((opt) => (
                        <button
                          key={opt}
                          role="menuitemradio"
                          aria-checked={m.value === opt}
                          onClick={() => {
                            m.onSelect(opt);
                            setMenu(null);
                          }}
                          className="flex w-full items-center justify-between px-4 py-2 text-left text-sm text-white/85 hover:bg-white/10"
                        >
                          {opt}
                          {m.value === opt ? <span className="text-primary">✓</span> : null}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
              <button type="button" aria-label="Picture in Picture" onClick={() => void togglePip()} className="transport-btn"><PictureInPicture aria-hidden="true" className="h-5 w-5" /></button>
              <button type="button" aria-label="Fullscreen" onClick={toggleFullscreen} className="transport-btn">
                {isFullscreen ? <Minimize aria-hidden="true" className="h-5 w-5" /> : <Maximize aria-hidden="true" className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
