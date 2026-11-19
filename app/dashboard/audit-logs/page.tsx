"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

interface AuditLogRecord {
  _id: string;
  action: string;
  module: string;
  details: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export default function AuditLogsPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ logs: AuditLogRecord[] }>("/api/audit-logs");
      setLogs(data.logs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchLogs();
    };
    load();
  }, [fetchLogs]);

  if (user && user.role !== "admin") {
    return (
      <div className="p-8 text-center text-(--text-muted)">
        You do not have permission to view this page.
      </div>
    );
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6 max-w-350 mx-auto">
      
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-bold text-(--text-primary) tracking-tight">Audit Logs</h1>
        <p className="text-[14px] text-(--text-secondary) mt-1">Track all activities across the system</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[14px]">
          {error}
        </div>
      )}

      {/* Table Card */}
      <div className="erp-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-(--border) bg-(--surface-subtle)">
                <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider">Action</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider">Module</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border)">
              
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-(--text-muted)">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-(--brand-600) border-t-transparent rounded-full animate-spin"></div>
                      Loading logs...
                    </div>
                  </td>
                </tr>
              )}

              {!loading && logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-[14px] text-(--text-secondary)">No activity logs found.</p>
                    <p className="text-[13px] text-(--text-muted) mt-1">Actions will be logged here automatically.</p>
                  </td>
                </tr>
              )}

              {!loading && logs.map((log) => (
                <tr key={log._id} className="hover:bg-(--surface-subtle) transition-colors">
                  <td className="px-6 py-4 text-[13px] text-(--text-secondary) whitespace-nowrap">{formatDateTime(log.createdAt)}</td>
                  <td className="px-6 py-4">
                    <p className="text-[13px] font-medium text-(--text-primary)">{log.user?.name}</p>
                    <p className="text-[11px] text-(--text-muted)">{log.user?.role}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase tracking-wide border ${
                      log.action === "CREATE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      log.action === "UPDATE" ? "bg-blue-50 text-blue-700 border-blue-200" :
                      log.action === "DELETE" ? "bg-red-50 text-red-700 border-red-200" :
                      "bg-slate-100 text-slate-700 border-slate-300"
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[13px] font-medium text-(--text-primary)">{log.module}</td>
                  <td className="px-6 py-4 text-[13px] text-(--text-secondary)">{log.details}</td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}