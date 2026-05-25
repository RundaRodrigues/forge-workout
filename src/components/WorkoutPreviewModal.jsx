import { EXERCISES } from '../data/exercises.js'

const CAT_COLOR = {
  push: 'var(--red)',
  pull: 'var(--blue)',
  legs: 'var(--green)',
}

export default function WorkoutPreviewModal({ day, onClose, onStart }) {
  if (!day) return null

  const totalSets = day.exercises.reduce((a, e) => a + e.sets, 0)
  const accent = CAT_COLOR[day.category] ?? 'var(--orange)'

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: 'rgba(7,7,15,.88)',
        backdropFilter: 'blur(14px)',
        display: 'flex', alignItems: 'flex-end',
        animation: 'fadeIn .2s ease',
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 430, margin: '0 auto',
          background: 'var(--surface)',
          borderRadius: '24px 24px 0 0',
          border: '1px solid var(--border)',
          maxHeight: '88dvh',
          display: 'flex', flexDirection: 'column',
          animation: 'slideUp .28s ease',
        }}
      >
        {/* Handle */}
        <div style={{ padding: '14px 20px 0', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, background: 'var(--border-2)', borderRadius: 2, margin: '0 auto 16px' }} />

          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 }}>
            <div>
              <span
                style={{
                  display: 'inline-block', fontSize: 11, fontWeight: 700,
                  letterSpacing: '1px', textTransform: 'uppercase',
                  color: accent, background: `${accent}18`,
                  border: `1px solid ${accent}44`,
                  borderRadius: 999, padding: '2px 10px', marginBottom: 6,
                }}
              >
                {day.name}
              </span>
              <h2 className="h2">{day.subtitle}</h2>
              <p className="caption" style={{ marginTop: 4 }}>
                {day.exercises.length} exercícios · {totalSets} sets totais
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                borderRadius: '50%', width: 32, height: 32,
                color: 'var(--text-2)', fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: 2,
              }}
            >
              ×
            </button>
          </div>

          <div style={{ height: 1, background: 'var(--border)', margin: '14px 0 0' }} />
        </div>

        {/* Scrollable exercise list */}
        <div style={{ overflowY: 'auto', flex: 1, padding: '0 20px' }}>
          {day.exercises.map(({ exerciseId, sets, repRange }, idx) => {
            const ex = EXERCISES[exerciseId]
            if (!ex) return null
            return (
              <div
                key={exerciseId}
                style={{
                  padding: '14px 0',
                  borderBottom: idx < day.exercises.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{
                      fontSize: 24, width: 42, height: 42,
                      background: 'var(--surface-2)', borderRadius: 12,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {ex.emoji}
                    </span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700 }}>{ex.name}</p>
                      <p className="caption" style={{ fontSize: 12 }}>{ex.muscles.join(' · ')}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                    <p style={{ fontSize: 15, fontWeight: 800, color: accent, whiteSpace: 'nowrap' }}>
                      {sets}×{repRange[0]}–{repRange[1]}
                    </p>
                    <p className="caption" style={{ fontSize: 11 }}>
                      {Math.round(ex.rest.recommended / 60)}min descanso
                    </p>
                  </div>
                </div>

                {/* Cues */}
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', paddingLeft: 52 }}>
                  {ex.cues.map((cue, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: 11, padding: '3px 8px',
                        background: 'var(--surface-3)',
                        borderRadius: 6, color: 'var(--text-2)',
                      }}
                    >
                      {cue}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}

          {/* Bottom padding for the sticky button */}
          <div style={{ height: 8 }} />
        </div>

        {/* Sticky bottom action */}
        <div style={{
          padding: '12px 20px calc(12px + env(safe-area-inset-bottom))',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface)',
          flexShrink: 0,
        }}>
          <button
            className="btn btn-primary w-full"
            style={{ fontSize: 16, padding: '16px' }}
            onClick={() => { onClose(); onStart(day) }}
          >
            🔥 Iniciar {day.name} Day
          </button>
        </div>
      </div>
    </div>
  )
}
