type BadgeVariant = "admin" | "hr" | "finance" | "inventory" | "sales" | "management";

const styles: Record<BadgeVariant, string> = {
  admin: "bg-purple-50 text-purple-700 border-purple-200",
  hr: "bg-pink-50 text-pink-700 border-pink-200",
  finance: "bg-emerald-50 text-emerald-700 border-emerald-200",
  inventory: "bg-amber-50 text-amber-700 border-amber-200",
  sales: "bg-blue-50 text-blue-700 border-blue-200",
  management: "bg-slate-100 text-slate-700 border-slate-300",
};

export default function RoleBadge({ role }: { role: BadgeVariant }) {
  return (
    <span
      className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded-[4px] text-[10px] font-semibold uppercase tracking-wide border ${styles[role]}`}
    >
      {role}
    </span>
  );
}