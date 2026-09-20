import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
/* Layered build: every Mantine rule lands in `@layer mantine`, so the VFL
   overrides in app/styles and the theme's CSS modules take precedence
   without needing raised specificity. */
import '@mantine/core/styles.layer.css'
import '@fontsource/bebas-neue/400.css'
import '@fontsource/oswald/700.css'
import '@fontsource-variable/inter'
import './styles/index.css'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
