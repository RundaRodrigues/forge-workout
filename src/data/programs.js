export const PROGRAMS = {
  'lv-ppl': {
    id: 'lv-ppl',
    name: 'PPL Hipertrofia & Queima',
    description: 'Push / Pull / Pernas — 5× por semana. Foco em massa muscular, densidade e gasto calórico.',
    frequency: 5,
    days: [
      {
        id: 'push',
        name: 'Push',
        subtitle: 'Peito · Ombro · Tríceps',
        category: 'push',
        exercises: [
          { exerciseId: 'bench-press',   sets: 3, repRange: [8, 10] },
          { exerciseId: 'overhead-press',sets: 3, repRange: [8, 10] },
          { exerciseId: 'incline-press', sets: 3, repRange: [10, 12] },
          { exerciseId: 'dumbbell-press', sets: 3, repRange: [8, 12] },
          { exerciseId: 'lateral-raise', sets: 3, repRange: [12, 20]},
          { exerciseId: 'machine-fly',   sets: 3, repRange: [12, 15]},
          { exerciseId: 'triceps-pushdown', sets: 3, repRange: [12, 15]},
        ],
      },
      {
        id: 'pull',
        name: 'Pull',
        subtitle: 'Costas · Bíceps · Ombro Post.',
        category: 'pull',
        exercises: [
          { exerciseId: 'pullup',       sets: 3, repRange: [6, 10] },
          { exerciseId: 'barbell-row',   sets: 3, repRange: [8, 12] },
          { exerciseId: 'lat-pulldown', sets: 3, repRange: [10, 12] },
          { exerciseId: 'seated-cable-row', sets: 3, repRange: [10, 12] },
          { exerciseId: 'face-pull',    sets: 3, repRange: [15, 20]},
          { exerciseId: 'rear-delt-fly', sets: 3, repRange: [12, 20]},
          { exerciseId: 'bicep-curl',   sets: 3, repRange: [10, 15]},
        ],
      },
      {
        id: 'legs',
        name: 'Legs',
        subtitle: 'Quadríceps · Glúteos · Isquio',
        category: 'legs',
        exercises: [
          { exerciseId: 'squat',              sets: 3, repRange: [8, 10] },
          { exerciseId: 'romanian-deadlift',  sets: 3, repRange: [8, 12] },
          { exerciseId: 'leg-curl',           sets: 3, repRange: [12, 15]},
          { exerciseId: 'leg-press',          sets: 3, repRange: [10, 15] },
          { exerciseId: 'leg-extension',      sets: 3, repRange: [12, 20] },
          { exerciseId: 'calf-raise',         sets: 4, repRange: [15, 25]},
          { exerciseId: 'lateral-raise',      sets: 3, repRange: [12, 20]},
          { exerciseId: 'wrist-curl',         sets: 3, repRange: [12, 20]},
        ],
      },
    ],
  },

  'lv-ppl-female': {
    id: 'lv-ppl-female',
    name: 'PPL Glúteos & Definição',
    description: 'Push / Pull / Glúteos — 5× por semana. Foco em hipertrofia, densidade e queima de gordura.',
    frequency: 5,
    days: [
      {
        id: 'push',
        name: 'Push',
        subtitle: 'Ombro · Peito · Definição',
        category: 'push',
        exercises: [
          { exerciseId: 'incline-press',  sets: 3, repRange: [10, 12] },
          { exerciseId: 'dumbbell-press',  sets: 3, repRange: [10, 12] },
          { exerciseId: 'overhead-press', sets: 3, repRange: [12, 15] },
          { exerciseId: 'lateral-raise',  sets: 4, repRange: [15, 20] },
          { exerciseId: 'machine-fly',    sets: 3, repRange: [12, 15] },
          { exerciseId: 'triceps-pushdown', sets: 3, repRange: [12, 15] },
        ],
      },
      {
        id: 'pull',
        name: 'Pull',
        subtitle: 'Costas · Bíceps · Postura',
        category: 'pull',
        exercises: [
          { exerciseId: 'lat-pulldown',  sets: 3, repRange: [10, 15] },
          { exerciseId: 'barbell-row',   sets: 3, repRange: [12, 15] },
          { exerciseId: 'seated-cable-row', sets: 3, repRange: [10, 12] },
          { exerciseId: 'face-pull',     sets: 3, repRange: [15, 20] },
          { exerciseId: 'rear-delt-fly',  sets: 3, repRange: [12, 20] },
          { exerciseId: 'bicep-curl',    sets: 3, repRange: [12, 15] },
        ],
      },
      {
        id: 'legs',
        name: 'Glúteos',
        subtitle: 'Glúteos · Isquio · Quadríceps',
        category: 'legs',
        exercises: [
          { exerciseId: 'hip-thrust',         sets: 4, repRange: [10, 15] },
          { exerciseId: 'squat',              sets: 3, repRange: [10, 15] },
          { exerciseId: 'romanian-deadlift',  sets: 3, repRange: [10, 12] },
          { exerciseId: 'leg-curl',           sets: 3, repRange: [12, 20] },
          { exerciseId: 'glute-kickback',      sets: 3, repRange: [12, 20] },
          { exerciseId: 'leg-extension',       sets: 3, repRange: [12, 20] },
          { exerciseId: 'lateral-raise',       sets: 3, repRange: [12, 20] },
          { exerciseId: 'wrist-curl',          sets: 3, repRange: [12, 20] },
        ],
      },
    ],
  },

  'home-calisthenics': {
    id: 'home-calisthenics',
    name: 'Casa Barra & Calistenia',
    description: 'Treino em casa — 5× por semana. Barra fixa para costas e calistenia para o resto do corpo.',
    frequency: 5,
    days: [
      {
        id: 'home-pull',
        name: 'Barra',
        subtitle: 'Costas · Bíceps · Core',
        category: 'pull',
        exercises: [
          { exerciseId: 'pullup',             sets: 4, repRange: [5, 10] },
          { exerciseId: 'chinup',             sets: 4, repRange: [6, 12] },
          { exerciseId: 'hanging-knee-raise', sets: 3, repRange: [8, 15] },
          { exerciseId: 'wrist-curl',         sets: 3, repRange: [12, 20] },
        ],
      },
      {
        id: 'home-legs',
        name: 'Pernas',
        subtitle: 'Quadríceps · Glúteos · Core',
        category: 'legs',
        exercises: [
          { exerciseId: 'bodyweight-squat',        sets: 4, repRange: [15, 25] },
          { exerciseId: 'bulgarian-split-squat',   sets: 3, repRange: [10, 15] },
          { exerciseId: 'reverse-lunge',           sets: 3, repRange: [10, 16] },
          { exerciseId: 'single-leg-glute-bridge', sets: 3, repRange: [12, 20] },
          { exerciseId: 'calf-raise',              sets: 4, repRange: [15, 25] },
        ],
      },
      {
        id: 'home-push',
        name: 'Push',
        subtitle: 'Peito · Ombro · Tríceps',
        category: 'push',
        exercises: [
          { exerciseId: 'push-up',          sets: 4, repRange: [10, 20] },
          { exerciseId: 'pike-push-up',     sets: 3, repRange: [8, 15] },
          { exerciseId: 'diamond-push-up',  sets: 3, repRange: [8, 15] },
          { exerciseId: 'chair-dip',        sets: 3, repRange: [10, 18] },
          { exerciseId: 'lateral-raise',    sets: 3, repRange: [12, 20] },
        ],
      },
      {
        id: 'home-core',
        name: 'Core',
        subtitle: 'Abdômen · Condicionamento',
        category: 'legs',
        exercises: [
          { exerciseId: 'plank',              sets: 3, repRange: [30, 60] },
          { exerciseId: 'mountain-climber',   sets: 3, repRange: [20, 40] },
          { exerciseId: 'hanging-knee-raise', sets: 3, repRange: [8, 15] },
          { exerciseId: 'push-up',            sets: 3, repRange: [10, 18] },
        ],
      },
      {
        id: 'home-full',
        name: 'Full',
        subtitle: 'Corpo todo · Queima',
        category: 'push',
        exercises: [
          { exerciseId: 'pullup',                  sets: 3, repRange: [5, 10] },
          { exerciseId: 'push-up',                 sets: 3, repRange: [10, 20] },
          { exerciseId: 'bodyweight-squat',        sets: 3, repRange: [15, 25] },
          { exerciseId: 'bulgarian-split-squat',   sets: 3, repRange: [10, 15] },
          { exerciseId: 'mountain-climber',        sets: 3, repRange: [20, 40] },
        ],
      },
    ],
  },
}

/** Given a list of workout history entries, figure out what the next day should be */
export function getNextProgramDay(programId, history) {
  const program = PROGRAMS[programId]
  if (!program) return null

  const days = program.days
  if (history.length === 0) return days[0]

  const lastDayId = history[history.length - 1].dayId
  const lastIndex = days.findIndex(d => d.id === lastDayId)
  return days[(lastIndex + 1) % days.length]
}

/** Get today's scheduled day (or null = rest day) based on a simple schedule */
export function getTodaySchedule(programId, history) {
  const program = PROGRAMS[programId]
  if (!program) return null

  // Simple rule: workout from Monday to Friday (indices 1-5)
  const dow = new Date().getDay() // 0=Sun,1=Mon...
  const workoutDays = [1, 2, 3, 4, 5]
  const isWorkoutDay = workoutDays.includes(dow)

  if (!isWorkoutDay) return null
  return getNextProgramDay(programId, history)
}
