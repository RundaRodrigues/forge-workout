/* ─────────────────────────────────────────────────────────────
   ExerciseIllustration — SVG line-art illustrations
   ViewBox: 0 0 280 175  (matches 16/10 aspect-ratio wrapper)
───────────────────────────────────────────────────────────── */

// Shared prop objects keep JSX terse
const R  = { fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round' }
const B  = { ...R, stroke: '#ccd0ff', strokeWidth: 5.5 }   // body thick
const Bt = { ...R, stroke: '#ccd0ff', strokeWidth: 3.5 }   // body thin
const E  = { ...R, stroke: '#8899bb', strokeWidth: 4   }   // equipment
const Et = { ...R, stroke: '#8899bb', strokeWidth: 3   }   // equipment thin

const CATS = {
  push: { bg: '#0e0808', acc: '#ff3b3b' },
  pull: { bg: '#07090e', acc: '#4cc9f0' },
  legs: { bg: '#070e0a', acc: '#06d6a0' },
  default: { bg: '#0a0a12', acc: '#ff7a1a' },
}

/* ── small reusable shapes ── */
const Plate = ({ x, y, acc }) => (
  <rect x={x - 4} y={y - 10} width={8} height={20} rx={2}
    fill="none" stroke={acc} strokeWidth={3.5} />
)
const Bar = ({ x1, y1, x2, y2 }) => (
  <line x1={x1} y1={y1} x2={x2} y2={y2} {...E} />
)
const Dumbbell = ({ cx, cy, angle = 0 }) => {
  const r = 18, hr = 6
  const dx = Math.cos(angle) * r, dy = Math.sin(angle) * r
  return (
    <g>
      <line x1={cx - dx} y1={cy - dy} x2={cx + dx} y2={cy + dy} {...Et} />
      <circle cx={cx - dx} cy={cy - dy} r={hr} {...Et} />
      <circle cx={cx + dx} cy={cy + dy} r={hr} {...Et} />
    </g>
  )
}

/* ────────────────────────────────────────────
   FRONT-VIEW STANDING FIGURE
   Standing neutral:
     head  (140,22) r13
     shoulders  (110,54)–(170,54)
     torso  (140,46)–(140,100)
     hips   (124,100)–(156,100)
     L-thigh(124,100)→(119,137)  shin→(116,168)  foot→(102,174)
     R-thigh(156,100)→(161,137)  shin→(164,168)  foot→(178,174)
     L-arm  shoulder(110,54)→elbow(97,82)→hand(93,110)
     R-arm  shoulder(170,54)→elbow(183,82)→hand(187,110)
──────────────────────────────────────────── */

function FrontHead({ x = 140, y = 22 }) {
  return <circle cx={x} cy={y} r={13} {...B} />
}
function FrontBody({ hipY = 100 }) {
  return (
    <>
      <line x1={140} y1={35} x2={140} y2={46} {...Bt} />
      <line x1={110} y1={54} x2={170} y2={54} {...B} />
      <line x1={140} y1={46} x2={140} y2={hipY} {...B} />
      <line x1={124} y1={hipY} x2={156} y2={hipY} {...B} />
    </>
  )
}
function FrontLegs({ hipY = 100, squat = 0 }) {
  // squat=0 standing, squat=1 full squat
  const kY = 137 + squat * 20, fY = 168 - squat * 28
  const kLx = 119 - squat * 12, kRx = 161 + squat * 12
  const fLx = 116 - squat * 18, fRx = 164 + squat * 18
  const hipLx = 124 - squat * 4, hipRx = 156 + squat * 4
  const hY = hipY + squat * 24
  return (
    <>
      <polyline points={`${hipLx},${hY} ${kLx},${kY} ${fLx},${fY}`} {...B} />
      <line x1={fLx} y1={fY} x2={fLx - 13} y2={fY + 6} {...B} />
      <polyline points={`${hipRx},${hY} ${kRx},${kY} ${fRx},${fY}`} {...B} />
      <line x1={fRx} y1={fY} x2={fRx + 13} y2={fY + 6} {...B} />
    </>
  )
}

/* ────────────────────────────────────────────
   SIDE-VIEW STANDING FIGURE  (facing left, seen from right)
   head  (145,22) r13
   torso (145,46)–(145,100)
   front-arm  shoulder(137,56) elbow(126,82) hand(122,110)
   back-arm   shoulder(153,56) elbow(164,82) hand(168,110)
   front-leg  hip(137,100) knee(130,137) ankle(127,168) foot→(112,175)
   back-leg   hip(153,100) knee(159,137) ankle(162,167) foot→(176,174)
──────────────────────────────────────────── */

function SideHead({ x = 145, y = 22 }) {
  return <circle cx={x} cy={y} r={13} {...B} />
}
function SideBody({ tiltX = 0, tiltY = 0, hipY = 100 }) {
  // tiltX/Y offset the shoulder from the hip for forward lean
  return (
    <>
      <line x1={145 + tiltX} y1={35 + tiltY} x2={145 + tiltX} y2={46 + tiltY} {...Bt} />
      <line x1={145 + tiltX} y1={46 + tiltY} x2={145} y2={hipY} {...B} />
    </>
  )
}
function SideLegs({ hipY = 100, kneeAngle = 0 }) {
  const kY = 137 + kneeAngle * 12
  const fY = 168 - kneeAngle * 10
  return (
    <>
      {/* front leg */}
      <polyline points={`137,${hipY} ${130 - kneeAngle * 5},${kY} ${127 - kneeAngle * 6},${fY}`} {...B} />
      <line x1={127 - kneeAngle * 6} y1={fY} x2={112 - kneeAngle * 6} y2={fY + 7} {...B} />
      {/* back leg */}
      <polyline points={`153,${hipY} ${159 + kneeAngle * 4},${kY} ${162 + kneeAngle * 5},${fY}`} {...B} />
      <line x1={162 + kneeAngle * 5} y1={fY} x2={177 + kneeAngle * 5} y2={fY + 7} {...B} />
    </>
  )
}

/* ── Floor / grid helper ── */
function Floor({ y = 175, acc }) {
  return (
    <line x1={10} y1={y} x2={270} y2={y}
      stroke={acc} strokeWidth={1.5} strokeOpacity={0.25} strokeDasharray="6 8" />
  )
}

/* ══════════════════════════════════════════════════════════
   EXERCISE CONFIGS
══════════════════════════════════════════════════════════ */
const ILLUSTRATIONS = {

  /* ── PUSH ─────────────────────────────────────────────── */

  'bench-press': ({ acc }) => (
    <>
      <Floor y={170} acc={acc} />
      {/* bench */}
      <rect x={38} y={112} width={180} height={11} rx={4} {...E} />
      <line x1={52} y1={123} x2={52} y2={148} {...Et} />
      <line x1={202} y1={123} x2={202} y2={148} {...Et} />
      {/* lying body — head at right, feet left */}
      <circle cx={195} cy={100} r={13} {...B} />
      <line x1={183} y1={103} x2={68} y2={103} {...B} />
      {/* legs hanging down */}
      <polyline points="68,103 55,112 48,140 44,168" {...B} />
      <line x1={44} y1={168} x2={35} y2={172} {...B} />
      {/* arms pushing up */}
      <line x1={128} y1={100} x2={122} y2={65} {...B} />
      <line x1={148} y1={100} x2={154} y2={65} {...B} />
      {/* bar */}
      <Bar x1={90} y1={62} x2={186} y2={62} />
      <Plate x={94} y={62} acc={acc} />
      <Plate x={182} y={62} acc={acc} />
    </>
  ),

  'overhead-press': ({ acc }) => (
    <>
      <Floor y={174} acc={acc} />
      <FrontHead />
      <FrontBody />
      <FrontLegs />
      {/* arms fully overhead */}
      <polyline points="110,54 90,34 88,18" {...B} />
      <polyline points="170,54 190,34 192,18" {...B} />
      {/* bar */}
      <Bar x1={65} y1={16} x2={215} y2={16} />
      <Plate x={70} y={16} acc={acc} />
      <Plate x={210} y={16} acc={acc} />
    </>
  ),

  'incline-press': ({ acc }) => (
    <>
      <Floor y={170} acc={acc} />
      {/* inclined bench */}
      <line x1={50} y1={138} x2={195} y2={88} {...E} strokeWidth={10} strokeLinecap="butt" />
      <line x1={50} y1={138} x2={50} y2={162} {...Et} />
      <line x1={130} y1={114} x2={130} y2={155} {...Et} />
      <line x1={195} y1={88} x2={200} y2={110} {...Et} />
      {/* lying body at ~30° — head upper right */}
      <circle cx={188} cy={76} r={13} {...B} />
      <line x1={176} y1={82} x2={78} y2={118} {...B} />
      {/* arms pushing forward-up */}
      <line x1={143} y1={96} x2={134} y2={62} {...B} />
      <line x1={158} y1={91} x2={165} y2={58} {...B} />
      {/* bar */}
      <Bar x1={108} y1={56} x2={190} y2={56} />
      <Plate x={113} y={56} acc={acc} />
      <Plate x={186} y={56} acc={acc} />
    </>
  ),

  'lateral-raise': ({ acc }) => (
    <>
      <Floor y={174} acc={acc} />
      <FrontHead />
      <FrontBody />
      <FrontLegs />
      {/* arms out to sides at shoulder height */}
      <polyline points="110,54 74,54 52,56" {...B} />
      <polyline points="170,54 206,54 228,56" {...B} />
      <Dumbbell cx={47} cy={55} angle={0.15} />
      <Dumbbell cx={233} cy={55} angle={0.15} />
    </>
  ),

  'machine-fly': ({ acc }) => (
    <>
      <Floor y={174} acc={acc} />
      {/* machine frame */}
      <line x1={42} y1={20} x2={42} y2={158} {...Et} />
      <line x1={238} y1={20} x2={238} y2={158} {...Et} />
      <line x1={42} y1={20} x2={80} y2={20} {...Et} />
      <line x1={238} y1={20} x2={200} y2={20} {...Et} />
      {/* seat */}
      <rect x={118} y={118} width={44} height={10} rx={3} {...E} />
      <line x1={140} y1={128} x2={140} y2={158} {...Et} />
      {/* seated figure */}
      <circle cx={140} cy={62} r={13} {...B} />
      <line x1={140} y1={75} x2={140} y2={120} {...B} />
      <line x1={126} y1={120} x2={154} y2={120} {...B} />
      <line x1={126} y1={120} x2={120} y2={158} {...Bt} />
      <line x1={154} y1={120} x2={160} y2={158} {...Bt} />
      {/* arms coming together — closed position */}
      <polyline points="130,80 100,80 82,82" {...B} />
      <polyline points="150,80 180,80 198,82" {...B} />
      {/* handles */}
      <circle cx={82} cy={82} r={5} {...{ ...E, fill: '#8899bb33' }} />
      <circle cx={198} cy={82} r={5} {...{ ...E, fill: '#8899bb33' }} />
      {/* cables */}
      <line x1={42} y1={60} x2={82} y2={82} {...{ ...Et, strokeDasharray: '4 4', strokeOpacity: 0.5 }} />
      <line x1={238} y1={60} x2={198} y2={82} {...{ ...Et, strokeDasharray: '4 4', strokeOpacity: 0.5 }} />
    </>
  ),

  /* ── PULL ─────────────────────────────────────────────── */

  'pullup': ({ acc }) => (
    <>
      <Floor y={174} acc={acc} />
      {/* bar and frame */}
      <Bar x1={72} y1={18} x2={208} y2={18} />
      <line x1={80} y1={18} x2={80} y2={6} {...E} />
      <line x1={200} y1={18} x2={200} y2={6} {...E} />
      {/* hanging figure — pulled up (chin above bar) */}
      <circle cx={140} cy={34} r={13} {...B} />
      <line x1={140} y1={47} x2={140} y2={95} {...B} />
      <line x1={126} y1={95} x2={154} y2={95} {...B} />
      {/* arms gripping bar */}
      <polyline points="110,54 102,34 108,18" {...B} />
      <polyline points="170,54 178,34 172,18" {...B} />
      {/* legs bent */}
      <polyline points="126,95 118,126 122,155" {...B} />
      <polyline points="154,95 162,126 158,155" {...B} />
    </>
  ),

  'barbell-row': ({ acc }) => (
    <>
      <Floor y={174} acc={acc} />
      {/* figure bent over ~50° */}
      <SideHead x={195} y={52} />
      {/* torso angled down-left */}
      <line x1={184} y1={57} x2={116} y2={96} {...B} />
      {/* hips / glutes */}
      <line x1={116} y1={96} x2={110} y2={106} {...B} />
      {/* legs roughly straight, slight bend */}
      <polyline points="110,106 105,140 102,168" {...B} />
      <line x1={102} y1={168} x2={86} y2={175} {...B} />
      <polyline points="122,102 120,138 118,168" {...B} />
      <line x1={118} y1={168} x2={132} y2={175} {...B} />
      {/* arms hanging then pulling — one up position */}
      {/* front arm (pulling up) */}
      <polyline points="170,68 155,88 148,108" {...B} />
      {/* back arm */}
      <polyline points="154,75 150,96 148,116" {...Bt} />
      {/* bar at pulled position */}
      <Bar x1={90} y1={108} x2={175} y2={108} />
      <Plate x={95} y={108} acc={acc} />
      <Plate x={170} y={108} acc={acc} />
    </>
  ),

  'lat-pulldown': ({ acc }) => (
    <>
      <Floor y={174} acc={acc} />
      {/* overhead bar / pulley */}
      <Bar x1={72} y1={14} x2={208} y2={14} />
      <line x1={140} y1={6} x2={140} y2={14} {...Et} />
      {/* seat */}
      <rect x={116} y={118} width={48} height={10} rx={3} {...E} />
      <line x1={140} y1={128} x2={140} y2={158} {...Et} />
      {/* knee pad (thigh hold-down) */}
      <line x1={112} y1={140} x2={168} y2={140} {...{ ...Et, strokeWidth: 5, stroke: '#556677' }} />
      {/* seated figure */}
      <circle cx={140} cy={58} r={13} {...B} />
      <line x1={140} y1={71} x2={140} y2={120} {...B} />
      <line x1={126} y1={120} x2={154} y2={120} {...B} />
      <line x1={126} y1={120} x2={118} y2={158} {...Bt} />
      <line x1={154} y1={120} x2={162} y2={158} {...Bt} />
      {/* arms pulling bar down — angled */}
      <polyline points="110,68 88,46 82,14" {...B} />
      <polyline points="170,68 192,46 198,14" {...B} />
    </>
  ),

  'face-pull': ({ acc }) => (
    <>
      <Floor y={174} acc={acc} />
      <FrontHead />
      <FrontBody />
      <FrontLegs />
      {/* arms pulling toward face — elbows high and wide */}
      <polyline points="110,54 80,48 62,52" {...B} />
      <polyline points="170,54 200,48 218,52" {...B} />
      {/* rope handles near face */}
      <circle cx={62} cy={52} r={5} {...{ ...E, fill: '#8899bb33' }} />
      <circle cx={218} cy={52} r={5} {...{ ...E, fill: '#8899bb33' }} />
      {/* rope lines to pulley at far right */}
      <line x1={62} y1={52} x2={18} y2={52}
        {...{ ...Et, strokeDasharray: '4 5', strokeOpacity: 0.5 }} />
      <line x1={218} y1={52} x2={262} y2={52}
        {...{ ...Et, strokeDasharray: '4 5', strokeOpacity: 0.5 }} />
    </>
  ),

  'bicep-curl': ({ acc }) => (
    <>
      <Floor y={174} acc={acc} />
      <FrontHead />
      <FrontBody />
      <FrontLegs />
      {/* arms — upper arm stays down, forearm curled to ~110° */}
      <line x1={110} y1={54} x2={96} y2={90} {...B} />
      <polyline points="96,90 84,70 76,52" {...B} />
      <line x1={170} y1={54} x2={184} y2={90} {...B} />
      <polyline points="184,90 196,70 204,52" {...B} />
      <Dumbbell cx={73} cy={47} angle={-0.5} />
      <Dumbbell cx={207} cy={47} angle={0.5} />
    </>
  ),

  /* ── LEGS ─────────────────────────────────────────────── */

  'squat': ({ acc }) => (
    <>
      <Floor y={174} acc={acc} />
      {/* side view, deep squat */}
      <SideHead x={150} y={62} />
      {/* torso slight forward lean */}
      <line x1={150} y1={75} x2={138} y2={112} {...B} />
      {/* hips */}
      <line x1={138} y1={112} x2={152} y2={116} {...B} />
      {/* front leg deep squat */}
      <polyline points="138,112 122,128 112,148 108,170" {...B} />
      <line x1={108} y1={170} x2={92} y2={176} {...B} />
      {/* back leg */}
      <polyline points="152,116 166,130 174,150 176,170" {...B} />
      <line x1={176} y1={170} x2={190} y2={176} {...B} />
      {/* front arm reaches forward for balance */}
      <polyline points="144,84 128,90 118,100" {...B} />
      <polyline points="155,82 168,88 172,100" {...Bt} />
      {/* bar on upper back */}
      <Bar x1={96} y1={74} x2={206} y2={74} />
      <Plate x={100} y={74} acc={acc} />
      <Plate x={202} y={74} acc={acc} />
    </>
  ),

  'romanian-deadlift': ({ acc }) => (
    <>
      <Floor y={174} acc={acc} />
      {/* side view, hinge ~65° forward */}
      <SideHead x={200} y={44} />
      {/* torso hinged forward */}
      <line x1={190} y1={52} x2={112} y2={94} {...B} />
      {/* hips */}
      <line x1={112} y1={94} x2={120} y2={104} {...B} />
      {/* legs — mostly straight, slight knee bend */}
      <polyline points="112,94 108,132 106,168" {...B} />
      <line x1={106} y1={168} x2={90} y2={174} {...B} />
      <polyline points="120,104 122,140 122,168" {...B} />
      <line x1={122} y1={168} x2={136} y2={174} {...B} />
      {/* arms hanging straight down holding bar */}
      <polyline points="168,68 155,94 148,122" {...B} />
      <polyline points="180,64 174,90 170,118" {...Bt} />
      {/* bar near shin level */}
      <Bar x1={98} y1={122} x2={196} y2={122} />
      <Plate x={102} y={122} acc={acc} />
      <Plate x={192} y={122} acc={acc} />
    </>
  ),

  'leg-press': ({ acc }) => (
    <>
      <Floor y={174} acc={acc} />
      {/* seat / backrest */}
      <rect x={28} y={90} width={12} height={72} rx={3} {...E} />
      <rect x={28} y={148} width={70} height={12} rx={3} {...E} />
      {/* figure reclined at ~40° */}
      <circle cx={52} cy={74} r={13} {...B} />
      <line x1={52} y1={87} x2={52} y2={142} {...B} />
      <line x1={40} y1={142} x2={64} y2={142} {...B} />
      {/* legs extending forward-up */}
      <polyline points="40,142 62,110 88,82" {...B} />
      <polyline points="64,142 86,112 112,86" {...B} />
      {/* foot plate */}
      <rect x={106} y={70} width={14} height={46} rx={3} {...{ ...E, strokeWidth: 5 }} />
      {/* machine rails */}
      <line x1={106} y1={75} x2={220} y2={32} {...Et} />
      <line x1={106} y1={112} x2={220} y2={68} {...Et} />
      {/* weight stack suggestion */}
      <rect x={222} y={26} width={22} height={50} rx={3} {...Et} />
      <line x1={222} y1={36} x2={244} y2={36} {...{ ...Et, strokeOpacity: 0.5 }} />
      <line x1={222} y1={46} x2={244} y2={46} {...{ ...Et, strokeOpacity: 0.5 }} />
      <line x1={222} y1={56} x2={244} y2={56} {...{ ...Et, strokeOpacity: 0.5 }} />
    </>
  ),

  'leg-curl': ({ acc }) => (
    <>
      <Floor y={174} acc={acc} />
      {/* bench */}
      <rect x={36} y={104} width={188} height={11} rx={4} {...E} />
      <line x1={52} y1={115} x2={52} y2={142} {...Et} />
      <line x1={208} y1={115} x2={208} y2={142} {...Et} />
      {/* ankle pad roller */}
      <circle cx={188} cy={98} r={8} {...{ ...E, fill: '#8899bb22' }} />
      {/* prone figure — head at left */}
      <circle cx={62} cy={94} r={13} {...B} />
      <line x1={75} y1={96} x2={170} y2={96} {...B} />
      {/* hips */}
      <line x1={170} y1={96} x2={178} y2={104} {...B} />
      {/* legs curling up — knees bent, feet toward ceiling */}
      <polyline points="170,96 182,96 196,86 196,60" {...B} />
      <line x1={196} y1={60} x2={202} y2={48} {...B} />
      <polyline points="178,104 190,104 200,96 200,68" {...Bt} />
      {/* upper arms along body */}
      <polyline points="100,94 88,88 80,76" {...B} />
      <polyline points="108,96 96,92 90,82" {...Bt} />
    </>
  ),

  'hip-thrust': ({ acc }) => (
    <>
      <Floor y={174} acc={acc} />
      {/* bench (upper back rests here) */}
      <rect x={32} y={96} width={82} height={14} rx={4} {...E} />
      <line x1={44} y1={110} x2={44} y2={140} {...Et} />
      <line x1={102} y1={110} x2={102} y2={140} {...Et} />
      {/* floor */}
      <line x1={20} y1={168} x2={260} y2={168} {...{ ...Et, strokeOpacity: 0.3 }} />
      {/* figure — upper back on bench, hips thrust up */}
      <circle cx={62} cy={84} r={13} {...B} />
      {/* torso from bench to hips (angled up) */}
      <line x1={72} y1={92} x2={138} y2={130} {...B} />
      {/* hips at top */}
      <line x1={130} y1={126} x2={148} y2={126} {...B} />
      {/* front leg: knee bent ~90°, foot flat */}
      <polyline points="130,126 118,156 110,168" {...B} />
      <line x1={110} y1={168} x2={92} y2={172} {...B} />
      {/* back leg */}
      <polyline points="148,126 162,155 170,168" {...B} />
      <line x1={170} y1={168} x2={188} y2={172} {...B} />
      {/* arms on bench for support */}
      <polyline points="72,96 58,104 50,110" {...B} />
      <polyline points="80,100 70,108 64,114" {...Bt} />
      {/* bar across hips */}
      <Bar x1={88} y1={122} x2={202} y2={122} />
      <Plate x={92} y={122} acc={acc} />
      <Plate x={198} y={122} acc={acc} />
    </>
  ),

  'calf-raise': ({ acc }) => (
    <>
      <Floor y={174} acc={acc} />
      {/* platform */}
      <rect x={94} y={158} width={72} height={14} rx={3} {...E} />
      {/* side-view figure — on tiptoes */}
      <SideHead x={145} y={22} />
      {/* torso upright */}
      <line x1={145} y1={35} x2={145} y2={46} {...Bt} />
      <line x1={145} y1={46} x2={145} y2={100} {...B} />
      {/* arms along sides */}
      <polyline points="137,56 126,82 122,110" {...B} />
      <polyline points="153,56 164,82 168,110" {...Bt} />
      {/* legs — on tiptoe, heel raised */}
      <polyline points="137,100 130,137 126,158" {...B} />
      {/* tiptoe: foot angled, heel up */}
      <polyline points="126,158 112,158 108,168" {...B} />
      <polyline points="153,100 160,137 163,158" {...B} />
      <polyline points="163,158 175,158 178,168" {...B} />
      {/* accent for raised heel (tiptoe indicator) */}
      <line x1={108} y1={168} x2={90} y2={170}
        stroke={acc} strokeWidth={3} strokeLinecap="round" strokeOpacity={0.7} />
      <line x1={178} y1={168} x2={196} y2={170}
        stroke={acc} strokeWidth={3} strokeLinecap="round" strokeOpacity={0.7} />
    </>
  ),

  /* ── default fallback ─────────────────────────────────── */
  'default': ({ acc }) => (
    <>
      <Floor y={174} acc={acc} />
      <FrontHead />
      <FrontBody />
      <FrontLegs />
      {/* arms in relaxed athletic stance */}
      <polyline points="110,54 96,82 93,110" {...B} />
      <polyline points="170,54 184,82 187,110" {...B} />
    </>
  ),
}

/* ── category lookup ── */
const EXERCISE_CATS = {
  'bench-press': 'push', 'overhead-press': 'push', 'incline-press': 'push',
  'lateral-raise': 'push', 'machine-fly': 'push',
  'pullup': 'pull', 'barbell-row': 'pull', 'lat-pulldown': 'pull',
  'face-pull': 'pull', 'bicep-curl': 'pull',
  'squat': 'legs', 'romanian-deadlift': 'legs', 'leg-press': 'legs',
  'leg-curl': 'legs', 'calf-raise': 'legs', 'hip-thrust': 'legs',
}

/* ── component ── */
export default function ExerciseIllustration({ exerciseId }) {
  const cat = EXERCISE_CATS[exerciseId] ?? 'default'
  const { bg, acc } = CATS[cat] ?? CATS.default
  const draw = ILLUSTRATIONS[exerciseId] ?? ILLUSTRATIONS['default']

  return (
    <div className="illustration-canvas" style={{ background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        viewBox="0 0 280 180"
        width="100%"
        height="100%"
        style={{ display: 'block' }}
        aria-label={exerciseId}
      >
        {/* subtle background glow */}
        <circle cx={140} cy={90} r={75}
          fill={acc} fillOpacity={0.04} />
        {draw({ acc })}
      </svg>
    </div>
  )
}
