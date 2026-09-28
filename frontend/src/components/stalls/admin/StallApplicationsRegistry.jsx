import React, { useState } from 'react';
import { ClipboardCheck, Search, Filter, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function StallApplicationsRegistry({ stallApps = [], onReviewStall }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const pendingCount = stallApps.filter((a) => a.status === 'pending').length;
  const approvedCount = stallApps.filter((a) => a.status === 'approved').length;
  const rejectedCount = stallApps.filter((a) => a.status === 'rejected').length;

  const filteredApps = stallApps.filter((app) => {
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      app.stall_id?.toLowerCase().includes(query) ||
      app.applicant_name?.toLowerCase().includes(query) ||
      app.applicant_email?.toLowerCase().includes(query) ||
      app.item_name?.toLowerCase().includes(query) ||
      app.description?.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="bg-white border-2 border-[#121217] rounded-3xl p-5 sm:p-7 fest-shadow space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-2 border-stone-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-2xl bg-[#FFD43B] text-black fest-shadow-sm shrink-0">
            <ClipboardCheck className="w-6 h-6" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-black text-xl sm:text-2xl text-[#121217]">
                Stall Applications Registry ({stallApps.length})
              </h3>
              {pendingCount > 0 && (
                <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-black px-2.5 py-0.5 rounded-full animate-pulse">
                  {pendingCount} Pending
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm font-semibold text-stone-500">
              Review student applications, verify menu or game details, and approve lot allocations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-500 bg-stone-100 px-3 py-1.5 rounded-xl border border-stone-200">
            Approved: <strong className="text-emerald-700">{approvedCount}</strong> · Rejected: <strong className="text-rose-700">{rejectedCount}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-200">
        
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
          <span className="text-stone-400 uppercase tracking-wider text-[11px] mr-1">Filter:</span>
          {[
            { id: 'all', label: `All (${stallApps.length})` },
            { id: 'pending', label: `Pending (${pendingCount})` },
            { id: 'approved', label: `Approved (${approvedCount})` },
            { id: 'rejected', label: `Rejected (${rejectedCount})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#121217] text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <input
            type="text"
            placeholder="Search by ID, applicant, item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#121217]"
          />
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border-2 border-[#121217]">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-stone-100 border-b-2 border-[#121217] font-black uppercase text-stone-600">
              <th className="py-3 px-4">Stall ID</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Applicant &amp; Phone</th>
              <th className="py-3 px-4">Product / Game Item</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 font-semibold bg-white">
            {filteredApps.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-stone-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <ClipboardCheck className="w-8 h-8 text-stone-300" />
                    <p className="font-bold text-sm text-stone-600">No applications match your criteria</p>
                    <p className="text-xs text-stone-400">Try changing status filter or clearing search keyword</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-stone-50 transition-colors">
                  <td className="py-3.5 px-4 font-black font-display text-sm text-[#121217]">
                    {app.stall_id}
                  </td>
                  <td className="py-3.5 px-4 uppercase text-[10px] font-black">
                    <span
                      className={`px-2 py-0.5 rounded font-black ${
                        app.type === 'food'
                          ? 'bg-orange-100 text-[#FF7A00]'
                          : 'bg-purple-100 text-[#8E44FF]'
                      }`}
                    >
                      {app.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-[#121217]">{app.applicant_name}</p>
                    <p className="text-stone-400 text-[11px]">
                      {app.applicant_email} {app.applicant_phone ? `· ${app.applicant_phone}` : ''}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <p className="font-bold text-stone-800">{app.item_name}</p>
                    {app.description && (
                      <p className="text-stone-500 text-[11px] line-clamp-1">{app.description}</p>
                    )}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-stone-800">
                    {app.price ? app.price : '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-black uppercase text-[10px] inline-flex items-center gap-1 ${
                        app.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {app.status === 'approved' && <CheckCircle2 className="w-3 h-3" />}
                      {app.status === 'rejected' && <XCircle className="w-3 h-3" />}
                      {app.status === 'pending' && <Clock className="w-3 h-3" />}
                      {app.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                    {app.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => onReviewStall(app.id, 'approve')}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg font-black text-xs transition-colors cursor-pointer"
                        >
                          ACCEPT
                        </button>
                        <button
                          onClick={() => onReviewStall(app.id, 'reject')}
                          className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded-lg font-black text-xs transition-colors cursor-pointer"
                        >
                          REJECT
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] font-bold text-stone-400 capitalize">
                        {app.status}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
