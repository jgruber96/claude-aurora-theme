import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { ACCENTS, colorArgs, isAccent, type Accent } from './palette.ts'

// The .aurora-wash: three soft glows (top-left, top-right, bottom) over --bg,
// plus the 2px glow line along the top edge. Breathes very slowly.
function scene(accent: Accent): string {
  const [g1, g2, g3] = ACCENTS[accent].glow
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
<style>
.bg { fill: #232233; }
.w { opacity: 0.2; }
.edge { opacity: 0.9; }
.a { animation: drift 28s ease-in-out infinite alternate; }
.b { animation: drift 34s ease-in-out infinite alternate-reverse; }
.c { animation: drift 40s ease-in-out infinite alternate; }
@keyframes drift { from { transform: translate(0px, 0px); } to { transform: translate(40px, 24px); } }
@media (prefers-color-scheme: light) {
  .bg { fill: #f1eefb; }
  .w { opacity: 0.13; }
  .edge { opacity: 0.7; }
}
</style>
<defs>
<radialGradient id="r1"><stop offset="0" stop-color="${g1}"/><stop offset="0.7" stop-color="${g1}" stop-opacity="0"/></radialGradient>
<radialGradient id="r2"><stop offset="0" stop-color="${g2}"/><stop offset="0.7" stop-color="${g2}" stop-opacity="0"/></radialGradient>
<radialGradient id="r3"><stop offset="0" stop-color="${g3}"/><stop offset="0.7" stop-color="${g3}" stop-opacity="0"/></radialGradient>
<linearGradient id="line" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${g1}"/><stop offset="0.55" stop-color="${g2}"/><stop offset="1" stop-color="${g3}"/></linearGradient>
</defs>
<rect class="bg" x="0" y="0" width="1600" height="1000"/>
<g class="w">
<ellipse class="a" cx="0" cy="0" rx="960" ry="500" fill="url(#r1)"/>
<ellipse class="b" cx="1600" cy="0" rx="880" ry="500" fill="url(#r3)"/>
<ellipse class="c" cx="800" cy="1100" rx="960" ry="550" fill="url(#r2)"/>
</g>
<rect class="edge" x="0" y="0" width="1600" height="2" fill="url(#line)"/>
</svg>`
}

const NAMES = Object.keys(ACCENTS) as Accent[]

async function applyLook($: EngineInterface, accent: Accent) {
  const { theme, problems } = makeColors(colorArgs(accent))
  const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))
  if (unpainted !== undefined) {
    $.ui.toast(unpainted)
  }
  const LOOK: ThemeSetArgs = { colors: theme, backdrop: { scene: `aurora-${accent}` } }
  const set = await $.theme.set(LOOK)
  if (!set.isDrawn) {
    $.ui.status(set.reason)
  }
}

export const register: Register = (on, options) => {
  // The accent picked with /aurora wins; else the userConfig default.
  const fallback: Accent = isAccent(options.accent) ? options.accent : 'aurora'
  let accent: Accent = fallback
  let SCENE = scene(accent)

  function choose(next: Accent): Accent {
    accent = next
    SCENE = scene(next)
    return next
  }

  on('session.start', async ($, e, next) => {
    const saved = await $.store.get('accent')
    await applyLook($, choose(isAccent(saved) ? saved : fallback))
    await $.command.register({
      name: 'aurora',
      description: 'Switch the Aurora theme accent',
      argumentHint: NAMES.join(' | '),
    })
    return next(e)
  })

  on('command.run', { command: 'aurora' }, async ($, e) => {
    const want = e.args.trim().toLowerCase()
    if (want === '') {
      return { text: `Aurora accent: ${accent}. Pick one with /aurora ${NAMES.join(' | ')}` }
    }
    if (!isAccent(want)) {
      return { text: `Unknown accent "${want}". Choose one of: ${NAMES.join(', ')}.` }
    }
    await $.store.set('accent', want)
    await applyLook($, choose(want))
    return { text: `Aurora accent set to ${want}.` }
  })

  on('ui.render', { component: 'Backdrop' }, ($, e, next) => {
    if (e.surface !== 'desktop' && e.surface !== 'mobile') {
      return next(e)
    }
    const { Svg } = $.ui.resolve(e)
    return <Svg source={SCENE} alt="Soft aurora glow in the corners" />
  })
}
