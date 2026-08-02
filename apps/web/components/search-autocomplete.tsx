'use client';

import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';

interface Suggestion {
  title: string;
  subjectId?: string;
  detailPath?: string;
}

/**
 * Debounced search input with live suggestions, driven by the BFF proxy
 * (never the raw ZST LABS key). Announces results to assistive tech without
 * interrupting typing.
 */
export function SearchAutocomplete({ initialQuery = '' }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    const q = query.trim();
    if (!q) {
      setSuggestions([]);
      return;
    }
    // 300ms debounce before hitting the BFF proxy.
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/proxy/search?query=${encodeURIComponent(q)}&perPage=6`);
        const body = (await res.json()) as {
          ok?: boolean;
          data?: { items?: Suggestion[] };
        };
        if (body.ok && body.data?.items) {
          setSuggestions(
            body.data.items.map((item) => ({
              title: item.title,
              ...(item.subjectId ? { subjectId: item.subjectId } : {}),
              ...(item.detailPath ? { detailPath: item.detailPath } : {}),
            })),
          );
        }
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [query]);

  return (
    <div className="relative">
      <div className="flex items-center gap-3 rounded-md border border-border bg-surface px-4 py-3">
        <Search aria-hidden="true" className="h-5 w-5 text-muted" />
        <label htmlFor="search-input" className="sr-only">
          Search titles
        </label>
        <input
          id="search-input"
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              window.location.href = `/search?q=${encodeURIComponent(query)}`;
            }
          }}
          placeholder="Search titles, genres, cast, or mood"
          className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls="search-suggestions"
          aria-expanded={open}
        />
        {loading ? <span className="text-xs text-muted" aria-live="polite">Searching…</span> : null}
      </div>

      {open && suggestions.length > 0 ? (
        <ul
          id="search-suggestions"
          role="listbox"
          aria-label="Search suggestions"
          className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-md border border-border bg-surface-raised shadow-cinematic"
        >
          {suggestions.map((s) => (
            <li key={s.subjectId ?? s.title}>
              <a
                href={`/title/${s.detailPath ?? s.title}`}
                onMouseDown={(e) => e.preventDefault()}
                className="block px-4 py-2.5 text-sm text-foreground hover:bg-white/5 focus-visible:bg-white/5 focus-visible:outline-none"
              >
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
