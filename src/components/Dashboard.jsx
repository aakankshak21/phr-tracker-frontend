import { useState, useEffect } from 'react';
import KpiCard     from './KpiCard';
import DateNav     from './DateNav';
import { StatusChart, PipelineChart, FailureChart } from './Charts';
import UserTable   from './UserTable';
import UserDetail  from './UserDetail';
import { getDateWindow, fmtDate } from '../utils/dates';
import {
  fetchKPIs, fetchStatusChart, fetchPipelineChart,
  fetchFailureChart, fetchUsers,
} from '../api';

export default function Dashboard() {
  const [weekOffset,     setWeekOffset]     = useState(0);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [kpis,       setKpis]       = useState(null);
  const [statusData, setStatusData] = useState([]);
  const [pipeData,   setPipeData]   = useState([]);
  const [failData,   setFailData]   = useState([]);
  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);

  const { start, end } = getDateWindow(weekOffset);

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
  }, [weekOffset]);

  const kpiCards = kpis ? [
    { label: 'Total Users',          value: kpis.totalUsers,      accent: '#6366f1' },
    { label: 'Scheduled Today',      value: kpis.scheduledToday,  accent: '#0ea5e9' },
    { label: 'Success Rate (7D)',     value: kpis.successRate != null ? `${kpis.successRate}%` : 'N/A', accent: '#10b981' },
    { label: 'Failed Messages (7D)', value: kpis.failedMessages,  accent: '#ef4444' },
  ] : [];

  return (
    <main className="flex-1 p-6 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg px-6 py-5 mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">PHR Intelligence Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Personalized Home Recommendation · Live Monitor</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Date Window</p>
          <span className="text-sm font-semibold text-gray-700 bg-gray-100 border border-gray-200 rounded-md px-3 py-1 inline-block">
            {fmtDate(start)} – {fmtDate(end)}
          </span>
        </div>
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

      {/* Date navigation */}
      <div className="mb-5">
        <DateNav
          startDate={start}
          endDate={end}
          weekOffset={weekOffset}
          onPrev={() => setWeekOffset(w => w + 1)}
          onNext={() => setWeekOffset(w => w - 1)}
        />
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
