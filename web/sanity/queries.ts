import { client } from './client'
import { createImageUrlBuilder } from '@sanity/image-url'

const builder = createImageUrlBuilder(client)
export const urlFor = (source: any) => builder.image(source)

export async function getGalleries() {
  return client.fetch(`
    *[_type == "gallery"] | order(orderRank asc) {
      _id,
      title,
      images[] {
        _key,
        "alt": asset->title,
        "date": asset->date,
        asset
      }
    }
  `)
}
