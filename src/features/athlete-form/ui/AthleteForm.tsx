import { Box, Divider, NumberInput, Select, SimpleGrid, Stack, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useNavigate } from 'react-router'
import {
  ATHLETE_STANCES,
  ATHLETE_STATUSES,
  dateInputToIso,
  isoToDateInput,
  optionalNumber,
  type AthleteInput,
} from '@/entities/athlete'
import { divisionQueries } from '@/entities/division'
import { FormShell } from '@/shared/ui'

interface AthleteFormProps {
  initialValues?: AthleteInput
  /** Absent while an edit page is still fetching the record. */
  loading?: boolean
  saving?: boolean
  error?: unknown
  submitLabel: string
  onSubmit: (values: AthleteInput) => void
}

const EMPTY: AthleteInput = {
  first_name: '',
  last_name: '',
  nickname: '',
  division_id: '',
  country: '',
  hometown: '',
  date_of_birth: '',
  status: 'active',
  height_cm: undefined,
  weight_kg: undefined,
  reach_cm: undefined,
  leg_reach_cm: undefined,
  stance: '',
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="vfl-label" mb={-6}>
      {children}
    </Text>
  )
}

export function AthleteForm({
  initialValues,
  loading,
  saving,
  error,
  submitLabel,
  onSubmit,
}: AthleteFormProps) {
  const navigate = useNavigate()

  /* The API links an athlete by division_id, so the select's values are ids
     and only its labels are names. */
  const { data: divisions } = divisionQueries.useList()

  const form = useForm<AthleteInput>({
    /* date_of_birth arrives as RFC3339 and the input needs YYYY-MM-DD. */
    initialValues: initialValues
      ? { ...initialValues, date_of_birth: isoToDateInput(initialValues.date_of_birth) }
      : EMPTY,
    validate: {
      first_name: (value) => (value.trim() ? null : 'First name is required'),
      last_name: (value) => (value.trim() ? null : 'Last name is required'),
    },
  })

  return (
    <FormShell
      onSubmit={form.onSubmit((values) =>
        /* The API rejects empty strings where it expects an id, a date or a
           number, so blank optional fields are dropped rather than sent. */
        onSubmit({
          ...values,
          nickname: values.nickname?.trim() || undefined,
          division_id: values.division_id || undefined,
          country: values.country?.trim() || undefined,
          hometown: values.hometown?.trim() || undefined,
          date_of_birth: dateInputToIso(values.date_of_birth ?? ''),
          stance: values.stance || undefined,
          height_cm: optionalNumber(values.height_cm),
          weight_kg: optionalNumber(values.weight_kg),
          reach_cm: optionalNumber(values.reach_cm),
          leg_reach_cm: optionalNumber(values.leg_reach_cm),
        }),
      )}
      onCancel={() => navigate('/athletes')}
      submitLabel={submitLabel}
      loading={loading}
      saving={saving}
      error={error}
    >
      <Stack gap={22}>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={22}>
          <TextInput label="First Name" placeholder="Jon" {...form.getInputProps('first_name')} />
          <TextInput label="Last Name" placeholder="Jones" {...form.getInputProps('last_name')} />
        </SimpleGrid>

        <TextInput label="Nickname" placeholder="Bones" {...form.getInputProps('nickname')} />

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={22}>
          <Select
            label="Division"
            placeholder="Select division"
            data={(divisions ?? []).map((division) => ({
              value: division.id,
              label: division.name,
            }))}
            searchable
            clearable
            {...form.getInputProps('division_id')}
          />
          <Select
            label="Status"
            data={ATHLETE_STATUSES}
            allowDeselect={false}
            {...form.getInputProps('status')}
          />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={22}>
          <TextInput
            label="Country"
            placeholder="US"
            maxLength={80}
            {...form.getInputProps('country')}
          />
          <TextInput
            label="Hometown"
            placeholder="Rochester, NY"
            maxLength={120}
            {...form.getInputProps('hometown')}
          />
        </SimpleGrid>

        <TextInput label="Date of Birth" type="date" {...form.getInputProps('date_of_birth')} />

        <Box mt={14}>
          <Divider mb={22} />
          <SectionLabel>Physicals</SectionLabel>
        </Box>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={22}>
          <NumberInput
            label="Height (cm)"
            placeholder="193"
            min={120}
            max={260}
            decimalScale={1}
            {...form.getInputProps('height_cm')}
          />
          <NumberInput
            label="Weight (kg)"
            placeholder="112"
            min={40}
            max={200}
            decimalScale={1}
            {...form.getInputProps('weight_kg')}
          />
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={22}>
          <NumberInput
            label="Reach (cm)"
            placeholder="215"
            min={120}
            max={260}
            decimalScale={1}
            {...form.getInputProps('reach_cm')}
          />
          <NumberInput
            label="Leg Reach (cm)"
            placeholder="111"
            min={70}
            max={160}
            decimalScale={1}
            {...form.getInputProps('leg_reach_cm')}
          />
        </SimpleGrid>

        <Select
          label="Stance"
          placeholder="Select stance"
          data={[...ATHLETE_STANCES]}
          clearable
          {...form.getInputProps('stance')}
        />
      </Stack>
    </FormShell>
  )
}
