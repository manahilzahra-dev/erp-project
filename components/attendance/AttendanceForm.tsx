"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
}

interface AttendanceFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    _id: string;
    employeeId: string | { _id: string };
    date: string;
    status: string;
    checkInTime?: string;
    checkOutTime?: string;
    notes?: string;
  } | null;
}

export default function AttendanceForm({ onClose, onSuccess, initialData }: AttendanceFormProps) {
  const isEditMode = !!initialData;

  // Employee ID nikaalo (populate ki wajah se object ya string ho sakta hai)
  const initialEmployeeId = typeof initialData?.employeeId === "object" 
    ? initialData.employeeId._id 
    : initialData?.employeeId || "";

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState({
    employeeId: initialEmployeeId,
    date: initialData?.date 
      ? new Date(initialData.date).toISOString().split("T")[0] 
      : new Date().toISOString().split("T")[0],
    status: initialData?.status || "present",
    checkInTime: initialData?.checkInTime || "09:00",
    checkOutTime: initialData?.checkOutTime || "17:00",
    notes: initialData?.notes || "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await api.get<{ employees: Employee[] }>("/api/employees");
        setEmployees(data.employees || []);
        if (!isEditMode && data.employees && data.employees.length > 0 && !form.employeeId) {
          setForm((prev) => ({ ...prev, employeeId: data.employees[0]._id }));
        }
      } catch (err) {
        console.error("Failed to load employees");
      }
    };
    fetchEmployees();
  }, [isEditMode, form.employeeId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isEditMode) {
        await api.put(`/api/attendance/${initialData._id}`, form);
      } else {
        await api.post("/api/attendance", form);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save attendance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-(--surface) w-full max-w-lg rounded-xl shadow-xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-(--border) flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-(--text-primary)">
            {isEditMode ? "Edit Attendance" : "Mark Attendance"}
          </h2>
          <button onClick={onClose} className="text-(--text-muted) hover:text-(--text-primary) transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[13px]">
              {error}
            </div>
          )}

          <form id="attendanceForm" onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Select Employee *</label>
              <select name="employeeId" required value={form.employeeId} onChange={handleChange}
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500) bg-white">
                <option value="" disabled>Select an employee</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName} ({emp.employeeId})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Date *</label>
              <input type="date" name="date" required value={form.date} onChange={handleChange}
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)" />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Status *</label>
              <select name="status" required value={form.status} onChange={handleChange}
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500) bg-white">
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="leave">Leave</option>
                <option value="half-day">Half Day</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Check In Time</label>
                <input type="time" name="checkInTime" value={form.checkInTime} onChange={handleChange}
                  className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Check Out Time</label>
                <input type="time" name="checkOutTime" value={form.checkOutTime} onChange={handleChange}
                  className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)" />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Notes (Optional)</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500) resize-none"
                placeholder="e.g. Sick leave, late arrival..." />
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-(--border) flex justify-end gap-3 bg-(--surface-subtle) rounded-b-xl">
          <button type="button" onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-(--text-secondary) hover:text-(--text-primary) transition-colors">
            Cancel
          </button>
          <button type="submit" form="attendanceForm" disabled={loading} className="px-4 py-2 bg-(--brand-600) hover:bg-(--brand-700) text-white text-[13px] font-medium rounded-md transition-colors disabled:opacity-50">
            {loading ? "Saving..." : (isEditMode ? "Update Attendance" : "Save Attendance")}
          </button>
        </div>

      </div>
    </div>
  );
}