import React, { useState, useEffect } from 'react';
import { Calendar, Check, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ClockWidgetProps {
  onClose?: () => void;
}

export const ClockWidget: React.FC<ClockWidgetProps> = ({ onClose }) => {
  const { theme, highContrast } = useTheme();
  const isLight = theme === 'light';

  const [time, setTime] = useState<Date>(new Date());
  const [is24Hour, setIs24Hour] = useState(false);
  const [clockMode, setClockMode] = useState<'both' | 'digital' | 'analog'>('both');
  const [showSeconds, setShowSeconds] = useState(true);

  // Accurate ticking clock interval
  useEffect(() => {
    setTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const rawHours = time.getHours();
  const rawMinutes = time.getMinutes();
  const rawSeconds = time.getSeconds();

  const displayHours = is24Hour
    ? rawHours.toString().padStart(2, '0')
    : (rawHours % 12 || 12).toString();

  const displayMinutes = rawMinutes.toString().padStart(2, '0');
  const displaySeconds = rawSeconds.toString().padStart(2, '0');
  const ampm = rawHours >= 12 ? 'PM' : 'AM';

  const dateString = time.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Analog angles
  const secondAngle = rawSeconds * 6; // 360 / 60
  const minuteAngle = rawMinutes * 6 + rawSeconds * 0.1;
  const hourAngle = (rawHours % 12) * 30 + rawMinutes * 0.5;

  return (
    <div className="h-full w-full flex flex-col justify-between overflow-hidden select-none">
      {/* Top Controls: Mode Switcher & Date */}
      <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-300 dark:border-white/15 shrink-0 gap-2">
        {/* Mode Switcher */}
        <div className="flex items-center bg-slate-200/90 dark:bg-white/10 rounded-xl p-0.5 text-[11px] font-bold">
          <button
            type="button"
            onClick={() => setClockMode('both')}
            className={`px-2 py-0.5 rounded-lg cursor-pointer transition-all ${
              clockMode === 'both'
                ? 'bg-amber-600 text-white shadow-xs font-black'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Show Analog & Digital Clocks"
          >
            Dual
          </button>
          <button
            type="button"
            onClick={() => setClockMode('digital')}
            className={`px-2 py-0.5 rounded-lg cursor-pointer transition-all ${
              clockMode === 'digital'
                ? 'bg-amber-600 text-white shadow-xs font-black'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Digital Clock Only"
          >
            Digital
          </button>
          <button
            type="button"
            onClick={() => setClockMode('analog')}
            className={`px-2 py-0.5 rounded-lg cursor-pointer transition-all ${
              clockMode === 'analog'
                ? 'bg-amber-600 text-white shadow-xs font-black'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
            title="Analog Clock Only"
          >
            Analog
          </button>
        </div>

        {/* Date Display */}
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 text-xs font-bold truncate">
          <Calendar className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="truncate uppercase tracking-wider text-[11px]">
            {dateString}
          </span>
        </div>
      </div>

      {/* Main Clock Face Display Area */}
      <div className="flex-1 flex items-center justify-center gap-3 sm:gap-5 min-h-0 py-2 overflow-hidden">
        {/* Analog Clock Face */}
        {(clockMode === 'analog' || clockMode === 'both') && (
          <div
            className={`relative flex items-center justify-center shrink-0 ${
              clockMode === 'analog'
                ? 'w-44 h-44 sm:w-52 sm:h-52'
                : 'w-32 h-32 sm:w-36 sm:h-36'
            }`}
          >
            <svg
              viewBox="0 0 100 100"
              className={`w-full h-full drop-shadow-md rounded-full ${
                isLight ? 'bg-white' : 'bg-slate-800'
              } border-2 ${
                highContrast
                  ? isLight
                    ? 'border-black'
                    : 'border-white'
                  : 'border-slate-300 dark:border-white/20'
              }`}
            >
              {/* Dial ring */}
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke={isLight ? '#cbd5e1' : '#334155'}
                strokeWidth="1.5"
              />

              {/* Hour tick marks & numerals */}
              {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => {
                const angle = (n * 30 - 90) * (Math.PI / 180);
                const xTickStart = 50 + 40 * Math.cos(angle);
                const yTickStart = 50 + 40 * Math.sin(angle);
                const xTickEnd = 50 + 45 * Math.cos(angle);
                const yTickEnd = 50 + 45 * Math.sin(angle);
                const xText = 50 + 31 * Math.cos(angle);
                const yText = 50 + 31 * Math.sin(angle) + 2.5;

                return (
                  <g key={n}>
                    <line
                      x1={xTickStart}
                      y1={yTickStart}
                      x2={xTickEnd}
                      y2={yTickEnd}
                      stroke={isLight ? '#475569' : '#94a3b8'}
                      strokeWidth={n % 3 === 0 ? '2' : '1'}
                    />
                    <text
                      x={xText}
                      y={yText}
                      textAnchor="middle"
                      className={`text-[8.5px] font-black ${
                        isLight ? 'fill-slate-800' : 'fill-slate-100'
                      }`}
                    >
                      {n}
                    </text>
                  </g>
                );
              })}

              {/* Hour Hand */}
              <line
                x1="50"
                y1="50"
                x2="50"
                y2="28"
                stroke={isLight ? '#0f172a' : '#f8fafc'}
                strokeWidth="3.5"
                strokeLinecap="round"
                transform={`rotate(${hourAngle} 50 50)`}
              />

              {/* Minute Hand */}
              <line
                x1="50"
                y1="50"
                x2="50"
                y2="18"
                stroke={isLight ? '#2563eb' : '#60a5fa'}
                strokeWidth="2.5"
                strokeLinecap="round"
                transform={`rotate(${minuteAngle} 50 50)`}
              />

              {/* Second Hand */}
              {showSeconds && (
                <>
                  <line
                    x1="50"
                    y1="58"
                    x2="50"
                    y2="14"
                    stroke="#ef4444"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    transform={`rotate(${secondAngle} 50 50)`}
                  />
                  <circle cx="50" cy="50" r="1.5" fill="#ef4444" />
                </>
              )}

              {/* Center Pivot */}
              <circle
                cx="50"
                cy="50"
                r="3"
                fill={isLight ? '#0f172a' : '#ffffff'}
              />
            </svg>
          </div>
        )}

        {/* Digital Clock Display */}
        {(clockMode === 'digital' || clockMode === 'both') && (
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-baseline justify-center">
              <span
                className={`font-mono font-black tracking-tight ${
                  clockMode === 'digital'
                    ? 'text-4xl sm:text-5xl md:text-6xl'
                    : 'text-2xl sm:text-3xl md:text-4xl'
                } ${isLight ? 'text-slate-900' : 'text-white'}`}
              >
                {displayHours}:{displayMinutes}
              </span>

              {showSeconds && (
                <span
                  className={`font-mono font-bold text-amber-600 dark:text-yellow-400 ml-1 ${
                    clockMode === 'digital'
                      ? 'text-xl sm:text-2xl md:text-3xl'
                      : 'text-base sm:text-lg'
                  }`}
                >
                  :{displaySeconds}
                </span>
              )}

              {!is24Hour && (
                <span className="text-xs sm:text-sm font-black text-sky-600 dark:text-sky-400 ml-1.5 uppercase">
                  {ampm}
                </span>
              )}
            </div>

            <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider text-center">
              {is24Hour ? '24-Hour Format' : '12-Hour Standard'}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar: 12h/24h toggle & Seconds Toggle */}
      <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-300 dark:border-white/15 shrink-0">
        <button
          type="button"
          onClick={() => setIs24Hour(!is24Hour)}
          className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
            is24Hour
              ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
              : isLight
              ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-800'
              : 'bg-white/10 hover:bg-white/15 border-white/15 text-slate-200'
          }`}
        >
          {is24Hour ? '24-Hour' : '12-Hour (AM/PM)'}
        </button>

        <button
          type="button"
          onClick={() => setShowSeconds(!showSeconds)}
          className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all border cursor-pointer ${
            showSeconds
              ? 'bg-slate-200 dark:bg-white/15 border-slate-300 dark:border-white/20 text-slate-800 dark:text-slate-100'
              : 'bg-transparent border-slate-300 dark:border-white/10 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          {showSeconds ? 'Seconds: On' : 'Seconds: Off'}
        </button>
      </div>
    </div>
  );
};
