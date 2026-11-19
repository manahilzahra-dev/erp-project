"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
}

interface ProjectFormProps {
  onClose: () => void;
  onSuccess: () => void;
  initialData?: {
    _id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    managerId:
      | string
      | {
          _id: string;
          firstName?: string;
          lastName?: string;
          employeeId?: string;
        };
    status: string;
  } | null;
}

export default function ProjectForm({ onClose, onSuccess, initialData }: ProjectFormProps) {
  const isEditMode = !!initialData;

  // Dates calculate karo (render ke bahar)
  const today = new Date();
  const defaultStartDate = today.toISOString().split("T")[0];

  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
  const defaultEndDate = thirtyDaysLater.toISOString().split("T")[0];

  // Manager ID nikaalo (object ya string handle karo)
  const initialManagerId =
    typeof initialData?.managerId === "object"
      ? initialData.managerId._id
      : initialData?.managerId || "";

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form, setForm] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    startDate: initialData?.startDate
      ? new Date(initialData.startDate).toISOString().split("T")[0]
      : defaultStartDate,
    endDate: initialData?.endDate
      ? new Date(initialData.endDate).toISOString().split("T")[0]
      : defaultEndDate,
    managerId: initialManagerId,
    status: initialData?.status || "planning",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await api.get<{ employees: Employee[] }>("/api/employees");
        setEmployees(data.employees || []);
        if (
          !isEditMode &&
          data.employees &&
          data.employees.length > 0 &&
          !form.managerId
        ) {
          setForm((prev) => ({ ...prev, managerId: data.employees[0]._id }));
        }
      } catch {
        console.error("Failed to load employees");
      }
    };
    fetchEmployees();
  }, [isEditMode, form.managerId]);

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
        await api.put(`/api/projects/${initialData._id}`, form);
      } else {
        await api.post("/api/projects", form);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save project");
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
            {isEditMode ? "Edit Project" : "Create New Project"}
          </h2>
          <button
            onClick={onClose}
            className="text-(--text-muted) hover:text-(--text-primary) transition-colors"
          >
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

          <form id="projectForm" onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">
                Project Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Website Redesign"
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)"
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">
                Description *
              </label>
              <textarea
                name="description"
                required
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500) resize-none"
                placeholder="What is this project about?"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  required
                  value={form.startDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)"
                />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  name="endDate"
                  required
                  value={form.endDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500)"
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">
                Project Manager *
              </label>
              <select
                name="managerId"
                required
                value={form.managerId}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500) bg-white"
              >
                <option value="" disabled>
                  Select Manager
                </option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-(--text-secondary) mb-1">
                Status *
              </label>
              <select
                name="status"
                required
                value={form.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-(--border) rounded-md text-[14px] text-(--text-primary) focus:outline-none focus:border-(--brand-500) bg-white"
              >
                <option value="planning">Planning</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on-hold">On Hold</option>
              </select>
            </div>

          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-(--border) flex justify-end gap-3 bg-(--surface-subtle) rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium text-(--text-secondary) hover:text-(--text-primary) transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="projectForm"
            disabled={loading}
            className="px-4 py-2 bg-(--brand-600) hover:bg-(--brand-700) text-white text-[13px] font-medium rounded-md transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : isEditMode ? "Update Project" : "Create Project"}
          </button>
        </div>

      </div>
    </div>
  );
}