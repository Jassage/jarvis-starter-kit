import Link from "next/link";
import { Sprout, Mountain, Users, HandHeart, ArrowRight } from "lucide-react";

const atouts = [
  { icon: Sprout, label: "Terre fertile", sub: "pour l'agriculture" },
  { icon: Mountain, label: "Destination touristique", sub: "en plein essor" },
  { icon: Users, label: "Population accueillante", sub: "et dynamique" },
  { icon: HandHeart, label: "Accompagnement", sub: "et facilités" },
];

export default function InvestirBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-800 via-green-900 to-black">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 85% 20%, white 0%, transparent 55%)" }} />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="max-w-xl mb-10">
          <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold mb-4">
            Investir à Gros-Morne
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
            Un territoire d&apos;opportunités pour un avenir prospère
          </h2>
          <p className="text-green-200 text-sm leading-relaxed">
            Agriculture, tourisme, commerce, immobilier... Gros-Morne offre un cadre
            idéal pour vos investissements.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-10">
          {atouts.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex flex-col items-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-amber-400" />
              </div>
              <p className="text-white text-sm font-bold">{label}</p>
              <p className="text-green-300 text-xs">{sub}</p>
            </div>
          ))}
        </div>
        <Link
          href="/investir"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-amber-500 text-white font-bold hover:bg-amber-400 hover:scale-105 transition-all duration-200 shadow-lg"
        >
          Découvrir les opportunités <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
