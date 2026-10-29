import {imageStructuredData} from '@/lib/photo-metadata';

export default function PhotoMetadata({images}: {images: string[]}) {
  const data = imageStructuredData(images);
  if (!data['@graph'].length) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(data).replace(/</g, '\\u003c')}}/>;
}
