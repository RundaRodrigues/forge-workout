import { useState } from 'react'
import { PROGRAMS } from '../data/programs.js'
import { EXERCISES } from '../data/exercises.js'
import { calcPlannedWorkoutCalories, formatCalories } from '../data/calories.js'
import WorkoutPreviewModal from './WorkoutPreviewModal.jsx'

const GENDER_LABELS = {
  male:   { icon: '♂', label: 'Masculino', color: '#4cc9f0' },
  female: { icon: '♀', label: 'Feminino',  color: '#c084fc' },
}

export default function ProgramsScreen({ programId, gender, onStartWorkout, onChangeGender }) {
  const program = PROGRAMS[programId] ?? PROGRAMS['lv-ppl']
  const [previewDay, setPreviewDay] = useState(null)
  const genderInfo = GENDER_LABELS[gender] ?? GENDER_LABELS.male
  const legsLabel = gender === 'female' ? 'G' : 'L'

  return (
    <div className="screen animate-in">
      <div style={{ paddingTop: 8 }}>
        <div className="row-between" style={{ marginBottom: 12 }}>
          <div>
            <h1 className="h2">{program.name}</h1>
            <p className="caption mt-8">{program.description}</p>
          </div>
          {/* Profile chip */}
          <button
            onClick={onChangeGender}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: `${genderInfo.color}15`,
              border: `1px solid ${genderInfo.color}44`,
              borderRadius: 999, padding: '6px 12px',
              color: genderInfo.color,
              fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            {genderInfo.icon} {genderInfo.label}
          </button>
        </div>
      </div>

      <div className="card mt-8" style={{ background: 'var(--grad-glow)', borderColor: 'rgba(255,122,26,.2)' }}>
        <div className="row gap-12">
          <span style={{ fontSize: 28 }}>🔬</span>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700 }}>Foco Massa + Queima</p>
            <p className="caption mt-8">
              {gender === 'female'
                ? 'Glúteos e membros superiores com reps moderadas, descanso curto e volume suficiente para definição.'
                : 'Reps de hipertrofia, descanso controlado e volume semanal para ganhar massa sem perder densidade.'}
            </p>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
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
            const isWorkout = [0, 2, 4].includes(i)
            return (
              <div key={d} style={{ flex: 1, textAlign: 'center' }}>
                <p style={{ fontSize: 10, color: 'var(--text-3)', marginBottom: 4 }}>{d}</p>
                <div style={{
                  height: 28, borderRadius: 6,
                  background: isWorkout ? 'var(--grad)' : 'var(--surface-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700,
                }}>
                  {isWorkout ? ['P', 'Pu', legsLabel][Math.floor(i / 2)] : '–'}
                </div>
              </div>
            )
          })}
        </div>
        <p className="caption mt-12" style={{ opacity: .5 }}>
          P = Push · Pu = Pull · {legsLabel} = {gender === 'female' ? 'Glúteos' : 'Legs'}
        </p>
      </div>

      {/* Change gender */}
      <div className="card mt-12" style={{ opacity: .7 }}>
        <div className="row-between">
          <div>
            <p style={{ fontSize: 13, fontWeight: 600 }}>Perfil de treino</p>
            <p className="caption">{genderInfo.icon} {genderInfo.label} · {program.name}</p>
          </div>
          <button
            className="btn btn-ghost"
            style={{ fontSize: 12, padding: '6px 14px' }}
            onClick={onChangeGender}
          >
            Trocar
          </button>
        </div>
      </div>
    </div>
  )
}

function DayCard({ day, onPreview, onStart }) {
  const totalSets = day.exercises.reduce((a, e) => a + e.sets, 0)
  const calories = calcPlannedWorkoutCalories(day)

  return (
    <div className="card">
      <div className="row-between" style={{ marginBottom: 12 }}>
        <div>
          <span className={`tag tag-${day.category}`}>{day.name}</span>
          <p className="h3" style={{ marginTop: 6 }}>{day.subtitle}</p>
          <p className="caption mt-8">{day.exercises.length} exercícios · {totalSets} sets · {formatCalories(calories)}</p>
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
        <button className="btn btn-ghost w-full" style={{ fontSize: 13 }} onClick={onPreview}>
          👁 Ver treino
        </button>
        <button className="btn btn-primary w-full" style={{ fontSize: 13 }} onClick={onStart}>
          🔥 Iniciar
        </button>
      </div>
    </div>
  )
}
