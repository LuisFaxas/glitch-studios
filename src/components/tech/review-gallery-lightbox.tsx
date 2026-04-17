"use client"

import { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import useEmblaCarousel from "embla-carousel-react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

export interface GalleryImage {
  url: string
  alt: string | null
  width: number | null
  height: number | null
}

interface ReviewGalleryLightboxProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  images: GalleryImage[]
  startIndex: number
}

export function ReviewGalleryLightbox({ open, onOpenChange, images, startIndex }: ReviewGalleryLightboxProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, startIndex })
  const [current, setCurrent] = useState(startIndex)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const update = () => setCurrent(emblaApi.selectedScrollSnap())
    emblaApi.on("select", update)
    return () => {
      emblaApi.off("select", update)
    }
  }, [emblaApi])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") scrollPrev()
      if (e.key === "ArrowRight") scrollNext()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, scrollPrev, scrollNext])

  if (images.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-screen w-screen max-w-none border-0 bg-black/95 p-0 backdrop-blur">
        <DialogTitle className="sr-only">Gallery image viewer</DialogTitle>
        <div className="relative h-full w-full" ref={emblaRef}>
          <div className="flex h-full">
            {images.map((img, i) => (
              <div key={i} className="flex h-full w-full flex-shrink-0 items-center justify-center p-6">
                <div className="relative max-h-[85vh] max-w-[90vw]">
                  <Image
                    src={img.url}
                    alt={img.alt ?? `Gallery image ${i + 1}`}
                    width={img.width ?? 1920}
                    height={img.height ?? 1080}
                    className="h-auto max-h-[85vh] w-auto max-w-[90vw] object-contain"
                    sizes="90vw"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close gallery"
          className="absolute right-4 top-4 flex h-11 w-11 cursor-pointer items-center justify-center text-[#f5f5f0] hover:bg-white/10"
        >
          <X className="h-6 w-6" />
        </button>
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={scrollPrev}
              aria-label="Previous image"
              className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center text-[#f5f5f0] hover:bg-white/10"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              aria-label="Next image"
              className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center text-[#f5f5f0] hover:bg-white/10"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-mono text-[13px] text-[#888]">
              {current + 1} / {images.length}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
