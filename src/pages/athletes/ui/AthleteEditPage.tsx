import { Stack } from '@mantine/core'
import { useNavigate, useParams } from 'react-router'
import { athleteName, athleteQueries, toAthleteInput } from '@/entities/athlete'
import { AthleteForm } from '@/features/athlete-form'
import { PageHeader } from '@/shared/ui'

export function AthleteEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, error } = athleteQueries.useItem(id)
  const update = athleteQueries.useUpdate()

  /* The form is keyed on the record so it remounts once data arrives —
     Mantine's useForm only reads initialValues on first render. */
  return (
    <Stack gap={36}>
      <PageHeader title={data ? athleteName(data) : 'Edit Athlete'} backTo="/athletes" backLabel="Athletes" />
      <AthleteForm
        key={data?.id ?? 'loading'}
        initialValues={data ? toAthleteInput(data) : undefined}
        loading={isLoading}
        saving={update.isPending}
        error={update.error ?? error}
        submitLabel="Save"
        onSubmit={(values) => {
          if (!id) return
          update.mutate({ id, input: values }, { onSuccess: () => navigate('/athletes') })
        }}
      />
    </Stack>
  )
}
