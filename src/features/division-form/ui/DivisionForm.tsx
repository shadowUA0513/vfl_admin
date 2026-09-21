import { NumberInput, Select, SimpleGrid, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useNavigate } from 'react-router'
import {
  DIVISION_GENDERS,
  DIVISION_KINDS,
  divisionKindLabel,
  type DivisionInput,
} from '@/entities/division'
import { FormShell } from '@/shared/ui'

interface DivisionFormProps {
  initialValues?: DivisionInput
  loading?: boolean
  saving?: boolean
  error?: unknown
  submitLabel: string
  onSubmit: (values: DivisionInput) => void
}

const EMPTY: DivisionInput = {
  name: '',
  gender: 'men',
  kind: 'weight_class',
  weight_limit_lbs: 155,
  sort_order: 0,
}

export function DivisionForm({
  initialValues,
  loading,
  saving,
  error,
  submitLabel,
  onSubmit,
}: DivisionFormProps) {
  const navigate = useNavigate()

  const form = useForm<DivisionInput>({
    initialValues: initialValues ?? EMPTY,
    validate: {
      name: (value) => (value.trim() ? null : 'Division name is required'),
      weight_limit_lbs: (value, values) => {
        /* A pound-for-pound board ranks across weights, so it has no limit. */
        if (values.kind === 'pound_for_pound') return null
        if (value === undefined || value === null) return 'Weight limit is required'
        return value >= 105 && value <= 300 ? null : 'Must be between 105 and 300 lbs'
      },
    },
  })

  const isPoundForPound = form.values.kind === 'pound_for_pound'

  return (
    <FormShell
      onSubmit={form.onSubmit((values) =>
        onSubmit({
          ...values,
          /* 0 rather than undefined: omitting the field leaves whatever
             limit the division had before, so switching an existing weight
             class to pound-for-pound would keep showing a stale limit. */
          weight_limit_lbs: isPoundForPound ? 0 : values.weight_limit_lbs,
        }),
      )}
      onCancel={() => navigate('/divisions')}
      submitLabel={submitLabel}
      loading={loading}
      saving={saving}
      error={error}
    >
      <Stack gap={22}>
        <TextInput
          label="Division Name"
          placeholder="Lightweight"
          maxLength={80}
          {...form.getInputProps('name')}
        />

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={22}>
          <Select
            label="Kind"
            data={DIVISION_KINDS.map((kind) => ({ value: kind, label: divisionKindLabel(kind) }))}
            allowDeselect={false}
            {...form.getInputProps('kind')}
          />
          <Select
            label="Gender"
            data={DIVISION_GENDERS}
            allowDeselect={false}
            {...form.getInputProps('gender')}
          />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={22}>
          <NumberInput
            label="Weight Limit (lbs)"
            min={105}
            max={300}
            disabled={isPoundForPound}
            description={isPoundForPound ? 'Not used for pound-for-pound' : undefined}
            {...form.getInputProps('weight_limit_lbs')}
          />
          <NumberInput label="Sort Order" min={0} {...form.getInputProps('sort_order')} />
        </SimpleGrid>
      </Stack>
    </FormShell>
  )
}
