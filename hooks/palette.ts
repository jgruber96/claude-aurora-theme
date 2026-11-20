// Aurora design tokens (from aurora-claude-theme.css), mapped onto the app's theme.
export type Accent = 'aurora' | 'purple' | 'green' | 'orange' | 'pink' | 'teal'

export const ACCENTS: Record<Accent, { dark: string; light: string; glow: [string, string, string] }> = {
  aurora: { dark: '#c792ff', light: '#8b3dff', glow: ['#ff5fa2', '#a66bff', '#4cc9f0'] },
  purple: { dark: '#a99bff', light: '#6d4aff', glow: ['#8f84ff', '#a66bff', '#e58bff'] },
  green: { dark: '#4ade80', light: '#12855a', glow: ['#a3e635', '#22c55e', '#22d3ee'] },
  orange: { dark: '#ff9f43', light: '#c2500a', glow: ['#ff5f6d', '#ff9f43', '#ffd166'] },
  pink: { dark: '#ff7ab6', light: '#d6247a', glow: ['#ff4d8d', '#ff7ab6', '#ffa94d'] },
  teal: { dark: '#4cc9f0', light: '#0b7fb0', glow: ['#2dd4bf', '#38bdf8', '#8b7bff'] },
}

export function isAccent(v: unknown): v is Accent {
  return typeof v === 'string' && v in ACCENTS
}

export function colorArgs(accent: Accent) {
  const a = ACCENTS[accent]
  return {
    label: `Aurora (${accent})`,
    dark: {
      roles: { accent: a.dark, danger: '#ff6b8f', success: '#6ee7b7', warning: '#ffb86b', pro: '#5fd4f4' },
      gray: {
        anchors: {
          'surface-0': '#1c1b29', // --panel: sidebar, title bar
          'surface-1': '#232233', // --bg: chat area
          'surface-2': '#262538', // --panel-2: composer, cards, bubbles
          'surface-3': '#2b2941', // --track: menus
          'text-primary': '#ecebf7',
          'text-secondary': '#b4b1cf',
          'text-muted': '#9a97b8',
        },
      },
    },
    light: {
      roles: { accent: a.light, danger: '#d1245a', success: '#12915d', warning: '#c26a00', pro: '#0b84a8' },
      gray: {
        anchors: {
          'surface-0': '#f1eefb', // --bg
          'surface-1': '#fbf9ff', // --panel-2
          'surface-2': '#fdfcff', // --panel
          'surface-3': '#fdfcff',
          'text-primary': '#221f33',
          'text-secondary': '#4f4a68',
          'text-muted': '#6b6685',
        },
      },
    },
  } as const
}
