import { Stack } from '@mantine/core'
import { useNavigate } from 'react-router'
import { divisionQueries } from '@/entities/division'
import { DivisionForm } from '@/features/division-form'
import { PageHeader } from '@/shared/ui'

export function DivisionCreatePage() {
  const navigate = useNavigate()
  const create = divisionQueries.useCreate()

  return (
    <Stack gap={36}>
      <PageHeader title="Create Division" backTo="/divisions" backLabel="Divisions" />
      <DivisionForm
        submitLabel="Create"
        saving={create.isPending}
        error={create.error}
        onSubmit={(values) =>
          create.mutate(values, { onSuccess: () => navigate('/divisions') })
        }
      />
    </Stack>
  )
}
