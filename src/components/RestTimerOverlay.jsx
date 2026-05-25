import { useState, useEffect, useRef } from 'react'

const CIRCUMFERENCE = 2 * Math.PI * 90 // r=90

function formatTime(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${String(sec).padStart(2, '0')}`
}

export default function RestTimerOverlay({ duration, exerciseName, onDone, onSkip }) {
  const [remaining, setRemaining] = useState(duration)
  const [total, setTotal] = useState(duration)
  const startRef = useRef(Date.now())
  const totalRef = useRef(duration)

  useEffect(() => {
    startRef.current = Date.now()
    totalRef.current = duration
    setRemaining(duration)
    setTotal(duration)
  }, [duration])

  useEffect(() => {
    const id = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startRef.current) / 1000)
      const left = Math.max(0, totalRef.current - elapsed)
      setRemaining(left)
      if (left === 0) {
        clearInterval(id)
        // vibrate if supported
        if ('vibrate' in navigator) navigator.vibrate([100, 50, 100])
        setTimeout(onDone, 600)
      }
    }, 250)
    return () => clearInterval(id)
  }, [onDone])

  function addTime(s) {
    totalRef.current += s
    setTotal(t => t + s)
  }

  const progress = remaining / total
  const dash = CIRCUMFERENCE * (1 - progress)

  const readyMessages = [
    'Foco total — último set!',
    'Descansou, agora vai!',
    'Respira fundo e vai forte!',
    'Energia renovada!',
    'Mantém a intensidade!',
  ]
  const readyMsg = readyMessages[Math.floor(Date.now() / 1000) % readyMessages.length]

  return (
    <div className="rest-overlay animate-in">
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
            {remaining === 0 ? '🔥 VAI!' : 'restante'}
          </span>
        </div>
      </div>

      <div
        className="rest-recommended"
        title="Descanso calculado com base na intensidade do set"
      >
        <span>🧠</span>
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
        <button className="btn btn-ghost" onClick={() => addTime(30)}>
          +30s
        </button>
        <button
          className="btn btn-primary"
          style={{ minWidth: 120 }}
          onClick={onSkip}
        >
          {remaining === 0 ? 'Continuar' : 'Pular ⏭'}
        </button>
      </div>
    </div>
  )
}
