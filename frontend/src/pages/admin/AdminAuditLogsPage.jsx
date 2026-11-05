import React, { useState, useEffect } from 'react';
import { History, Shield, Clock } from 'lucide-react';
import { adminAPI } from '../../services/api';

export const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getAuditLogs();
        if (res.success) {
          setLogs(res.logs || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="pb-4 border-b border-slate-200/80 dark:border-dark-border">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          System Audit Trail & Security Logs
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Immutable records of user status updates, job moderation, and system activities
        </p>
      </div>

      <div className="rounded-3xl bg-white dark:bg-dark-card border border-slate-200/80 dark:border-dark-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading audit records...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No audit logs recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-dark-surface/60 border-b border-slate-200 dark:border-dark-border text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Action</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Target Type</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                {logs.map(log => (
                  <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-dark-surface/30 transition-colors">
                    <td className="p-4">
                      <span className="font-mono text-[11px] font-bold text-brand-600 dark:text-brand-400">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-900 dark:text-white">{log.actorId?.name || 'System'}</p>
                      <p className="text-[10px] text-slate-500">{log.actorId?.email}</p>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-dark-surface">
                        {log.targetType}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {JSON.stringify(log.details)}
                    </td>
                    <td className="p-4 text-slate-400 text-[11px]">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
