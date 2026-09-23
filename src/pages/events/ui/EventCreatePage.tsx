import { Stack } from '@mantine/core'
import { useRef } from 'react'
import { useNavigate } from 'react-router'
import { boutQueries, type BoutDraft } from '@/entities/bout'
import { eventQueries, type VflEventInput } from '@/entities/event'
import { EventForm } from '@/features/event-form'
import { PageHeader } from '@/shared/ui'

export function EventCreatePage() {
  const navigate = useNavigate()
  const create = eventQueries.useCreate()
  const update = eventQueries.useUpdate()
  const syncBouts = boutQueries.useSync()

  /* Bouts hang off an event id, so the event has to exist before its card
     can be saved — which means a card that fails leaves the event behind.
     Remembering that id keeps a retry from this page an update rather than
     a second event with the same name. */
  const createdId = useRef<string | undefined>(undefined)

  const handleSubmit = (values: VflEventInput, bouts: BoutDraft[]) => {
    const saveCard = (eventId: string) => {
      createdId.current = eventId
      syncBouts.mutate({ eventId, bouts }, { onSuccess: () => navigate('/events') })
    }

    if (createdId.current) {
      update.mutate(
        { id: createdId.current, input: values },
        { onSuccess: (event) => saveCard(event.id) },
      )
      return
    }

    create.mutate(values, { onSuccess: (event) => saveCard(event.id) })
  }

  return (
    <Stack gap={36}>
      <PageHeader title="Create Event" backTo="/events" backLabel="Events" />
      <EventForm
        submitLabel="Create"
        saving={create.isPending || update.isPending || syncBouts.isPending}
        error={create.error ?? update.error ?? syncBouts.error}
        onSubmit={handleSubmit}
      />
    </Stack>
  )
}
