import { Stack } from '@mantine/core'
import { useNavigate, useParams } from 'react-router'
import { divisionQueries, toDivisionInput } from '@/entities/division'
import { DivisionForm } from '@/features/division-form'
import { PageHeader } from '@/shared/ui'

export function DivisionEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, error } = divisionQueries.useItem(id)
  const update = divisionQueries.useUpdate()

  /* The form is keyed on the record so it remounts once data arrives —
     Mantine's useForm only reads initialValues on first render. */
  return (
    <Stack gap={36}>
      <PageHeader title={data?.name ?? 'Edit Division'} backTo="/divisions" backLabel="Divisions" />
      <DivisionForm
        key={data?.id ?? 'loading'}
        initialValues={data ? toDivisionInput(data) : undefined}
        loading={isLoading}
        saving={update.isPending}
        error={update.error ?? error}
        submitLabel="Save"
        onSubmit={(values) => {
          if (!id) return
          update.mutate({ id, input: values }, { onSuccess: () => navigate('/divisions') })
        }}
      />
    </Stack>
  )
}
