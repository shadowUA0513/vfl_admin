import { Stack } from '@mantine/core'
import { useNavigate } from 'react-router'
import { rankingQueries } from '@/entities/ranking'
import { RankingForm } from '@/features/ranking-form'
import { PageHeader } from '@/shared/ui'

export function RankingCreatePage() {
  const navigate = useNavigate()
  const create = rankingQueries.useCreate()

  return (
    <Stack gap={36}>
      <PageHeader title="Create Ranking" backTo="/rankings" backLabel="Rankings" />
      <RankingForm
        submitLabel="Save Draft"
        saving={create.isPending}
        error={create.error}
        onSubmit={(values) => create.mutate(values, { onSuccess: () => navigate('/rankings') })}
      />
    </Stack>
  )
}
