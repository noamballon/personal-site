import { getGallery, urlFor } from '@/sanity/queries'
import PhotoViewer from './PhotoViewer'

export default async function Home() {
  const gallery = await getGallery()
  const urls = (gallery.images ?? []).map((p: any) => ({
    id: p._key,
    url: urlFor(p).url(),
    alt: p.alt ?? '',
  }))

  return <PhotoViewer photos={urls} title={gallery.title ?? ''} />
}
