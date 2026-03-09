import { useState, useRef, useEffect } from 'react';
import { toISO, fmtDate } from '../utils/dates';

function today()   { return toISO(new Date()); }
function daysAgo(n){ const d = new Date(); d.setDate(d.getDate() - n); return toISO(d); }

const PRESETS = [
  { label: 'Today',       start: () => today(),    end: () => today()    },
  { label: 'Last 7 days', start: () => daysAgo(6), end: () => today()    },
  { label: 'Last 30 days',start: () => daysAgo(29),end: () => today()    },
];

export default function DateRangePicker({ start, end, onChange }) {
  const [open,       setOpen]       = useState(false);
  const [customStart,setCustomStart] = useState(start);
  const [customEnd,  setCustomEnd]   = useState(end);
  const [activePreset, setActivePreset] = useState('Last 7 days');
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handle(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  function applyPreset(preset) {
    const s = preset.start();
    const e = preset.end();
    setCustomStart(s);
    setCustomEnd(e);
    setActivePreset(preset.label);
    onChange(s, e);
    setOpen(false);
  }

  function applyCustom() {
    if (!customStart || !customEnd || customStart > customEnd) return;
    setActivePreset('');
    onChange(customStart, customEnd);
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative text-right">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Date Window</p>
      <button
        onClick={() => setOpen(o => !o)}
        className="text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-200 rounded-md px-3 py-1.5 inline-flex items-center gap-2 hover:bg-gray-200 transition-colors"
      >
        {fmtDate(start)} – {fmtDate(end)}
        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {/* Presets */}
          <div className="p-2 border-b border-gray-100">
            {PRESETS.map(p => (
              <button
                key={p.label}
                onClick={() => applyPreset(p)}
                className={`w-full text-left text-sm px-3 py-2 rounded-md transition-colors ${
                  activePreset === p.label
                    ? 'bg-gray-900 text-white font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom range */}
          <div className="p-3">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Custom Range</p>
            <div className="flex flex-col gap-2">
              <input
                type="date"
                value={customStart}
                max={customEnd || today()}
                onChange={e => { setCustomStart(e.target.value); setActivePreset(''); }}
                className="text-sm border border-gray-200 rounded-md px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400 w-full"
              />
              <input
                type="date"
                value={customEnd}
                min={customStart}
                max={today()}
                onChange={e => { setCustomEnd(e.target.value); setActivePreset(''); }}
                className="text-sm border border-gray-200 rounded-md px-2 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400 w-full"
              />
              <button
                onClick={applyCustom}
                disabled={!customStart || !customEnd || customStart > customEnd}
                className="w-full text-sm font-medium bg-gray-900 text-white py-1.5 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
