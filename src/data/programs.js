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
        ],
      },
    ],
  },
}

/** Given a list of workout history entries, figure out what the next day should be */
export function getNextProgramDay(programId, history) {
  const program = PROGRAMS[programId]
  if (!program) return program.days[0]

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
