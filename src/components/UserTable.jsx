import { useState, useMemo, useEffect } from 'react';
import Badge from './Badge';
import { fmtDate } from '../utils/dates';

const PAGE_SIZE = 50;

function exportCSV(rows, startDate, endDate) {
  const headers = ['Name', 'Phone', 'Email', 'Pipeline', 'Last PHR Sent', 'PHR in 7D', 'Last Status', 'Failure Reason'];
  const lines = rows.map(r => [
    r.name, r.phone, r.email, r.pipeline,
    r.last_phr_sent_date ?? '—',
    r.phr_in_last_7_days ? 'Yes' : 'No',
    r.last_status, r.failure_reason,
  ].map(v => `"${v}"`).join(','));
  const csv  = [headers.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `phr_report_${startDate}_${endDate}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function UserTable({ data, startDate, endDate, onNameClick }) {
  const [pipeline, setPipeline]     = useState('All');
  const [status, setStatus]         = useState('All');
  const [search, setSearch]         = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage]             = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const pipelines = useMemo(() => ['All', ...new Set(data.map(r => r.pipeline))].sort(), [data]);
  const statuses  = useMemo(() => {
    const vals = [...new Set(data.map(r => r.last_status).filter(s => s !== '—'))].sort();
    return ['All', ...vals];
  }, [data]);

  const filtered = useMemo(() => {
    let rows = data;
    if (pipeline !== 'All') rows = rows.filter(r => r.pipeline === pipeline);
    if (status !== 'All')   rows = rows.filter(r => r.last_status === status);
    if (debouncedSearch.length >= 3) {
      const q = debouncedSearch.toLowerCase();
      rows = rows.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [data, pipeline, status, debouncedSearch]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const pageRows   = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPage(1);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const rowFrom = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rowTo   = Math.min(safePage * PAGE_SIZE, filtered.length);

  // Page pills (max 5 visible)
  const pagePills = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const half = 2;
    if (safePage <= half + 1) return [1, 2, 3, 4, 5];
    if (safePage >= totalPages - half) return Array.from({ length: 5 }, (_, i) => totalPages - 4 + i);
    return [safePage - 2, safePage - 1, safePage, safePage + 1, safePage + 2];
  }, [totalPages, safePage]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Filters toolbar */}
      <div className="flex flex-wrap items-end gap-3 p-4 border-b border-gray-100">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Pipeline</label>
          <select
            value={pipeline}
            onChange={handleFilterChange(setPipeline)}
            className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
          >
            {pipelines.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</label>
          <select
            value={status}
            onChange={handleFilterChange(setStatus)}
            className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400"
          >
            {statuses.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Search</label>
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Name, phone or email (min 3 chars)…"
            className="text-sm border border-gray-200 rounded-md px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </div>
        <button
          onClick={() => exportCSV(filtered, startDate, endDate)}
          className="ml-auto text-sm font-medium bg-gray-900 text-white px-4 py-1.5 rounded-md hover:bg-gray-700 transition-colors"
        >
          ⬇ Export CSV
        </button>
      </div>

      {/* Row count */}
      <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
        Showing <span className="font-semibold text-gray-700">{rowFrom}–{rowTo}</span> of{' '}
        <span className="font-semibold text-gray-700">{filtered.length}</span> users
      </div>

      {/* Table */}
      <div className="overflow-x-auto" style={{ height: 600, overflowY: 'auto' }}>
        <table className="w-full text-sm min-w-[800px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-50 border-b-2 border-gray-200">
              {['Name','Phone','Email','Pipeline','Last PHR Sent','PHR in 7D','Last Status','Failure Reason'].map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r, i) => (
              <tr
                key={r.id}
                className={`border-b border-gray-50 hover:bg-blue-50 cursor-pointer transition-colors ${i % 2 === 1 ? 'bg-gray-50/50' : 'bg-white'}`}
              >
                <td className="px-4 py-2.5 whitespace-nowrap">
                  <button
                    onClick={() => onNameClick?.(r.id)}
                    className="font-medium text-indigo-600 hover:text-indigo-900 hover:underline text-left"
                  >
                    {r.name}
                  </button>
                </td>
                <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">{r.phone}</td>
                <td className="px-4 py-2.5 text-gray-600 whitespace-nowrap">{r.email}</td>
                <td className="px-4 py-2.5 whitespace-nowrap">
                  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">{r.pipeline}</span>
                </td>
                <td className="px-4 py-2.5 text-gray-500 whitespace-nowrap">{fmtDate(r.last_phr_sent_date)}</td>
                <td className="px-4 py-2.5 whitespace-nowrap">
                  {r.phr_in_last_7_days
                    ? <span className="text-emerald-600 font-semibold text-xs">● Yes</span>
                    : <span className="text-gray-400 text-xs">○ No</span>}
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap"><Badge status={r.last_status} /></td>
                <td className="px-4 py-2.5 text-gray-400 text-xs whitespace-nowrap">{r.failure_reason}</td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr><td colSpan={8} className="text-center py-10 text-gray-400 text-sm">No users match the current filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 px-4 py-3 border-t border-gray-100">
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={safePage <= 1}
            className="text-xs font-medium px-3 py-1.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ‹ Prev
          </button>
          {pagePills.map(pg => (
            <button
              key={pg}
              onClick={() => setPage(pg)}
              className={`text-xs font-medium w-8 h-8 rounded border transition-colors ${
                pg === safePage
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {pg}
            </button>
          ))}
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={safePage >= totalPages}
            className="text-xs font-medium px-3 py-1.5 rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next ›
          </button>
        </div>
      )}
    </div>
  );
}
