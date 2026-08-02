import { AppShell, Badge } from '@cinenova/ui';

export default function RightsPolicyPage() {
  return (
    <AppShell active="account">
      <section className="px-4 pb-24 pt-24 sm:px-6 lg:px-8">
        <article className="mx-auto max-w-3xl space-y-6">
          <Badge>Legal engineering note</Badge>
          <h1 className="font-display text-3xl text-foreground">Rights and availability</h1>
          <p className="text-sm leading-6 text-foreground/90">
            CineNova displays, streams, downloads, or ingests only media for which valid rights exist
            for the user, territory, time window, profile, plan, and entitlement.
          </p>
          <p className="text-sm leading-6 text-muted">
            The app defaults to the ZST LABS catalogue and denies playback/downloads unless rights and
            entitlement checks pass. Provider keys, signed URLs, and internal details are never exposed
            to the browser.
          </p>
        </article>
      </section>
    </AppShell>
  );
}
