import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import { existsSync, readdirSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

/* ------------------------------------------------------------------ */
/* Feature-Sliced Design import rules                                  */
/* ------------------------------------------------------------------ */

/* Layers, top to bottom. A layer may import from layers strictly below it,
   never above and never sideways into a sibling slice. */
const LAYERS = ['app', 'pages', 'widgets', 'features', 'entities', 'shared']

/* Layers built from slices. `shared` is excluded: it has segments (api, lib,
   ui, config), not slices, so `shared/api` reaching `shared/lib` is normal. */
const SLICED_LAYERS = ['pages', 'widgets', 'features', 'entities']

/** The segments a slice is built from. `@x` is deliberately absent. */
const SEGMENTS = ['ui', 'model', 'api', 'lib', 'config']

const srcDir = fileURLToPath(new URL('./src', import.meta.url))

function slicesIn(layer) {
  const dir = `${srcDir}/${layer}`
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
}

/** Patterns banning every layer above `layer`. */
function upwardPatterns(layer) {
  return LAYERS.slice(0, LAYERS.indexOf(layer)).map((forbidden) => ({
    group: [`@/${forbidden}/*`, `@/${forbidden}/*/**`],
    message: `${layer} cannot import from ${forbidden} — FSD layers only depend downward (${LAYERS.join(' > ')}).`,
  }))
}

const CROSS_IMPORT_MESSAGE = (layer) =>
  `Cross-imports between ${layer} slices are not allowed. Use an @x cross-import API, lift the shared part into a lower layer, or compose both slices in a higher one.`

/* One config block per slice, so a slice can be told which of its siblings
   are off limits by exact name. Matching them as a glob does not work: under
   gitignore semantics `@/entities/*` also matches everything beneath it, and
   an excluded parent directory cannot be re-included by a later negation —
   which would take the `@x` folders down with it. */
function rulesForSlice(layer, slice, siblings) {
  return {
    files: [`src/${layer}/${slice}/**/*.{ts,tsx}`],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: siblings.map((sibling) => ({
            name: `@/${layer}/${sibling}`,
            message: CROSS_IMPORT_MESSAGE(layer),
          })),
          patterns: [
            ...upwardPatterns(layer),
            {
              /* Reaching past a slice's index.ts into its internals. Applies
                 to this slice too — use a relative path within your own. */
              group: SEGMENTS.map((segment) => `@/${layer}/*/${segment}`),
              message: `Import a slice through its index.ts, not its internals. (${layer})`,
            },
          ],
        },
      ],
    },
  }
}

const layerRules = [
  /* `shared` is the bottom layer: only the upward bans apply. */
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': ['error', { patterns: upwardPatterns('shared') }] },
  },
  ...SLICED_LAYERS.flatMap((layer) => {
    const slices = slicesIn(layer)
    return slices.map((slice) =>
      rulesForSlice(
        layer,
        slice,
        slices.filter((other) => other !== slice),
      ),
    )
  }),
]

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
  ...layerRules,
])
