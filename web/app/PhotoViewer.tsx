'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

type Photo = { id: string; url: string; alt: string; date: string; lqip?: string; aspectRatio?: number }
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

function Panel({ collection, photoIndex, onImageClick }: { collection: Collection; photoIndex: number; onImageClick: () => void }) {
  const photo = collection.photos[photoIndex] ?? collection.photos[0]
  const [loaded, setLoaded] = useState(false)
  const [loadedForId, setLoadedForId] = useState(photo?.id)

  if (photo?.id !== loadedForId) {
    setLoadedForId(photo?.id)
    setLoaded(false)
  }

  const handleImgRef = useCallback((node: HTMLImageElement | null) => {
    if (!node) return
    if (node.complete) {
      setLoaded(true)
    } else {
      node.addEventListener('load', () => setLoaded(true), { once: true })
    }
  }, [])

  if (!photo) return <div className="w-screen h-screen shrink-0" />

  const ar = photo.aspectRatio || 1.5

  return (
    <div className="w-screen h-screen shrink-0 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div
          onClick={onImageClick}
          className="relative overflow-hidden cursor-pointer [--maxw:67.2vw] [--maxh:67.2vh] sm:[--maxw:56vw] sm:[--maxh:56vh]"
          style={{ aspectRatio: ar, width: `min(var(--maxw), calc(var(--maxh) * ${ar}))` }}
        >
          {photo.lqip && (
            <img
              src={photo.lqip}
              alt=""
              aria-hidden="true"
              style={{ transform: 'scale(1.1)' }}
              className={`absolute inset-0 w-full h-full object-cover blur-xl ${loaded ? 'opacity-0' : 'opacity-100'}`}
            />
          )}
          <img
            ref={handleImgRef}
            key={photo.id}
            src={photo.url}
            alt={photo.alt}
            className={`absolute inset-0 w-full h-full object-contain ${loaded ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>
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
  const [photoIndices, setPhotoIndices] = useState<number[]>(() => collections.map(() => 0))
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
    setPhotoIndices(arr => arr.map((v, i) => (i === index ? mod(v + dir, photos.length) : v)))
  }, [collections, index])

  // nextCollection/prevCollection/cyclePhoto change identity whenever index
  // changes (i.e. right when a collection switch completes). Keeping the
  // latest versions in a ref - rather than the effects' dependency arrays -
  // means the listeners below stay mounted for the component's whole
  // lifetime instead of being torn down and recreated mid-gesture, which
  // would otherwise reset the wheel debounce state while trackpad momentum
  // is still firing and cause it to double-trigger a collection change.
  const latest = useRef({ nextCollection, prevCollection, cyclePhoto })
  useEffect(() => {
    latest.current = { nextCollection, prevCollection, cyclePhoto }
  })

  useEffect(() => {
    // go()/cyclePhoto already refuse to act while a collection switch is
    // animating, which naturally covers the strong initial burst of a
    // trackpad swipe. The only remaining risk is the tail end of momentum
    // still trickling in once that's over - but by then its delta is small,
    // so a plain magnitude threshold filters it out without needing any
    // separate cooldown timer that could keep extending itself and block
    // the next real scroll (which was the previous, over-eager fix here).
    const SCROLL_THRESHOLD = 15

    const onWheel = (e: WheelEvent) => {
      const { nextCollection, prevCollection, cyclePhoto } = latest.current
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        if (Math.abs(e.deltaX) < SCROLL_THRESHOLD) return
        if (e.deltaX > 0) cyclePhoto(1)
        else if (e.deltaX < 0) cyclePhoto(-1)
        return
      }
      if (Math.abs(e.deltaY) < SCROLL_THRESHOLD) return
      if (e.deltaY > 0) nextCollection()
      else if (e.deltaY < 0) prevCollection()
    }
    window.addEventListener('wheel', onWheel)
    return () => window.removeEventListener('wheel', onWheel)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { nextCollection, prevCollection, cyclePhoto } = latest.current
      if (e.key === 'ArrowRight') cyclePhoto(1)
      else if (e.key === 'ArrowLeft') cyclePhoto(-1)
      else if (e.key === 'ArrowDown') nextCollection()
      else if (e.key === 'ArrowUp') prevCollection()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

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
      const { nextCollection, prevCollection, cyclePhoto } = latest.current
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
  }, [])

  if (!count) return null

  const prevIdx = mod(index - 1, count)
  const nextIdx = mod(index + 1, count)
  const translateVh = pending === 1 ? -200 : pending === -1 ? 0 : -100

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-white">
      <p className="absolute top-6 left-6 right-6 text-[10px] z-10">
        I take photos and run{' '}
        <a
          href="https://www.azou.studio"
          className="underline hover:opacity-50 transition-opacity cursor-alias"
        >
          azou studio
        </a>
        {' '}- a design studio with a publishing arm via{' '}
        <a
          href="https://editions.azou.studio"
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
        <Panel collection={collections[prevIdx]} photoIndex={photoIndices[prevIdx] ?? 0} onImageClick={() => cyclePhoto(1)} />
        <Panel collection={collections[index]} photoIndex={photoIndices[index] ?? 0} onImageClick={() => cyclePhoto(1)} />
        <Panel collection={collections[nextIdx]} photoIndex={photoIndices[nextIdx] ?? 0} onImageClick={() => cyclePhoto(1)} />
      </div>
    </main>
  )
}
