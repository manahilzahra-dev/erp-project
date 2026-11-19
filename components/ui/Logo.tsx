import Link from "next/link";

export default function Logo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: { box: "w-7 h-7", icon: "w-4 h-4", text: "text-[15px]" },
    md: { box: "w-8 h-8", icon: "w-[18px] h-[18px]", text: "text-base" },
    lg: { box: "w-10 h-10", icon: "w-5 h-5", text: "text-lg" },
  };
  const s = sizes[size];

  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 group select-none">
      {/* Icon Box */}
      <div className={`${s.box} rounded-[6px] bg-[var(--text-primary)] flex items-center justify-center shadow-sm`}>
        <svg
          className={`${s.icon} text-white`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
          />
        </svg>
      </div>
      
      {/* Text */}
      <span className={`${s.text} font-semibold tracking-tight`}>
        <span className="text-[var(--text-primary)]">ERP</span>
        <span className="text-[var(--text-muted)] font-normal"> System</span>
      </span>
    </Link>
  );
}