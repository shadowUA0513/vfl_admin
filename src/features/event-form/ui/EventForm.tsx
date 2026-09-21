import { Box, Divider, Select, SimpleGrid, Stack, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useNavigate } from 'react-router'
import {
  EVENT_STATUSES,
  isoToLocalInput,
  localInputToIso,
  optionalIso,
  type VflEventInput,
} from '@/entities/event'
import { FormShell } from '@/shared/ui'

interface EventFormProps {
  initialValues?: VflEventInput
  loading?: boolean
  saving?: boolean
  error?: unknown
  submitLabel: string
  onSubmit: (values: VflEventInput) => void
}

const EMPTY: VflEventInput = {
  name: '',
  starts_at: '',
  subtitle: '',
  venue_name: '',
  city: '',
  region: '',
  country: '',
  status: 'scheduled',
  early_prelims_at: '',
  prelims_at: '',
  main_card_at: '',
  broadcast_platform: '',
  ticket_url: '',
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="vfl-label" mb={-6}>
      {children}
    </Text>
  )
}

export function EventForm({
  initialValues,
  loading,
  saving,
  error,
  submitLabel,
  onSubmit,
}: EventFormProps) {
  const navigate = useNavigate()

  const form = useForm<VflEventInput>({
    /* Every timestamp is edited as a local datetime string and converted
       back to RFC3339 on submit. */
    initialValues: initialValues
      ? {
          ...initialValues,
          starts_at: isoToLocalInput(initialValues.starts_at),
          early_prelims_at: isoToLocalInput(initialValues.early_prelims_at),
          prelims_at: isoToLocalInput(initialValues.prelims_at),
          main_card_at: isoToLocalInput(initialValues.main_card_at),
        }
      : EMPTY,
    validate: {
      name: (value) => (value.trim() ? null : 'Event name is required'),
      starts_at: (value) => (value ? null : 'Start time is required'),
      ticket_url: (value) =>
        !value || /^https?:\/\//i.test(value.trim()) ? null : 'Must start with http:// or https://',
    },
  })

  return (
    <FormShell
      onSubmit={form.onSubmit((values) =>
        onSubmit({
          ...values,
          starts_at: localInputToIso(values.starts_at),
          early_prelims_at: optionalIso(values.early_prelims_at),
          prelims_at: optionalIso(values.prelims_at),
          main_card_at: optionalIso(values.main_card_at),
          subtitle: values.subtitle?.trim() || undefined,
          venue_name: values.venue_name?.trim() || undefined,
          city: values.city?.trim() || undefined,
          region: values.region?.trim() || undefined,
          country: values.country?.trim() || undefined,
          broadcast_platform: values.broadcast_platform?.trim() || undefined,
          ticket_url: values.ticket_url?.trim() || undefined,
        }),
      )}
      onCancel={() => navigate('/events')}
      submitLabel={submitLabel}
      loading={loading}
      saving={saving}
      error={error}
    >
      <Stack gap={22}>
        <TextInput
          label="Event Name"
          placeholder="VFL 300"
          maxLength={200}
          {...form.getInputProps('name')}
        />

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={22}>
          <TextInput
            label="Subtitle"
            placeholder="Van vs Pantoja 2"
            maxLength={200}
            {...form.getInputProps('subtitle')}
          />
          <Select
            label="Status"
            data={EVENT_STATUSES}
            allowDeselect={false}
            {...form.getInputProps('status')}
          />
        </SimpleGrid>

        <Box mt={14}>
          <Divider mb={22} />
          <SectionLabel>Schedule</SectionLabel>
        </Box>

        <TextInput
          label="Starts At"
          type="datetime-local"
          {...form.getInputProps('starts_at')}
        />

        {/* Each segment goes out on air at its own time, so they are stored
            separately rather than derived from the start. */}
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={22}>
          <TextInput
            label="Early Prelims"
            type="datetime-local"
            {...form.getInputProps('early_prelims_at')}
          />
          <TextInput
            label="Prelims"
            type="datetime-local"
            {...form.getInputProps('prelims_at')}
          />
          <TextInput
            label="Main Card"
            type="datetime-local"
            {...form.getInputProps('main_card_at')}
          />
        </SimpleGrid>

        <Box mt={14}>
          <Divider mb={22} />
          <SectionLabel>Venue</SectionLabel>
        </Box>

        <TextInput
          label="Venue"
          placeholder="T-Mobile Arena"
          maxLength={160}
          {...form.getInputProps('venue_name')}
        />

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={22}>
          <TextInput
            label="City"
            placeholder="Las Vegas"
            maxLength={120}
            {...form.getInputProps('city')}
          />
          <TextInput
            label="Region"
            placeholder="Nevada"
            maxLength={120}
            {...form.getInputProps('region')}
          />
          <TextInput
            label="Country"
            placeholder="USA"
            maxLength={80}
            {...form.getInputProps('country')}
          />
        </SimpleGrid>

        <Box mt={14}>
          <Divider mb={22} />
          <SectionLabel>Broadcast</SectionLabel>
        </Box>

        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={22}>
          <TextInput
            label="Platform"
            placeholder="Fight Pass"
            maxLength={120}
            {...form.getInputProps('broadcast_platform')}
          />
          <TextInput
            label="Ticket URL"
            placeholder="https://tickets.example.com/vfl-300"
            {...form.getInputProps('ticket_url')}
          />
        </SimpleGrid>
      </Stack>
    </FormShell>
  )
}
