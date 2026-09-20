import { Box, Text } from '@mantine/core'
import classes from './SessionSplash.module.css'

/**
 * Shown while a stored token is being validated. Deliberately plain — it is
 * on screen for a few hundred milliseconds and a spinner on a black field
 * reads as a broken page.
 */
export function SessionSplash() {
  return (
    <Box className={classes.root}>
      <Text className={`vfl-wordmark ${classes.mark}`}>VFL</Text>
      <Box className={classes.track}>
        <Box className={classes.bar} />
      </Box>
      <Text className="vfl-label" mt={20}>
        Verifying session
      </Text>
    </Box>
  )
}
