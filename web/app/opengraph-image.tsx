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
      images[] { _key, asset, alt, date }
    }
  `)

  const images = gallery?.images ?? []
  const photo = images[Math.floor(Math.random() * images.length)]

  const builder = createImageUrlBuilder(client as any)
  const url = photo
    ? builder.image(photo).width(720).url()
    : null

  const formattedDate = photo?.date
    ? (() => { const [y, m, d] = photo.date.split('-'); return `${d}.${m}.${y.slice(2)}` })()
    : null

  const caption = [photo?.alt, formattedDate ? `(${formattedDate})` : null].filter(Boolean).join(' ')

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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img
            src={url}
            style={{
              maxWidth: 480,
              maxHeight: 520,
              objectFit: 'contain',
            }}
          />
          {caption && (
            <p style={{ margin: '8px 0 0', fontSize: 14, color: '#000' }}>{caption}</p>
          )}
        </div>
      )}
    </div>,
    { width: 1200, height: 630 }
  )
}
