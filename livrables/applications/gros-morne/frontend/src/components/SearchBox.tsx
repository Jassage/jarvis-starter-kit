"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X, User, Newspaper, MapPinned, Loader2 } from "lucide-react";
import { rechercheApi } from "@/lib/api";

interface Traduction { locale: "FR" | "HT"; domaine?: string; resume?: string; description?: string }
interface Item { id: string; nom?: string; titre?: string; traductions: Traduction[] }
interface Resultats { personnalites: Item[]; articles: Item[]; lieux: Item[] }

function texteDe(t?: Traduction) {
  return t?.domaine ?? t?.resume ?? t?.description ?? "";
}

export default function SearchBox() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [resultats, setResultats] = useState<Resultats | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResultats(null);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      rechercheApi
        .chercher(q.trim())
        .then(({ data }) => setResultats(data.data))
        .catch(() => setResultats(null))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const total = resultats ? resultats.personnalites.length + resultats.articles.length + resultats.lieux.length : 0;

  return (
    <div className="relative" ref={boxRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:bg-green-50 hover:text-green-700 transition-colors"
        aria-label="Rechercher"
      >
        {open ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
      </button>

      {open && (
        <div className="absolute top-full right-0 pt-2 w-96 max-w-[90vw] z-50">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
            <div className="relative mb-2">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Personnalités, actualités, lieux..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {loading && (
              <div className="flex items-center justify-center py-6 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            )}

            {!loading && q.trim().length >= 2 && resultats && total === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">Aucun résultat pour &laquo; {q} &raquo;.</p>
            )}

            {!loading && resultats && total > 0 && (
              <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
                {resultats.personnalites.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 px-1">Personnalités</p>
                    {resultats.personnalites.map((p) => (
                      <Link key={p.id} href={`/personnalites/${p.id}`} onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                        <User className="w-3.5 h-3.5 text-green-600 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{p.nom}</p>
                          <p className="text-xs text-gray-400 truncate">{texteDe(p.traductions.find((t) => t.locale === "FR"))}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                {resultats.articles.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 px-1">Actualités</p>
                    {resultats.articles.map((a) => (
                      <Link key={a.id} href={`/actualites/${a.id}`} onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                        <Newspaper className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        <p className="text-sm font-semibold text-gray-800 truncate">{a.titre}</p>
                      </Link>
                    ))}
                  </div>
                )}
                {resultats.lieux.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 px-1">Lieux touristiques</p>
                    {resultats.lieux.map((l) => (
                      <Link key={l.id} href="/tourisme" onClick={() => setOpen(false)} className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                        <MapPinned className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <p className="text-sm font-semibold text-gray-800 truncate">{l.nom}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
