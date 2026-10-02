import { Alert, Box, Button, Group, Modal, Stack, Text, Textarea } from '@mantine/core'
import { useMediaQuery } from '@mantine/hooks'
import { IconDownload, IconSparkles } from '@tabler/icons-react'
import { useState } from 'react'
import { useGenerateBanner, useLastBanner, type VflEvent } from '@/entities/event'
import { apiErrorMessage } from '@/shared/api'
import classes from './BannerModal.module.css'

interface BannerModalProps {
  /** The event to draw a banner for; null keeps the dialog closed. */
  event: VflEvent | null
  onClose: () => void
}

function fileNameFor(event: VflEvent, url: string): string {
  const slug =
    event.slug ||
    event.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  const extension = url.split('?')[0].match(/\.(png|jpe?g|webp)$/i)?.[1] ?? 'png'
  return `${slug || 'event'}-banner.${extension}`
}

/* The image lives in object storage on another origin, where `<a download>`
   is ignored and the browser just navigates. Fetching it as a blob first
   gives a real file save; if the bucket does not allow CORS the image is
   opened in a new tab instead, where it can still be saved by hand. */
async function downloadImage(url: string, fileName: string): Promise<void> {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const blobUrl = URL.createObjectURL(await response.blob())
    const link = document.createElement('a')
    link.href = blobUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(blobUrl)
  } catch {
    window.open(url, '_blank', 'noopener')
  }
}

/**
 * Generates the event's fight-card poster and offers it for download.
 *
 * Every word on the poster comes from the database; the style field only
 * steers the look. Left empty, the built-in VFL design renders instantly.
 */
export function BannerModal({ event, onClose }: BannerModalProps) {
  /* Style drafts are kept per event, so reopening one shows what was typed
     for it — falling back to the style its last banner was drawn in. */
  const [styleDrafts, setStyleDrafts] = useState<Record<string, string>>({})
  const [downloading, setDownloading] = useState(false)
  const generate = useGenerateBanner()
  const { data: banner } = useLastBanner(event?.id)
  const narrow = useMediaQuery('(max-width: 900px)')

  const style = (event && styleDrafts[event.id]) ?? banner?.style ?? ''
  const setStyle = (value: string) => {
    if (event) setStyleDrafts((drafts) => ({ ...drafts, [event.id]: value }))
  }

  /* The mutation is shared by every event, so its pending and error state
     only apply to the event it was started for. */
  const forThisEvent = generate.variables?.eventId === event?.id
  const pending = generate.isPending && forThisEvent
  const error = forThisEvent ? generate.error : null

  /* The banner itself is kept (see useLastBanner); closing only clears a
     stale error. A render still in flight is left alone so it lands in the
     cache when it finishes. */
  const handleClose = () => {
    if (!generate.isPending) generate.reset()
    onClose()
  }

  const styled = style.trim().length > 0

  const handleGenerate = () => {
    if (!event) return
    generate.mutate({ eventId: event.id, style })
  }

  const handleDownload = async () => {
    if (!event || !banner) return
    setDownloading(true)
    await downloadImage(banner.url, fileNameFor(event, banner.url))
    setDownloading(false)
  }

  return (
    <Modal
      opened={event !== null}
      onClose={handleClose}
      title={event ? `Banner · ${event.name}` : 'Banner'}
      size="min(1180px, 94vw)"
      fullScreen={narrow}
      centered
      closeOnClickOutside={!pending}
    >
      <Box className={classes.layout}>
        <Box className={classes.controls}>
          <Textarea
            label="Style"
            description="Optional. Colours, mood, fonts, background — the content always comes from the event."
            placeholder="black and gold, strict and premium"
            autosize
            minRows={3}
            maxRows={8}
            value={style}
            onChange={(e) => setStyle(e.currentTarget.value)}
            disabled={pending}
          />

          {pending && styled && (
            <Text c="var(--vfl-gray)" fz={13}>
              A custom style can take up to a minute to render.
            </Text>
          )}

          {error && (
            <Alert variant="outline" color="vflRed" radius={0}>
              {apiErrorMessage(error, 'Could not generate the banner.')}
            </Alert>
          )}

          {banner && banner.notes.length > 0 && (
            <Alert variant="outline" color="gray" radius={0} title="Not applied">
              <Stack gap={4}>
                {banner.notes.map((note) => (
                  <Text key={note} fz={13}>
                    {note}
                  </Text>
                ))}
              </Stack>
            </Alert>
          )}

          <Group gap={12} className={classes.actions} grow>
            <Button
              leftSection={<IconSparkles size={16} />}
              onClick={handleGenerate}
              loading={pending}
            >
              {banner ? 'Regenerate' : 'Generate'}
            </Button>
            {banner && (
              <Button
                variant="outline"
                leftSection={<IconDownload size={16} />}
                onClick={handleDownload}
                loading={downloading}
                disabled={pending}
              >
                Download
              </Button>
            )}
          </Group>
        </Box>

        <Box className={classes.preview}>
          {banner ? (
            <img
              src={banner.url}
              alt={`${event?.name ?? 'Event'} banner`}
              className={classes.image}
            />
          ) : (
            <Text c="var(--vfl-gray)" fz={14} className={classes.placeholder}>
              {pending
                ? 'Drawing the fight card…'
                : 'Generate a banner to preview it here.'}
            </Text>
          )}
        </Box>
      </Box>
    </Modal>
  )
}
