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

const INSIGHT_META = {
  performance:    { icon: '🟢', className: 'text-gray-600' },
  anomaly:        { icon: '⚠',  className: 'text-amber-600' },
  recommendation: { icon: '💡', className: 'text-gray-600' },
};

function Insights({ points }) {
  if (!points?.length) return null;
  return (
    <div className="mt-4 pt-3 border-t border-gray-100">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Insights</p>
      <ul className="space-y-2">
        {points.map((p, i) => {
          const meta = INSIGHT_META[p.type] ?? { icon: '›', className: 'text-gray-500' };
          return (
            <li key={i} className="flex gap-2 text-xs leading-relaxed">
              <span className="shrink-0">{meta.icon}</span>
              <span className={meta.className}>{p.text}</span>
            </li>
          );
        })}
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
  const total     = data.reduce((s, r) => s + r.count, 0);
  if (!total) return [];
  const sent      = data.find(r => r.status === 'sent')?.count    ?? 0;
  const failed    = data.find(r => r.status === 'failed')?.count  ?? 0;
  const skipped   = data.find(r => r.status === 'skipped')?.count ?? 0;
  const sentPct   = Math.round((sent    / total) * 100);
  const failedPct = Math.round((failed  / total) * 100);
  const skippedPct= Math.round((skipped / total) * 100);

  const perf = sentPct >= 85
    ? { type: 'performance', text: 'Delivery performance is healthy — messages are consistently reaching recipients.' }
    : sentPct >= 60
    ? { type: 'performance', text: 'Delivery performance is moderate — a notable portion of messages are not getting through.' }
    : { type: 'performance', text: 'Delivery performance is poor — the majority of outreach is not reaching users.' };

  const anomaly = failedPct >= 30
    ? { type: 'anomaly', text: 'Failure rate is critically high, suggesting a systemic issue rather than isolated incidents.' }
    : skippedPct >= 20
    ? { type: 'anomaly', text: 'A large share of messages were skipped — users may have eligibility gaps or opt-out conditions.' }
    : { type: 'anomaly', text: 'No severe anomalies detected, but continued monitoring will help catch early degradation.' };

  const rec = failedPct >= 20
    ? { type: 'recommendation', text: 'Investigate failure reasons and retry eligible messages to recover lost delivery opportunities.' }
    : skippedPct >= 20
    ? { type: 'recommendation', text: 'Audit user eligibility criteria and opt-in status to reduce unnecessary skips.' }
    : { type: 'recommendation', text: 'Maintain current delivery practices and set alerts for any sudden drop in success rate.' };

  return [perf, anomaly, rec];
}

function pipelineInsights(data) {
  if (!data.length) return [];
  const total  = data.reduce((s, r) => s + r.count, 0);
  const top    = data[0];
  const bottom = data[data.length - 1];
  const topPct = Math.round((top.count / total) * 100);

  const perf = data.length === 1
    ? { type: 'performance', text: 'All users belong to a single pipeline — segmentation is uniform but leaves no room for targeted variation.' }
    : topPct <= 50
    ? { type: 'performance', text: 'User distribution across pipelines is balanced — outreach risk is spread evenly across segments.' }
    : { type: 'performance', text: 'Pipeline coverage is uneven — one segment drives most activity while others contribute little.' };

  const anomaly = topPct >= 70
    ? { type: 'anomaly', text: 'Heavy concentration in one pipeline creates dependency risk — a drop in that segment will impact overall metrics.' }
    : data.length > 2 && bottom.count < total * 0.05
    ? { type: 'anomaly', text: 'Some pipelines have very low user counts — they may be stale, miscategorized, or inactive.' }
    : { type: 'anomaly', text: 'Pipeline distribution appears within normal range — no unusual concentration detected.' };

  const rec = topPct >= 70
    ? { type: 'recommendation', text: 'Expand outreach into underrepresented pipelines to reduce over-reliance on a single segment.' }
    : data.length > 2 && bottom.count < total * 0.05
    ? { type: 'recommendation', text: 'Review low-volume pipelines and consider consolidating or re-activating them with targeted campaigns.' }
    : { type: 'recommendation', text: 'Keep pipeline segments current as leads progress to ensure messaging stays relevant and well-targeted.' };

  return [perf, anomaly, rec];
}

function failureInsights(data) {
  if (!data.length) return [];
  const total  = data.reduce((s, r) => s + r.count, 0);
  const top    = data[0];
  const topPct = Math.round((top.count / total) * 100);

  const perf = data.length === 1
    ? { type: 'performance', text: 'All failures share a single root cause — this is easier to resolve than scattered multi-cause failures.' }
    : { type: 'performance', text: `Failures are distributed across ${data.length} reasons — delivery issues appear to be multi-faceted and may require multiple fixes.` };

  const anomaly = topPct >= 70
    ? { type: 'anomaly', text: 'One failure reason is responsible for most delivery issues — this concentrated pattern indicates a specific, fixable problem.' }
    : { type: 'anomaly', text: 'No single failure reason dominates — issues may stem from varied user conditions or inconsistent system behaviour.' };

  const rec = topPct >= 70
    ? { type: 'recommendation', text: `Prioritise the top failure reason — resolving it alone is likely to produce the most significant improvement in delivery rate.` }
    : { type: 'recommendation', text: 'Work through failure reasons by frequency — tackling the highest-volume issues first will yield the fastest recovery.' };

  return [perf, anomaly, rec];
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
