import { useState } from 'react'

const OPTIONS = [
  {
    id: 'male',
    icon: '♂',
    label: 'Masculino',
    program: 'Força · Hipertrofia',
    desc: 'PPL clássico focado em compostos pesados e progressão de carga.',
    color: '#4cc9f0',
    bg: 'rgba(76,201,240,0.07)',
    border: 'rgba(76,201,240,0.35)',
  },
  {
    id: 'female',
    icon: '♀',
    label: 'Feminino',
    program: 'Glúteos · Definição',
    desc: 'PPL low volume com foco em glúteos, isquiotibiais e hipertrofia feminina.',
    color: '#c084fc',
    bg: 'rgba(192,132,252,0.07)',
    border: 'rgba(192,132,252,0.35)',
  },
]

export default function GenderSelectScreen({ onSelect }) {
  const [selected, setSelected] = useState(null)

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '0 20px',
      background: 'var(--bg)',
    }}>

      {/* Brand */}
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <h1 style={{
          fontSize: 52, fontWeight: 900, letterSpacing: -2,
          background: 'linear-gradient(135deg,#ff3b3b,#ff7a1a)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          lineHeight: 1,
        }}>
          FORGE
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 10, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 600 }}>
          Selecione seu perfil
        </p>
      </div>

      {/* Cards */}
      <div style={{ display: 'flex', gap: 14, width: '100%', maxWidth: 360 }}>
        {OPTIONS.map(opt => {
          const active = selected === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => setSelected(opt.id)}
              style={{
                flex: 1,
                background: active ? opt.bg : 'var(--surface)',
                border: `2px solid ${active ? opt.border : 'var(--border)'}`,
                borderRadius: 20,
                padding: '24px 16px',
                cursor: 'pointer',
                textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                transition: 'all .2s ease',
                boxShadow: active ? `0 0 24px ${opt.color}22` : 'none',
                fontFamily: 'inherit',
              }}
            >
              <span style={{
                fontSize: 36,
                color: active ? opt.color : 'var(--text-3)',
                transition: 'color .2s',
              }}>
                {opt.icon}
              </span>
              <p style={{
                fontSize: 16, fontWeight: 800,
                color: active ? opt.color : 'var(--text)',
                transition: 'color .2s',
              }}>
                {opt.label}
              </p>
              <p style={{
                fontSize: 11, fontWeight: 700, letterSpacing: 1,
                textTransform: 'uppercase',
                color: active ? opt.color : 'var(--text-3)',
                opacity: active ? 1 : 0.7,
              }}>
                {opt.program}
              </p>
              <p style={{
                fontSize: 12, color: 'var(--text-2)', lineHeight: 1.5,
                marginTop: 4,
              }}>
                {opt.desc}
              </p>

              {active && (
                <div style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: opt.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, color: '#000', fontWeight: 800,
                  marginTop: 4,
                }}>
                  ✓
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* CTA */}
      <button
        onClick={() => selected && onSelect(selected)}
        disabled={!selected}
        style={{
          marginTop: 36,
          width: '100%', maxWidth: 360,
          padding: '18px',
          borderRadius: 'var(--r-xl)',
          border: 'none',
          background: selected
            ? 'linear-gradient(135deg,#ff3b3b,#ff7a1a)'
            : 'var(--surface-2)',
          color: selected ? '#fff' : 'var(--text-3)',
          fontSize: 16, fontWeight: 800,
          cursor: selected ? 'pointer' : 'default',
          fontFamily: 'inherit',
          transition: 'all .25s ease',
          letterSpacing: 0.5,
        }}
      >
        {selected ? 'Começar →' : 'Selecione um perfil'}
      </button>

      <p style={{ marginTop: 16, fontSize: 11, color: 'var(--text-3)', textAlign: 'center' }}>
        Pode ser alterado depois nas configurações
      </p>
    </div>
  )
}
