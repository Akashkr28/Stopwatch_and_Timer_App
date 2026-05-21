import { useState, useEffect } from 'react';
import { useTimer } from '../hooks/useTimer';
import { formatTimer } from '../utils/format';

const PRESETS = [
  { label: '1 min',  s: 60   },
  { label: '5 min',  s: 300  },
  { label: '10 min', s: 600  },
  { label: '25 min', s: 1500 },
];

export default function Timer() {
  const [inputH, setInputH]       = useState(0);
  const [inputM, setInputM]       = useState(5);
  const [inputS, setInputS]       = useState(0);
  const [configured, setConfigured] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);

  const { remaining, running, finished, progress, set, start, pause, reset } = useTimer();

  useEffect(() => { if (finished) playAlarm(); }, [finished]);

  function playAlarm() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      [[0, 880], [0.4, 1100], [0.8, 880]].forEach(([t, freq]) => {
        const osc = ctx.createOscillator(), gain = ctx.createGain();
        osc.connect(gain); gain.connect(ctx.destination);
        osc.type = 'sine'; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.5, ctx.currentTime + t);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.35);
        osc.start(ctx.currentTime + t);
        osc.stop(ctx.currentTime + t + 0.36);
      });
    } catch (_) {}
  }

  function handlePreset(p) {
    const h = Math.floor(p.s / 3600);
    const m = Math.floor((p.s % 3600) / 60);
    const s = p.s % 60;
    setInputH(h); setInputM(m); setInputS(s);
    set(h, m, s);
    setConfigured(true);
    setSelectedPreset(p.s);
  }

  function handleSet() {
    if (inputH === 0 && inputM === 0 && inputS === 0) return;
    set(inputH, inputM, inputS);
    setConfigured(true);
    setSelectedPreset(null);
  }

  function handleReset() {
    reset();
    setConfigured(false);
    setSelectedPreset(null);
  }

  const { h, m, s } = formatTimer(remaining);

  /* SVG ring — drains as countdown progresses */
  const R = 108;
  const SIZE = 268;
  const CX = SIZE / 2;
  const circumference = 2 * Math.PI * R;
  const strokeDashoffset = circumference * progress; /* 0=full, 1=empty */

  return (
    <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingBottom: 20, WebkitOverflowScrolling: 'touch' }}>
      {/* ── Presets ── */}
      <div className="preset-row">
        {PRESETS.map(p => (
          <button
            key={p.s}
            className={`preset-btn neu-raised-sm ${selectedPreset === p.s ? 'selected' : ''}`}
            onClick={() => handlePreset(p)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Ring display ── */}
      <div className="timer-ring-wrap">
        <div className="neu-inset" style={{
          width: SIZE, height: SIZE, borderRadius: '50%', position: 'relative',
        }}>
          <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}>
            {/* Track */}
            <circle cx={CX} cy={CX} r={R}
              fill="none"
              stroke="var(--ring-track)"
              strokeWidth="10"
            />
            {/* Progress arc */}
            {configured && remaining > 0 && (
              <circle cx={CX} cy={CX} r={R}
                fill="none"
                stroke="var(--accent)"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                style={{ transition: 'stroke-dashoffset 0.12s linear', filter: 'drop-shadow(0 0 6px var(--accent))' }}
              />
            )}
          </svg>

          {/* Center */}
          <div className="timer-center">
            {finished ? (
              <span className="timer-finished">Time's Up!</span>
            ) : (
              <>
                <span className="timer-digits">
                  {h !== '00' ? `${h}:${m}:${s}` : `${m}:${s}`}
                </span>
                {!configured && (
                  <span className="timer-hint">Set a time</span>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Input section (hidden while running) ── */}
      {!running && (
        <div className="input-section">
          <div className="input-row">
            {[
              { label: 'H', val: inputH, max: 23, set: setInputH },
              { label: 'M', val: inputM, max: 59, set: setInputM },
              { label: 'S', val: inputS, max: 59, set: setInputS },
            ].map(({ label, val, max, set: setter }) => (
              <div key={label} className="input-field-wrap">
                <span className="input-label">{label}</span>
                <input
                  type="number" min={0} max={max} value={val}
                  onChange={e => {
                    setter(Math.min(max, Math.max(0, Number(e.target.value))));
                    setSelectedPreset(null);
                  }}
                  className="time-input neu-inset-sm"
                />
              </div>
            ))}
          </div>
          <button className="set-btn neu-raised-sm" onClick={handleSet}>
            Set Time
          </button>
        </div>
      )}

      {/* ── Controls ── */}
      <div className="controls">
        <button className="neu-btn neu-raised-sm" onClick={handleReset}>
          Reset
        </button>

        {running ? (
          <button className="neu-btn neu-raised-sm accent" onClick={pause}>
            Pause
          </button>
        ) : (
          <button
            className="neu-btn neu-raised-sm accent"
            onClick={start}
            disabled={!configured || remaining === 0}
          >
            Start
          </button>
        )}
      </div>
    </div>
  );
}
