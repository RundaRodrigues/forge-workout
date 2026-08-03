import { EXERCISES } from './exercises.js'

const DEFAULT_BODY_WEIGHT_KG = 75

const CATEGORY_MET = {
  push: 5.4,
  pull: 5.6,
  legs: 6.3,
}

export function getWorkoutStats(workout) {
  const completedSets = workout.exercises.reduce((acc, exercise) =>
    acc + exercise.sets.filter(set => set.completed).length, 0)

  const volume = workout.exercises.reduce((acc, exercise) =>
    acc + exercise.sets
      .filter(set => set.completed)
      .reduce((sum, set) => sum + (set.weight * set.reps), 0), 0)

  const durationMs = (workout.endTime ?? Date.now()) - workout.startTime
  const durationMin = Math.max(0, durationMs / 60000)

  return { completedSets, volume, durationMin }
}

export function calcWorkoutCalories(workout) {
  const { completedSets, volume, durationMin } = getWorkoutStats(workout)
  if (durationMin <= 0 && completedSets === 0) return 0

  const met = CATEGORY_MET[workout.category] ?? 5.5
  const timeCalories = (met * 3.5 * DEFAULT_BODY_WEIGHT_KG / 200) * durationMin
  const workCalories = (completedSets * 2.2) + Math.min(70, volume / 1000 * 4)

  return Math.max(0, Math.round(timeCalories + workCalories))
}

export function calcPlannedWorkoutCalories(day) {
  if (!day) return 0

  const plannedSets = day.exercises.reduce((acc, exercise) => acc + exercise.sets, 0)
  const restMinutes = day.exercises.reduce((acc, exercise) => {
    const ex = EXERCISES[exercise.exerciseId]
    return acc + ((ex?.rest.recommended ?? 90) / 60) * Math.max(0, exercise.sets - 1)
  }, 0)
  const effortMinutes = plannedSets * 1.2
  const transitionMinutes = day.exercises.length * 1.5
  const estimatedDuration = effortMinutes + restMinutes + transitionMinutes
  const met = CATEGORY_MET[day.category] ?? 5.5

  return Math.round((met * 3.5 * DEFAULT_BODY_WEIGHT_KG / 200) * estimatedDuration + plannedSets * 2)
}

export function formatCalories(calories) {
  return `${Math.max(0, Math.round(calories))} kcal`
}
