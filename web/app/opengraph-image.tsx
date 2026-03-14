import { ImageResponse } from 'next/og'
import { client } from '@/sanity/client'
import { createImageUrlBuilder } from '@sanity/image-url'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const alt = 'Noam Ballon'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage() {
  const gallery = await client.fetch(`
    *[_type == "gallery" && isActive == true][0] {
      images[] { _key, asset }
    }
  `)

  const images = gallery?.images ?? []
  const photo = images[Math.floor(Math.random() * images.length)]

  const builder = createImageUrlBuilder(client as any)
  const url = photo
    ? builder.image(photo).width(720).url()
    : null

  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {url && (
        <img
          src={url}
          style={{
            maxWidth: '40%',
            maxHeight: '100%',
            objectFit: 'contain',
          }}
        />
      )}
    </div>,
    { width: 1200, height: 630 }
  )
}
