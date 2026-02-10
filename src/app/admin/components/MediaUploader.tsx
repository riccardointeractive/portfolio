'use client'

import { useState, useCallback, useRef } from 'react'
import NextImage from 'next/image'
import { Upload, X, Image as ImageIcon, Film } from 'lucide-react'
import { uploadFile } from '@/lib/upload'
import { cn } from '@/lib/utils'

interface MediaUploaderProps {
  value?: string
  folder?: 'shots' | 'projects' | 'media'
  accept?: string
  onUpload: (url: string, mediaId: string) => void
  onRemove?: () => void
  className?: string
}

const ACCEPTED_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  video: ['video/mp4', 'video/webm'],
}

const ALL_ACCEPTED = [...ACCEPTED_TYPES.image, ...ACCEPTED_TYPES.video]

export function MediaUploader({
  value,
  folder = 'media',
  accept,
  onUpload,
  onRemove,
  className,
}: MediaUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const acceptedTypes = accept
    ? accept.split(',').map((t) => t.trim())
    : ALL_ACCEPTED

  const handleFile = useCallback(
    async (file: File) => {
      if (!acceptedTypes.includes(file.type)) {
        setError(`File type not supported: ${file.type}`)
        return
      }

      setError(null)
      setIsUploading(true)
      setProgress(0)

      try {
        const result = await uploadFile({
          file,
          folder,
          onProgress: setProgress,
        })
        onUpload(result.url, result.media.id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed')
      } finally {
        setIsUploading(false)
        setProgress(0)
      }
    },
    [acceptedTypes, folder, onUpload]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const isImage = value?.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i)
  const isVideo = value?.match(/\.(mp4|webm)(\?|$)/i)

  if (value) {
    return (
      <div className={cn('relative overflow-hidden rounded-lg border border-border-default', className)}>
        {isImage && (
          <div className="relative h-48 w-full">
            <NextImage
              src={value}
              alt="Uploaded"
              fill
              sizes="480px"
              className="object-cover"
            />
          </div>
        )}
        {isVideo && (
          <video src={value} className="h-48 w-full object-cover" muted />
        )}
        {!isImage && !isVideo && (
          <div className="flex h-48 items-center justify-center bg-elevated text-secondary">
            <span className="text-sm">{value.split('/').pop()}</span>
          </div>
        )}
        {onRemove && (
          <button
            onClick={onRemove}
            className="absolute right-2 top-2 rounded-full bg-surface p-1.5 shadow-sm transition-colors hover:bg-hover"
          >
            <X size={14} className="text-secondary" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-4 py-8 transition-colors',
        isDragging
          ? 'border-interactive bg-hover'
          : 'border-border-default hover:border-border-hover hover:bg-hover',
        isUploading && 'pointer-events-none opacity-60',
        className
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleChange}
        className="hidden"
      />

      {isUploading ? (
        <>
          <div className="h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-elevated">
            <div
              className="h-full rounded-full bg-interactive transition-all duration-200"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-sm text-secondary">{progress}%</span>
        </>
      ) : (
        <>
          <div className="flex gap-2 text-tertiary">
            <ImageIcon size={20} />
            <Film size={20} />
            <Upload size={20} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-secondary">
              Drop a file or click to upload
            </p>
            <p className="mt-1 text-xs text-tertiary">
              JPG, PNG, WebP, GIF, MP4, WebM
            </p>
          </div>
        </>
      )}

      {error && (
        <p className="text-xs text-error">{error}</p>
      )}
    </div>
  )
}
