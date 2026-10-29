import records from '@/public/images/photo-metadata.json';

type PhotoCredit = {name: string; creditText: string; source: string; copyrightNotice?: string; creator?: string; license?: string; description: string};
export const PHOTO_METADATA = records as Record<string, PhotoCredit>;

export function photoMetadataAttributes(src: string) {
  const credit = PHOTO_METADATA[src];
  return credit ? {
    'data-credit': credit.creditText,
    'data-source': credit.source,
    'data-license': credit.license,
    'data-metadata': '/images/photo-metadata.json',
  } : {};
}

export function imageStructuredData(images: string[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': [...new Set(images)].flatMap(src => {
      const credit = PHOTO_METADATA[src];
      if (!credit) return [];
      const {source, creator, ...metadata} = credit;
      return [{
        '@type': 'ImageObject',
        contentUrl: 'https://plate-preview-dubai-atelier.angelina-n.chatgpt.site' + src,
        ...metadata,
        isBasedOn: source,
        ...(creator ? {creator: {'@type': 'Person', name: creator}} : {}),
      }];
    }),
  };
}
