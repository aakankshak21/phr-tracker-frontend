export function getDateWindow(weekOffset = 0) {
  const end   = new Date();
  end.setDate(end.getDate() - weekOffset * 7);
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  return {
    start: toISO(start),
    end:   toISO(end),
  };
}

export function toISO(d) {
  return d.toISOString().split('T')[0];
}

export function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
}
