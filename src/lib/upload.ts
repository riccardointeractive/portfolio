import type { MediaRecord } from '@/types/content'
import { API } from '@/config/routes'

interface UploadOptions {
  file: File
  folder?: 'shots' | 'projects' | 'media'
  onProgress?: (percent: number) => void
}

interface UploadResult {
  url: string
  key: string
  media: MediaRecord
}

/**
 * Upload a file to R2 via presigned URL, then register in the DB.
 *
 * Flow:
 * 1. GET presigned PUT URL from our API
 * 2. PUT file directly to R2 (with progress tracking)
 * 3. POST to /api/admin/media to register the upload
 */
export async function uploadFile({
  file,
  folder = 'media',
  onProgress,
}: UploadOptions): Promise<UploadResult> {
  // 1. Get presigned URL
  const presignRes = await fetch(API.admin.upload, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: file.name,
      contentType: file.type,
      folder,
    }),
  })

  if (!presignRes.ok) {
    throw new Error('Failed to get upload URL')
  }

  const { uploadUrl, publicUrl, key } = await presignRes.json()

  // 2. Upload directly to R2 with progress
  await uploadToR2(uploadUrl, file, file.type, onProgress)

  // 3. Register in the database
  const confirmRes = await fetch(API.admin.media, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: key.split('/').pop(),
      original_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      url: publicUrl,
    }),
  })

  if (!confirmRes.ok) {
    throw new Error('Failed to register upload')
  }

  const media: MediaRecord = await confirmRes.json()

  return { url: publicUrl, key, media }
}

function uploadToR2(
  url: string,
  file: File,
  contentType: string,
  onProgress?: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`))
      }
    })

    xhr.addEventListener('error', () => reject(new Error('Upload failed')))
    xhr.addEventListener('abort', () => reject(new Error('Upload aborted')))

    xhr.open('PUT', url)
    xhr.setRequestHeader('Content-Type', contentType)
    xhr.send(file)
  })
}
