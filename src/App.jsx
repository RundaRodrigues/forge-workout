import { useState, useEffect, useCallback, useRef } from 'react'
import Navigation from './components/Navigation.jsx'
import HomeScreen from './components/HomeScreen.jsx'
import WorkoutScreen from './components/WorkoutScreen.jsx'
import HistoryScreen from './components/HistoryScreen.jsx'
import ProgramsScreen from './components/ProgramsScreen.jsx'
import CloudSync from './components/CloudSync.jsx'
import GenderSelectScreen from './components/GenderSelectScreen.jsx'
import RestTimerOverlay from './components/RestTimerOverlay.jsx'
import { EXERCISES } from './data/exercises.js'
import { saveToCloud, getSession } from './services/supabase.js'

const STORAGE_KEY = 'forge_data_v1'

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { history: [], activeWorkout: null, gender: null }
    return JSON.parse(raw)
  } catch {
    return { history: [], activeWorkout: null, gender: null }
  }
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch { /* storage full */ }
}

function formatRestTime(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

function getRestRemaining(timer) {
  if (!timer) return 0
  const elapsed = Math.floor((Date.now() - timer.startedAt) / 1000)
  return Math.max(0, timer.duration - elapsed)
}

export default function App() {
  const [screen, setScreen] = useState('home')
  const [history, setHistory] = useState([])
  const [activeWorkout, setActiveWorkout] = useState(null)
  const [gender, setGender] = useState(null)
  const [cloudSync, setCloudSync] = useState({ state: 'idle', time: null })
  const [restTimer, setRestTimer] = useState(null)
  const hydratedRef = useRef(false)
  // 'idle' | 'syncing' | 'done' | 'error'

  useEffect(() => {
    const data = loadData()
    setHistory(data.history ?? [])
    setActiveWorkout(data.activeWorkout ?? null)
    setGender(data.gender ?? null)
    if (data.activeWorkout) setScreen('workout')
  }, [])

  const programId = gender === 'female' ? 'lv-ppl-female' : 'lv-ppl'

  /* ── Auto-sync to Supabase ───────────────────────────── */
  const autoSync = useCallback(async (data) => {
    try {
      const session = await getSession()
      if (!session) return   // not authenticated — skip silently
      setCloudSync({ state: 'syncing', time: null })
      await saveToCloud(data)
      setCloudSync({ state: 'done', time: Date.now() })
    } catch {
      setCloudSync({ state: 'error', time: null })
    }
  }, [])

  useEffect(() => {
    if (gender === null) return
    saveData({ history, activeWorkout, gender })

    if (!hydratedRef.current) {
      hydratedRef.current = true
      return
    }

    const id = setTimeout(() => {
      autoSync({ history, activeWorkout, gender })
    }, 1200)
    return () => clearTimeout(id)
  }, [history, activeWorkout, gender, autoSync])

  useEffect(() => {
    if (!restTimer) return
    const id = setInterval(() => {
      if (getRestRemaining(restTimer) > 0) return
      if ('vibrate' in navigator) navigator.vibrate([100, 50, 100])
      setRestTimer(null)
    }, 250)
    return () => clearInterval(id)
  }, [restTimer])

  /* ── Actions ─────────────────────────────────────────── */
  const navigate = useCallback((nextScreen) => {
    setRestTimer(timer => timer ? { ...timer, minimized: true } : timer)
    setScreen(nextScreen)
  }, [])

  function startRestTimer(duration, exerciseName) {
    setRestTimer({
      duration,
      exerciseName,
      startedAt: Date.now(),
      minimized: false,
    })
  }

  function addRestTime(seconds) {
    setRestTimer(timer => timer ? { ...timer, duration: timer.duration + seconds } : timer)
  }

  function handleGenderSelect(g) {
    setGender(g)
    saveData({ history, activeWorkout, gender: g })
  }

  function startWorkout(day) {
    if (!day) {
      day = {
        id: 'custom', name: 'Custom', category: 'push',
        exercises: Object.values(EXERCISES).slice(0, 4).map(ex => ({
          exerciseId: ex.id, sets: ex.defaultSets, repRange: ex.repRange,
        })),
      }
    }
    const workout = {
      programId, dayId: day.id, dayName: day.name,
      category: day.category, startTime: Date.now(),
      exercises: day.exercises.map(({ exerciseId, sets, repRange }) => ({
        exerciseId, plannedSets: sets, repRange,
        sets: Array.from({ length: sets }, () => ({
          weight: 0, reps: repRange[0], completed: false,
        })),
      })),
    }
    setActiveWorkout(workout)
    navigate('workout')
  }

  function updateWorkout(updated) {
    setActiveWorkout(updated)
  }

  function finishWorkout() {
    if (!activeWorkout) return
    const finished = { ...activeWorkout, endTime: Date.now() }
    const newHistory = [...history, finished]
    setHistory(newHistory)
    setActiveWorkout(null)
    setRestTimer(null)
    setScreen('history')
  }

  function deleteWorkout(startTime) {
    const newHistory = history.filter(w => w.startTime !== startTime)
    setHistory(newHistory)
  }

  function handleCloudLoad(loaded) {
    if (loaded.history) setHistory(loaded.history)
    if (loaded.activeWorkout !== undefined) setActiveWorkout(loaded.activeWorkout)
    if (loaded.gender) setGender(loaded.gender)
  }

  if (gender === null) {
    return <GenderSelectScreen onSelect={handleGenderSelect} />
  }

  const cloudData = { history, activeWorkout, gender }

  function renderScreen() {
    switch (screen) {
      case 'home':
        return (
          <HomeScreen
            history={history}
            activeWorkout={activeWorkout}
            programId={programId}
            onStartWorkout={startWorkout}
            setScreen={navigate}
            driveSync={
              <CloudSync
                data={cloudData}
                onLoad={handleCloudLoad}
                autoSync={cloudSync}
              />
            }
          />
        )
      case 'workout':
        return (
          <WorkoutScreen
            activeWorkout={activeWorkout}
            onUpdateWorkout={updateWorkout}
            onFinishWorkout={finishWorkout}
            history={history}
            onStartRest={startRestTimer}
          />
        )
      case 'history':
        return <HistoryScreen history={history} onDelete={deleteWorkout} />
      case 'programs':
        return (
          <ProgramsScreen
            programId={programId}
            gender={gender}
            onStartWorkout={startWorkout}
            onChangeGender={() => setGender(null)}
          />
        )
      default:
        return null
    }
  }

  return (
    <>
      {renderScreen()}
      {restTimer && restTimer.minimized && (
        <RestTimerChip
          timer={restTimer}
          onExpand={() => setRestTimer(timer => timer ? { ...timer, minimized: false } : timer)}
          onSkip={() => setRestTimer(null)}
        />
      )}
      {restTimer && !restTimer.minimized && (
        <RestTimerOverlay
          duration={restTimer.duration}
          startedAt={restTimer.startedAt}
          exerciseName={restTimer.exerciseName}
          onAddTime={addRestTime}
          onMinimize={() => setRestTimer(timer => timer ? { ...timer, minimized: true } : timer)}
          onSkip={() => setRestTimer(null)}
        />
      )}
      <Navigation screen={screen} setScreen={navigate} hasActiveWorkout={!!activeWorkout} />
    </>
  )
}

function RestTimerChip({ timer, onExpand, onSkip }) {
  const [remaining, setRemaining] = useState(() => getRestRemaining(timer))

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRestRemaining(timer)), 250)
    return () => clearInterval(id)
  }, [timer])

  return (
    <div className="rest-chip" role="status" aria-live="polite">
      <button className="rest-chip-main" onClick={onExpand}>
        <span className="rest-chip-label">Descanso</span>
        <span className="rest-chip-name">{timer.exerciseName}</span>
        <span className="rest-chip-time">{formatRestTime(remaining)}</span>
      </button>
      <button className="rest-chip-skip" onClick={onSkip} aria-label="Encerrar descanso">
        Pular
      </button>
    </div>
  )
}
