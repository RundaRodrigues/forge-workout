export default function Navigation({ screen, setScreen, hasActiveWorkout }) {
  const tabs = [
    { id: 'home',    label: 'Início',   icon: '⚡' },
    { id: 'workout', label: 'Treino',   icon: '🏋️', dot: hasActiveWorkout },
    { id: 'history', label: 'Histórico',icon: '📊' },
    { id: 'programs',label: 'Programas',icon: '📋' },
  ]

  return (
    <nav className="nav">
      <div className="nav-inner">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${screen === tab.id ? 'active' : ''}`}
            onClick={() => setScreen(tab.id)}
          >
            <div className="nav-icon" style={{ position: 'relative' }}>
              {tab.icon}
              {tab.dot && <span className="nav-dot visible" />}
            </div>
            <span className="nav-label">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
