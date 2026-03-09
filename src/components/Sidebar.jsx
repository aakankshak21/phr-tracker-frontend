import { useState, useEffect } from 'react';
import { fetchUserList } from '../api';

export default function Sidebar({ onSelectUser }) {
  const [users, setUsers]   = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUserList().then(setUsers);
  }, []);

  const filtered = search.length >= 2
    ? users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()))
    : users;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-gray-100">
        <p className="text-base font-bold text-gray-900">⬡ PHR Intelligence</p>
        <p className="text-xs text-gray-400 mt-0.5">Real Estate Platform</p>
      </div>

      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">User Lookup</p>
        <input
          type="text"
          placeholder="Search users…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
        />
      </div>

      <div className="overflow-y-auto flex-1 py-1">
        {filtered.map(u => (
          <button
            key={u.id}
            onClick={() => onSelectUser(u.id)}
            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition-colors border-b border-gray-50"
          >
            <p className="text-sm font-medium text-gray-800 truncate">{u.name}</p>
            <p className="text-xs text-gray-400 truncate">{u.pipeline}</p>
          </button>
        ))}
      </div>
    </aside>
  );
}
