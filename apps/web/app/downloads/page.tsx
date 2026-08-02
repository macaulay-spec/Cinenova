'use client';

import { AppShell, Switch } from '@cinenova/ui';
import { Pause, Trash2, Wifi } from 'lucide-react';
import { useState } from 'react';

interface DownloadRow {
  name: string;
  meta: string;
  status: string;
  progress: number;
  expired?: boolean;
}

const MOCK_DOWNLOADS: DownloadRow[] = [
  { name: 'The Avengers', meta: '2h 21m · 1080p', status: '1.2 GB · 64% downloaded', progress: 64 },
  { name: 'Squid Game S1:E1', meta: '58m · 720p', status: 'Completed · expires in 6 days', progress: 100 },
  { name: 'Inception', meta: '2h 28m · 1080p', status: 'Expired — renew rights to redownload', progress: 100, expired: true },
];

export default function DownloadsPage() {
  const [smart, setSmart] = useState(true);

  return (
    <AppShell active="downloads">
      <section className="px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <h1 className="font-display text-3xl text-foreground sm:text-4xl">Downloads</h1>

          {/* Smart Downloads card */}
          <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-surface p-5">
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground">Smart Downloads</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
                <Wifi aria-hidden="true" className="h-3.5 w-3.5" />
                {smart ? 'On · Wi-Fi only' : 'Off'}
              </p>
            </div>
            <Switch checked={smart} onCheckedChange={setSmart} label="Toggle Smart Downloads" />
          </div>

          {/* Download list */}
          <div className="divide-y divide-border rounded-md border border-border bg-surface">
            {MOCK_DOWNLOADS.map((download) => (
              <div key={download.name} className="flex items-center gap-4 p-3">
                <div className="h-12 w-20 shrink-0 rounded-sm bg-secondary" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">{download.name}</p>
                  <p className="text-xs text-muted">{download.meta}</p>
                  <div className="mt-1.5 h-1 rounded-full bg-secondary">
                    <div
                      className={`h-full rounded-full ${download.expired ? 'bg-muted' : 'bg-primary'}`}
                      style={{ width: `${download.progress}%` }}
                    />
                  </div>
                  <p className={`mt-1 text-xs ${download.expired ? 'text-muted' : 'text-muted'}`}>
                    {download.status}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label={download.expired ? `Delete ${download.name}` : `Pause ${download.name}`}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full ring-1 ring-inset ring-border text-muted hover:text-foreground"
                >
                  {download.expired ? (
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  ) : download.progress === 100 ? (
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  ) : (
                    <Pause aria-hidden="true" className="h-4 w-4" />
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-muted">
            <span>3 titles · 4.1 GB used</span>
            <span>Downloads require a valid entitlement and expire per rights window.</span>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
