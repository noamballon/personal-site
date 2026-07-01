import { getGalleries, urlFor } from '@/sanity/queries'
import PhotoViewer from './PhotoViewer'

export default async function Home() {
  const galleries = await getGalleries()
  const collections = (galleries ?? [])
    .map((g: any) => ({
      id: g._id,
      title: g.title ?? '',
      photos: (g.images ?? []).map((p: any) => ({
        id: p._key,
        url: urlFor(p).width(2000).quality(75).auto('format').fit('max').url(),
        alt: p.alt ?? '',
        date: p.date ?? '',
      })),
    }))
    .filter((c: any) => c.photos.length > 0)

  return <PhotoViewer collections={collections} />
}
