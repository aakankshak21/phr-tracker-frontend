export default function KpiCard({ label, value, accent }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 flex flex-col gap-2">
      <div className="w-8 h-0.5 rounded-full" style={{ background: accent }} />
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest">{label}</p>
      <p className="text-3xl font-semibold text-gray-900 leading-none">{value ?? '—'}</p>
    </div>
  );
}
