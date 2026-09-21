import { Stack } from '@mantine/core'
import { useNavigate, useParams } from 'react-router'
import { eventQueries, toEventInput } from '@/entities/event'
import { EventForm } from '@/features/event-form'
import { PageHeader } from '@/shared/ui'

export function EventEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, error } = eventQueries.useItem(id)
  const update = eventQueries.useUpdate()

  /* The form is keyed on the record so it remounts once data arrives —
     Mantine's useForm only reads initialValues on first render. */
  return (
    <Stack gap={36}>
      <PageHeader title={data?.name ?? 'Edit Event'} backTo="/events" backLabel="Events" />
      <EventForm
        key={data?.id ?? 'loading'}
        initialValues={data ? toEventInput(data) : undefined}
        loading={isLoading}
        saving={update.isPending}
        error={update.error ?? error}
        submitLabel="Save"
        onSubmit={(values) => {
          if (!id) return
          update.mutate({ id, input: values }, { onSuccess: () => navigate('/events') })
        }}
      />
    </Stack>
  )
}
