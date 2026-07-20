import { useMemo, useState } from 'react'
import { EXERCISES, calcE1RM } from '../data/exercises.js'

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'short',
  })
}

function formatDuration(ms) {
  const m = Math.round(ms / 60000)
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}min`
  return `${m}min`
}

function getPeriodStart(period) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  if (period === 'week') {
    start.setDate(start.getDate() - 6)
    return start
  }

  if (period === 'month') {
    start.setMonth(start.getMonth() - 1)
    return start
  }

  return null
}

const PERIODS = [
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mês' },
  { id: 'all', label: 'Tudo' },
]

export default function HistoryScreen({ history, onDelete }) {
  const [period, setPeriod] = useState('month')
  const filteredHistory = useMemo(() => {
    const start = getPeriodStart(period)
    if (!start) return history
    return history.filter(w => new Date(w.endTime) >= start)
  }, [history, period])

  if (history.length === 0) {
    return (
      <div className="screen" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
        <div style={{ fontSize: 48 }}>📊</div>
        <h2 className="h3" style={{ textAlign: 'center' }}>Nenhum treino registrado</h2>
        <p className="caption" style={{ textAlign: 'center', maxWidth: 260 }}>
          Complete seu primeiro treino para ver o histórico aqui.
        </p>
      </div>
    )
  }

  const sorted = [...filteredHistory].reverse()

  // Calculate PR markers across all history
  const prByWorkout = {}
  const runningPrs = {}
  history.forEach(w => {
    prByWorkout[w.startTime] = {}
    w.exercises.forEach(e => {
      const bestInWorkout = e.sets
        .filter(s => s.completed)
        .reduce((best, s) => Math.max(best, calcE1RM(s.weight, s.reps)), 0)

      if (bestInWorkout > (runningPrs[e.exerciseId] ?? 0)) {
        prByWorkout[w.startTime][e.exerciseId] = true
        runningPrs[e.exerciseId] = bestInWorkout
      }
    })
  })

  const periodBest = {}
  filteredHistory.forEach(w => {
    w.exercises.forEach(e => {
      const bestInWorkout = e.sets
        .filter(s => s.completed)
        .reduce((best, s) => Math.max(best, calcE1RM(s.weight, s.reps)), 0)

      periodBest[e.exerciseId] = Math.max(periodBest[e.exerciseId] ?? 0, bestInWorkout)
    })
  })

  // Total stats
  const totalWorkouts = filteredHistory.length
  const totalVolume = filteredHistory.reduce((acc, w) =>
    acc + w.exercises.reduce((a, e) =>
      a + e.sets.filter(s => s.completed).reduce((x, s) => x + (s.weight * s.reps), 0), 0), 0)
  const totalSets = filteredHistory.reduce((acc, w) =>
    acc + w.exercises.reduce((a, e) => a + e.sets.filter(s => s.completed).length, 0), 0)

  return (
    <div className="screen animate-in">
      <div style={{ paddingTop: 8 }}>
        <h1 className="h2">Histórico</h1>
        <p className="caption mt-8">Sua jornada de força</p>
      </div>

      <div className="history-filter" role="tablist" aria-label="Filtrar histórico por período">
        {PERIODS.map(option => (
          <button
            key={option.id}
            type="button"
            className={`history-filter-btn ${period === option.id ? 'active' : ''}`}
            onClick={() => setPeriod(option.id)}
            role="tab"
            aria-selected={period === option.id}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Overall stats */}
      <div className="stat-grid mt-16 mb-24">
        <div className="stat-box">
          <div className="stat-value grad">{totalWorkouts}</div>
          <div className="label">Treinos</div>
        </div>
        <div className="stat-box">
          <div className="stat-value grad">{totalSets}</div>
          <div className="label">Sets totais</div>
        </div>
        <div className="stat-box" style={{ gridColumn: '1 / -1' }}>
          <div className="stat-value grad">
            {totalVolume >= 1000
              ? `${(totalVolume / 1000).toFixed(1)}t`
              : `${totalVolume}kg`}
          </div>
          <div className="label">Volume total levantado</div>
        </div>
      </div>

      {filteredHistory.length === 0 && (
        <div className="card-2 mb-24" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 13, fontWeight: 700 }}>Nenhum treino neste período</p>
          <p className="caption mt-8">Troque o filtro para ver registros mais antigos.</p>
        </div>
      )}

      {/* Best lifts section */}
      {Object.keys(periodBest).length > 0 && (
        <>
          <h2 className="h3 mb-12">🏆 Melhores do período</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {Object.entries(periodBest)
              .sort(([, a], [, b]) => b - a)
              .map(([exId, e1rm]) => {
                const ex = EXERCISES[exId]
                if (!ex) return null
                return (
                  <div key={exId} className="card-2 row-between">
                    <div className="row gap-8">
                      <span>{ex.emoji}</span>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600 }}>{ex.name}</p>
                        <p className="caption">1RM estimado</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span className="tag tag-pr">{e1rm}kg</span>
                    </div>
                  </div>
                )
              })}
          </div>
        </>
      )}

      {/* Workout list */}
      <h2 className="h3 mb-12">Treinos do período</h2>
      {sorted.map((w, i) => {
        const vol = w.exercises.reduce((a, e) =>
          a + e.sets.filter(s => s.completed).reduce((x, s) => x + (s.weight * s.reps), 0), 0)
        const sets = w.exercises.reduce((a, e) => a + e.sets.filter(s => s.completed).length, 0)
        const dur = w.endTime - w.startTime

        return (
          <WorkoutEntry key={w.startTime} workout={w} volume={vol} sets={sets} duration={dur} prExercises={prByWorkout[w.startTime] ?? {}} onDelete={onDelete} />
        )
      })}
    </div>
  )
}

function WorkoutEntry({ workout, volume, sets, duration, prExercises, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [confirming, setConfirming] = useState(false)

  function handleDelete(e) {
    e.stopPropagation()
    if (confirming) {
      onDelete(workout.startTime)
    } else {
      setConfirming(true)
    }
  }

  function cancelDelete(e) {
    e.stopPropagation()
    setConfirming(false)
  }

  return (
    <div className="history-card" onClick={() => { setExpanded(e => !e); setConfirming(false) }}>
      <div className="history-header">
        <div>
          <span className={`tag tag-${workout.category}`}>{workout.dayName}</span>
          <p className="caption mt-8">{formatDate(workout.endTime)}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 13, fontWeight: 700 }}>{formatDuration(duration)}</p>
          <p className="caption" style={{ whiteSpace: 'nowrap' }}>{volume}kg · {sets} sets</p>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 10 }}>
          <div className="sep" />
          {workout.exercises.map((e, i) => {
            const ex = EXERCISES[e.exerciseId]
            if (!ex) return null
            const completedSets = e.sets.filter(s => s.completed)
            const bestE1rm = completedSets.reduce((best, s) =>
              Math.max(best, calcE1RM(s.weight, s.reps)), 0)
            const isPR = !!prExercises[e.exerciseId] && bestE1rm > 0

            return (
              <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="row-between">
                  <div className="row gap-8">
                    <span>{ex.emoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{ex.name}</span>
                    {isPR && <span className="tag tag-pr" style={{ fontSize: 10 }}>PR</span>}
                  </div>
                  {bestE1rm > 0 && (
                    <span className="caption" style={{ whiteSpace: 'nowrap' }}>{bestE1rm}kg e1RM</span>
                  )}
                </div>
                <div className="row gap-8" style={{ marginTop: 6, flexWrap: 'wrap' }}>
                  {completedSets.map((s, si) => (
                    <span key={si} style={{
                      fontSize: 11, padding: '2px 8px',
                      background: 'var(--surface-3)',
                      borderRadius: 6, color: 'var(--text-2)',
                      whiteSpace: 'nowrap',
                    }}>
                      {s.weight}kg × {s.reps}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div style={{ marginTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p className="caption" style={{ opacity: .4, fontSize: 11 }}>
          {expanded ? '▲ fechar' : '▼ detalhes'}
        </p>
        {expanded && (
          confirming ? (
            <div className="row gap-8" onClick={e => e.stopPropagation()}>
              <span className="caption" style={{ fontSize: 11 }}>Confirmar?</span>
              <button
                onClick={handleDelete}
                style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, border: 'none', background: '#cc2222', color: '#fff', cursor: 'pointer', fontWeight: 700 }}
              >Excluir</button>
              <button
                onClick={cancelDelete}
                style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-2)', cursor: 'pointer' }}
              >Cancelar</button>
            </div>
          ) : (
            <button
              onClick={handleDelete}
              style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, border: '1px solid #cc222244', background: 'transparent', color: '#cc4444', cursor: 'pointer' }}
            >🗑 Excluir</button>
          )
        )}
      </div>
    </div>
  )
}

