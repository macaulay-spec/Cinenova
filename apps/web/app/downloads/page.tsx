'use client';

import { AppShell, Switch } from '@cinenova/ui';
import { AlertTriangle, Check, Pause, Play } from 'lucide-react';
import { useState } from 'react';

interface DownloadRow {
  id: string;
  name: string;
  meta: string;
  status: 'downloading' | 'complete' | 'expired' | 'queued';
  progress: number;
  size: string;
  detail: string;
}

const INITIAL: DownloadRow[] = [
  { id: 'd1', name: 'Genesis', meta: '58m · 720p', status: 'downloading', progress: 64, size: '1.2 GB', detail: '64% downloaded' },
  { id: 'd2', name: 'Supergirl', meta: '1h 42m · 1080p', status: 'complete', progress: 100, size: '2.4 GB', detail: 'Completed · expires in 6 days' },
  { id: 'd3', name: 'Inception', meta: '2h 28m · 1080p', status: 'expired', progress: 100, size: '3.1 GB', detail: 'Expired — renew rights to redownload' },
  { id: 'd4', name: 'Colony', meta: '2h 02m · 720p', status: 'queued', progress: 0, size: '1.1 GB', detail: 'Queued · waiting on Wi-Fi' },
];

const STATUS_TEXT: Record<DownloadRow['status'], string> = {
  downloading: 'Downloading',
  complete: 'Complete',
  expired: 'Expired',
  queued: 'Queued',
};

export default function DownloadsPage() {
  const [smart, setSmart] = useState(true);
  const [downloads, setDownloads] = useState<DownloadRow[]>(INITIAL);

  function togglePause(id: string) {
    setDownloads((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: d.status === 'downloading' ? 'queued' : d.status === 'queued' ? 'downloading' : d.status } : d)),
    );
  }

  return (
    <AppShell active="downloads">
      <section className="px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <h1 className="font-display text-3xl text-foreground sm:text-4xl">Downloads</h1>

          {/* Smart Downloads card */}
          <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-surface p-5">
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">Smart Downloads</p>
              <p className="mt-1 text-xs text-muted">
                {smart ? 'On · Wi-Fi only' : 'Off'}
              </p>
            </div>
            <Switch checked={smart} onCheckedChange={setSmart} label="Toggle Smart Downloads" />
          </div>

          {/* Download list */}
          <div className="divide-y divide-border rounded-md border border-border bg-surface">
            {downloads.map((d) => (
              <div key={d.id} className="flex items-center gap-4 p-3">
                <div className="h-12 w-20 shrink-0 rounded-sm bg-secondary" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">{d.name}</p>
                  <p className="text-xs text-muted">{d.meta}</p>
                  <div className="mt-1.5 h-1 rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full ${d.status === 'expired' ? 'bg-muted' : 'bg-primary'}`}
                      style={{ width: `${d.progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {d.status === 'expired' ? 'Expired' : `${d.size} · ${d.detail}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-xs text-muted" aria-live="polite">
                  <span
                    className={
                      d.status === 'complete'
                        ? 'inline-flex items-center gap-1 text-success'
                        : d.status === 'expired'
                          ? 'inline-flex items-center gap-1 text-danger'
                          : 'inline-flex items-center gap-1'
                    }
                  >
                    {d.status === 'complete' ? <Check aria-hidden="true" className="h-3.5 w-3.5" /> : d.status === 'expired' ? <AlertTriangle aria-hidden="true" className="h-3.5 w-3.5" /> : null}
                    {STATUS_TEXT[d.status]}
                  </span>
                  <button
                    type="button"
                    aria-label={`${d.status === 'downloading' ? 'Pause' : d.status === 'queued' ? 'Resume' : 'Delete'} ${d.name}`}
                    onClick={() => (d.status === 'downloading' || d.status === 'queued' ? togglePause(d.id) : undefined)}
                    className="grid h-9 w-9 place-items-center rounded-full ring-1 ring-inset ring-border text-muted hover:text-foreground"
                  >
                    {d.status === 'downloading' ? (
                      <Pause aria-hidden="true" className="h-4 w-4" />
                    ) : d.status === 'queued' ? (
                      <Play aria-hidden="true" className="h-4 w-4" />
                    ) : (
                      <Check aria-hidden="true" className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-muted">
            <span>{downloads.length} titles · 7.8 GB used</span>
            <span>Downloads require a valid entitlement and expire per rights window.</span>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
