import { AppShell, Badge } from '@cinenova/ui';

export default function RightsPolicyPage() {
  return (
    <AppShell active="account">
      <section className="px-4 pb-28 pt-28 sm:px-6 lg:px-10">
        <article className="prose prose-invert prose-lg mx-auto max-w-3xl">
          <Badge>Legal engineering note</Badge>
          <h1>Rights and availability</h1>
          <p>
            CineNova displays, streams, downloads, or ingests only media for which valid rights exist
            for the user, territory, time window, profile, plan, and entitlement.
          </p>
          <p>
            This repository starts with mock licensed content. Real providers, billing, and DRM require
            legal approval, configured credentials, verified contracts, and operational runbooks.
          </p>
        </article>
      </section>
    </AppShell>
  );
}
