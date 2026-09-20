import {
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core'
import type { ReactNode } from 'react'

/* Living reference for the VFL admin design system. Every token and control
   below renders through the real theme, so this page breaks when the theme
   breaks — which is the point of keeping it in the app rather than in docs. */

const SURFACES = [
  ['--vfl-bg', '#050505', 'Page background'],
  ['--vfl-bg-soft', '#090909', 'Inputs, table headers'],
  ['--vfl-card', '#0D090A', 'Panels, modals, dropdowns'],
  ['--vfl-red', '#CB0106', 'Primary actions, accent lines'],
  ['--vfl-red-bright', '#F0171D', 'Hover, links, live state'],
  ['--vfl-white', '#FFFFFF', 'Display headings'],
  ['--vfl-white-soft', '#E8E8E8', 'Body text'],
  ['--vfl-gray', '#A5A5A5', 'Secondary text'],
  ['--vfl-gray-muted', '#777777', 'Labels, disabled'],
] as const

const FIGHTS = [
  ['01', 'Dauren Ismailov', 'Marco Silva', 'Lightweight', 'LIVE'],
  ['02', 'Timur Abdiev', 'Kenji Watanabe', 'Welterweight', 'SCHEDULED'],
  ['03', 'Ruslan Karimov', 'Andre Costa', 'Middleweight', 'SCHEDULED'],
  ['04', 'Javier Morales', 'Ilya Sorokin', 'Featherweight', 'DRAFT'],
] as const

function statusColor(status: string) {
  if (status === 'LIVE') return 'var(--vfl-red-bright)'
  if (status === 'SCHEDULED') return 'var(--vfl-white-soft)'
  return 'var(--vfl-gray-muted)'
}

function Section({
  label,
  title,
  children,
}: {
  label: string
  title: string
  children: ReactNode
}) {
  return (
    <Box component="section">
      <Text className="vfl-label vfl-label--red" mb={10}>
        {label}
      </Text>
      <Title order={2} mb={14}>
        {title}
      </Title>
      <Box className="vfl-rule" mb={28} style={{ maxWidth: 64 }} />
      {children}
    </Box>
  )
}

export function DesignSystemPage() {
  return (
    <Box
      className="vfl-enter"
      p="5vw"
      style={{ maxWidth: 'var(--vfl-shell-max)', margin: '0 auto' }}
    >
      <Stack gap={72}>
        {/* ---- Masthead ------------------------------------------------ */}
        <Box>
          <Text className="vfl-label" mb={12}>
            VFL / Internal
          </Text>
          <Title order={1}>Admin Design System</Title>
          <Text c="var(--vfl-gray)" mt={16} maw={620}>
            The brand system adapted for data density. Same palette, same
            geometry, same motion — smaller type scale, tighter padding, and no
            arena photography behind working screens.
          </Text>
        </Box>

        {/* ---- Color --------------------------------------------------- */}
        <Section label="01 — Foundation" title="Color">
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing={1}>
            {SURFACES.map(([token, hex, usage]) => (
              <Box key={token} style={{ border: '1px solid var(--vfl-border)' }}>
                <Box h={72} style={{ backgroundColor: `var(${token})` }} />
                <Box p={16} bg="var(--vfl-card)">
                  <Text ff="monospace" fz={12} c="var(--vfl-white-soft)">
                    {token}
                  </Text>
                  <Group justify="space-between" mt={6}>
                    <Text ff="monospace" fz={11} c="var(--vfl-gray-muted)">
                      {hex}
                    </Text>
                    <Text fz={11} c="var(--vfl-gray-muted)">
                      {usage}
                    </Text>
                  </Group>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
        </Section>

        {/* ---- Typography ---------------------------------------------- */}
        <Section label="02 — Foundation" title="Typography">
          <Stack gap={30}>
            <Box>
              <Text className="vfl-label" mb={10}>
                H1 · Bebas Neue · page title
              </Text>
              <Title order={1}>Event Roster</Title>
            </Box>
            <Divider />
            <Box>
              <Text className="vfl-label" mb={10}>
                Display numeric · KPI value
              </Text>
              <Text className="vfl-display vfl-numeric" fz={72}>
                248
              </Text>
            </Box>
            <Divider />
            <Box>
              <Text className="vfl-label" mb={10}>
                Section label · Inter 700 · .2em tracking
              </Text>
              <Text className="vfl-label">Upcoming Events</Text>
            </Box>
            <Divider />
            <Box>
              <Text className="vfl-label" mb={10}>
                Body · Inter · 15px / 1.55
              </Text>
              <Text maw={620}>
                Body copy runs at 15px in the admin rather than the 18–20px used
                on the public site. Long-form reading is rare here; scanning
                dense tables is the actual job.
              </Text>
            </Box>
          </Stack>
        </Section>

        {/* ---- Buttons ------------------------------------------------- */}
        <Section label="03 — Controls" title="Buttons">
          <Group gap={16} mb={20}>
            <Button size="lg">Create Event</Button>
            <Button>Save</Button>
            <Button variant="outline">Cancel</Button>
            <Button variant="subtle">Discard</Button>
            <Button disabled>Disabled</Button>
          </Group>
          <Text c="var(--vfl-gray-muted)" fz={13} maw={620}>
            The skewed clip path is reserved for filled buttons. Row actions
            inside tables stay rectangular — skewing every control makes an
            aligned grid look misprinted.
          </Text>
        </Section>

        {/* ---- Panels -------------------------------------------------- */}
        <Section label="04 — Surfaces" title="Panels">
          <SimpleGrid cols={{ base: 1, md: 3 }} spacing={20}>
            <Paper data-accent p="var(--vfl-pad-panel)" className="vfl-enter vfl-enter-1">
              <Text className="vfl-label" mb={12}>
                Total Fighters
              </Text>
              <Text className="vfl-display vfl-numeric" fz={56}>
                248
              </Text>
            </Paper>
            <Paper data-accent p="var(--vfl-pad-panel)" className="vfl-enter vfl-enter-2">
              <Text className="vfl-label" mb={12}>
                Events This Year
              </Text>
              <Text className="vfl-display vfl-numeric" fz={56}>
                17
              </Text>
            </Paper>
            <Paper p="var(--vfl-pad-panel)" className="vfl-enter vfl-enter-3">
              <Text className="vfl-label" mb={12}>
                No Accent
              </Text>
              <Text c="var(--vfl-gray)" fz={13}>
                The red top line is opt-in via a data-accent attribute. Used
                sparingly it signals importance; used everywhere it signals
                nothing.
              </Text>
            </Paper>
          </SimpleGrid>
        </Section>

        {/* ---- Data ---------------------------------------------------- */}
        <Section label="05 — Data" title="Tables">
          <Paper p={0}>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th w={70}>Bout</Table.Th>
                  <Table.Th>Red Corner</Table.Th>
                  <Table.Th>Blue Corner</Table.Th>
                  <Table.Th>Division</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th w={110} />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {FIGHTS.map(([bout, red, blue, division, status]) => (
                  <Table.Tr key={bout}>
                    <Table.Td>
                      <Text className="vfl-display vfl-numeric" fz={20}>
                        {bout}
                      </Text>
                    </Table.Td>
                    <Table.Td>{red}</Table.Td>
                    <Table.Td>{blue}</Table.Td>
                    <Table.Td c="var(--vfl-gray)">{division}</Table.Td>
                    <Table.Td>
                      <Text className="vfl-label" c={statusColor(status)}>
                        {status}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Button variant="subtle" size="compact-sm">
                        Edit
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Paper>
        </Section>

        {/* ---- Inputs / Tabs / Badges ---------------------------------- */}
        <Section label="06 — Controls" title="Inputs, Tabs & Badges">
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing={40}>
            <Stack gap={20}>
              <TextInput label="Fighter Name" placeholder="Enter full name" />
              <TextInput label="Nickname" placeholder="Optional" />
              <Group gap={10}>
                <Badge color="vflRed">Live</Badge>
                <Badge variant="outline" color="gray">
                  Draft
                </Badge>
                <Badge variant="outline" color="vflRed">
                  Main Event
                </Badge>
              </Group>
            </Stack>
            <Tabs defaultValue="details">
              <Tabs.List>
                <Tabs.Tab value="details">Details</Tabs.Tab>
                <Tabs.Tab value="record">Record</Tabs.Tab>
                <Tabs.Tab value="media">Media</Tabs.Tab>
              </Tabs.List>
              <Box pt={24}>
                <Text c="var(--vfl-gray)" fz={13}>
                  The active tab is marked by a 2px red underline — the same
                  accent used on panel tops, so one visual cue carries "current"
                  everywhere in the admin.
                </Text>
              </Box>
            </Tabs>
          </SimpleGrid>
        </Section>
      </Stack>
    </Box>
  )
}
