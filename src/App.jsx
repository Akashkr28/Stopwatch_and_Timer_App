import { useState, useEffect } from 'react';
import { IoStopwatchOutline, IoTimerOutline, IoAlarmOutline, IoGlobeOutline } from 'react-icons/io5';
import { BsSunFill, BsMoonFill } from 'react-icons/bs';
import Stopwatch from './components/Stopwatch';
import Timer from './components/Timer';

const NAV = [
  { id: 'stopwatch', label: 'Stopwatch', Icon: IoStopwatchOutline },
  { id: 'timer',     label: 'Timer',     Icon: IoTimerOutline      },
  { id: 'alarm',     label: 'Alarm',     Icon: IoAlarmOutline      },
  { id: 'world',     label: 'World',     Icon: IoGlobeOutline      },
];

const TITLES = {
  stopwatch: 'Stopwatch',
  timer:     'Timer',
  alarm:     'Alarm',
  world:     'World Clock',
};

function ComingSoon({ icon: Icon }) {
  return (
    <div className="coming-soon">
      <Icon className="coming-soon-icon" style={{ fontSize: 52 }} />
      <p className="coming-soon-text">Coming Soon</p>
      <p className="coming-soon-sub">This feature is under development</p>
    </div>
  );
}

export default function App() {
  const [dark, setDark]   = useState(false);
  const [tab,  setTab]    = useState('stopwatch');

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);

  useEffect(() => {
    const splash = document.getElementById('splash');
    if (!splash) return;
    const t = setTimeout(() => {
      splash.classList.add('sp-hide');
      setTimeout(() => splash.remove(), 600);
    }, 1400);
    return () => clearTimeout(t);
  }, []);

  const ActiveIcon = NAV.find(n => n.id === tab)?.Icon;

  return (
    <>
      <div className="app">
        {/* Top bar */}
        <div className="top-bar">
          <h1 className="page-title">{TITLES[tab]}</h1>
          <button
            className="theme-btn neu-raised-sm"
            onClick={() => setDark(d => !d)}
            aria-label="Toggle theme"
          >
            {dark ? <BsSunFill style={{ color: '#f5c842' }} /> : <BsMoonFill style={{ color: '#7b9fd4' }} />}
          </button>
        </div>

        {/* Content */}
        {tab === 'stopwatch' && <Stopwatch />}
        {tab === 'timer'     && <Timer />}
        {tab === 'alarm'     && <ComingSoon icon={IoAlarmOutline} />}
        {tab === 'world'     && <ComingSoon icon={IoGlobeOutline} />}
      </div>

      {/* Bottom nav */}
      <nav className="bottom-nav neu-raised">
        {NAV.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={`nav-btn ${tab === id ? 'active' : ''}`}
            onClick={() => setTab(id)}
            aria-label={label}
          >
            <Icon />
            {tab === id && <span className="nav-dot" />}
          </button>
        ))}
      </nav>
    </>
  );
}
