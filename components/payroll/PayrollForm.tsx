 "use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
}

interface PayrollFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function PayrollForm({ onClose, onSuccess }: PayrollFormProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState({
    employeeId: "",
    month: new Date().toISOString().slice(0, 7), // Current month (YYYY-MM)
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await api.get<{ employees: Employee[] }>("/api/employees");
        setEmployees(data.employees || []);
        if (data.employees && data.employees.length > 0 && !form.employeeId) {
          setForm((prev) => ({ ...prev, employeeId: data.employees[0]._id }));
        }
      } catch (err) {
        console.error("Failed to load employees");
      }
    };
    fetchEmployees();
  }, [form.employeeId]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/api/payroll", form);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate payroll");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-(--surface) w-full max-w-md rounded-xl shadow-xl flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-(--border) flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-(--text-primary)">
            Generate Payroll
          </h2>
          <button onClick={onClose} className="text-(--text-muted) hover:text-(--text-primary) transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-[13px]">
              {error}
            </div>
          )}

          <form id="payrollForm" onSubmit={handleSubmit} className="space-y-4">
            
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
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">Month *</label>
              <input type="month" name="month" required value={form.month} onChange={handleChange}
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)" />
              <p className="text-[11px] text-(--text-muted) mt-1">Select the month to calculate salary</p>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-(--border) flex justify-end gap-3 bg-(--surface-subtle) rounded-b-xl">
          <button type="button" onClick={onClose} className="px-4 py-2 text-[13px] font-medium text-(--text-secondary) hover:text-(--text-primary) transition-colors">
            Cancel
          </button>
          <button type="submit" form="payrollForm" disabled={loading} className="px-4 py-2 bg-(--brand-600) hover:bg-(--brand-700) text-white text-[13px] font-medium rounded-md transition-colors disabled:opacity-50">
            {loading ? "Calculating..." : "Generate Payroll"}
          </button>
        </div>

      </div>
    </div>
  );
}