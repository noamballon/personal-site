'use client'

import { useState, useEffect, useCallback } from 'react'

type Photo = { id: string; url: string; alt: string; date: string }

function formatDate(date: string) {
  if (!date) return ''
  const [y, m, d] = date.split('-')
  return `${d}.${m}.${y.slice(2)}`
}

export default function PhotoViewer({ photos }: { photos: Photo[] }) {
  const [index, setIndex] = useState(0)

  const next = useCallback(() => {
    setIndex(i => (i + 1) % photos.length)
  }, [photos.length])

  const prev = useCallback(() => {
    setIndex(i => (i - 1 + photos.length) % photos.length)
  }, [photos.length])

  useEffect(() => {
    let cooldown = false
    const onWheel = (e: WheelEvent) => {
      if (cooldown) return
      if (e.deltaY > 0) next()
      else if (e.deltaY < 0) prev()
      cooldown = true
      setTimeout(() => { cooldown = false }, 800)
    }
    window.addEventListener('wheel', onWheel)
    return () => window.removeEventListener('wheel', onWheel)
  }, [next])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next()
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next])

  useEffect(() => {
    let startY = 0
    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY
    }
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
    }
    const onTouchEnd = (e: TouchEvent) => {
      const diff = startY - e.changedTouches[0].clientY
      if (diff > 30) next()
      else if (diff < -30) prev()
    }
    window.addEventListener('touchstart', onTouchStart)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [next])

  if (!photos.length) return null

  return (
    <main
      onClick={next}
      className="relative w-screen h-screen cursor-pointer bg-white"
    >
      <p className="absolute top-6 left-6 text-[10px]">
        I take photos and run{' '}
        <a
          href="https://www.azou.studio"
          onClick={e => e.stopPropagation()}
          className="hover:opacity-50 transition-opacity"
        >
          azou.studio
        </a>
        {' '}- we provide design services and publish via{' '}
        <a
          href="https://editions.azou.studio"
          onClick={e => e.stopPropagation()}
          className="hover:opacity-50 transition-opacity"
        >
          azou.editions
        </a>
      </p>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
        {photos.map((photo, i) => (
          <img
            key={photo.id}
            src={photo.url}
            alt={photo.alt}
            className={`max-w-[56vw] max-h-[56vh] w-auto h-auto ${i === index ? '' : 'hidden'}`}
          />
        ))}

        <p className="mt-2 text-[10px]">
          {photos[index].alt}{photos[index].date ? ` (${formatDate(photos[index].date)})` : ''}
        </p>
      </div>
    </main>
  )
}
