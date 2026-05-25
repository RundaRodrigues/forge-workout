export const EXERCISES = {
  /* ── PUSH ────────────────────────────────────────────── */
  'bench-press': {
    id: 'bench-press',
    name: 'Supino Reto',
    nameEn: 'Bench Press',
    category: 'push',
    type: 'compound',
    muscles: ['Peitoral', 'Tríceps', 'Deltóide'],
    defaultSets: 3,
    repRange: [4, 6],
    rest: { recommended: 180, min: 120, max: 300 },
    cues: ['Retrai as escápulas', 'Pés firmes no chão', 'Cotovelos a 45° do tronco'],
    emoji: '🏋️',
  },
  'overhead-press': {
    id: 'overhead-press',
    name: 'Desenvolvimento',
    nameEn: 'Overhead Press',
    category: 'push',
    type: 'compound',
    muscles: ['Deltóide', 'Tríceps', 'Trapézio'],
    defaultSets: 3,
    repRange: [5, 8],
    rest: { recommended: 180, min: 120, max: 300 },
    cues: ['Core contraído', 'Pressiona direto para cima', 'Glúteos ativados'],
    emoji: '⬆️',
  },
  'incline-press': {
    id: 'incline-press',
    name: 'Supino Inclinado',
    nameEn: 'Incline Press',
    category: 'push',
    type: 'compound',
    muscles: ['Peitoral Superior', 'Deltóide', 'Tríceps'],
    defaultSets: 2,
    repRange: [6, 10],
    rest: { recommended: 150, min: 90, max: 240 },
    cues: ['Banco a 30–45°', 'Escápulas retraídas', 'Movimento controlado'],
    emoji: '↗️',
  },
  'lateral-raise': {
    id: 'lateral-raise',
    name: 'Elevação Lateral',
    nameEn: 'Lateral Raise',
    category: 'push',
    type: 'isolation',
    muscles: ['Deltóide Lateral'],
    defaultSets: 3,
    repRange: [12, 20],
    rest: { recommended: 90, min: 60, max: 120 },
    cues: ['Leve inclinação para frente', 'Cotovelos levemente dobrados', 'Controla a descida'],
    emoji: '✈️',
  },

  'machine-fly': {
    id: 'machine-fly',
    name: 'Fly Máquina',
    nameEn: 'Machine Fly / Pec Deck',
    category: 'push',
    type: 'isolation',
    muscles: ['Peitoral', 'Deltóide Anterior'],
    defaultSets: 3,
    repRange: [12, 15],
    rest: { recommended: 90, min: 60, max: 120 },
    cues: ['Tensão constante no cabo', 'Contrai o peitoral no centro', 'Controla a abertura 3s'],
    emoji: '🦅',
  },

  /* ── PULL ────────────────────────────────────────────── */
  'pullup': {
    id: 'pullup',
    name: 'Barra Fixa',
    nameEn: 'Weighted Pull-up',
    category: 'pull',
    type: 'compound',
    muscles: ['Latíssimo', 'Bíceps', 'Rombóide'],
    defaultSets: 3,
    repRange: [4, 8],
    rest: { recommended: 180, min: 120, max: 300 },
    cues: ['Deprime as escápulas antes de puxar', 'Cotovelos para baixo', 'Peito até a barra'],
    emoji: '⬆️',
  },
  'barbell-row': {
    id: 'barbell-row',
    name: 'Remada Curvada',
    nameEn: 'Barbell Row',
    category: 'pull',
    type: 'compound',
    muscles: ['Latíssimo', 'Rombóide', 'Bíceps'],
    defaultSets: 3,
    repRange: [5, 8],
    rest: { recommended: 180, min: 120, max: 300 },
    cues: ['Tronco a 45°', 'Puxa até o umbigo', 'Contrai o dorsal no topo'],
    emoji: '🔄',
  },
  'face-pull': {
    id: 'face-pull',
    name: 'Face Pull',
    nameEn: 'Face Pull',
    category: 'pull',
    type: 'isolation',
    muscles: ['Deltóide Posterior', 'Manguito Rotador'],
    defaultSets: 3,
    repRange: [15, 20],
    rest: { recommended: 90, min: 60, max: 120 },
    cues: ['Polia na altura dos olhos', 'Puxa para o rosto', 'Rotação externa no final'],
    emoji: '🎯',
  },
  'bicep-curl': {
    id: 'bicep-curl',
    name: 'Rosca Direta',
    nameEn: 'Bicep Curl',
    category: 'pull',
    type: 'isolation',
    muscles: ['Bíceps', 'Braquial'],
    defaultSets: 3,
    repRange: [10, 15],
    rest: { recommended: 90, min: 60, max: 120 },
    cues: ['Cotovelos fixos', 'Supinação no topo', 'Descida controlada 3s'],
    emoji: '💪',
  },

  'lat-pulldown': {
    id: 'lat-pulldown',
    name: 'Puxada Frontal',
    nameEn: 'Lat Pulldown',
    category: 'pull',
    type: 'compound',
    muscles: ['Latíssimo', 'Bíceps', 'Rombóide'],
    defaultSets: 3,
    repRange: [8, 12],
    rest: { recommended: 150, min: 90, max: 210 },
    cues: ['Deprime as escápulas', 'Puxa até o queixo', 'Cotovelos apontam para o chão'],
    emoji: '🔽',
  },

  /* ── LEGS ────────────────────────────────────────────── */
  'squat': {
    id: 'squat',
    name: 'Agachamento',
    nameEn: 'Back Squat',
    category: 'legs',
    type: 'compound',
    muscles: ['Quadríceps', 'Glúteos', 'Isquiotibiais'],
    defaultSets: 3,
    repRange: [4, 6],
    rest: { recommended: 240, min: 180, max: 360 },
    cues: ['Joelhos sobre os pés', 'Descida abaixo do paralelo', 'Empurra o chão'],
    emoji: '🦵',
  },
  'romanian-deadlift': {
    id: 'romanian-deadlift',
    name: 'Levantamento Terra Romeno',
    nameEn: 'Romanian Deadlift',
    category: 'legs',
    type: 'compound',
    muscles: ['Isquiotibiais', 'Glúteos', 'Lombar'],
    defaultSets: 3,
    repRange: [6, 10],
    rest: { recommended: 180, min: 120, max: 240 },
    cues: ['Quadril para trás', 'Barra próxima ao corpo', 'Sente o alongamento'],
    emoji: '📐',
  },
  'leg-curl': {
    id: 'leg-curl',
    name: 'Mesa Flexora',
    nameEn: 'Leg Curl',
    category: 'legs',
    type: 'isolation',
    muscles: ['Isquiotibiais', 'Gastrocnêmio'],
    defaultSets: 3,
    repRange: [10, 15],
    rest: { recommended: 90, min: 60, max: 120 },
    cues: ['Quadril fixo no banco', 'Contrai no final do movimento', 'Descida controlada 3s'],
    emoji: '🦵',
  },
  'leg-press': {
    id: 'leg-press',
    name: 'Leg Press',
    nameEn: 'Leg Press',
    category: 'legs',
    type: 'compound',
    muscles: ['Quadríceps', 'Glúteos'],
    defaultSets: 3,
    repRange: [8, 12],
    rest: { recommended: 150, min: 90, max: 210 },
    cues: ['Pés na largura dos ombros', 'Não trava os joelhos', 'Amplitude completa'],
    emoji: '🔩',
  },
  'hip-thrust': {
    id: 'hip-thrust',
    name: 'Hip Thrust',
    nameEn: 'Hip Thrust',
    category: 'legs',
    type: 'compound',
    muscles: ['Glúteos', 'Isquiotibiais', 'Core'],
    defaultSets: 3,
    repRange: [10, 15],
    rest: { recommended: 150, min: 90, max: 210 },
    cues: ['Costas no banco', 'Empurra o chão com os pés', 'Contrai o glúteo no topo 1s'],
    emoji: '🍑',
  },
  'calf-raise': {
    id: 'calf-raise',
    name: 'Panturrilha',
    nameEn: 'Calf Raise',
    category: 'legs',
    type: 'isolation',
    muscles: ['Gastrocnêmio', 'Sóleo'],
    defaultSets: 4,
    repRange: [15, 25],
    rest: { recommended: 60, min: 45, max: 90 },
    cues: ['Amplitude completa', 'Pausa no topo 1s', 'Descida lenta'],
    emoji: '⬆️',
  },
}

export function getExercise(id) {
  return EXERCISES[id] ?? null
}

export function getExercisesByCategory(cat) {
  return Object.values(EXERCISES).filter(e => e.category === cat)
}

/** Epley formula: estimated 1-rep max */
export function calcE1RM(weight, reps) {
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30))
}

/** Smart rest recommendation in seconds */
export function calcRecommendedRest(exercise, weight, reps, historyForExercise = []) {
  // base rest
  let base = exercise.type === 'compound' ? exercise.rest.recommended : exercise.rest.recommended

  // find best e1RM from history
  const bestE1RM = historyForExercise.reduce((best, entry) => {
    const maxE = Math.max(...(entry.sets ?? []).map(s => calcE1RM(s.weight ?? 0, s.reps ?? 1)))
    return Math.max(best, maxE)
  }, 0)

  if (bestE1RM > 0) {
    const currentE1RM = calcE1RM(weight, reps)
    const intensity = currentE1RM / bestE1RM
    if (intensity >= 0.92) base = Math.round(base * 1.5)      // near max → much more rest
    else if (intensity >= 0.82) base = Math.round(base * 1.25) // heavy → more rest
    else if (intensity < 0.65) base = Math.round(base * 0.75)  // light → less rest
  }

  return Math.min(Math.max(base, exercise.rest.min), exercise.rest.max)
}
