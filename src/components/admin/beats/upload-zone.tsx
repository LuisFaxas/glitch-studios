"use client"

import { useState, useRef, useCallback } from "react"
import { getPresignedUploadUrl } from "@/actions/admin-beats"

interface UploadZoneProps {
  label: string
  accept: string
  currentKey: string | null
  onUploadComplete: (key: string) => void
  subtitle?: string
}

export function UploadZone({
  label,
  accept,
  currentKey,
  onUploadComplete,
  subtitle,
}: UploadZoneProps) {
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedName, setUploadedName] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUpload = useCallback(
    async (file: File) => {
      setUploading(true)
      setProgress(0)

      try {
        const { url, key } = await getPresignedUploadUrl(
          file.name,
          file.type
        )

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open("PUT", url)
          xhr.setRequestHeader("Content-Type", file.type)

          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              setProgress(Math.round((e.loaded / e.total) * 100))
            }
          })

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve()
            } else {
              reject(new Error(`Upload failed: ${xhr.status}`))
            }
          })

          xhr.addEventListener("error", () => reject(new Error("Upload failed")))
          xhr.send(file)
        })

        setUploadedName(file.name)
        onUploadComplete(key)
      } catch (err) {
        console.error("Upload error:", err)
      } finally {
        setUploading(false)
        setProgress(0)
      }
    },
    [onUploadComplete]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) handleUpload(file)
    },
    [handleUpload]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleUpload(file)
    },
    [handleUpload]
  )

  const displayName =
    uploadedName || (currentKey ? currentKey.split("/").pop() : null)

  return (
    <div
      className={`border border-dashed ${
        dragOver ? "border-[#f5f5f0] bg-[#1a1a1a]" : "border-[#333] bg-[#111]"
      } rounded-none p-6 text-center cursor-pointer transition-colors`}
      onDragOver={(e) => {
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
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />

      <p className="font-mono text-sm text-[#f5f5f0] uppercase tracking-wider">
        {label}
      </p>

      {subtitle && (
        <p className="text-[11px] text-[#888] font-sans mt-1">{subtitle}</p>
      )}

      {uploading ? (
        <div className="mt-3">
          <div className="w-full bg-[#222] h-1">
            <div
              className="bg-[#f5f5f0] h-1 transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] text-[#888] font-sans mt-1">
            Uploading... {progress}%
          </p>
        </div>
      ) : displayName ? (
        <div className="mt-2 flex items-center justify-center gap-2">
          <span className="text-[#4ade80] text-sm">&#10003;</span>
          <span className="text-[13px] text-[#888] font-sans truncate max-w-[200px]">
            {displayName}
          </span>
        </div>
      ) : (
        <p className="text-[13px] text-[#666] font-sans mt-2">
          Drop file here or click to browse
        </p>
      )}
    </div>
  )
}
