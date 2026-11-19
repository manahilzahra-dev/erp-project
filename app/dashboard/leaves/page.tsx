"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import LeaveForm from "@/components/leaves/LeaveForm";

interface LeaveRecord {
  _id: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  totalDays: number;
  employeeId: {
    _id: string;
    firstName: string;
    lastName: string;
    employeeId: string;
    designation: string;
  };
}

export default function LeavesPage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [viewLeave, setViewLeave] = useState<LeaveRecord | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<{ leaves: LeaveRecord[] }>("/api/leaves");
      setLeaves(data.leaves || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leaves");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      await fetchLeaves();
    };
    load();
  }, [fetchLeaves]);

  const handleStatusChange = async (id: string, status: "approved" | "rejected") => {
    setUpdatingId(id);
    try {
      await api.put(`/api/leaves/${id}`, { status });
      fetchLeaves();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  if (user && !["admin", "hr", "management"].includes(user.role)) {
    return (
      <div className="p-8 text-center text-(--text-muted)">
        You do not have permission to view this page.
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 max-w-350 mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-(--text-primary) tracking-tight">Leaves</h1>
          <p className="text-[14px] text-(--text-secondary) mt-1">Manage employee leave requests</p>
        </div>
        
        {user && ["admin", "hr"].includes(user.role) && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-(--brand-600) hover:bg-(--brand-700) text-white text-[14px] font-medium rounded-lg transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Apply Leave
          </button>
        )}
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
                <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider">Days</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--border)">
              
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-(--text-muted)">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-(--brand-600) border-t-transparent rounded-full animate-spin"></div>
                      Loading leaves...
                    </div>
                  </td>
                </tr>
              )}

              {!loading && leaves.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-[14px] text-(--text-secondary)">No leave requests found.</p>
                    <p className="text-[13px] text-(--text-muted) mt-1">Click &quot;Apply Leave&quot; to create one.</p>
                  </td>
                </tr>
              )}

              {!loading && leaves.map((leave) => (
                <tr key={leave._id} className="hover:bg-(--surface-subtle) transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-(--brand-50) border border-(--brand-100) flex items-center justify-center text-(--brand-700) text-[12px] font-bold">
                        {leave.employeeId?.firstName?.[0]}{leave.employeeId?.lastName?.[0]}
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-(--text-primary)">
                          {leave.employeeId?.firstName} {leave.employeeId?.lastName}
                        </p>
                        <p className="text-[12px] text-(--text-muted)">{leave.employeeId?.designation}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-(--text-secondary) capitalize">{leave.leaveType}</td>
                  <td className="px-6 py-4 text-[13px] text-(--text-secondary)">
                    {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                  </td>
                  <td className="px-6 py-4 text-[13px] text-(--text-secondary)">{leave.totalDays}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase tracking-wide border ${
                      leave.status === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      leave.status === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
                      "bg-amber-50 text-amber-700 border-amber-200"
                    }`}>
                      {leave.status}
                    </span>
                  </td>
                  
                  {/* Actions Column */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      
                      {/* View Button */}
                      <button 
                        onClick={() => setViewLeave(leave)}
                        className="p-1.5 text-(--text-muted) hover:text-(--text-primary) hover:bg-(--surface-subtle) rounded transition-colors"
                        title="View Details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>

                      {/* Approve/Reject Buttons (Only if Pending) */}
                      {leave.status === "pending" && user && ["admin", "hr"].includes(user.role) && (
                        <>
                          <button 
                            onClick={() => handleStatusChange(leave._id, "approved")}
                            disabled={updatingId === leave._id}
                            className="p-1.5 text-(--text-muted) hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors disabled:opacity-50"
                            title="Approve"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleStatusChange(leave._id, "rejected")}
                            disabled={updatingId === leave._id}
                            className="p-1.5 text-(--text-muted) hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                            title="Reject"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <LeaveForm 
          onClose={() => setIsFormOpen(false)} 
          onSuccess={() => {
            setIsFormOpen(false);
            fetchLeaves();
          }} 
        />
      )}

      {/* View Details Modal */}
      {viewLeave && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-(--surface) w-full max-w-md rounded-xl shadow-xl flex flex-col">
            <div className="px-6 py-4 border-b border-(--border) flex items-center justify-between">
              <h2 className="text-[18px] font-semibold text-(--text-primary)">Leave Details</h2>
              <button onClick={() => setViewLeave(null)} className="text-(--text-muted) hover:text-(--text-primary) transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-(--brand-50) border border-(--brand-100) flex items-center justify-center text-(--brand-700) text-[16px] font-bold">
                  {viewLeave.employeeId?.firstName?.[0]}{viewLeave.employeeId?.lastName?.[0]}
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-(--text-primary)">
                    {viewLeave.employeeId?.firstName} {viewLeave.employeeId?.lastName}
                  </h3>
                  <p className="text-[13px] text-(--text-secondary)">{viewLeave.employeeId?.designation}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider mb-1">Leave Type</p>
                  <p className="text-[14px] text-(--text-secondary) capitalize">{viewLeave.leaveType}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider mb-1">Total Days</p>
                  <p className="text-[14px] text-(--text-secondary)">{viewLeave.totalDays} days</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider mb-1">Start Date</p>
                  <p className="text-[14px] text-(--text-secondary)">{formatDate(viewLeave.startDate)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider mb-1">End Date</p>
                  <p className="text-[14px] text-(--text-secondary)">{formatDate(viewLeave.endDate)}</p>
                </div>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider mb-1">Reason</p>
                <p className="text-[14px] text-(--text-secondary) leading-relaxed">{viewLeave.reason}</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold text-(--text-muted) uppercase tracking-wider mb-1">Status</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-sm text-[10px] font-semibold uppercase tracking-wide border ${
                  viewLeave.status === "approved" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  viewLeave.status === "rejected" ? "bg-red-50 text-red-700 border-red-200" :
                  "bg-amber-50 text-amber-700 border-amber-200"
                }`}>
                  {viewLeave.status}
                </span>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-(--border) bg-(--surface-subtle) rounded-b-xl flex justify-end">
              <button onClick={() => setViewLeave(null)} className="px-4 py-2 bg-(--surface) border border-(--border) text-[13px] font-medium text-(--text-primary) rounded-md hover:bg-(--surface-subtle) transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}