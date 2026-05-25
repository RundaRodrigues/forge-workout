import { useState } from 'react'
import { PROGRAMS, getTodaySchedule } from '../data/programs.js'
import { EXERCISES } from '../data/exercises.js'
import WorkoutPreviewModal from './WorkoutPreviewModal.jsx'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

const DOW_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function HomeScreen({ history, activeWorkout, programId, onStartWorkout, setScreen, driveSync }) {
  const [previewDay, setPreviewDay] = useState(null)
  const today = getTodaySchedule(programId, history)
  const isRestDay = !today
  const dow = new Date().getDay()

  // Last 7 days workout status
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const key = d.toDateString()
    const worked = history.some(h => new Date(h.endTime).toDateString() === key)
    const isToday = d.toDateString() === new Date().toDateString()
    return { label: DOW_LABELS[d.getDay()], worked, isToday }
  })

  // Stats
  const thisWeekStart = new Date()
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay())
  thisWeekStart.setHours(0, 0, 0, 0)
  const weekWorkouts = history.filter(h => new Date(h.endTime) >= thisWeekStart)
  const totalSets = weekWorkouts.reduce((acc, w) =>
    acc + w.exercises.reduce((a, e) => a + e.sets.filter(s => s.completed).length, 0), 0)
  const totalVolume = weekWorkouts.reduce((acc, w) =>
    acc + w.exercises.reduce((a, e) =>
      a + e.sets.filter(s => s.completed).reduce((x, s) => x + (s.weight * s.reps), 0), 0), 0)

  const recentWorkouts = history.slice(-3).reverse()

  return (
    <>
    <div className="screen animate-in">
      {/* Header */}
      <div style={{ paddingTop: 8 }}>
        <div className="row-between" style={{ marginBottom: 8 }}>
          <p className="caption">{getGreeting()} 👋</p>
          {driveSync}
        </div>
        <h1 className="h1">
          {activeWorkout
            ? 'Treino em andamento'
            : isRestDay
              ? 'Dia de descanso'
              : <><span className="text-grad">{today.name} Day</span> te espera</>
          }
        </h1>
      </div>

      {/* Week strip */}
      <div className="week-strip mt-16">
        {last7.map((day, i) => (
          <div className="week-day" key={i}>
            <span className="week-day-label">{day.label}</span>
            <div className={`week-day-dot ${day.worked ? 'done' : ''} ${day.isToday && !day.worked ? 'today' : ''}`}>
              {day.worked ? '✓' : day.isToday ? '•' : ''}
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="stat-grid mt-16">
        <div className="stat-box">
          <div className="stat-value grad">{weekWorkouts.length}</div>
          <div className="label">Treinos na semana</div>
        </div>
        <div className="stat-box">
          <div className="stat-value grad">{totalSets}</div>
          <div className="label">Sets concluídos</div>
        </div>
        <div className="stat-box">
          <div className="stat-value" style={{ fontSize: 20 }}>
            {totalVolume >= 1000
              ? `${(totalVolume / 1000).toFixed(1)}t`
              : `${totalVolume}kg`}
          </div>
          <div className="label">Volume semanal</div>
        </div>
        <div className="stat-box">
          <div className="stat-value">{history.length}</div>
          <div className="label">Total de treinos</div>
        </div>
      </div>

      {/* Today's workout card */}
      {activeWorkout ? (
        <div className="card mt-16" style={{ background: 'var(--grad-glow)', borderColor: 'rgba(255,122,26,.2)' }}>
          <div className="row-between">
            <div>
              <p className="label">EM ANDAMENTO</p>
              <p className="h3" style={{ marginTop: 4 }}>{activeWorkout.dayName}</p>
            </div>
            <span className="pulse" style={{ fontSize: 28 }}>🔥</span>
          </div>
          <button
            className="btn btn-primary w-full mt-12"
            onClick={() => setScreen('workout')}
          >
            Continuar Treino →
          </button>
        </div>
      ) : isRestDay ? (
        <div className="card mt-16" style={{ opacity: .7 }}>
          <div className="text-center" style={{ padding: '12px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>😴</div>
            <p className="h3">Recuperação ativa</p>
            <p className="caption mt-8">O músculo cresce no descanso. Aproveite.</p>
          </div>
          <button className="btn btn-ghost w-full mt-12" onClick={() => onStartWorkout(null)}>
            Treino personalizado
          </button>
        </div>
      ) : (
        <div className="card mt-16">
          <div className="row-between mb-12">
            <div>
              <span className={`tag tag-${today.category}`}>{today.name}</span>
              <p className="h3" style={{ marginTop: 6 }}>{today.subtitle}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p className="caption">{today.exercises.length} exercícios</p>
              <p className="caption">
                {today.exercises.reduce((a, e) => a + e.sets, 0)} sets
              </p>
            </div>
          </div>

          {today.exercises.slice(0, 3).map(({ exerciseId, sets, repRange }) => {
            const ex = EXERCISES[exerciseId]
            return (
              <div key={exerciseId} className="row gap-8" style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 16 }}>{ex.emoji}</span>
                <span style={{ fontSize: 13, flex: 1 }}>{ex.name}</span>
                <span className="caption">{sets}×{repRange[0]}–{repRange[1]}</span>
              </div>
            )
          })}
          {today.exercises.length > 3 && (
            <p className="caption" style={{ marginTop: 4, opacity: .5 }}>
              +{today.exercises.length - 3} mais
            </p>
          )}

          <div className="row gap-8 mt-16">
            <button
              className="btn btn-ghost w-full"
              onClick={() => setPreviewDay(today)}
            >
              👁 Ver treino
            </button>
            <button
              className="btn btn-primary w-full"
              onClick={() => onStartWorkout(today)}
            >
              🔥 Iniciar
            </button>
          </div>
        </div>
      )}

      {/* Recent workouts */}
      {recentWorkouts.length > 0 && (
        <>
          <div className="row-between mt-24 mb-12">
            <h2 className="h3">Últimos treinos</h2>
            <button className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => setScreen('history')}>
              Ver todos
            </button>
          </div>
          {recentWorkouts.map((w, i) => {
            const dur = Math.round((w.endTime - w.startTime) / 60000)
            const vol = w.exercises.reduce((a, e) =>
              a + e.sets.filter(s => s.completed).reduce((x, s) => x + (s.weight * s.reps), 0), 0)
            return (
              <div className="history-card" key={i} style={{ marginBottom: 8 }}>
                <div className="history-header">
                  <div>
                    <span className={`tag tag-${w.category}`}>{w.dayName}</span>
                    <p className="caption mt-8">
                      {new Date(w.endTime).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 13, fontWeight: 700 }}>{dur}min</p>
                    <p className="caption" style={{ whiteSpace: 'nowrap' }}>{vol}kg vol.</p>
                  </div>
                </div>
              </div>
            )
          })}
        </>
      )}
    </div>

    {previewDay && (
      <WorkoutPreviewModal
        day={previewDay}
        onClose={() => setPreviewDay(null)}
        onStart={(day) => { setPreviewDay(null); onStartWorkout(day) }}
      />
    )}
    </>
  )
}
