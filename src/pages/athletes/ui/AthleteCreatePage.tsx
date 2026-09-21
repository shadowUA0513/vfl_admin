import { Stack } from '@mantine/core'
import { useNavigate } from 'react-router'
import { athleteQueries } from '@/entities/athlete'
import { AthleteForm } from '@/features/athlete-form'
import { PageHeader } from '@/shared/ui'

export function AthleteCreatePage() {
  const navigate = useNavigate()
  const create = athleteQueries.useCreate()

  return (
    <Stack gap={36}>
      <PageHeader title="Create Athlete" backTo="/athletes" backLabel="Athletes" />
      <AthleteForm
        submitLabel="Create"
        saving={create.isPending}
        error={create.error}
        onSubmit={(values) =>
          create.mutate(values, { onSuccess: () => navigate('/athletes') })
        }
      />
    </Stack>
  )
}
