const configs = {
  sent:    'bg-emerald-100 text-emerald-800',
  failed:  'bg-red-100 text-red-800',
  skipped: 'bg-gray-100 text-gray-600',
};

export default function Badge({ status }) {
  if (!status || status === '—') {
    return <span className="text-gray-400 text-xs">—</span>;
  }
  const cls = configs[status.toLowerCase()] ?? 'bg-gray-100 text-gray-500';
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide ${cls}`}>
      {status}
    </span>
  );
}
