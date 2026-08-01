import type { TitleDetail } from '@cinenova/contracts';
import { Badge } from './badge';

interface TitleMetadataProps {
  title: TitleDetail;
}

export function TitleMetadata({ title }: TitleMetadataProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Badge>{title.kind}</Badge>
        <Badge>{title.releaseYear}</Badge>
        <Badge>{title.maturityRating.replace('_', '-')}</Badge>
        <Badge>{title.minimumPlan} plan</Badge>
      </div>
      <p className="max-w-3xl text-lg leading-8 text-cinenova-muted">{title.synopsis}</p>
      <dl className="grid gap-4 text-sm text-cinenova-muted sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="font-bold text-cinenova-ivory">Genres</dt>
          <dd>{title.genres.join(', ')}</dd>
        </div>
        <div>
          <dt className="font-bold text-cinenova-ivory">Cast</dt>
          <dd>{title.cast.join(', ')}</dd>
        </div>
        <div>
          <dt className="font-bold text-cinenova-ivory">Audio</dt>
          <dd>{title.audioTracks.map((track) => track.label).join(', ')}</dd>
        </div>
        <div>
          <dt className="font-bold text-cinenova-ivory">Availability</dt>
          <dd>{title.rightsExplanation}</dd>
        </div>
      </dl>
    </div>
  );
}
