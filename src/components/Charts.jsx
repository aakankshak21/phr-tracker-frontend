import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';

const STATUS_COLORS = { sent: '#10b981', failed: '#ef4444', skipped: '#9ca3af' };

function CleanTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const item  = payload[0];
  const name  = label ?? item.name ?? item.payload?.status ?? item.payload?.pipeline ?? item.payload?.reason ?? '';
  const value = item.value;
  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: 6,
      padding: '6px 12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      fontSize: 12,
      color: '#111827',
      lineHeight: 1.6,
      pointerEvents: 'none',
    }}>
      {name && <p style={{ color: '#6b7280', marginBottom: 2, textTransform: 'capitalize' }}>{name}</p>}
      <p style={{ fontWeight: 600, color: '#111827' }}>{value.toLocaleString()}</p>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center h-[220px] gap-2">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}

function Insights({ points }) {
  if (!points?.length) return null;
  return (
    <div className="mt-4 pt-3 border-t border-gray-100">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Insights</p>
      <ul className="space-y-1.5">
        {points.map((p, i) => (
          <li key={i} className="flex gap-1.5 text-xs text-gray-500 leading-relaxed">
            <span className="text-gray-300 shrink-0 mt-px">›</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <p className="text-sm font-semibold text-gray-900 mb-0.5">{title}</p>
      <p className="text-xs text-gray-400 mb-4">{subtitle}</p>
      {children}
    </div>
  );
}

// ── Insight generators ────────────────────────────────────────────────────────

function statusInsights(data) {
  const total   = data.reduce((s, r) => s + r.count, 0);
  if (!total) return [];
  const sent    = data.find(r => r.status === 'sent')?.count    ?? 0;
  const failed  = data.find(r => r.status === 'failed')?.count  ?? 0;
  const skipped = data.find(r => r.status === 'skipped')?.count ?? 0;
  const sentPct   = Math.round((sent   / total) * 100);
  const failedPct = Math.round((failed / total) * 100);
  const points = [];

  if (sentPct >= 80)      points.push(`Strong delivery — ${sentPct}% of messages sent successfully.`);
  else if (sentPct >= 50) points.push(`Moderate delivery rate at ${sentPct}%. Room for improvement.`);
  else                    points.push(`Low delivery rate — only ${sentPct}% sent. Review failure reasons.`);

  if (failedPct >= 20)    points.push(`High failure rate at ${failedPct}% — delivery issues need attention.`);
  else if (failed > 0)    points.push(`${failed} message${failed > 1 ? 's' : ''} failed (${failedPct}% of total).`);

  if (skipped > 0)        points.push(`${skipped} message${skipped > 1 ? 's' : ''} skipped this period.`);

  return points;
}

function pipelineInsights(data) {
  if (!data.length) return [];
  const total  = data.reduce((s, r) => s + r.count, 0);
  const top    = data[0];
  const topPct = Math.round((top.count / total) * 100);
  const points = [];

  points.push(`"${top.pipeline}" leads with ${top.count} users (${topPct}% of total).`);

  if (data.length > 1) {
    const second = data[1];
    const gap    = top.count - second.count;
    points.push(`"${second.pipeline}" is second with ${second.count} users — ${gap} behind the top segment.`);
  }

  if (topPct >= 60) points.push(`Heavy concentration in one segment — consider diversifying pipeline coverage.`);

  return points.slice(0, 2);
}

function failureInsights(data) {
  if (!data.length) return [];
  const total  = data.reduce((s, r) => s + r.count, 0);
  const top    = data[0];
  const topPct = Math.round((top.count / total) * 100);
  const points = [];

  points.push(`Top failure: "${top.reason}" — ${top.count} occurrences (${topPct}% of failures).`);

  if (topPct >= 70) points.push(`Resolving this single issue could fix most delivery failures.`);
  else if (data.length > 1) points.push(`${data.length} distinct failure reasons detected this period.`);

  return points;
}

// ── Charts ────────────────────────────────────────────────────────────────────

export function StatusChart({ data }) {
  return (
    <ChartCard title="Message Status" subtitle="Last 7 days delivery performance">
      {data.length === 0 ? (
        <EmptyState message="No activity in this date range" />
      ) : (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((entry) => (
                  <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? '#6b7280'} />
                ))}
              </Pie>
              <Tooltip content={<CleanTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <Insights points={statusInsights(data)} />
        </>
      )}
    </ChartCard>
  );
}

export function PipelineChart({ data }) {
  return (
    <ChartCard title="Users by Pipeline" subtitle="Lead segmentation overview">
      {data.length === 0 ? (
        <EmptyState message="No pipeline data available" />
      ) : (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
              <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="pipeline" tick={{ fontSize: 11 }} width={80} axisLine={false} tickLine={false} />
              <Tooltip content={<CleanTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Bar dataKey="count" fill="#64748b" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
          <Insights points={pipelineInsights(data)} />
        </>
      )}
    </ChartCard>
  );
}

export function FailureChart({ data }) {
  return (
    <ChartCard title="Failure Reasons" subtitle="Message delivery issues">
      {data.length === 0 ? (
        <EmptyState message="No failures in this date range" />
      ) : (
        <>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
              <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="reason" tick={{ fontSize: 11 }} width={140} axisLine={false} tickLine={false} />
              <Tooltip content={<CleanTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
          <Insights points={failureInsights(data)} />
        </>
      )}
    </ChartCard>
  );
}
