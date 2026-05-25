import { PROGRAMS } from '../data/programs.js'
import { EXERCISES } from '../data/exercises.js'

export default function ProgramsScreen({ onStartWorkout }) {
  const program = PROGRAMS['lv-ppl']

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
          <DayCard key={day.id} day={day} onStart={() => onStartWorkout(day)} />
        ))}
      </div>

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

function DayCard({ day, onStart }) {
  const [open, setOpen] = useState(false)
  const totalSets = day.exercises.reduce((a, e) => a + e.sets, 0)

  return (
    <div className="card">
      <div
        className="row-between"
        onClick={() => setOpen(o => !o)}
        style={{ cursor: 'pointer' }}
      >
        <div>
          <span className={`tag tag-${day.category}`}>{day.name}</span>
          <p className="h3" style={{ marginTop: 6 }}>{day.subtitle}</p>
          <p className="caption mt-8">{day.exercises.length} exercícios · {totalSets} sets totais</p>
        </div>
        <span style={{ fontSize: 18, color: 'var(--text-3)', transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }}>
          ▾
        </span>
      </div>

      {open && (
        <div style={{ marginTop: 14 }}>
          <div className="sep" />
          {day.exercises.map(({ exerciseId, sets, repRange }) => {
            const ex = EXERCISES[exerciseId]
            return (
              <div key={exerciseId} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div className="row-between">
                  <div className="row gap-10">
                    <span style={{ fontSize: 18 }}>{ex.emoji}</span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600 }}>{ex.name}</p>
                      <p className="caption">{ex.muscles.join(' · ')}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 13, fontWeight: 700 }}>
                      {sets}×{repRange[0]}–{repRange[1]}
                    </p>
                    <p className="caption">
                      {Math.round(ex.rest.recommended / 60)}min descanso
                    </p>
                  </div>
                </div>
              </div>
            )
          })}

          <button
            className="btn btn-primary w-full mt-14"
            onClick={e => { e.stopPropagation(); onStart() }}
          >
            🔥 Iniciar {day.name} Day
          </button>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
