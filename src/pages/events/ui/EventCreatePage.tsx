import { Stack } from '@mantine/core'
import { useNavigate } from 'react-router'
import { eventQueries } from '@/entities/event'
import { EventForm } from '@/features/event-form'
import { PageHeader } from '@/shared/ui'

export function EventCreatePage() {
  const navigate = useNavigate()
  const create = eventQueries.useCreate()

  return (
    <Stack gap={36}>
      <PageHeader title="Create Event" backTo="/events" backLabel="Events" />
      <EventForm
        submitLabel="Create"
        saving={create.isPending}
        error={create.error}
        onSubmit={(values) =>
          create.mutate(values, { onSuccess: () => navigate('/events') })
        }
      />
    </Stack>
  )
}
