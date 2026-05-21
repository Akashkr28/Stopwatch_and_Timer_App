import { useStopwatch } from '../hooks/useStopwatch';
import { formatStopwatch } from '../utils/format';

function pad(n) { return String(n).padStart(2, '0'); }

export default function Stopwatch() {
  const { elapsed, running, laps, start, stop, reset, lap } = useStopwatch();

  const lapDurations = laps.map((l, i) => (i === 0 ? l : l - laps[i - 1]));
  const bestLap  = laps.length > 1 ? Math.min(...lapDurations) : null;
  const worstLap = laps.length > 1 ? Math.max(...lapDurations) : null;

  const needleAngle = ((elapsed / 1000) % 60) / 60 * 360;

  const cs = pad(Math.floor((elapsed % 1000) / 10));
  const ss = pad(Math.floor(elapsed / 1000) % 60);
  const mm = pad(Math.floor(elapsed / 60000) % 60);
  const hh = Math.floor(elapsed / 3600000);

  return (
    /* Root fills the full .app height and manages its own scrolling */
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>

      {/* ── STATIC section: clock + time + controls — never scrolls ── */}
      <div style={{ flexShrink: 0 }}>

        {/* Analog clock face */}
        <div className="clock-wrap">
          <div className="clock-face neu-inset" style={{ position: 'relative' }}>
            <svg viewBox="0 0 260 260" width="260" height="260"
              style={{ position: 'absolute', inset: 0 }}>
              {Array.from({ length: 60 }).map((_, i) => {
                const major  = i % 5 === 0;
                const angle  = (i * 6 * Math.PI) / 180;
                const outerR = 122, innerR = major ? 112 : 117;
                const cx = 130, cy = 130;
                return (
                  <line key={i}
                    x1={cx + innerR * Math.sin(angle)} y1={cy - innerR * Math.cos(angle)}
                    x2={cx + outerR * Math.sin(angle)} y2={cy - outerR * Math.cos(angle)}
                    stroke="var(--accent)"
                    strokeOpacity={major ? 0.4 : 0.13}
                    strokeWidth={major ? 2.5 : 1}
                    strokeLinecap="round"
                  />
                );
              })}
              <g transform={`rotate(${needleAngle} 130 130)`}>
                <line x1="130" y1="128" x2="130" y2="42"
                  stroke="rgba(0,0,0,0.08)" strokeWidth="4" strokeLinecap="round"
                  transform="translate(2 2)" />
                <line x1="130" y1="140" x2="130" y2="42"
                  stroke="var(--needle)" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="130" y1="140" x2="130" y2="160"
                  stroke="var(--needle)" strokeWidth="4" strokeLinecap="round" />
                <circle cx="130" cy="140" r="6"
                  fill="var(--bg)" stroke="var(--needle)" strokeWidth="2.5" />
                <circle cx="130" cy="140" r="2.5" fill="var(--needle)" />
              </g>
            </svg>
          </div>
        </div>

        {/* Digital display */}
        <div className="digital-display">
          <div>
            <span className="digital-main">
              {hh > 0 && `${pad(hh)}:`}{mm}:{ss}
            </span>
            <span className="digital-cs">.{cs}</span>
          </div>
          {running && laps.length > 0 && (
            <div className="running-label">Lap {laps.length + 1}</div>
          )}
        </div>

        {/* Controls */}
        <div className="controls">
          <button className="neu-btn neu-raised-sm" onClick={reset}>Reset</button>
          {running && (
            <button className="neu-btn neu-raised-sm accent" onClick={lap}>Lap</button>
          )}
          {running ? (
            <button className="neu-btn neu-raised-sm danger" onClick={stop}>Stop</button>
          ) : (
            <button className="neu-btn neu-raised-sm accent" onClick={start}>
              {elapsed === 0 ? 'Start' : 'Resume'}
            </button>
          )}
        </div>
      </div>

      {/* ── SCROLLABLE lap section — only this part scrolls ── */}
      {laps.length > 0 && (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 0,
          paddingBottom: 16,
          WebkitOverflowScrolling: 'touch',
        }}>
          <div className="lap-list">
            {[...laps].reverse().map((overall, revIdx) => {
              const idx     = laps.length - 1 - revIdx;
              const lapDur  = lapDurations[idx];
              const isBest  = laps.length > 1 && lapDur === bestLap;
              const isWorst = laps.length > 1 && lapDur === worstLap;
              return (
                <div key={idx}
                  className={`lap-row neu-flat ${isBest ? 'lap-best' : isWorst ? 'lap-worst' : ''}`}>
                  <span className="lap-label">Lap {idx + 1}</span>
                  <span className="lap-time">{formatStopwatch(lapDur)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
