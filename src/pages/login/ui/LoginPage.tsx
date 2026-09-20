import { Box, Text } from '@mantine/core'
import { LoginForm } from '@/features/auth'
import classes from './LoginPage.module.css'

/** Composition only: the brand stage plus the auth feature's form. */
export function LoginPage() {
  return (
    <Box className={classes.root}>
      {/* Left: brand panel. The arena photograph is confined to this screen —
          behind working data it fights the content for attention. */}
      <Box className={classes.stage}>
        <Box className={classes.stageInner}>
          <Text className="vfl-label" c="var(--vfl-red-bright)" mb={16}>
            Virtus Fighting League
          </Text>
          <Text className={`vfl-display ${classes.stageTitle}`}>
            Control
            <br />
            The Card
          </Text>
          <Box className="vfl-rule" mt={28} style={{ maxWidth: 88 }} />
          <Text className={classes.stageBody}>
            Event scheduling, fighter records, bout results and broadcast
            assets — the operational side of the promotion.
          </Text>
        </Box>
      </Box>

      {/* Right: the form. */}
      <Box className={classes.formSide}>
        <Box className={`${classes.formInner} vfl-enter`}>
          <Text className="vfl-label" mb={12}>
            Staff Access
          </Text>
          <Text className={`vfl-display ${classes.formTitle}`}>Sign In</Text>
          <Box className="vfl-rule" mt={20} mb={36} style={{ maxWidth: 56 }} />

          <LoginForm />
        </Box>
      </Box>
    </Box>
  )
}
