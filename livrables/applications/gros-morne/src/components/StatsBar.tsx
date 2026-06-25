"use client";

import { useEffect, useRef, useState } from "react";
import { Users, MapPin, Radio, TreePine } from "lucide-react";

function useCounter(target: number, duration = 2000, started = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!started) return;
    const step = target / (duration / 16);
    let current = 0;
    const t = setInterval(() => {
      current = Math.min(current + step, target);
      setVal(Math.round(current));
      if (current >= target) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [started, target, duration]);
  return val;
}

export default function StatsBar() {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.3 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const pop   = useCounter(155692, 2200, started);
  const surf  = useCounter(397,    1600, started);
  const radios = useCounter(11,    1200, started);
  const sec   = useCounter(8,      1000, started);

  const stats = [
    { icon: Users,    val: pop.toLocaleString("fr-FR"), label: "Habitants",          sub: "recensement 2015" },
    { icon: MapPin,   val: `${surf} km²`,               label: "Superficie",          sub: "territoire communal" },
    { icon: Radio,    val: `${radios} radios`,           label: "Stations locales",    sub: "dont Francisque FM 98.9" },
    { icon: TreePine, val: `${sec} sections`,            label: "Sections communales", sub: "code postal HT 4210" },
  ];

  return (
    <div ref={ref} className="bg-gray-950 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 sm:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/5">
          {stats.map(({ icon: Icon, val, label, sub }, i) => (
            <div
              key={label}
              className="flex items-center gap-4 py-6 px-6 first:pl-0 last:pr-0 group"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="w-10 h-10 rounded-xl bg-green-900/30 flex items-center justify-center shrink-0 group-hover:bg-green-800/50 transition-colors">
                <Icon className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-white tabular-nums leading-none">{val}</div>
                <div className="text-green-400 text-xs font-bold uppercase tracking-wider mt-0.5">{label}</div>
                <div className="text-white/25 text-xs hidden sm:block mt-0.5">{sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
