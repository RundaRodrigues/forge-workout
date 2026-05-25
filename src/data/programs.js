export const PROGRAMS = {
  'lv-ppl': {
    id: 'lv-ppl',
    name: 'Low Volume PPL',
    description: 'Push / Pull / Pernas — 3× por semana. Volume mínimo para máximo ganho.',
    frequency: 3,
    days: [
      {
        id: 'push',
        name: 'Push',
        subtitle: 'Peito · Ombro · Tríceps',
        category: 'push',
        exercises: [
          { exerciseId: 'bench-press',   sets: 3, repRange: [4, 6]  },
          { exerciseId: 'overhead-press',sets: 3, repRange: [5, 8]  },
          { exerciseId: 'incline-press', sets: 2, repRange: [6, 10] },
          { exerciseId: 'lateral-raise', sets: 3, repRange: [12, 20]},
          { exerciseId: 'dumbbell-fly',  sets: 3, repRange: [10, 15]},
        ],
      },
      {
        id: 'pull',
        name: 'Pull',
        subtitle: 'Costas · Bíceps · Ombro Post.',
        category: 'pull',
        exercises: [
          { exerciseId: 'pullup',       sets: 3, repRange: [4, 8]  },
          { exerciseId: 'barbell-row',   sets: 3, repRange: [5, 8]  },
          { exerciseId: 'lat-pulldown', sets: 3, repRange: [8, 12] },
          { exerciseId: 'face-pull',    sets: 3, repRange: [15, 20]},
          { exerciseId: 'bicep-curl',   sets: 3, repRange: [10, 15]},
        ],
      },
      {
        id: 'legs',
        name: 'Legs',
        subtitle: 'Quadríceps · Glúteos · Isquio',
        category: 'legs',
        exercises: [
          { exerciseId: 'squat',              sets: 3, repRange: [4, 6]  },
          { exerciseId: 'romanian-deadlift',  sets: 3, repRange: [6, 10] },
          { exerciseId: 'leg-curl',           sets: 3, repRange: [10, 15]},
          { exerciseId: 'leg-press',          sets: 3, repRange: [8, 12] },
          { exerciseId: 'calf-raise',         sets: 4, repRange: [15, 25]},
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

  // Simple rule: workout on Mon/Wed/Fri (indices 1,3,5)
  const dow = new Date().getDay() // 0=Sun,1=Mon...
  const workoutDays = [1, 3, 5]
  const isWorkoutDay = workoutDays.includes(dow)

  if (!isWorkoutDay) return null
  return getNextProgramDay(programId, history)
}
