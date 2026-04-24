"use client"

import { useState, useRef, useCallback } from "react"
import { Upload } from "lucide-react"
import { toast } from "sonner"
import { getMediaUploadUrl, confirmMediaUpload } from "@/actions/admin-media"

interface MediaUploadZoneProps {
  onUploadComplete: () => void
}

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB

interface UploadProgress {
  filename: string
  progress: number
}

function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
      URL.revokeObjectURL(img.src)
    }
    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error("Failed to read image dimensions"))
    }
    img.src = URL.createObjectURL(file)
  })
}

export function MediaUploadZone({ onUploadComplete }: MediaUploadZoneProps) {
  const [dragOver, setDragOver] = useState(false)
  const [uploads, setUploads] = useState<UploadProgress[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    async (files: FileList) => {
      const validFiles = Array.from(files).filter((f) => {
        if (f.size > MAX_FILE_SIZE) {
          toast.error(`${f.name} exceeds 100MB limit`)
          return false
        }
        if (
          !f.type.startsWith("image/") &&
          !f.type.startsWith("audio/") &&
          !f.type.startsWith("video/")
        ) {
          toast.error(`${f.name}: unsupported file type`)
          return false
        }
        return true
      })

      if (validFiles.length === 0) return

      let uploadedCount = 0

      for (const file of validFiles) {
        setUploads((prev) => [
          ...prev,
          { filename: file.name, progress: 0 },
        ])

        try {
          // Step 1: Get presigned URL from server (metadata only, no file data)
          const { uploadUrl, key } = await getMediaUploadUrl({
            filename: file.name,
            mimeType: file.type,
            size: file.size,
          })

          // Step 2: PUT file directly to R2 via presigned URL
          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest()
            xhr.open("PUT", uploadUrl)
            xhr.setRequestHeader("Content-Type", file.type)

            xhr.upload.addEventListener("progress", (e) => {
              if (e.lengthComputable) {
                const pct = Math.round((e.loaded / e.total) * 100)
                setUploads((prev) =>
                  prev.map((u) =>
                    u.filename === file.name ? { ...u, progress: pct } : u
                  )
                )
              }
            })

            xhr.addEventListener("load", () => {
              if (xhr.status >= 200 && xhr.status < 300) resolve()
              else reject(new Error(`Upload failed: ${xhr.status}`))
            })

            xhr.addEventListener("error", () =>
              reject(new Error("Upload failed"))
            )
            xhr.send(file)
          })

          // Step 3: Read dimensions for images
          let width: number | undefined
          let height: number | undefined
          if (file.type.startsWith("image/")) {
            try {
              const dims = await getImageDimensions(file)
              width = dims.width
              height = dims.height
            } catch {
              // Proceed without dimensions
            }
          }

          // Step 4: Confirm upload in DB
          await confirmMediaUpload({
            key,
            filename: file.name,
            mimeType: file.type,
            size: file.size,
            width,
            height,
          })

          uploadedCount++
        } catch (err) {
          console.error("Upload error:", err)
          toast.error(`Failed to upload ${file.name}`)
        }

        setUploads((prev) => prev.filter((u) => u.filename !== file.name))
      }

      if (uploadedCount > 0) {
        toast.success(
          `${uploadedCount} file${uploadedCount > 1 ? "s" : ""} uploaded`
        )
        onUploadComplete()
      }
    },
    [onUploadComplete]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      if (e.dataTransfer.files.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles]
  )

  return (
    <div>
      <div
        data-testid="media-drop-zone"
        data-dragging={dragOver ? "true" : "false"}
        className={`border border-dashed ${
          dragOver
            ? "border-[#f5f5f0] bg-[#1a1a1a]"
            : "border-[#333333] bg-[#111111]"
        } p-6 text-center cursor-pointer transition-colors`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragEnter={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,audio/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              handleFiles(e.target.files)
              e.target.value = ""
            }
          }}
        />
        <Upload size={24} className="mx-auto text-[#555555] mb-2" />
        <p className="font-mono text-sm text-[#f5f5f0] uppercase tracking-wider">
          Drop files here or click to upload
        </p>
        <p className="text-[11px] text-[#888888] font-sans mt-1">
          Images, audio, and video up to 100MB
        </p>
      </div>

      {uploads.length > 0 && (
        <div className="mt-3 space-y-2">
          {uploads.map((u) => (
            <div key={u.filename} className="bg-[#111111] p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[13px] text-[#888888] font-sans truncate max-w-[80%]">
                  {u.filename}
                </span>
                <span className="text-[11px] text-[#555555] font-mono">
                  {u.progress}%
                </span>
              </div>
              <div className="w-full bg-[#222222] h-1">
                <div
                  className="bg-[#f5f5f0] h-1 transition-all duration-200"
                  style={{ width: `${u.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
