import { ActionIcon, Box, Loader, Text, Tooltip } from '@mantine/core'
import { IconPhotoPlus, IconX } from '@tabler/icons-react'
import { useRef, useState } from 'react'
import {
  MAX_UPLOAD_BYTES,
  apiErrorMessage,
  formatBytes,
  isImageFile,
  uploadImage,
  type UploadFolder,
} from '@/shared/api'
import classes from './ImageUpload.module.css'

interface ImageUploadProps {
  label: string
  folder: UploadFolder
  /** The stored URL, or empty when nothing is set. */
  value: string | undefined
  onChange: (url: string | undefined) => void
  description?: string
}

/**
 * One image slot: click or drop to upload, preview once set, X to clear.
 *
 * The value is the public URL the API returns, so the parent form keeps
 * storing a plain string and knows nothing about the upload.
 */
export function ImageUpload({ label, folder, value, onChange, description }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  const send = async (file: File) => {
    /* Checked before the request so an obvious mistake fails instantly
       instead of after pushing 8MB up the wire. */
    if (!isImageFile(file)) {
      setError('Not an image file')
      return
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError(`Too large — ${formatBytes(file.size)}, limit is 8 MB`)
      return
    }

    setError(null)
    setUploading(true)
    setProgress(0)
    try {
      onChange(await uploadImage(folder, file, setProgress))
    } catch (cause) {
      setError(apiErrorMessage(cause, 'Upload failed'))
    } finally {
      setUploading(false)
    }
  }

  const pick = (fileList: FileList | null) => {
    const file = fileList?.[0]
    if (file) void send(file)
  }

  return (
    <Box>
      <Text className="vfl-label" mb={8}>
        {label}
      </Text>

      <Box
        className={classes.slot}
        data-filled={Boolean(value) || undefined}
        data-dragover={dragOver || undefined}
        data-busy={uploading || undefined}
        role="button"
        tabIndex={0}
        onClick={() => !uploading && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            if (!uploading) inputRef.current?.click()
          }
        }}
        onDragOver={(event) => {
          event.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault()
          setDragOver(false)
          if (!uploading) pick(event.dataTransfer.files)
        }}
      >
        {value && !uploading && (
          <img src={value} alt={label} className={classes.preview} loading="lazy" />
        )}

        {uploading && (
          <Box className={classes.busy}>
            <Loader size="sm" color="var(--vfl-red)" />
            <Text className="vfl-numeric" fz={12} c="var(--vfl-gray)" mt={10}>
              {progress}%
            </Text>
          </Box>
        )}

        {!value && !uploading && (
          <Box className={classes.placeholder}>
            <IconPhotoPlus size={22} stroke={1.5} />
            <Text fz={11} mt={8}>
              Upload
            </Text>
          </Box>
        )}

        {value && !uploading && (
          <Tooltip label="Remove" withArrow={false}>
            <ActionIcon
              className={classes.clear}
              size={26}
              radius={0}
              variant="filled"
              aria-label={`Remove ${label}`}
              onClick={(event) => {
                /* The slot itself opens the file picker, so the clear button
                   must not bubble into it. */
                event.stopPropagation()
                onChange(undefined)
                setError(null)
              }}
            >
              <IconX size={14} />
            </ActionIcon>
          </Tooltip>
        )}
      </Box>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          pick(event.target.files)
          /* Cleared so picking the same file twice still fires a change. */
          event.target.value = ''
        }}
      />

      {error ? (
        <Text fz={11} c="var(--vfl-red-bright)" mt={6}>
          {error}
        </Text>
      ) : (
        description && (
          <Text fz={11} c="var(--vfl-gray-muted)" mt={6}>
            {description}
          </Text>
        )
      )}
    </Box>
  )
}
