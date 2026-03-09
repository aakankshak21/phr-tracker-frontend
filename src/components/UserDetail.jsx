import { useEffect, useState } from 'react';
import { fetchUserDetail } from '../api';
import Badge from './Badge';
import { fmtDate } from '../utils/dates';

function Row({ label, value }) {
  return (
    <div className="mb-3">
      <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value || '—'}</p>
    </div>
  );
}

export default function UserDetail({ userId, onClose }) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchUserDetail(userId)
      .then(setData)
      .finally(() => setLoading(false));
  }, [userId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-[720px] max-h-[85vh] bg-white rounded-xl shadow-2xl overflow-y-auto flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Header — sticky */}
        <div className="sticky top-0 z-10 bg-white flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="text-sm font-semibold text-gray-900">{data?.info?.name ?? '…'}</p>
            <p className="text-xs text-gray-400">User Detail</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">✕</button>
        </div>

        {loading && <p className="p-6 text-sm text-gray-400">Loading…</p>}

        {!loading && data?.info && (
          <>
            {/* Info */}
            <div className="px-6 py-5 border-b border-gray-100">
              <Row label="Name"           value={data.info.name} />
              <Row label="Phone"          value={data.info.phone} />
              <Row label="Email"          value={data.info.email} />
              <Row label="Pipeline"       value={data.info.pipeline} />
              <Row label="Mobile Status"  value={data.info.mobile_status} />
              <Row label="Email Validity" value={data.info.email_validity} />
              <Row label="Created At"     value={data.info.created_at?.slice(0, 10)} />
            </div>

            {/* PHR History */}
            <div className="px-6 py-4">
              <p className="text-sm font-semibold text-gray-900 mb-1">PHR History</p>
              <p className="text-xs text-gray-400 mb-4">Last 30 records</p>

              {data.history.length === 0 ? (
                <p className="text-sm text-gray-400">No history found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs min-w-[400px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {['Date','Service','Status','Reason','Props'].map(h => (
                          <th key={h} className="px-3 py-2 text-left font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.history.map((r, i) => (
                        <tr key={i} className={`border-b border-gray-50 ${i % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
                          <td className="px-3 py-2 text-gray-600">{fmtDate(r.phr_sent_date)}</td>
                          <td className="px-3 py-2 text-gray-600">{r.phr_service}</td>
                          <td className="px-3 py-2"><Badge status={r.status} /></td>
                          <td className="px-3 py-2 text-gray-400">{r.failure_reason}</td>
                          <td className="px-3 py-2 text-gray-600">{r.properties_sent_count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
