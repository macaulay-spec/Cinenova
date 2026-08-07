import { PrismaClient } from '@prisma/client';
import { MOCK_RIGHTS, MOCK_TITLES } from '@cinenova/provider-sdk';

const prisma = new PrismaClient();

async function seedPlans(): Promise<void> {
  const plans = [
    { code: 'guest', name: 'Guest', priceCents: 0, concurrentStreams: 0, offlineDeviceLimit: 0 },
    { code: 'free', name: 'Free', priceCents: 0, concurrentStreams: 1, offlineDeviceLimit: 0 },
    { code: 'standard', name: 'Standard', priceCents: 999, concurrentStreams: 2, offlineDeviceLimit: 1 },
    { code: 'premium', name: 'Premium', priceCents: 1499, concurrentStreams: 4, offlineDeviceLimit: 2 },
    { code: 'admin', name: 'Admin', priceCents: 0, concurrentStreams: 99, offlineDeviceLimit: 0 },
  ] as const;

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { code: plan.code },
      update: plan,
      create: plan,
    });
  }
}

async function seedCatalogue(): Promise<void> {
  for (const title of MOCK_TITLES) {
    const created = await prisma.title.upsert({
      where: { slug: title.slug },
      update: {
        kind: title.kind,
        title: title.title,
        synopsis: title.synopsis,
        releaseYear: title.releaseYear,
        runtimeSeconds: title.runtimeSeconds,
        maturityRating: title.maturityRating,
        originalCountry: title.countries[0] ?? 'NG',
        visible: true,
      },
      create: {
        slug: title.slug,
        kind: title.kind,
        title: title.title,
        synopsis: title.synopsis,
        releaseYear: title.releaseYear,
        runtimeSeconds: title.runtimeSeconds,
        maturityRating: title.maturityRating,
        originalCountry: title.countries[0] ?? 'NG',
        visible: true,
      },
    });

    await prisma.artwork.deleteMany({ where: { titleId: created.id } });
    await prisma.artwork.createMany({
      data: title.artwork.map((artwork) => ({
        titleId: created.id,
        kind: artwork.kind,
        url: artwork.url,
        alt: artwork.alt,
        width: artwork.width,
        height: artwork.height,
        dominantColor: artwork.dominantColor,
        provenance: 'mock-generated-placeholder',
      })),
    });

    const right = MOCK_RIGHTS.find((candidate) => candidate.titleId === title.id);
    await prisma.contentRight.deleteMany({ where: { titleId: created.id } });
    if (right) {
      await prisma.contentRight.create({
        data: {
          titleId: created.id,
          territories: right.territories,
          startsAt: right.startsAt,
          endsAt: right.endsAt,
          minimumPlan: right.minimumPlan,
          streamAllowed: right.streamAllowed,
          offlineDownloadAllowed: right.offlineDownloadAllowed,
          permittedAssetIds: right.permittedAssetIds,
          rightsHolder: 'CineNova Mock Licensed Catalogue',
          contractReferenceHash: `mock-${title.id}`,
        },
      });
    }
  }
}

async function main(): Promise<void> {
  await seedPlans();
  await seedCatalogue();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
