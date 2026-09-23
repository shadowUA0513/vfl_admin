import { Box, Divider, NumberInput, Select, SimpleGrid, Stack, Text, TextInput } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import { useNavigate } from 'react-router'
import {
  ATHLETE_STANCES,
  ATHLETE_STATUSES,
  dateInputToIso,
  isoToDateInput,
  normalizeCareerStats,
  optionalNumber,
  type Athlete,
  type AthleteInput,
  type CareerStats,
} from '@/entities/athlete'
import { divisionQueries } from '@/entities/division'
import { FormShell, ImageUpload } from '@/shared/ui'
import { RecordReadout } from './RecordReadout'

interface AthleteFormProps {
  initialValues?: AthleteInput
  /* The fetched record, for the read-only W-L-D panel. Absent on create —
     a fighter with no bouts has no record to show. */
  athlete?: Athlete
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
  photo_url: undefined,
  photo_thumbnail_url: undefined,
  photo_large_url: undefined,
  career_stats: {},
}

/* The 12 writable stats, in the order they are read on a fighter profile:
   striking volume, then accuracy, then the grappling equivalents.
   `percent` fields are 0-100; the rest are counts or per-minute rates. */
const CAREER_STAT_FIELDS: Array<{
  key: keyof CareerStats
  label: string
  placeholder: string
  percent?: boolean
  decimals?: number
  max?: number
}> = [
  { key: 'sig_strikes_landed', label: 'Sig. Strikes Landed', placeholder: '1463' },
  { key: 'sig_strikes_attempted', label: 'Sig. Strikes Attempted', placeholder: '2790' },
  { key: 'striking_accuracy', label: 'Striking Accuracy', placeholder: '52.4', percent: true },
  { key: 'striking_defense', label: 'Striking Defense', placeholder: '64.1', percent: true },
  {
    key: 'strikes_landed_per_min',
    label: 'Strikes Landed / Min',
    placeholder: '4.29',
    decimals: 2,
    max: 50,
  },
  {
    key: 'strikes_absorbed_per_min',
    label: 'Strikes Absorbed / Min',
    placeholder: '2.22',
    decimals: 2,
    max: 50,
  },
  { key: 'takedowns_landed', label: 'Takedowns Landed', placeholder: '36' },
  { key: 'takedowns_attempted', label: 'Takedowns Attempted', placeholder: '82' },
  { key: 'takedown_accuracy', label: 'Takedown Accuracy', placeholder: '43.9', percent: true },
  { key: 'takedown_defense', label: 'Takedown Defense', placeholder: '95.0', percent: true },
  {
    key: 'takedown_avg_per_15_min',
    label: 'Takedowns / 15 Min',
    placeholder: '1.91',
    decimals: 2,
    max: 50,
  },
  {
    key: 'submission_avg_per_15_min',
    label: 'Submissions / 15 Min',
    placeholder: '0.44',
    decimals: 2,
    max: 50,
  },
]

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="vfl-label" mb={-6}>
      {children}
    </Text>
  )
}

export function AthleteForm({
  initialValues,
  athlete,
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
      ? {
          ...initialValues,
          date_of_birth: isoToDateInput(initialValues.date_of_birth),
          career_stats: initialValues.career_stats ?? {},
        }
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
          career_stats: normalizeCareerStats(values.career_stats),
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

        <DatePickerInput
          label="Date of Birth"
          placeholder="Select date"
          valueFormat="MMM D, YYYY"
          clearable
          maxDate={new Date()}
          value={form.values.date_of_birth || null}
          onChange={(value) => form.setFieldValue('date_of_birth', value ?? '')}
        />

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

        <Box mt={14}>
          <Divider mb={22} />
          <SectionLabel>Record</SectionLabel>
        </Box>

        <RecordReadout athlete={athlete} />

        <Box mt={14}>
          <Divider mb={22} />
          <SectionLabel>Career Stats</SectionLabel>
        </Box>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={22}>
          {CAREER_STAT_FIELDS.map((stat) => (
            <NumberInput
              key={stat.key}
              label={stat.label}
              placeholder={stat.placeholder}
              min={0}
              max={stat.percent ? 100 : (stat.max ?? 100000)}
              decimalScale={stat.percent ? 1 : (stat.decimals ?? 0)}
              /* Counts are whole: a fighter cannot land 36.5 takedowns. */
              allowDecimal={Boolean(stat.percent || stat.decimals)}
              suffix={stat.percent ? '%' : undefined}
              {...form.getInputProps(`career_stats.${stat.key}`)}
            />
          ))}
        </SimpleGrid>

        <Box mt={14}>
          <Divider mb={22} />
          <SectionLabel>Photos</SectionLabel>
        </Box>

        {/* Three independent slots: the API stores three URLs and does not
            derive sizes, so each is uploaded on its own. */}
        <SimpleGrid cols={{ base: 1, xs: 3 }} spacing={18}>
          <ImageUpload
            label="Main"
            folder="athlete-photos"
            description="Profile photo"
            value={form.values.photo_url}
            onChange={(url) => form.setFieldValue('photo_url', url)}
          />
          <ImageUpload
            label="Thumbnail"
            folder="athlete-photos"
            description="Lists and cards"
            value={form.values.photo_thumbnail_url}
            onChange={(url) => form.setFieldValue('photo_thumbnail_url', url)}
          />
          <ImageUpload
            label="Large"
            folder="athlete-photos"
            description="Hero / full bleed"
            value={form.values.photo_large_url}
            onChange={(url) => form.setFieldValue('photo_large_url', url)}
          />
        </SimpleGrid>
      </Stack>
    </FormShell>
  )
}
