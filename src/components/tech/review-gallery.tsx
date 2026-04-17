"use client"

import { useState } from "react"
import Image from "next/image"
import { ReviewGalleryLightbox, type GalleryImage } from "./review-gallery-lightbox"

interface ReviewGalleryProps {
  images: GalleryImage[]
}

export function ReviewGallery({ images }: ReviewGalleryProps) {
  const [open, setOpen] = useState(false)
  const [startIndex, setStartIndex] = useState(0)

  if (images.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
      <h2 className="mb-6 font-mono text-2xl font-bold uppercase tracking-[0.05em] text-[#f5f5f0] md:text-3xl">
        Gallery
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              setStartIndex(i)
              setOpen(true)
            }}
            aria-label={`View image ${i + 1} of ${images.length}`}
            className="relative aspect-square cursor-pointer overflow-hidden border border-[#222] bg-[#0a0a0a] transition-colors hover:border-[#444] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f5f5f0]"
          >
            <Image
              src={img.url}
              alt={img.alt ?? `Gallery thumbnail ${i + 1}`}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover"
            />
          </button>
        ))}
      </div>
      <ReviewGalleryLightbox open={open} onOpenChange={setOpen} images={images} startIndex={startIndex} />
    </section>
  )
}
