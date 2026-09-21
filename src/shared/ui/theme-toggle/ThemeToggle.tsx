import { ActionIcon, useComputedColorScheme, useMantineColorScheme } from '@mantine/core'
import { IconMoon, IconSun } from '@tabler/icons-react'
import { useEffect } from 'react'
import classes from './ThemeToggle.module.css'

/**
 * Light/dark toggle. Deliberately the one control in the admin with no red
 * in it — it switches the whole surface, so it stays neutral chrome rather
 * than competing with the accents it is about to repaint.
 */
export function ThemeToggle() {
  const { setColorScheme } = useMantineColorScheme()

  /* `colorScheme` can be 'auto'; `useComputedColorScheme` resolves that to
     the scheme actually rendering, which is what the icon has to reflect.
     `getInitialValueInEffect` defers the read until after mount so it agrees
     with the pre-paint script in index.html. */
  const computed = useComputedColorScheme('dark', { getInitialValueInEffect: true })
  const isDark = computed === 'dark'

  /* Keeps the mobile browser chrome in step with the page. The inline script
     in index.html sets this on load; this covers later changes. */
  useEffect(() => {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', isDark ? '#050505' : '#ffffff')
  }, [isDark])

  return (
    <ActionIcon
      variant="default"
      size={38}
      className={classes.toggle}
      onClick={() => setColorScheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Shows the scheme you get by clicking, not the one you are in. */}
      {isDark ? <IconSun size={18} stroke={1.8} /> : <IconMoon size={18} stroke={1.8} />}
    </ActionIcon>
  )
}
