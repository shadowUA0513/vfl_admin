import {
  Anchor,
  Badge,
  Button,
  Card,
  Checkbox,
  Divider,
  Input,
  Menu,
  Modal,
  Paper,
  ScrollArea,
  Select,
  Table,
  Tabs,
  Textarea,
  TextInput,
  Title,
  Tooltip,
  createTheme,
  type CSSVariablesResolver,
  type MantineColorsTuple,
} from '@mantine/core'
import classes from './components.module.css'

/* Mantine's `dark` tuple drives every surface it renders, so it is replaced
   wholesale with the VFL surfaces rather than tinted. Order is lightest to
   darkest — Mantine reads 7 for the body and 6 for component backgrounds,
   which lands on --vfl-bg and --vfl-card respectively. */
const dark: MantineColorsTuple = [
  '#ffffff',
  '#e8e8e8',
  '#a5a5a5',
  '#777777',
  '#4a4446',
  '#161012',
  '#0d090a',
  '#050505',
  '#030303',
  '#000000',
]

/* Shade 6 is red-primary, shade 5 is red-bright. Filled controls sit on 6 and
   brighten to 5 on hover, which inverts Mantine's default darken-on-hover. */
const vflRed: MantineColorsTuple = [
  '#ffe9ea',
  '#ffd1d2',
  '#fca0a2',
  '#f96b6f',
  '#f63f44',
  '#f0171d',
  '#cb0106',
  '#a50105',
  '#7d0104',
  '#520002',
]

/* Both schemes point Mantine's own variables at the VFL tokens, which are
   themselves redefined per scheme in app/styles/tokens.css. That keeps one
   source of truth: change a token, both Mantine and the hand-written CSS
   follow. */
const MANTINE_VARS = {
  '--mantine-color-body': 'var(--vfl-bg)',
  '--mantine-color-text': 'var(--vfl-white-soft)',
  '--mantine-color-dimmed': 'var(--vfl-gray-muted)',
  '--mantine-color-default': 'var(--vfl-card)',
  '--mantine-color-default-border': 'var(--vfl-border)',
  '--mantine-color-default-color': 'var(--vfl-white-soft)',
  '--mantine-color-placeholder': 'var(--vfl-gray-muted)',
  '--mantine-color-anchor': 'var(--vfl-red-bright)',
  '--mantine-color-error': 'var(--vfl-red-bright)',
}

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {
    ...MANTINE_VARS,
    '--mantine-color-default-hover': 'var(--vfl-bg-soft)',
  },
  dark: {
    ...MANTINE_VARS,
    '--mantine-color-default-hover': '#161012',
  },
})

export const theme = createTheme({
  colors: { dark, vflRed },
  primaryColor: 'vflRed',
  /* Same shade in both schemes — the admin is dark-only, but pinning it keeps
     a stray light render from silently shifting the brand red. */
  primaryShade: { light: 6, dark: 6 },
  autoContrast: false,

  defaultRadius: 0,
  radius: { xs: '0px', sm: '0px', md: '0px', lg: '0px', xl: '2px' },

  /* Shadows are off by mandate. Depth comes from borders and the red accent
     line instead, so every level resolves to none. */
  shadows: { xs: 'none', sm: 'none', md: 'none', lg: 'none', xl: 'none' },

  fontFamily: 'var(--vfl-font-body)',
  fontFamilyMonospace: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSmoothing: true,
  focusRing: 'auto',

  headings: {
    fontFamily: 'var(--vfl-font-display)',
    /* Bebas Neue ships a single weight; asking for 700 triggers synthetic
       bold, which smears the condensed letterforms. */
    fontWeight: '400',
    textWrap: 'balance',
    sizes: {
      /* Admin scale. The 155px landing hero has no place on a data screen —
         h1 is a page title, not a hero. Tight leading is kept throughout. */
      h1: { fontSize: 'clamp(38px, 3.4vw, 52px)', lineHeight: '0.86' },
      h2: { fontSize: 'clamp(30px, 2.6vw, 40px)', lineHeight: '0.88' },
      h3: { fontSize: '28px', lineHeight: '0.92' },
      h4: { fontSize: '22px', lineHeight: '1' },
      h5: { fontSize: '18px', lineHeight: '1.1' },
      h6: { fontSize: '16px', lineHeight: '1.15' },
    },
  },

  other: {
    ease: 'cubic-bezier(.16,1,.3,1)',
    clipPrimary: 'polygon(8px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)',
  },

  components: {
    Title: Title.extend({
      classNames: { root: classes.title },
    }),

    Button: Button.extend({
      defaultProps: { radius: 0 },
      classNames: { root: classes.button, label: classes.buttonLabel },
    }),

    Paper: Paper.extend({
      defaultProps: { radius: 0, withBorder: true, bg: 'var(--vfl-card)' },
      classNames: { root: classes.paper },
    }),

    Card: Card.extend({
      defaultProps: { radius: 0, withBorder: true, padding: 'var(--vfl-pad-panel)' },
      classNames: { root: classes.card },
    }),

    Badge: Badge.extend({
      defaultProps: { radius: 0 },
      classNames: { root: classes.badge, label: classes.badgeLabel },
    }),

    Divider: Divider.extend({
      defaultProps: { color: 'var(--vfl-border)' },
    }),

    Input: Input.extend({
      defaultProps: { radius: 0 },
      classNames: { input: classes.input },
    }),

    TextInput: TextInput.extend({
      classNames: { label: classes.inputLabel },
    }),

    Textarea: Textarea.extend({
      classNames: { label: classes.inputLabel },
    }),

    Select: Select.extend({
      defaultProps: { radius: 0, checkIconPosition: 'right' },
      classNames: { label: classes.inputLabel, dropdown: classes.dropdown },
    }),

    Checkbox: Checkbox.extend({
      defaultProps: { radius: 0 },
    }),

    Table: Table.extend({
      defaultProps: { horizontalSpacing: 18, verticalSpacing: 14 },
      classNames: { table: classes.table, th: classes.th, td: classes.td },
    }),

    Tabs: Tabs.extend({
      classNames: { tab: classes.tab, list: classes.tabList },
    }),

    Modal: Modal.extend({
      defaultProps: { radius: 0, centered: true, overlayProps: { backgroundOpacity: 0.82, blur: 0 } },
      classNames: { content: classes.modalContent, header: classes.modalHeader, title: classes.modalTitle },
    }),

    Menu: Menu.extend({
      defaultProps: { radius: 0, shadow: 'none' },
      classNames: { dropdown: classes.dropdown, item: classes.menuItem },
    }),

    Tooltip: Tooltip.extend({
      defaultProps: { radius: 0, color: 'var(--vfl-red)' },
      classNames: { tooltip: classes.tooltip },
    }),

    Anchor: Anchor.extend({
      classNames: { root: classes.anchor },
    }),

    ScrollArea: ScrollArea.extend({
      defaultProps: { scrollbarSize: 8 },
    }),
  },
})
