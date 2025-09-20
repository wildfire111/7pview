"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const q = (useSearchParams().get("q") || "").trim();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function run() {
      if (!q) return setResults([]);
      setLoading(true);
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const j = await r.json();
        if (!ignore) setResults(j.results || []);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    run();
    return () => {
      ignore = true;
    };
  }, [q]);

  // --- render the UI ---
  return (
    <main className="p-8 space-y-4">
      <h1 className="text-xl font-semibold">Search</h1>
      <p className="text-sm">Query: {q || "none"}</p>

      {loading && <p>Searching…</p>}

      {!loading && q && results.length === 0 && (
        <p className="text-gray-500">No results</p>
      )}

      <ul className="space-y-2">
        {results.map((r) => (
          <li
            key={r.id}
            className="border rounded px-3 py-2 bg-white text-black"
          >
            {r.title}
          </li>
        ))}
      </ul>
    </main>
  );
}
