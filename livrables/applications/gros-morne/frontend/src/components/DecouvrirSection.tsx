import Link from "next/link";
import { TreePine, Landmark, Utensils, TrendingUp, ArrowRight } from "lucide-react";

const cartes = [
  {
    icon: TreePine,
    titre: "Nature exceptionnelle",
    desc: "Des montagnes majestueuses, des rivières et des paysages à couper le souffle.",
    href: "/tourisme",
    color: "from-green-600 to-emerald-700",
  },
  {
    icon: Landmark,
    titre: "Patrimoine & Culture",
    desc: "Un patrimoine historique riche et des traditions culturelles vivantes.",
    href: "/histoire",
    color: "from-amber-600 to-orange-700",
  },
  {
    icon: Utensils,
    titre: "Gastronomie locale",
    desc: "Des saveurs uniques qui reflètent l'âme de notre terroir.",
    href: "/culture",
    color: "from-red-500 to-rose-700",
  },
  {
    icon: TrendingUp,
    titre: "Économie locale",
    desc: "Une économie dynamique portée par l'agriculture, le commerce et le tourisme.",
    href: "/economie",
    color: "from-blue-600 to-indigo-700",
  },
];

export default function DecouvrirSection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between gap-4 mb-8">
          <h2 className="text-3xl font-black text-gray-900">
            Découvrir <span className="text-green-700">Gros-Morne</span>
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {cartes.map(({ icon: Icon, titre, desc, href, color }) => (
            <Link
              key={href + titre}
              href={href}
              className={`group relative rounded-2xl overflow-hidden h-48 flex flex-col justify-end p-5 bg-gradient-to-br ${color} card-hover`}
            >
              <Icon className="absolute top-4 right-4 w-8 h-8 text-white/25" />
              <h3 className="font-black text-white text-lg mb-1">{titre}</h3>
              <p className="text-white/70 text-xs leading-relaxed mb-3">{desc}</p>
              <span className="flex items-center gap-1.5 text-white text-sm font-semibold group-hover:gap-2.5 transition-all">
                Explorer <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
