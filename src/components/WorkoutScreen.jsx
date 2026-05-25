import { useState, useEffect } from 'react'
import { EXERCISES, calcRecommendedRest, calcE1RM } from '../data/exercises.js'
import ExerciseIllustration from './ExerciseIllustration.jsx'
import RestTimerOverlay from './RestTimerOverlay.jsx'

function formatElapsed(ms) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

export default function WorkoutScreen({ activeWorkout, onUpdateWorkout, onFinishWorkout, history }) {
  const [elapsed, setElapsed] = useState(0)
  const [selectedExIdx, setSelectedExIdx] = useState(0)
  const [restTimer, setRestTimer] = useState(null) // { duration, exerciseId }

  // Elapsed clock
  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Date.now() - activeWorkout.startTime)
    }, 1000)
    return () => clearInterval(id)
  }, [activeWorkout.startTime])

  if (!activeWorkout) return (
    <div className="screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>💪</div>
      <p className="h3" style={{ textAlign: 'center' }}>Nenhum treino ativo</p>
      <p className="caption" style={{ textAlign: 'center' }}>Inicie um treino pela tela Início</p>
    </div>
  )

  const currentExercise = activeWorkout.exercises[selectedExIdx]
  const ex = EXERCISES[currentExercise.exerciseId]

  // Total volume
  const totalVolume = activeWorkout.exercises.reduce((acc, e) =>
    acc + e.sets.filter(s => s.completed).reduce((a, s) => a + (s.weight * s.reps), 0), 0)

  function getExHistory() {
    return history
      .flatMap(w => w.exercises.filter(e => e.exerciseId === currentExercise.exerciseId))
  }

  function handleCompleteSet(setIdx) {
    const set = currentExercise.sets[setIdx]
    if (!set.weight || !set.reps) return

    const updated = { ...activeWorkout }
    updated.exercises = updated.exercises.map((e, ei) => {
      if (ei !== selectedExIdx) return e
      return {
        ...e,
        sets: e.sets.map((s, si) =>
          si === setIdx ? { ...s, completed: true, timestamp: Date.now() } : s
        ),
      }
    })
    onUpdateWorkout(updated)

    // Calculate smart rest time
    const restDuration = calcRecommendedRest(ex, set.weight, set.reps, getExHistory())
    setRestTimer({ duration: restDuration, exerciseId: currentExercise.exerciseId })
  }

  function handleUpdateSet(setIdx, field, value) {
    const updated = { ...activeWorkout }
    updated.exercises = updated.exercises.map((e, ei) => {
      if (ei !== selectedExIdx) return e
      return {
        ...e,
        sets: e.sets.map((s, si) =>
          si === setIdx ? { ...s, [field]: value } : s
        ),
      }
    })
    onUpdateWorkout(updated)
  }

  function addSet() {
    const updated = { ...activeWorkout }
    updated.exercises = updated.exercises.map((e, ei) => {
      if (ei !== selectedExIdx) return e
      const lastSet = e.sets[e.sets.length - 1]
      return {
        ...e,
        sets: [...e.sets, { weight: lastSet?.weight ?? 0, reps: lastSet?.reps ?? ex.repRange[0], completed: false }],
      }
    })
    onUpdateWorkout(updated)
  }

  function allDone() {
    return activeWorkout.exercises.every(e =>
      e.sets.filter(s => s.completed).length >= e.plannedSets
    )
  }

  // Best e1RM for current exercise from history
  const exHistory = getExHistory()
  const bestE1RM = exHistory.reduce((best, entry) => {
    const max = Math.max(...(entry.sets ?? []).map(s => calcE1RM(s.weight ?? 0, s.reps ?? 1)))
    return Math.max(best, max)
  }, 0)

  // PR detection
  const currentBestE1RM = currentExercise.sets
    .filter(s => s.completed)
    .reduce((best, s) => Math.max(best, calcE1RM(s.weight, s.reps)), 0)
  const isPR = bestE1RM > 0 && currentBestE1RM > bestE1RM

  const categoryColor = {
    push: 'var(--red)',
    pull: 'var(--blue)',
    legs: 'var(--green)',
  }[activeWorkout.category] ?? 'var(--orange)'

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* Sticky header */}
      <div className="workout-header">
        <div>
          <p className="label" style={{ color: 'var(--text-3)' }}>{activeWorkout.dayName}</p>
          <p className="workout-timer">{formatElapsed(elapsed)}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p className="volume-badge">{totalVolume}kg</p>
          <p className="caption">volume total</p>
        </div>
      </div>

      <div className="screen" style={{ paddingTop: 16 }}>

        {/* Illustration */}
        <div className="illustration-wrap">
          <ExerciseIllustration exerciseId={currentExercise.exerciseId} />
          {isPR && (
            <div style={{
              position: 'absolute', top: 10, right: 10,
              background: 'linear-gradient(135deg,rgba(255,215,0,.9),rgba(255,165,0,.9))',
              borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 800, color: '#000'
            }}>
              🏆 PR!
            </div>
          )}
        </div>

        {/* Exercise tabs */}
        <div style={{ display: 'flex', gap: 6, marginTop: 14, overflowX: 'auto', paddingBottom: 4 }}>
          {activeWorkout.exercises.map((e, i) => {
            const exInfo = EXERCISES[e.exerciseId]
            const done = e.sets.filter(s => s.completed).length >= e.plannedSets
            return (
              <button
                key={i}
                onClick={() => setSelectedExIdx(i)}
                style={{
                  flexShrink: 0,
                  padding: '6px 12px',
                  borderRadius: 999,
                  border: `1.5px solid ${i === selectedExIdx ? categoryColor : 'var(--border)'}`,
                  background: i === selectedExIdx ? `${categoryColor}22` : 'var(--surface)',
                  color: i === selectedExIdx ? categoryColor : (done ? 'var(--text-3)' : 'var(--text-2)'),
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  textDecoration: done ? 'line-through' : 'none',
                  opacity: done && i !== selectedExIdx ? .5 : 1,
                }}
              >
                {done ? '✓ ' : ''}{exInfo.name}
              </button>
            )
          })}
        </div>

        {/* Current exercise detail */}
        <div className="card mt-12">
          <div className="row-between mb-12">
            <div>
              <div className="row gap-8">
                <h2 className="h3">{ex.name}</h2>
                {isPR && <span className="tag tag-pr">PR</span>}
              </div>
              <p className="caption mt-8">{ex.muscles.join(' · ')}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span className={`tag tag-${ex.category}`}>{ex.category}</span>
              <p className="caption mt-8">
                {currentExercise.sets.filter(s => s.completed).length}/{currentExercise.plannedSets} sets
              </p>
            </div>
          </div>

          {/* Cues */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
            {ex.cues.map((c, i) => (
              <span key={i} style={{
                fontSize: 11, padding: '3px 8px',
                background: 'var(--surface-2)',
                borderRadius: 6, color: 'var(--text-2)'
              }}>
                {c}
              </span>
            ))}
          </div>

          <div className="sep" />

          {/* Sets header */}
          <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 40px', gap: 8, padding: '6px 0', marginBottom: 4 }}>
            <span className="label text-center">SET</span>
            <span className="label text-center">KG</span>
            <span className="label text-center">REPS</span>
            <span />
          </div>

          {/* Sets */}
          {currentExercise.sets.map((set, si) => (
            <SetRow
              key={si}
              setNum={si + 1}
              set={set}
              repRange={ex.repRange}
              onWeightChange={v => handleUpdateSet(si, 'weight', v)}
              onRepsChange={v => handleUpdateSet(si, 'reps', v)}
              onComplete={() => handleCompleteSet(si)}
            />
          ))}

          <button
            className="btn btn-ghost w-full mt-12"
            style={{ fontSize: 13 }}
            onClick={addSet}
          >
            + Adicionar set
          </button>
        </div>

        {/* Rest info */}
        <div className="card-2 mt-10" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>⏱</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600 }}>
              Descanso recomendado: {Math.round(ex.rest.recommended / 60)}–{Math.round(ex.rest.max / 60)} min
            </p>
            <p className="caption">Ajustado pela intensidade do set</p>
          </div>
        </div>

        {/* Cues */}
        {allDone() && (
          <div style={{ marginTop: 24 }}>
            <button
              className="btn btn-primary w-full"
              style={{ fontSize: 16, padding: '18px', borderRadius: 'var(--r-xl)' }}
              onClick={onFinishWorkout}
            >
              🏁 Finalizar Treino
            </button>
          </div>
        )}
      </div>

      {/* Rest timer overlay */}
      {restTimer && (
        <RestTimerOverlay
          duration={restTimer.duration}
          exerciseName={ex.name}
          onDone={() => setRestTimer(null)}
          onSkip={() => setRestTimer(null)}
        />
      )}
    </div>
  )
}

function SetRow({ setNum, set, repRange, onWeightChange, onRepsChange, onComplete }) {
  return (
    <div className="set-row">
      <span className="set-num">{setNum}</span>

      {/* Weight */}
      <div className="input-group">
        <button className="input-adj" onClick={() => onWeightChange(Math.max(0, (set.weight || 0) - 2.5))}>−</button>
        <input
          type="number"
          value={set.weight || ''}
          onChange={e => onWeightChange(parseFloat(e.target.value) || 0)}
          placeholder="kg"
          disabled={set.completed}
          style={{ opacity: set.completed ? .5 : 1 }}
        />
        <button className="input-adj" onClick={() => onWeightChange((set.weight || 0) + 2.5)}>+</button>
      </div>

      {/* Reps */}
      <div className="input-group">
        <button className="input-adj" onClick={() => onRepsChange(Math.max(1, (set.reps || repRange[0]) - 1))}>−</button>
        <input
          type="number"
          value={set.reps || ''}
          onChange={e => onRepsChange(parseInt(e.target.value) || 0)}
          placeholder={`${repRange[0]}`}
          disabled={set.completed}
          style={{ opacity: set.completed ? .5 : 1 }}
        />
        <button className="input-adj" onClick={() => onRepsChange((set.reps || repRange[0]) + 1)}>+</button>
      </div>

      {/* Complete */}
      <button
        className={`set-check ${set.completed ? 'done' : ''}`}
        onClick={onComplete}
        disabled={set.completed || !set.weight || !set.reps}
        style={{ opacity: !set.weight || !set.reps ? .3 : 1 }}
      >
        {set.completed ? '✓' : ''}
      </button>
    </div>
  )
}
