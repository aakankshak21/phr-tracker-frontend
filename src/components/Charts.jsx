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

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <p className="text-sm font-semibold text-gray-900 mb-0.5">{title}</p>
      <p className="text-xs text-gray-400 mb-4">{subtitle}</p>
      {children}
    </div>
  );
}

export function StatusChart({ data }) {
  return (
    <ChartCard title="Message Status" subtitle="Last 7 days delivery performance">
      {data.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">No activity in this date range</p>
      ) : (
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
      )}
    </ChartCard>
  );
}

export function PipelineChart({ data }) {
  return (
    <ChartCard title="Users by Pipeline" subtitle="Lead segmentation overview">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
          <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="pipeline" tick={{ fontSize: 11 }} width={80} axisLine={false} tickLine={false} />
          <Tooltip content={<CleanTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
          <Bar dataKey="count" fill="#64748b" radius={[0, 4, 4, 0]} barSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function FailureChart({ data }) {
  return (
    <ChartCard title="Failure Reasons" subtitle="Message delivery issues">
      {data.length === 0 ? (
        <p className="text-sm text-gray-400 py-8 text-center">No failures in this date range</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
            <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="reason" tick={{ fontSize: 11 }} width={140} axisLine={false} tickLine={false} />
            <Tooltip content={<CleanTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
            <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
