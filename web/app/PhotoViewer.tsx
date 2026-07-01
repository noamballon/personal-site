'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

type Photo = { id: string; url: string; alt: string; date: string }
type Collection = { id: string; title: string; photos: Photo[] }

const TRANSITION_MS = 600

function formatDate(date: string) {
  if (!date) return ''
  const [y, m, d] = date.split('-')
  return `${d}.${m}.${y.slice(2)}`
}

function mod(n: number, m: number) {
  return ((n % m) + m) % m
}

function Panel({ collection, photoIndex }: { collection: Collection; photoIndex: number }) {
  const photo = collection.photos[photoIndex] ?? collection.photos[0]
  if (!photo) return <div className="w-screen h-screen shrink-0" />

  return (
    <div className="w-screen h-screen shrink-0 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <img
          src={photo.url}
          alt={photo.alt}
          className="max-w-[56vw] max-h-[56vh] w-auto h-auto"
        />
        <p className="mt-2 text-[10px]">
          {photo.alt}{photo.date ? ` (${formatDate(photo.date)})` : ''}
        </p>
      </div>
    </div>
  )
}

export default function PhotoViewer({ collections }: { collections: Collection[] }) {
  const count = collections.length
  const [index, setIndex] = useState(0)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [pending, setPending] = useState<0 | 1 | -1>(0)
  const [transitionEnabled, setTransitionEnabled] = useState(true)
  const animating = useRef(false)

  const go = useCallback((dir: 1 | -1) => {
    if (animating.current || count <= 1) return
    animating.current = true
    setTransitionEnabled(true)
    setPending(dir)
  }, [count])

  const nextCollection = useCallback(() => go(1), [go])
  const prevCollection = useCallback(() => go(-1), [go])

  const handleTransitionEnd = useCallback(() => {
    if (pending === 0) return
    setIndex(i => mod(i + pending, count))
    setPhotoIndex(0)
    setTransitionEnabled(false)
    setPending(0)
    animating.current = false
  }, [pending, count])

  useEffect(() => {
    if (transitionEnabled) return
    const raf = requestAnimationFrame(() => setTransitionEnabled(true))
    return () => cancelAnimationFrame(raf)
  }, [transitionEnabled])

  const cyclePhoto = useCallback((dir: 1 | -1) => {
    if (animating.current) return
    const photos = collections[index]?.photos
    if (!photos || photos.length < 2) return
    setPhotoIndex(i => mod(i + dir, photos.length))
  }, [collections, index])

  useEffect(() => {
    let cooldown = false
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        if (e.deltaX > 0) cyclePhoto(1)
        else if (e.deltaX < 0) cyclePhoto(-1)
        return
      }
      if (cooldown) return
      if (e.deltaY > 0) nextCollection()
      else if (e.deltaY < 0) prevCollection()
      cooldown = true
      setTimeout(() => { cooldown = false }, TRANSITION_MS + 200)
    }
    window.addEventListener('wheel', onWheel)
    return () => window.removeEventListener('wheel', onWheel)
  }, [nextCollection, prevCollection, cyclePhoto])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') cyclePhoto(1)
      else if (e.key === 'ArrowLeft') cyclePhoto(-1)
      else if (e.key === 'ArrowDown') nextCollection()
      else if (e.key === 'ArrowUp') prevCollection()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [nextCollection, prevCollection, cyclePhoto])

  useEffect(() => {
    let startX = 0
    let startY = 0
    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
    }
    const onTouchEnd = (e: TouchEvent) => {
      const diffX = startX - e.changedTouches[0].clientX
      const diffY = startY - e.changedTouches[0].clientY
      if (Math.abs(diffX) > Math.abs(diffY)) {
        if (diffX > 30) cyclePhoto(1)
        else if (diffX < -30) cyclePhoto(-1)
        return
      }
      if (diffY > 30) nextCollection()
      else if (diffY < -30) prevCollection()
    }
    window.addEventListener('touchstart', onTouchStart)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    return () => {
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [nextCollection, prevCollection, cyclePhoto])

  if (!count) return null

  const prevIdx = mod(index - 1, count)
  const nextIdx = mod(index + 1, count)
  const translateVh = pending === 1 ? -200 : pending === -1 ? 0 : -100

  return (
    <main
      onClick={() => cyclePhoto(1)}
      className="relative w-screen h-screen overflow-hidden cursor-pointer bg-white"
    >
      <p className="absolute top-6 left-6 right-6 text-[10px] z-10">
        I take photos and run{' '}
        <a
          href="https://www.azou.studio"
          onClick={e => e.stopPropagation()}
          className="underline hover:opacity-50 transition-opacity cursor-alias"
        >
          azou studio
        </a>
        {' '}- a design studio with a publishing arm via{' '}
        <a
          href="https://editions.azou.studio"
          onClick={e => e.stopPropagation()}
          className="underline hover:opacity-50 transition-opacity cursor-alias"
        >
          azou editions
        </a>
      </p>

      <div
        onTransitionEnd={handleTransitionEnd}
        style={{
          transform: `translateY(${translateVh}vh)`,
          transition: transitionEnabled ? `transform ${TRANSITION_MS}ms ease` : 'none',
        }}
      >
        <Panel collection={collections[prevIdx]} photoIndex={0} />
        <Panel collection={collections[index]} photoIndex={photoIndex} />
        <Panel collection={collections[nextIdx]} photoIndex={0} />
      </div>
    </main>
  )
}
