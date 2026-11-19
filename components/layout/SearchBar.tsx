"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface SearchResult {
  type: string;
  id: string;
  title: string;
  subtitle: string;
  link: string;
}

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounce search (har keypress pe nahi, 300ms baad)
   useEffect(() => {
    // Fix: State update ko async function mein wrap karo
    const search = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const data = await api.get<{ results: SearchResult[] }>(`/api/search?q=${encodeURIComponent(query)}`);
        setResults(data.results || []);
        setShowResults(true);
      } catch {
        console.error("Search failed");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(() => {
      search();
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Bahar click karne se dropdown close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleResultClick = (link: string) => {
    router.push(link);
    setQuery("");
    setShowResults(false);
  };

  return (
    <div className="relative hidden md:block" ref={searchRef}>
      <div className="flex items-center gap-2 px-3 h-8 rounded-[6px] border border-(--border) text-[13px] text-(--text-muted) hover:bg-(--surface-subtle) transition-colors bg-(--surface)">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder="Search..."
          className="bg-transparent outline-none w-32 text-(--text-primary) placeholder:text-(--text-muted)"
        />
        <kbd className="ml-auto text-[10px] font-medium text-(--text-muted) bg-(--surface-subtle) px-1.5 py-0.5 rounded border border-(--border)">
          ⌘K
        </kbd>
      </div>

      {/* Results Dropdown */}
      {showResults && (
        <div className="absolute right-0 mt-2 w-96 bg-(--surface) border border-(--border) rounded-lg shadow-xl overflow-hidden z-50">
          {loading ? (
            <div className="p-4 text-center text-[13px] text-(--text-muted)">Searching...</div>
          ) : results.length === 0 ? (
            <div className="p-4 text-center text-[13px] text-(--text-muted)">No results found.</div>
          ) : (
            <div className="max-h-80 overflow-y-auto">
              {results.map((result, idx) => (
                <button
                  key={`${result.type}-${result.id}-${idx}`}
                  onClick={() => handleResultClick(result.link)}
                  className="w-full text-left px-4 py-3 hover:bg-(--surface-subtle) transition-colors border-b border-(--border) last:border-b-0"
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-(--brand-600) bg-(--brand-50) px-1.5 py-0.5 rounded">
                      {result.type}
                    </span>
                    <p className="text-[13px] font-medium text-(--text-primary)">{result.title}</p>
                  </div>
                  <p className="text-[12px] text-(--text-secondary)">{result.subtitle}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}