import { Stack } from '@mantine/core'
import { useNavigate, useParams } from 'react-router'
import { boutQueries, toBoutDraft, type BoutDraft } from '@/entities/bout'
import { eventQueries, toEventInput, type VflEventInput } from '@/entities/event'
import { EventForm } from '@/features/event-form'
import { PageHeader } from '@/shared/ui'

export function EventEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, error } = eventQueries.useItem(id)
  const bouts = boutQueries.useList(id)
  const update = eventQueries.useUpdate()
  const syncBouts = boutQueries.useSync()

  const handleSubmit = (values: VflEventInput, card: BoutDraft[]) => {
    if (!id) return
    update.mutate(
      { id, input: values },
      /* The card is saved second because a bout is rejected outright if its
         event is not there — on this page it always is, but the order is
         the same one the create page needs. */
      { onSuccess: () => syncBouts.mutate({ eventId: id, bouts: card }, { onSuccess: () => navigate('/events') }) },
    )
  }

  const loading = isLoading || bouts.isLoading

  /* The form is keyed on the record so it remounts once data arrives —
     Mantine's useForm only reads initialValues on first render, and the
     bout editor's own state is seeded the same way. Both fetches are in the
     key because the card can land after the event, and the body stays
     blocked until neither is pending, so a remount cannot discard typing. */
  return (
    <Stack gap={36}>
      <PageHeader title={data?.name ?? 'Edit Event'} backTo="/events" backLabel="Events" />
      <EventForm
        key={loading ? 'loading' : (data?.id ?? 'loading')}
        initialValues={data ? toEventInput(data) : undefined}
        initialBouts={(bouts.data ?? []).map(toBoutDraft)}
        loading={loading}
        saving={update.isPending || syncBouts.isPending}
        error={update.error ?? syncBouts.error ?? error ?? bouts.error}
        submitLabel="Save"
        onSubmit={handleSubmit}
      />
    </Stack>
  )
}
