"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight, MapPin } from "lucide-react";

const slides = [
  {
    id: 1,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Haiti_Saut-d%27Eau.JPG/1200px-Haiti_Saut-d%27Eau.JPG",
    overlay: "from-black/85 via-black/55 to-black/30",
    accent: "#22c55e",
    label: "Nature & Paysages",
    title: ["DÉCOUVREZ", "GROS-MORNE"],
    desc: "Une ville fière de l'Artibonite — entre mornes verdoyants, rivières cristallines et traditions ancestrales.",
    cta: { label: "Explorer", href: "/tourisme" },
    ctaSecondary: { label: "Notre géographie", href: "/geographie" },
  },
  {
    id: 2,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Haiti_Saut-d%27Eau.JPG/1200px-Haiti_Saut-d%27Eau.JPG",
    overlay: "from-amber-950/90 via-black/60 to-black/20",
    accent: "#f59e0b",
    label: "Histoire & Indépendance",
    title: ["NOTRE", "HISTOIRE"],
    desc: "Depuis 1804, Gros-Morne porte fièrement l'héritage de Paul Prompt et Étienne Magny, héros de l'indépendance haïtienne.",
    cta: { label: "Découvrir l'histoire", href: "/histoire" },
    ctaSecondary: { label: "Personnalités", href: "/personnalites" },
  },
  {
    id: 3,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Haiti_Saut-d%27Eau.JPG/1200px-Haiti_Saut-d%27Eau.JPG",
    overlay: "from-green-950/90 via-black/60 to-black/20",
    accent: "#4ade80",
    label: "Communauté & Diaspora",
    title: ["VIL MWEN", "MA VILLE"],
    desc: "Que vous soyez à Gros-Morne ou dans la diaspora, cette plateforme est votre lien avec votre ville natale.",
    cta: { label: "Rejoindre", href: "/communaute" },
    ctaSecondary: { label: "Voir la galerie", href: "/galerie" },
  },
  {
    id: 4,
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Haiti_Saut-d%27Eau.JPG/1200px-Haiti_Saut-d%27Eau.JPG",
    overlay: "from-purple-950/90 via-black/65 to-black/20",
    accent: "#a78bfa",
    label: "Culture & Traditions",
    title: ["RARA,", "CULTURE & VIE"],
    desc: "Mangue francisque, Rara, Kompa, artisanat — une culture vivante ancrée dans les traditions haïtiennes les plus profondes.",
    cta: { label: "Découvrir la culture", href: "/culture" },
    ctaSecondary: { label: "Actualités", href: "/actualites" },
  },
];

const INTERVAL = 6000;

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback((idx: number) => {
    if (animating) return;
    setAnimating(true);
    setCurrent(idx);
    setProgress(0);
    setTimeout(() => setAnimating(false), 600);
  }, [animating]);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo]);
  const prev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, goTo]);

  // Auto-advance + progress bar
  useEffect(() => {
    setProgress(0);
    const start = Date.now();
    const progressTimer = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min((elapsed / INTERVAL) * 100, 100));
    }, 50);
    const slideTimer = setTimeout(next, INTERVAL);
    return () => { clearInterval(progressTimer); clearTimeout(slideTimer); };
  }, [current, next]);

  const slide = slides[current];

  return (
    <section className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden bg-black select-none">

      {/* ── Slides ── */}
      {slides.map((s, i) => (
        <div
          key={s.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0, zIndex: i === current ? 1 : 0 }}
        >
          {/* Image */}
          <div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{
              backgroundImage: `url('${s.image}')`,
              transform: i === current ? "scale(1.03)" : "scale(1.08)",
              transition: "transform 7s ease-out",
            }}
          />
          {/* Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${s.overlay}`} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </div>
      ))}

      {/* ── UI Layer ── */}
      <div className="absolute inset-0 z-10 flex flex-col">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 sm:px-16 pt-24 md:pt-28">
          <div className="flex items-center gap-3 text-white/40 text-xs tracking-[0.2em] font-mono">
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: slide.accent }} />
            <span>19°40′N · 72°41′O</span>
            <span className="hidden sm:inline">· Artibonite, Haïti</span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-white/30 text-xs font-mono">
              0{current + 1} / 0{slides.length}
            </span>
            <div className="w-16 h-px bg-white/20 relative overflow-hidden rounded-full">
              <div
                className="absolute inset-y-0 left-0 rounded-full transition-none"
                style={{ width: `${progress}%`, background: slide.accent }}
              />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-end px-6 sm:px-16 pb-24">
          <div className="w-full max-w-3xl">

            {/* Label */}
            <div
              key={`label-${current}`}
              className="inline-flex items-center gap-2 mb-5 animate-fade-in-up"
            >
              <MapPin className="w-3.5 h-3.5" style={{ color: slide.accent }} />
              <span className="text-xs font-bold tracking-[0.25em] uppercase" style={{ color: slide.accent }}>
                {slide.label}
              </span>
            </div>

            {/* Title */}
            <div key={`title-${current}`} className="mb-6">
              {slide.title.map((line, i) => (
                <div
                  key={i}
                  className="overflow-hidden"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <h1
                    className="font-black leading-none text-[clamp(3rem,12vw,9rem)] block animate-slide-up"
                    style={i === 0
                      ? { color: "rgba(255,255,255,0.15)", WebkitTextStroke: `1px rgba(255,255,255,0.25)` }
                      : {
                          background: `linear-gradient(135deg, #fff 0%, ${slide.accent} 100%)`,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                          marginTop: "-0.1em",
                        }
                    }
                  >
                    {line}
                  </h1>
                </div>
              ))}
            </div>

            {/* Desc + CTAs */}
            <div
              key={`desc-${current}`}
              className="animate-fade-in-up delay-200 flex flex-col sm:flex-row items-start sm:items-end gap-6"
            >
              <div className="flex-1">
                <div className="w-10 h-0.5 mb-4 rounded-full" style={{ background: slide.accent }} />
                <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-md">
                  {slide.desc}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <Link
                  href={slide.cta.href}
                  className="group flex items-center gap-2 px-6 py-3.5 rounded-full font-bold text-sm text-black transition-all duration-300 hover:gap-3"
                  style={{ background: slide.accent }}
                >
                  {slide.cta.label}
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
                <Link
                  href={slide.ctaSecondary.href}
                  className="flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/20 text-white font-bold text-sm hover:bg-white/10 transition-all duration-300"
                >
                  {slide.ctaSecondary.label}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom controls */}
        <div className="flex items-center justify-between px-6 sm:px-16 pb-6">

          {/* Dots */}
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="transition-all duration-300 rounded-full"
                style={{
                  width: i === current ? "2rem" : "0.5rem",
                  height: "0.375rem",
                  background: i === current ? slide.accent : "rgba(255,255,255,0.3)",
                }}
              />
            ))}
          </div>

          {/* Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/40 transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={next}
              className="w-10 h-10 rounded-full flex items-center justify-center text-black font-bold transition-all duration-200 hover:scale-105"
              style={{ background: slide.accent }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

    </section>
  );
}
