import { useState, useEffect } from 'react'

const CIRCUMFERENCE = 2 * Math.PI * 90 // r=90

function formatTime(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

function getRemaining(duration, startedAt) {
  const elapsed = Math.floor((Date.now() - startedAt) / 1000)
  return Math.max(0, duration - elapsed)
}

export default function RestTimerOverlay({
  duration,
  startedAt,
  exerciseName,
  onAddTime,
  onMinimize,
  onSkip,
}) {
  const [remaining, setRemaining] = useState(() => getRemaining(duration, startedAt))

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining(duration, startedAt)), 250)
    return () => clearInterval(id)
  }, [duration, startedAt])

  const progress = duration > 0 ? remaining / duration : 0
  const dash = CIRCUMFERENCE * (1 - progress)

  const readyMessages = [
    'Foco total - ultimo set!',
    'Descansou, agora vai!',
    'Respira fundo e vai forte!',
    'Energia renovada!',
    'Mantem a intensidade!',
  ]
  const readyMsg = readyMessages[Math.floor(Date.now() / 1000) % readyMessages.length]

  return (
    <div className="rest-overlay animate-in">
      <button className="rest-minimize" onClick={onMinimize}>
        Minimizar
      </button>

      <p className="label" style={{ color: 'var(--text-3)', letterSpacing: '2px' }}>
        DESCANSO
      </p>

      <p className="h3" style={{ color: 'var(--text-2)', marginTop: 8, fontSize: 13 }}>
        {exerciseName}
      </p>

      <div className="rest-ring-wrap">
        <svg width="220" height="220" viewBox="0 0 220 220">
          <defs>
            <linearGradient id="timerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff3b3b" />
              <stop offset="100%" stopColor="#ff7a1a" />
            </linearGradient>
          </defs>
          <circle
            className="rest-ring-track"
            cx="110" cy="110" r="90"
            fill="none"
            strokeWidth="6"
          />
          <circle
            className="rest-ring-progress"
            cx="110" cy="110" r="90"
            fill="none"
            strokeWidth="6"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dash}
          />
        </svg>

        <div className="rest-time-display">
          <span
            className="rest-seconds text-grad"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {formatTime(remaining)}
          </span>
          <span className="rest-label-sm">
            {remaining === 0 ? 'VAI!' : 'restante'}
          </span>
        </div>
      </div>

      <div
        className="rest-recommended"
        title="Descanso calculado com base na intensidade do set"
      >
        <span>Ideal: {formatTime(duration)}</span>
      </div>

      {remaining > 0 && (
        <p
          className="caption"
          style={{ marginTop: 12, textAlign: 'center', opacity: .5, fontSize: 12, maxWidth: 240 }}
        >
          {readyMsg}
        </p>
      )}

      <div className="rest-actions" style={{ marginTop: 24 }}>
        <button className="btn btn-ghost" onClick={() => onAddTime(30)}>
          +30s
        </button>
        <button
          className="btn btn-primary"
          style={{ minWidth: 120 }}
          onClick={onSkip}
        >
          {remaining === 0 ? 'Continuar' : 'Pular'}
        </button>
      </div>
    </div>
  )
}
