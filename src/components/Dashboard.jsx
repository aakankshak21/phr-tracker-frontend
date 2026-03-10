import { useState, useEffect } from 'react';
import KpiCard         from './KpiCard';
import DateRangePicker from './DateRangePicker';
import { StatusChart, PipelineChart, FailureChart } from './Charts';
import UserTable       from './UserTable';
import UserDetail      from './UserDetail';
import { toISO } from '../utils/dates';
import {
  fetchKPIs, fetchStatusChart, fetchPipelineChart,
  fetchFailureChart, fetchUsers,
} from '../api';

function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return toISO(d); }

function getRangeLabel(start, end) {
  const today = toISO(new Date());
  if (start === end && start === today) return 'Today';
  const days = Math.round((new Date(end) - new Date(start)) / 86400000) + 1;
  if (days === 7)  return '7D';
  if (days === 30) return '30D';
  return `${days}D`;
}

export default function Dashboard() {
  const [start,         setStart]         = useState(() => daysAgo(6));
  const [end,           setEnd]           = useState(() => toISO(new Date()));
  const [selectedUserId,setSelectedUserId] = useState(null);
  const [kpis,          setKpis]          = useState(null);
  const [statusData,    setStatusData]    = useState([]);
  const [pipeData,      setPipeData]      = useState([]);
  const [failData,      setFailData]      = useState([]);
  const [users,         setUsers]         = useState([]);
  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchKPIs(start, end),
      fetchStatusChart(start, end),
      fetchPipelineChart(),
      fetchFailureChart(start, end),
      fetchUsers(start),
    ]).then(([kpi, status, pipe, fail, users]) => {
      setKpis(kpi);
      setStatusData(status);
      setPipeData(pipe);
      setFailData(fail);
      setUsers(users);
    }).finally(() => setLoading(false));
  }, [start, end]);

  const rangeLabel = getRangeLabel(start, end);

  const kpiCards = kpis ? (() => {
    const srDelta  = (parseFloat(kpis.successRate) - parseFloat(kpis.prevSuccessRate)).toFixed(1);
    const fmDelta  = kpis.failedMessages - kpis.prevFailedMessages;
    return [
      { label: 'Total Users',                     value: kpis.totalUsers,        accent: '#6366f1' },
      { label: 'Scheduled Today',                 value: kpis.scheduledToday,    accent: '#0ea5e9' },
      { label: `Success Rate (${rangeLabel})`,    value: `${kpis.successRate}%`, accent: '#10b981',
        trend: { positive: parseFloat(srDelta) >= 0, label: `${srDelta > 0 ? '+' : ''}${srDelta}pp` } },
      { label: `Failed Messages (${rangeLabel})`, value: kpis.failedMessages,    accent: '#ef4444',
        trend: { positive: fmDelta <= 0, label: `${fmDelta > 0 ? '+' : ''}${fmDelta}` } },
    ];
  })() : [];

  return (
    <main className="flex-1 p-6 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg px-6 py-5 mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">PHR Intelligence Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Personalized Home Recommendation · Live Monitor</p>
        </div>
        <DateRangePicker
          start={start}
          end={end}
          onChange={(s, e) => { setStart(s); setEnd(e); }}
        />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-5 h-24 animate-pulse bg-gray-100" />
            ))
          : kpiCards.map(c => <KpiCard key={c.label} {...c} />)
        }
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg p-5 h-72 animate-pulse" />
          ))
        ) : (
          <>
            <StatusChart   data={statusData} />
            <PipelineChart data={pipeData}   />
            <FailureChart  data={failData}   />
          </>
        )}
      </div>

      {/* User Activity */}
      <div className="mb-2">
        <p className="text-lg font-semibold text-gray-900">User Activity</p>
        <p className="text-sm text-gray-400 mt-0.5">All users with PHR delivery status</p>
      </div>

      {loading ? (
        <div className="bg-white border border-gray-200 rounded-lg h-64 animate-pulse mt-3" />
      ) : (
        <UserTable data={users} startDate={start} endDate={end} onNameClick={setSelectedUserId} />
      )}

      {selectedUserId && (
        <UserDetail userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </main>
  );
}
