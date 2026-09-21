import { api } from './client'
import { USING_MOCK_API } from '@/shared/config/env'

/* POST /admin/uploads/{folder} — multipart, one file, returns one public
   URL. The API does not derive sizes, which is why an athlete carries three
   separate URL fields and each is uploaded on its own. */

export type UploadFolder = 'athlete-photos' | 'event-posters'

/** The API's documented ceiling. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024

interface UploadResponse {
  url: string
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export async function uploadImage(
  folder: UploadFolder,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  if (USING_MOCK_API) {
    /* Dev only: a blob URL renders in the preview but does not survive a
       reload. Good enough to build the screen against. */
    await new Promise((resolve) => setTimeout(resolve, 400))
    onProgress?.(100)
    return URL.createObjectURL(file)
  }

  const form = new FormData()
  form.append('file', file)

  const { data } = await api.post<UploadResponse>(`/admin/uploads/${folder}`, form, {
    /* The axios instance defaults every request to application/json. That
       default has to be cleared here, not replaced: the browser needs to
       write Content-Type itself so it can include the multipart boundary. */
    headers: { 'Content-Type': undefined },
    onUploadProgress: (event) => {
      if (!onProgress || !event.total) return
      onProgress(Math.round((event.loaded / event.total) * 100))
    },
  })

  return data.url
}
