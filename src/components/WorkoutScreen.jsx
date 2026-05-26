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
  const [restTimer, setRestTimer] = useState(null)
  const [confirmFinish, setConfirmFinish] = useState(false)
  const [planOpen, setPlanOpen] = useState(false)

  // Elapsed clock
  useEffect(() => {
    if (!activeWorkout) return
    const id = setInterval(() => {
      setElapsed(Date.now() - activeWorkout.startTime)
    }, 1000)
    return () => clearInterval(id)
  }, [activeWorkout?.startTime])

  if (!activeWorkout) return (
    <div className="screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>💪</div>
      <p className="h3" style={{ textAlign: 'center' }}>Nenhum treino ativo</p>
      <p className="caption" style={{ textAlign: 'center' }}>Inicie um treino pela tela Início</p>
    </div>
  )

  const currentExercise = activeWorkout.exercises[selectedExIdx]
  const ex = EXERCISES[currentExercise.exerciseId]

  const totalVolume = activeWorkout.exercises.reduce((acc, e) =>
    acc + e.sets.filter(s => s.completed).reduce((a, s) => a + (s.weight * s.reps), 0), 0)

  function getExHistory() {
    return history.flatMap(w => w.exercises.filter(e => e.exerciseId === currentExercise.exerciseId))
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

  const exHistory = getExHistory()
  const bestE1RM = exHistory.reduce((best, entry) => {
    const max = Math.max(...(entry.sets ?? []).map(s => calcE1RM(s.weight ?? 0, s.reps ?? 1)))
    return Math.max(best, max)
  }, 0)

  const currentBestE1RM = currentExercise.sets
    .filter(s => s.completed)
    .reduce((best, s) => Math.max(best, calcE1RM(s.weight, s.reps)), 0)
  const isPR = bestE1RM > 0 && currentBestE1RM > bestE1RM

  const categoryColor = {
    push: 'var(--red)',
    pull: 'var(--blue)',
    legs: 'var(--green)',
  }[activeWorkout.category] ?? 'var(--orange)'

  const completedSets = currentExercise.sets.filter(s => s.completed).length

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* Sticky header */}
      <div className="workout-header">
        <div>
          <p className="label" style={{ color: 'var(--text-3)' }}>{activeWorkout.dayName}</p>
          <p className="workout-timer">{formatElapsed(elapsed)}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Plan toggle */}
          <button
            onClick={() => setPlanOpen(o => !o)}
            style={{
              background: planOpen ? `${categoryColor}22` : 'var(--surface-2)',
              border: `1px solid ${planOpen ? categoryColor : 'var(--border)'}`,
              borderRadius: 8, padding: '5px 10px',
              color: planOpen ? categoryColor : 'var(--text-2)',
              fontSize: 11, fontWeight: 700,
              fontFamily: 'inherit', cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            📋 Plano
          </button>
          <div style={{ textAlign: 'right' }}>
            <p className="volume-badge">{totalVolume}kg</p>
            <p className="caption">volume</p>
          </div>
        </div>
      </div>

      {/* Plan overview dropdown */}
      {planOpen && (
        <div style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: '10px 16px 14px',
        }}>
          {activeWorkout.exercises.map((e, i) => {
            const exInfo = EXERCISES[e.exerciseId]
            const done = e.sets.filter(s => s.completed).length >= e.plannedSets
            const isSelected = i === selectedExIdx
            return (
              <button
                key={i}
                onClick={() => { setSelectedExIdx(i); setPlanOpen(false) }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  width: '100%', padding: '8px 10px', marginBottom: 4,
                  borderRadius: 10,
                  background: isSelected ? `${categoryColor}18` : done ? 'rgba(6,214,160,.06)' : 'var(--surface-2)',
                  border: `1px solid ${isSelected ? categoryColor : done ? 'rgba(6,214,160,.25)' : 'var(--border)'}`,
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{exInfo.emoji}</span>
                  <div>
                    <p style={{
                      fontSize: 13, fontWeight: 600,
                      color: isSelected ? categoryColor : done ? 'var(--green)' : 'var(--text)',
                      textDecoration: done ? 'line-through' : 'none',
                    }}>
                      {exInfo.name}
                    </p>
                    <p className="caption" style={{ fontSize: 11 }}>
                      {e.plannedSets} sets · {e.repRange[0]}–{e.repRange[1]} reps
                    </p>
                  </div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: done ? 'var(--green)' : isSelected ? categoryColor : 'var(--text-3)',
                }}>
                  {done ? '✓' : `${e.sets.filter(s => s.completed).length}/${e.plannedSets}`}
                </span>
              </button>
            )
          })}
        </div>
      )}

      <div className="screen" style={{ paddingTop: 14 }}>

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
        <div style={{ display: 'flex', gap: 6, marginTop: 12, overflowX: 'auto', paddingBottom: 4 }}>
          {activeWorkout.exercises.map((e, i) => {
            const exInfo = EXERCISES[e.exerciseId]
            const done = e.sets.filter(s => s.completed).length >= e.plannedSets
            return (
              <button
                key={i}
                onClick={() => setSelectedExIdx(i)}
                style={{
                  flexShrink: 0,
                  padding: '5px 12px',
                  borderRadius: 999,
                  border: `1.5px solid ${i === selectedExIdx ? categoryColor : 'var(--border)'}`,
                  background: i === selectedExIdx ? `${categoryColor}22` : 'var(--surface)',
                  color: i === selectedExIdx ? categoryColor : (done ? 'var(--green)' : 'var(--text-2)'),
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  opacity: done && i !== selectedExIdx ? .6 : 1,
                }}
              >
                {done ? '✓ ' : ''}{exInfo.name}
              </button>
            )
          })}
        </div>

        {/* Exercise card */}
        <div className="card mt-12">

          {/* Header: name + progress */}
          <div className="row-between mb-8">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="row gap-8">
                <h2 className="h3" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {ex.name}
                </h2>
                {isPR && <span className="tag tag-pr" style={{ flexShrink: 0 }}>PR</span>}
              </div>
              <p className="caption" style={{ marginTop: 4 }}>{ex.muscles.join(' · ')}</p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 10 }}>
              <span className={`tag tag-${ex.category}`}>{ex.category}</span>
            </div>
          </div>

          {/* Target + history row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 5,
              background: `${categoryColor}15`,
              border: `1px solid ${categoryColor}40`,
              borderRadius: 999, padding: '4px 12px',
            }}>
              <span style={{ fontSize: 11 }}>🎯</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: categoryColor, whiteSpace: 'nowrap' }}>
                {currentExercise.plannedSets} sets · {currentExercise.repRange[0]}–{currentExercise.repRange[1]} reps
              </span>
            </div>
            {bestE1RM > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 999, padding: '4px 12px',
              }}>
                <span style={{ fontSize: 11 }}>🏆</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-2)', whiteSpace: 'nowrap' }}>
                  {bestE1RM}kg e1RM
                </span>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span className="caption" style={{ fontSize: 11 }}>Progresso</span>
              <span className="caption" style={{ fontSize: 11, fontWeight: 700 }}>
                {completedSets} / {currentExercise.plannedSets} sets
              </span>
            </div>
            <div style={{ height: 4, background: 'var(--surface-3)', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(100, (completedSets / currentExercise.plannedSets) * 100)}%`,
                background: `linear-gradient(90deg, ${categoryColor}, ${categoryColor}99)`,
                borderRadius: 999,
                transition: 'width .4s ease',
              }} />
            </div>
          </div>

          {/* Cues */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr 1fr 40px', gap: 8, padding: '6px 0', marginBottom: 2 }}>
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
              isPlanned={si < currentExercise.plannedSets}
              categoryColor={categoryColor}
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
            + Set extra
          </button>
        </div>

        {/* Rest info */}
        <div className="card-2 mt-10" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>⏱</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600 }}>
              Descanso: {Math.round(ex.rest.recommended / 60)}–{Math.round(ex.rest.max / 60)} min
            </p>
            <p className="caption">Ajustado pela intensidade</p>
          </div>
        </div>

        {/* Finish button */}
        <div style={{ marginTop: 24 }}>
          {confirmFinish && !allDone() ? (
            <div className="card-2" style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
              <p style={{ fontSize: 13, fontWeight: 600, textAlign: 'center' }}>
                Ainda há sets incompletos. Finalizar mesmo assim?
              </p>
              <div className="row gap-8 w-full">
                <button
                  className="btn btn-primary w-full"
                  style={{ fontSize: 14 }}
                  onClick={onFinishWorkout}
                >
                  🏁 Finalizar
                </button>
                <button
                  className="btn btn-ghost w-full"
                  style={{ fontSize: 14 }}
                  onClick={() => setConfirmFinish(false)}
                >
                  Voltar
                </button>
              </div>
            </div>
          ) : (
            <button
              className="btn btn-primary w-full"
              style={{ fontSize: 16, padding: '18px', borderRadius: 'var(--r-xl)', opacity: allDone() ? 1 : 0.7 }}
              onClick={() => allDone() ? onFinishWorkout() : setConfirmFinish(true)}
            >
              🏁 Finalizar Treino
            </button>
          )}
        </div>
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

function SetRow({ setNum, set, repRange, isPlanned, categoryColor, onWeightChange, onRepsChange, onComplete }) {
  return (
    <div className="set-row" style={{
      opacity: set.completed ? 0.6 : 1,
      background: set.completed ? 'rgba(6,214,160,.04)' : 'transparent',
    }}>
      <span className="set-num" style={{
        color: isPlanned ? 'var(--text-2)' : 'var(--text-3)',
      }}>
        {setNum}
      </span>

      {/* Weight */}
      <div className="input-group" style={{
        borderColor: set.completed ? 'rgba(6,214,160,.3)' : undefined,
      }}>
        <button className="input-adj" onClick={() => onWeightChange(Math.max(0, (set.weight || 0) - 2.5))}>−</button>
        <input
          type="number"
          value={set.weight || ''}
          onChange={e => onWeightChange(parseFloat(e.target.value) || 0)}
          placeholder="0"
          disabled={set.completed}
        />
        <button className="input-adj" onClick={() => onWeightChange((set.weight || 0) + 2.5)}>+</button>
      </div>

      {/* Reps — show target range as placeholder */}
      <div className="input-group" style={{
        borderColor: set.completed ? 'rgba(6,214,160,.3)' : undefined,
      }}>
        <button className="input-adj" onClick={() => onRepsChange(Math.max(1, (set.reps || repRange[0]) - 1))}>−</button>
        <input
          type="number"
          value={set.reps || ''}
          onChange={e => onRepsChange(parseInt(e.target.value) || 0)}
          placeholder={`${repRange[0]}`}
          disabled={set.completed}
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
