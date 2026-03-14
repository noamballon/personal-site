import { client } from './client'
import { createImageUrlBuilder } from '@sanity/image-url'

const builder = createImageUrlBuilder(client)
export const urlFor = (source: any) => builder.image(source)

export async function getGallery() {
  return client.fetch(`
    *[_type == "gallery" && isActive == true][0] {
      title,
      images[] {
        _key,
        alt,
        asset
      }
    }
  `)
}
