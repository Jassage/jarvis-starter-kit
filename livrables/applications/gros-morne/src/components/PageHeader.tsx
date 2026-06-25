import Link from "next/link";
import { ChevronRight, MapPin } from "lucide-react";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle: string;
  breadcrumbs: Breadcrumb[];
  gradient?: string;
  bgImage?: string;
  eyebrow?: string;
  accent?: string;
}

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  gradient = "from-green-900 via-green-950 to-black",
  bgImage,
  eyebrow,
  accent = "#22c55e",
}: PageHeaderProps) {
  return (
    <section className="relative pt-32 pb-16 overflow-hidden bg-black">
      {/* Background */}
      {bgImage ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center scale-105"
            style={{ backgroundImage: `url('${bgImage}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-black/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        </>
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      )}

      {/* Accent vertical line */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 opacity-60"
        style={{ background: `linear-gradient(to bottom, transparent, ${accent}, transparent)` }}
      />

      {/* Decorative blob */}
      <div
        className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 opacity-20"
        style={{ background: accent }}
      />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-12">
        {/* Top metadata */}
        <div className="flex items-center gap-3 text-white/40 text-xs tracking-[0.2em] font-mono mb-8">
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }} />
          <span>19°40′N · 72°41′O</span>
          <span className="hidden sm:inline">· Gros-Morne, Artibonite</span>
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-white/50 text-sm mb-6">
          {breadcrumbs.map((bc, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="w-3.5 h-3.5" />}
              {bc.href ? (
                <Link href={bc.href} className="hover:text-white transition-colors">
                  {bc.label}
                </Link>
              ) : (
                <span className="text-white font-medium">{bc.label}</span>
              )}
            </span>
          ))}
        </nav>

        {/* Eyebrow label */}
        {eyebrow && (
          <div className="inline-flex items-center gap-2 mb-4">
            <MapPin className="w-3.5 h-3.5" style={{ color: accent }} />
            <span className="text-xs font-bold tracking-[0.25em] uppercase" style={{ color: accent }}>
              {eyebrow}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-5 leading-none tracking-tight">
          {title}
        </h1>

        {/* Accent divider */}
        <div className="w-12 h-0.5 mb-5 rounded-full" style={{ background: accent }} />

        <p className="text-base sm:text-lg text-white/60 max-w-2xl leading-relaxed">{subtitle}</p>
      </div>
    </section>
  );
}
