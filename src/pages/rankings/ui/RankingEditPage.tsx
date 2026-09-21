import { Stack } from '@mantine/core'
import { useNavigate, useParams } from 'react-router'
import { rankingQueries, toRankingSnapshotInput } from '@/entities/ranking'
import { RankingForm } from '@/features/ranking-form'
import { PageHeader } from '@/shared/ui'

export function RankingEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, error } = rankingQueries.useItem(id)
  const update = rankingQueries.useUpdate()

  /* The form is keyed on the record so it remounts once data arrives —
     Mantine's useForm only reads initialValues on first render. */
  return (
    <Stack gap={36}>
      <PageHeader
        title={data?.division?.name ?? 'Edit Ranking'}
        backTo="/rankings"
        backLabel="Rankings"
      />
      <RankingForm
        key={data?.id ?? 'loading'}
        initialValues={data ? toRankingSnapshotInput(data) : undefined}
        divisionLocked
        loading={isLoading}
        saving={update.isPending}
        error={update.error ?? error}
        submitLabel="Save"
        onSubmit={(values) => {
          if (!id) return
          update.mutate({ id, input: values }, { onSuccess: () => navigate('/rankings') })
        }}
      />
    </Stack>
  )
}
