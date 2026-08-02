import { AnchorButton, Wordmark } from '@cinenova/ui';
import { getCatalogProvider } from '../../../lib/providers';
import { TitleDetailView } from '../../../components/title-detail-view';

interface TitlePageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export default async function TitlePage({ params }: TitlePageProps) {
  const { slug } = await params;
  const provider = getCatalogProvider();

  let title: Awaited<ReturnType<typeof provider.titleBySlug>>;
  let providerError = false;
  try {
    title = await provider.titleBySlug(slug, 'NG');
  } catch {
    providerError = true;
    title = null;
  }

  if (providerError || !title) {
    return (
      <main className="flex min-h-screen flex-col bg-background text-foreground">
        <div className="flex items-center gap-3 px-4 py-6 sm:px-6 lg:px-8">
          <a href="/" className="text-foreground">
            <Wordmark />
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center px-4 pb-24">
          <div className="max-w-md space-y-4 text-center">
            <p className="eyebrow">Title unavailable</p>
            <h1 className="font-display text-2xl text-foreground">Not in this region or catalogue</h1>
            <p className="text-sm text-muted">
              This title is either not licensed in your territory or no longer in the catalogue.
            </p>
            <AnchorButton href="/" variant="primary" className="mx-auto">
              Back to Home
            </AnchorButton>
          </div>
        </div>
      </main>
    );
  }

  let recs: Awaited<ReturnType<typeof provider.recommendations>> = [];
  try {
    recs = await provider.recommendations(title.id, 'NG');
  } catch {
    recs = [];
  }

  return <TitleDetailView title={title} recs={recs} />;
}
