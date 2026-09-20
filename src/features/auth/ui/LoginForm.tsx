import { Alert, Box, Button, PasswordInput, Stack, Text, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { apiErrorMessage } from '@/shared/api'
import { USING_MOCK_API } from '@/shared/config/env'
import { MOCK_HINTS } from '@/entities/session'
import type { Credentials } from '@/entities/session'
import { useLogin } from '../model/useLogin'
import classes from './LoginForm.module.css'

/**
 * The credentials form on its own. The login page owns the surrounding
 * layout, so this stays reusable if sign-in ever moves into a modal.
 */
export function LoginForm() {
  const mutation = useLogin()

  const form = useForm<Credentials>({
    initialValues: { email: '', password: '' },
    validate: {
      /* Mock mode only asks for something in the box — the point is to get
         to the dashboard and build screens, not to rehearse validation.
         The real email rule comes back the moment VITE_API_URL is set. */
      email: (value) => {
        if (!value.trim()) return 'Enter your email'
        if (USING_MOCK_API) return null
        return /^\S+@\S+\.\S+$/.test(value.trim()) ? null : 'Enter a valid email address'
      },
      password: (value) => (value.length > 0 ? null : 'Enter your password'),
    },
  })

  return (
    <>
      <form onSubmit={form.onSubmit((values) => mutation.mutate(values))} noValidate>
        <Stack gap={22}>
          {mutation.isError && (
            <Alert variant="outline" color="vflRed" radius={0} classNames={{ root: classes.alert }}>
              {apiErrorMessage(mutation.error, 'Unable to sign in.')}
            </Alert>
          )}

          <TextInput
            label="Email"
            placeholder="you@vfl.com"
            type="email"
            autoComplete="username"
            autoFocus
            {...form.getInputProps('email')}
          />

          <PasswordInput
            label="Password"
            placeholder="••••••••"
            autoComplete="current-password"
            {...form.getInputProps('password')}
          />

          <Button type="submit" size="lg" fullWidth loading={mutation.isPending} mt={6}>
            Enter Admin
          </Button>
        </Stack>
      </form>

      {USING_MOCK_API && (
        <Box className={classes.mockNote}>
          <Text className="vfl-label" mb={10}>
            Mock mode — no API configured
          </Text>
          <Text fz={12} c="var(--vfl-gray-muted)" mb={12}>
            Any email and password signs you in as superadmin. These addresses
            resolve to their own role instead:
          </Text>
          <Stack gap={4}>
            {MOCK_HINTS.slice(1).map((hint) => (
              <Text key={hint.email} fz={12} c="var(--vfl-gray-muted)" ff="monospace">
                {hint.email} · {hint.role}
              </Text>
            ))}
          </Stack>
        </Box>
      )}
    </>
  )
}
