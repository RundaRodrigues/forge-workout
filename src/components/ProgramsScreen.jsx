import { useState } from 'react'
import { PROGRAMS } from '../data/programs.js'
import { EXERCISES } from '../data/exercises.js'
import WorkoutPreviewModal from './WorkoutPreviewModal.jsx'

export default function ProgramsScreen({ onStartWorkout }) {
  const program = PROGRAMS['lv-ppl']
  const [previewDay, setPreviewDay] = useState(null)

  return (
    <div className="screen animate-in">
      <div style={{ paddingTop: 8 }}>
        <h1 className="h2">{program.name}</h1>
        <p className="caption mt-8">{program.description}</p>
      </div>

      <div className="card mt-16" style={{ background: 'var(--grad-glow)', borderColor: 'rgba(255,122,26,.2)' }}>
        <div className="row gap-12">
          <span style={{ fontSize: 32 }}>🔬</span>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700 }}>Filosofia Low Volume</p>
            <p className="caption mt-8">
              2–4 sets por exercício. Intensidade máxima. Recuperação total.
              Menos é mais quando a qualidade domina.
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {program.days.map(day => (
          <DayCard
            key={day.id}
            day={day}
            onPreview={() => setPreviewDay(day)}
            onStart={() => onStartWorkout(day)}
          />
        ))}
      </div>

      {previewDay && (
        <WorkoutPreviewModal
          day={previewDay}
          onClose={() => setPreviewDay(null)}
          onStart={(day) => { setPreviewDay(null); onStartWorkout(day) }}
        />
      )}

      <div className="card mt-16" style={{ opacity: .6 }}>
        <p className="label mb-8">Estrutura semanal</p>
        <div style={{ display: 'flex', gap: 6 }}>
          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((d, i) => {
            const isWorkout = [0, 2, 4].includes(i) // Mon, Wed, Fri (0-indexed from Mon)
            return (
              <div key={d} style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>{d}</p>
                <div style={{
                  height: 28,
                  borderRadius: 6,
                  background: isWorkout ? 'var(--grad)' : 'var(--surface-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12,
                }}>
                  {isWorkout
                    ? ['P', 'Pu', 'L'][Math.floor(i / 2)]
                    : '–'}
                </div>
              </div>
            )
          })}
        </div>
        <p className="caption mt-12" style={{ opacity: .5 }}>P = Push · Pu = Pull · L = Legs</p>
      </div>
    </div>
  )
}

function DayCard({ day, onPreview, onStart }) {
  const totalSets = day.exercises.reduce((a, e) => a + e.sets, 0)

  return (
    <div className="card">
      <div className="row-between" style={{ marginBottom: 12 }}>
        <div>
          <span className={`tag tag-${day.category}`}>{day.name}</span>
          <p className="h3" style={{ marginTop: 6 }}>{day.subtitle}</p>
          <p className="caption mt-8">{day.exercises.length} exercícios · {totalSets} sets totais</p>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {day.exercises.map(({ exerciseId }) => {
            const ex = EXERCISES[exerciseId]
            return (
              <span key={exerciseId} style={{ fontSize: 18 }} title={ex?.name}>{ex?.emoji}</span>
            )
          })}
        </div>
      </div>

      <div className="row gap-8">
        <button
          className="btn btn-ghost w-full"
          style={{ fontSize: 13 }}
          onClick={onPreview}
        >
          👁 Ver treino
        </button>
        <button
          className="btn btn-primary w-full"
          style={{ fontSize: 13 }}
          onClick={onStart}
        >
          🔥 Iniciar
        </button>
      </div>
    </div>
  )
}
