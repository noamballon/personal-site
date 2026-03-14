import { getGallery, urlFor } from '@/sanity/queries'
import PhotoViewer from './PhotoViewer'

export default async function Home() {
  const gallery = await getGallery()
  const urls = (gallery.images ?? []).map((p: any) => ({
    id: p._key,
    url: urlFor(p).url(),
    alt: p.alt ?? '',
    date: p.date ?? '',
  }))

  return <PhotoViewer photos={urls} />
}
