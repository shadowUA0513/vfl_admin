import { Box, Divider, Select, SimpleGrid, Stack, Text, TextInput } from '@mantine/core'
import { DateTimePicker } from '@mantine/dates'
import { useForm, type UseFormReturnType } from '@mantine/form'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { validateBouts, type BoutDraft } from '@/entities/bout'
import {
  EVENT_STATUSES,
  isoToLocalInput,
  localInputToIso,
  optionalIso,
  type VflEventInput,
} from '@/entities/event'
import { FormShell } from '@/shared/ui'
import { BoutCardEditor } from './BoutCardEditor'

interface EventFormProps {
  initialValues?: VflEventInput
  /* Bouts are a sub-resource of the event rather than part of its DTO, so
     they travel beside the event's own values instead of inside them. On
     the create page there is no event to hang them off yet, so the page
     saves the event first and the card immediately after. */
  initialBouts?: BoutDraft[]
  loading?: boolean
  saving?: boolean
  error?: unknown
  submitLabel: string
  onSubmit: (values: VflEventInput, bouts: BoutDraft[]) => void
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

type TimestampField = 'starts_at' | 'early_prelims_at' | 'prelims_at' | 'main_card_at'

/* The four schedule fields are identical apart from their label and whether
   they can be cleared, and the native `datetime-local` control they replace
   was rendered by the browser, ignoring the theme entirely. */
function ScheduleField({
  form,
  field,
  label,
  required,
}: {
  form: UseFormReturnType<VflEventInput>
  field: TimestampField
  label: string
  required?: boolean
}) {
  return (
    <DateTimePicker
      label={label}
      placeholder="Select date and time"
      /* 24-hour clock: a fight card at 10:00 that means 22:00 is the kind of
         mistake this screen exists to prevent. */
      valueFormat="MMM D, YYYY · HH:mm"
      timePickerProps={{ format: '24h', withDropdown: true }}
      clearable={!required}
      withAsterisk={required}
      /* Mantine stores '' as no value, but its own empty value is null. */
      value={form.values[field] || null}
      onChange={(value) => form.setFieldValue(field, value ?? '')}
      error={form.errors[field]}
    />
  )
}

export function EventForm({
  initialValues,
  initialBouts,
  loading,
  saving,
  error,
  submitLabel,
  onSubmit,
}: EventFormProps) {
  const navigate = useNavigate()
  const [bouts, setBouts] = useState<BoutDraft[]>(initialBouts ?? [])
  /* Keyed by draft key and filled on submit, so a half-typed bout is not
     flagged while the card is still being built. */
  const [boutErrors, setBoutErrors] = useState<Record<string, string>>({})

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
      onSubmit={form.onSubmit((values) => {
        /* The event's own fields are already valid by the time Mantine
           calls this, so only the card is left to check. */
        const found = validateBouts(bouts)
        setBoutErrors(found)
        if (Object.keys(found).length > 0) return

        onSubmit(
          {
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
          },
          bouts,
        )
      })}
      onCancel={() => navigate('/events')}
      maw={860}
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

        <ScheduleField form={form} field="starts_at" label="Starts At" required />

        {/* Each segment goes out on air at its own time, so they are stored
            separately rather than derived from the start. */}
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={22}>
          <ScheduleField form={form} field="early_prelims_at" label="Early Prelims" />
          <ScheduleField form={form} field="prelims_at" label="Prelims" />
          <ScheduleField form={form} field="main_card_at" label="Main Card" />
        </SimpleGrid>

        <Box mt={14}>
          <Divider mb={22} />
        </Box>

        <BoutCardEditor value={bouts} onChange={setBouts} errors={boutErrors} />

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
