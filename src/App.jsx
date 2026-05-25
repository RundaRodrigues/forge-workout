import { useState, useEffect } from 'react'
import Navigation from './components/Navigation.jsx'
import HomeScreen from './components/HomeScreen.jsx'
import WorkoutScreen from './components/WorkoutScreen.jsx'
import HistoryScreen from './components/HistoryScreen.jsx'
import ProgramsScreen from './components/ProgramsScreen.jsx'
import DriveSync from './components/DriveSync.jsx'
import { EXERCISES } from './data/exercises.js'

const STORAGE_KEY = 'forge_data_v1'

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { history: [], activeWorkout: null }
    return JSON.parse(raw)
  } catch {
    return { history: [], activeWorkout: null }
  }
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch { /* storage full – silently ignore */ }
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const [history, setHistory] = useState([])
  const [activeWorkout, setActiveWorkout] = useState(null)

  // Load persisted data
  useEffect(() => {
    const data = loadData()
    setHistory(data.history ?? [])
    setActiveWorkout(data.activeWorkout ?? null)
    if (data.activeWorkout) setScreen('workout')
  }, [])

  // Persist whenever state changes
  useEffect(() => {
    saveData({ history, activeWorkout })
  }, [history, activeWorkout])

  function startWorkout(day) {
    if (!day) {
      // Custom workout – use full exercise list
      day = {
        id: 'custom',
        name: 'Custom',
        category: 'push',
        exercises: Object.values(EXERCISES).slice(0, 4).map(ex => ({
          exerciseId: ex.id,
          sets: ex.defaultSets,
          repRange: ex.repRange,
        })),
      }
    }

    const workout = {
      programId: 'lv-ppl',
      dayId: day.id,
      dayName: day.name,
      category: day.category,
      startTime: Date.now(),
      exercises: day.exercises.map(({ exerciseId, sets, repRange }) => ({
        exerciseId,
        plannedSets: sets,
        repRange,
        sets: Array.from({ length: sets }, (_, i) => ({
          weight: 0,
          reps: repRange[0],
          completed: false,
        })),
      })),
    }

    setActiveWorkout(workout)
    setScreen('workout')
  }

  function updateWorkout(updated) {
    setActiveWorkout(updated)
  }

  function finishWorkout() {
    if (!activeWorkout) return
    const finished = { ...activeWorkout, endTime: Date.now() }
    setHistory(h => [...h, finished])
    setActiveWorkout(null)
    setScreen('history')
  }

  function deleteWorkout(startTime) {
    setHistory(h => h.filter(w => w.startTime !== startTime))
  }

  function handleDriveLoad(loaded) {
    if (loaded.history) setHistory(loaded.history)
    if (loaded.activeWorkout !== undefined) setActiveWorkout(loaded.activeWorkout)
  }

  const driveData = { history, activeWorkout }

  function renderScreen() {
    switch (screen) {
      case 'home':
        return (
          <HomeScreen
            history={history}
            activeWorkout={activeWorkout}
            onStartWorkout={startWorkout}
            setScreen={setScreen}
            driveSync={<DriveSync data={driveData} onLoad={handleDriveLoad} />}
          />
        )
      case 'workout':
        return (
          <WorkoutScreen
            activeWorkout={activeWorkout}
            onUpdateWorkout={updateWorkout}
            onFinishWorkout={finishWorkout}
            history={history}
          />
        )
      case 'history':
        return <HistoryScreen history={history} onDelete={deleteWorkout} />
      case 'programs':
        return <ProgramsScreen onStartWorkout={startWorkout} />
      default:
        return null
    }
  }

  return (
    <>
      {renderScreen()}
      <Navigation
        screen={screen}
        setScreen={setScreen}
        hasActiveWorkout={!!activeWorkout}
      />
    </>
  )
}
